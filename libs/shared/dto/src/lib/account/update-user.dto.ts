import { z } from 'zod';

export const updateAccountSchema = z.object({
  userId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
})

export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
