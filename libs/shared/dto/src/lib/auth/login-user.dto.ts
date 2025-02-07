
import { z } from 'zod';

export const LoginUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .required();

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
