import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(150),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(UserRole),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
