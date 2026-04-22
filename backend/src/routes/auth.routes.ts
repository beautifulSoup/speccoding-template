import { Router, type Request, type Response, type NextFunction } from 'express';
import type { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validators.js';
import { createLoginRateLimiter } from '../middleware/rate-limit.js';
import {
  InvalidEmailFormatError,
  WeakPasswordError,
  RefreshTokenExpiredError,
} from '../errors/auth.errors.js';
import { REFRESH_TTL } from '../utils/jwt.js';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();
  const loginRateLimiter = createLoginRateLimiter();

  /**
   * POST /api/auth/register
   */
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errors = parseResult.error.issues;
        for (const err of errors) {
          if (err.message === 'invalid_email_format') {
            throw new InvalidEmailFormatError();
          }
          if (err.message === 'weak_password') {
            throw new WeakPasswordError();
          }
        }
        throw new InvalidEmailFormatError();
      }

      const { email, password } = parseResult.data;
      const result = await authService.register(email, password);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/auth/login
   */
  router.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errors = parseResult.error.issues;
        for (const err of errors) {
          if (err.message === 'invalid_email_format') {
            throw new InvalidEmailFormatError();
          }
        }
        throw new InvalidEmailFormatError();
      }

      const { email, password } = parseResult.data;
      const result = await authService.login(email, password);

      // Set refresh_token as HttpOnly Secure cookie
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TTL * 1000,
        path: '/api/auth',
      });

      res.status(200).json({
        access_token: result.access_token,
        expires_in: result.expires_in,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/auth/refresh
   */
  router.post('/refresh', (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        throw new RefreshTokenExpiredError();
      }

      const result = authService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
