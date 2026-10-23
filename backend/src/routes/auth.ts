import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../errors';
import { ah } from '../middleware/async';
import { prisma } from '../prisma';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/otp';
import { requestOtpSchema, validate, verifyOtpSchema } from '../validation';

export const authRouter = Router();

authRouter.post(
  '/request-otp',
  validate(requestOtpSchema),
  ah(async (req, res) => {
    const { phone } = req.body as { phone: string };
    const code = generateOtp();
    await prisma.otp.create({
      data: {
        phone,
        codeHash: hashOtp(phone, code),
        expiresAt: new Date(Date.now() + config.otpTtlMs),
      },
    });
    // Mock OTP delivery, as required by the assignment: print to the server log.
    console.log(`[MOCK OTP] ${phone} -> ${code} (valid 5 min)`);
    res.json({ message: 'OTP sent (check server log)' });
  }),
);

authRouter.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  ah(async (req, res) => {
    const { phone, otp } = req.body as { phone: string; otp: string };

    // Latest unused OTP for this phone.
    const record = await prisma.otp.findFirst({
      where: { phone, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new AppError(400, 'OTP expired or not requested');
    }
    if (record.attempts >= config.otpMaxAttempts) {
      throw new AppError(429, 'Too many attempts. Request a new OTP');
    }
    if (!verifyOtpHash(phone, otp, record.codeHash)) {
      await prisma.otp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      throw new AppError(400, 'Incorrect OTP');
    }

    const user = await prisma.$transaction(async (tx) => {
      // Atomic "claim": only one concurrent request can flip usedAt from null.
      const claimed = await tx.otp.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count === 0) throw new AppError(400, 'OTP already used');
      return tx.user.upsert({ where: { phone }, update: {}, create: { phone } });
    });

    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    res.json({ token });
  }),
);
