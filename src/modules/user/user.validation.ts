import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).optional(),
});

export const updateUserSchema = z
  .object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
