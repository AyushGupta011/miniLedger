import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../errors';

export type AuthedRequest = Request & { userId: string };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError(401, 'Missing token'));
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    (req as AuthedRequest).userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
