import { z } from 'zod';

export const createAccountSchema = z.object({
  userId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
})

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
