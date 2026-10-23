import crypto from 'crypto';
import path from 'path';
import { Loan, LoanStatus, Prisma } from '@prisma/client';
import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { AppError } from '../errors';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { ah } from '../middleware/async';
import { prisma } from '../prisma';
import { isOverdue, todayUtc } from '../utils/loan';
import { createLoanSchema, idParamSchema, validate } from '../validation';

export const loansRouter = Router();
loansRouter.use(requireAuth); // every query below is also scoped by userId

const uid = (req: Request) => (req as AuthedRequest).userId;
const dateOnly = (d: Date) => d.toISOString().slice(0, 10); // @db.Date is stored as UTC midnight
const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);

const toDto = (l: Loan, today = todayUtc()) => ({
  id: l.id,
  friendName: l.friendName,
  amount: l.amount.toFixed(2), // Decimal -> string: no float rounding
  dueDate: dateOnly(l.dueDate),
  status: l.status,
  isOverdue: isOverdue(l.status, dateOnly(l.dueDate), today),
  repaidAt: l.repaidAt,
  receiptUrl: l.receiptUrl,
  createdAt: l.createdAt,
});

loansRouter.post(
  '/',
  validate(createLoanSchema),
  ah(async (req, res) => {
    const { friendName, amount, dueDate } = req.body;
    const loan = await prisma.loan.create({
      data: { userId: uid(req), friendName, amount: new Prisma.Decimal(amount), dueDate: toDate(dueDate) },
    });
    res.status(201).json(toDto(loan));
  }),
);

loansRouter.get(
  '/',
  ah(async (req, res) => {
    const loans = await prisma.loan.findMany({
      where: { userId: uid(req) },
      // PENDING is declared before REPAID in the enum, so 'asc' lists pending first.
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
    const today = todayUtc();
    res.json(loans.map((l) => toDto(l, today)));
  }),
);

// Declared before '/:id/...' routes so "summary" is never treated as an id.
loansRouter.get(
  '/summary',
  ah(async (req, res) => {
    const userId = uid(req);
    const today = toDate(todayUtc());
    const [lent, repaid, overdue] = await prisma.$transaction([
      prisma.loan.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.loan.aggregate({ where: { userId, status: LoanStatus.REPAID }, _sum: { amount: true } }),
      prisma.loan.aggregate({
        where: { userId, status: LoanStatus.PENDING, dueDate: { lt: today } },
        _sum: { amount: true },
      }),
    ]);
    const totalLent = lent._sum.amount ?? new Prisma.Decimal(0);
    const totalRepaid = repaid._sum.amount ?? new Prisma.Decimal(0);
    const overdueAmount = overdue._sum.amount ?? new Prisma.Decimal(0);
    res.json({
      totalLent: totalLent.toFixed(2),
      totalRepaid: totalRepaid.toFixed(2),
      overdueAmount: overdueAmount.toFixed(2),
      outstanding: totalLent.minus(totalRepaid).toFixed(2),
    });
  }),
);

loansRouter.patch(
  '/:id/repay',
  validate(idParamSchema, 'params'),
  ah(async (req, res) => {
    const where = { id: req.params.id, userId: uid(req) };
    // Atomic conditional update: no race between "check" and "set".
    const { count } = await prisma.loan.updateMany({
      where: { ...where, status: LoanStatus.PENDING },
      data: { status: LoanStatus.REPAID, repaidAt: new Date() },
    });
    const loan = await prisma.loan.findFirst({ where });
    // 404 for other users' loans too, so we never reveal that an id exists.
    if (!loan) throw new AppError(404, 'Loan not found');
    if (count === 0) throw new AppError(409, 'Loan already repaid');
    res.json(toDto(loan));
  }),
);

// ---- Bonus: receipt photo upload ----
const EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const EXT_FROM_NAME: Record<string, string> = { '.jpg': '.jpg', '.jpeg': '.jpg', '.png': '.png', '.webp': '.webp' };

// Some mobile clients send a generic mimetype, so fall back to the file extension.
const imageExt = (file: Express.Multer.File): string | undefined =>
  EXT[file.mimetype] ?? EXT_FROM_NAME[path.extname(file.originalname).toLowerCase()];

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + (imageExt(file) ?? '.jpg')),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    imageExt(file) ? cb(null, true) : cb(new AppError(400, 'Only JPEG, PNG or WebP images allowed')),
});

// Check ownership BEFORE multer writes anything to disk, so no orphan files.
const ownsLoan = ah(async (req: Request, _res: Response, next: NextFunction) => {
  const loan = await prisma.loan.findFirst({
    where: { id: req.params.id, userId: uid(req) },
    select: { id: true },
  });
  if (!loan) throw new AppError(404, 'Loan not found');
  next();
});

loansRouter.post(
  '/:id/receipt',
  validate(idParamSchema, 'params'),
  ownsLoan,
  upload.single('receipt'),
  ah(async (req, res) => {
    if (!req.file) throw new AppError(400, 'receipt file is required');
    const loan = await prisma.loan.update({
      where: { id: req.params.id },
      data: { receiptUrl: `/uploads/${req.file.filename}` },
    });
    res.json(toDto(loan));
  }),
);
