import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { AppError } from './errors';

const phone = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number');

export const requestOtpSchema = z.object({ phone });
export const verifyOtpSchema = z.object({ phone, otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits') });

const isRealDate = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const createLoanSchema = z.object({
  friendName: z.string().trim().min(1, 'Friend name is required').max(100),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(9_999_999_999.99)
    .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'Max 2 decimal places'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD')
    .refine(isRealDate, 'Invalid date'),
});

export const idParamSchema = z.object({ id: z.string().uuid('Invalid id') });

export function validate(schema: z.ZodTypeAny, source: 'body' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(', ');
      return next(new AppError(400, msg));
    }
    req[source] = result.data;
    next();
  };
}
