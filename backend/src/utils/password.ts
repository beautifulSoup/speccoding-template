import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt with cost=12
 */
export async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Verify a plain-text password against a bcrypt hash
 */
export async function verify(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
