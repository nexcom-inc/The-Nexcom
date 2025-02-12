import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  emailVerified : z.boolean().default(false).optional(),
  password: z.string().optional(),
  provider : z.enum(['EMAILANDPASSWORD', 'GOOGLE', 'FACEBOOK', 'GITHUB', 'SSO']).default('EMAILANDPASSWORD'),
  accountProviderId: z.string().optional(),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
