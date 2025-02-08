import { z } from 'zod';

export const OauthUserSchema = z.object({
  email: z.string().email(),
  provider: z.enum(['GOOGLE', 'FACEBOOK', 'GITHUB']),
  accountProviderId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
});

// Extended schema with userId
export const OauthUserWithIdSchema = OauthUserSchema.extend({
  userId: z.string(),
});

// Original DTO type
export type OauthUserDto = z.infer<typeof OauthUserSchema>;

// Extended DTO type with userId
export type OauthUserWithIdDto = z.infer<typeof OauthUserWithIdSchema>;
