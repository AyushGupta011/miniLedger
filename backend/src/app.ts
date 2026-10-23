import path from 'path';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from './errors';
import { authRouter } from './routes/auth';
import { loansRouter } from './routes/loans';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/loans', loansRouter);

app.use((_req, _res, next) => next(new AppError(404, 'Route not found')));

// Central error handler: one place that shapes every error response.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
