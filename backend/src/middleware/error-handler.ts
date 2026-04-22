import type { Request, Response, NextFunction } from 'express';
import { AuthError } from '../errors/auth.errors.js';

/**
 * Global error handler middleware
 * Unified error response format: { error: { code, message } }
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Unexpected errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'internal_error',
      message: 'An internal server error occurred',
    },
  });
}
