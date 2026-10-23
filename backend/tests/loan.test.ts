import { isOverdue } from '../src/utils/loan';
import { generateOtp, hashOtp, verifyOtpHash } from '../src/utils/otp';
import { createLoanSchema, verifyOtpSchema } from '../src/validation';

describe('isOverdue', () => {
  const today = '2026-10-22';
  it('pending + past due date is overdue', () => expect(isOverdue('PENDING', '2026-10-21', today)).toBe(true));
  it('pending + due today is NOT overdue', () => expect(isOverdue('PENDING', '2026-10-22', today)).toBe(false));
  it('pending + future is not overdue', () => expect(isOverdue('PENDING', '2026-11-01', today)).toBe(false));
  it('repaid is never overdue', () => expect(isOverdue('REPAID', '2020-01-01', today)).toBe(false));
});

describe('otp', () => {
  it('generates 6 digits', () => expect(generateOtp()).toMatch(/^\d{6}$/));
  it('accepts the right code and rejects a wrong one', () => {
    const h = hashOtp('+919999999999', '123456');
    expect(verifyOtpHash('+919999999999', '123456', h)).toBe(true);
    expect(verifyOtpHash('+919999999999', '654321', h)).toBe(false);
  });
  it('binds the hash to the phone number', () => {
    const h = hashOtp('+919999999999', '123456');
    expect(verifyOtpHash('+918888888888', '123456', h)).toBe(false);
  });
});

describe('validation', () => {
  const ok = { friendName: 'Rahul', amount: 500.5, dueDate: '2026-11-01' };
  it('accepts a valid loan', () => expect(createLoanSchema.safeParse(ok).success).toBe(true));
  it('rejects negative amount', () => expect(createLoanSchema.safeParse({ ...ok, amount: -1 }).success).toBe(false));
  it('rejects 3 decimal places', () => expect(createLoanSchema.safeParse({ ...ok, amount: 1.234 }).success).toBe(false));
  it('rejects impossible date', () => expect(createLoanSchema.safeParse({ ...ok, dueDate: '2026-02-31' }).success).toBe(false));
  it('rejects blank friend name', () => expect(createLoanSchema.safeParse({ ...ok, friendName: '  ' }).success).toBe(false));
  it('rejects non-6-digit otp', () => expect(verifyOtpSchema.safeParse({ phone: '+919999999999', otp: '12' }).success).toBe(false));
});
