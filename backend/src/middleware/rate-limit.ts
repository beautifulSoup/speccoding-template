import rateLimit from 'express-rate-limit';

/**
 * Create a login rate limiter: 5 attempts per minute per IP
 * Returns a new instance each time to avoid shared state across app instances (important for testing)
 */
export function createLoginRateLimiter() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5,              // limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'too_many_attempts',
        message: 'Too many failed attempts. Please try again later.',
      },
    },
  });
}
