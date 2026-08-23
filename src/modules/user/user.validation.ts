import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'USER']).optional(),
});

export const updateUserSchema = z
  .object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
