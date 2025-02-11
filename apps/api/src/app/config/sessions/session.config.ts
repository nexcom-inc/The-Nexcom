import { registerAs } from "@nestjs/config";

export default registerAs("SessionConfig", () => ({
  saveUninitialized: false,
  secret: process.env.JWT_SECRET || "secret",
  resave: false,
  cookie: {
    sameSite: true,
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  },
}));
