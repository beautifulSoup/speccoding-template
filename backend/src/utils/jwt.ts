import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

// TTL constants (in seconds)
export const ACCESS_TTL = 15 * 60;         // 15 minutes
export const REFRESH_TTL = 7 * 24 * 3600;  // 7 days

export interface JwtPayload {
  user_id: number;
  jti: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set. Server cannot start.');
  }
  return secret;
}

/**
 * Sign a JWT token
 */
export function sign(
  payload: { user_id: number },
  type: 'access' | 'refresh'
): string {
  const secret = getSecret();
  const ttl = type === 'access' ? ACCESS_TTL : REFRESH_TTL;
  const jti = randomUUID();

  return jwt.sign(
    { user_id: payload.user_id, jti },
    secret,
    { expiresIn: ttl }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verify(token: string): JwtPayload {
  const secret = getSecret();
  return jwt.verify(token, secret) as JwtPayload;
}

/**
 * Decode a JWT token without verifying (for extracting jti from expired tokens)
 */
export function decode(token: string): JwtPayload | null {
  const decoded = jwt.decode(token);
  return decoded as JwtPayload | null;
}
