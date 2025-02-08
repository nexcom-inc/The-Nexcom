import { z } from 'zod';

export const createUserProviderSchema = z.object({
  userId: z.string(),
  provider : z.enum(['EMAILANDPASSWORD', 'GOOGLE', 'FACEBOOK', 'GITHUB', 'SSO']).default('EMAILANDPASSWORD').optional(),
  accountProviderId: z.string().optional(),
});

export type CreateUserProviderDto = z.infer<typeof createUserProviderSchema>;
