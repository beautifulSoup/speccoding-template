import { z } from 'zod';

/**
 * Email validation regex (basic)
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password requirements:
 * - At least 8 characters
 * - Contains at least one letter
 * - Contains at least one number
 */
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  email: z
    .string()
    .refine((val) => emailRegex.test(val), {
      message: 'invalid_email_format',
    }),
  password: z
    .string()
    .refine((val) => passwordRegex.test(val), {
      message: 'weak_password',
    }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .refine((val) => emailRegex.test(val), {
      message: 'invalid_email_format',
    }),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
