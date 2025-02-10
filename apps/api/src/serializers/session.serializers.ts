import { PassportSerializer } from "@nestjs/passport";

export class SessionSerializer extends PassportSerializer {
  // used to serialize the user for the session
  serializeUser(user : unknown, done) {
    done(null, user);
  }

  // used to deserialize the user
  deserializeUser(user, done) {
    done(null, user);
  }
}
