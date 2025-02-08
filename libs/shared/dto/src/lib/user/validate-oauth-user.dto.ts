import { z } from 'zod';

export const validateOauthUserSchema = z.object({
  email: z.string().email(),
  provider : z.enum(['GOOGLE', 'FACEBOOK', 'GITHUB']),
  accountProviderId: z.string().optional(),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
});

export type validateOauthUserDto = z.infer<typeof validateOauthUserSchema>;
