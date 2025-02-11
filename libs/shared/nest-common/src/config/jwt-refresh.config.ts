import { registerAs } from "@nestjs/config";
import { JwtSignOptions } from "@nestjs/jwt";

export default registerAs('jwtRefresh', () : JwtSignOptions => ({
  secret: process.env['JWT_REFRESH_SECRET'],
  expiresIn: process.env['JWT_REFRESH_EXPIRES_IN']
}))
