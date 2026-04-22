import type { Request, Response, NextFunction } from 'express';
import * as jwt from '../utils/jwt.js';
import {
  MissingTokenError,
  TokenExpiredError,
  InvalidTokenError,
} from '../errors/auth.errors.js';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new MissingTokenError());
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token);
    req.user = { id: payload.user_id };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      next(new TokenExpiredError());
      return;
    }
    next(new InvalidTokenError());
  }
}
