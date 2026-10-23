import crypto from 'crypto';
import { config } from '../config';

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// OTPs are never stored in plain text. HMAC binds the code to the phone number.
export function hashOtp(phone: string, code: string): string {
  return crypto.createHmac('sha256', config.jwtSecret).update(`${phone}:${code}`).digest('hex');
}

export function verifyOtpHash(phone: string, code: string, storedHash: string): boolean {
  const a = Buffer.from(hashOtp(phone, code), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
