import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgres://miniledger:miniledger@localhost:5432/miniledger',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: '7d' as const,
  otpTtlMs: 5 * 60 * 1000,
  otpMaxAttempts: 5,
};
