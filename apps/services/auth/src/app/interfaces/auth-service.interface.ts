import { CreateUserDto, LoginUserDto, OauthUserDto } from '@the-nexcom/dto';
import { UserJwt } from '@the-nexcom/nest-common';

/**
 * Interface representing the authentication service.
 */
export interface AuthServiceInterface {
  /**
   * Updates the hashed refresh token for a user.
   * @param userId - The ID of the user.
   * @param refreshToken - The new refresh token.
   * @returns A promise that resolves when the operation is complete.
   */
  updateHashedRefreshToken(userId: string, refreshToken: string): Promise<void>;

  /**
   * Verifies the refresh token for a user.
   * @param userId - The ID of the user.
   * @param refreshToken - The refresh token to verify.
   * @returns A promise that resolves with the user's ID if the token is valid.
   */
  verifyRefreshToken(userId: string, refreshToken: string): Promise<{ id: string }>;

  /**
   * Generates a new access token and refresh token for a user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves with the new access token and refresh token.
   */
  refreshToken(userId: string): Promise<{ access_token: string; refresh_token: string }>;

  /**
   * Verifies a JWT token.
   * @param jwt - The JWT token to verify.
   * @returns A promise that resolves with the token's expiration time.
   */
  verifyToken(jwt: string): Promise<{ exp: number }>;

  /**
   * Retrieves the user information from a JWT token in the header.
   * @param jwt - The JWT token.
   * @returns A promise that resolves with the user information or undefined if the token is invalid.
   */
  getUserFromHeader(jwt: string): Promise<UserJwt | undefined>;

  /**
   * Validates a user's email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns A promise that resolves with the user's ID if the credentials are valid, or null otherwise.
   */
  validateEmailAndPasswordUser(email: string, password: string): Promise<{ id: string } | null>;

  /**
   * Validates an OAuth user.
   * @param user - The OAuth user data transfer object.
   * @returns A promise that resolves with the user's ID.
   */
  validateOAuthUser(user: OauthUserDto): Promise<{ id: string }>;

  /**
   * Authenticates a user by their ID.
   * @param userId - The ID of the user.
   * @returns A promise that resolves with the new access token and refresh token.
   */
  authenticateUser(userId: string): Promise<{ access_token: string; refresh_token: string }>;

  /**
   * Logs in a user.
   * @param user - The login user data transfer object.
   * @returns A promise that resolves with the new access token and refresh token.
   */
  login(user: LoginUserDto): Promise<{ access_token: string; refresh_token: string }>;

  /**
   * Registers a new user with email and password.
   * @param user - The create user data transfer object.
   * @returns A promise that resolves with the new access token and refresh token.
   */
  registerEmailPassword(user: CreateUserDto): Promise<{ access_token: string; refresh_token: string }>;

  /**
   * Generates a cryptographic token.
   * @param length - The length of the token. Defaults to a predefined length if not specified.
   * @returns The generated token as a string.
   */
  generateCryptoToken(length?: number): string;

    /**
   * hashes a token using Argon2.
   * @param token - The token to hash.
   * @returns The generated token as a string.
   */
  hashToken(token: string): Promise<string>;

  /**
   * Sets the session token to Redis.
   * @param userId - The ID of the user.
   * @param sessionId - The session ID.
   * @param sat - The session access token.
   * @param sct - The session continuous token.
   * @returns A promise that resolves when the operation is complete.
   */
  setSessionTokenToRedis(userId: string, sessionId: string, sat : string, sct: string): Promise<void>;

  /**
   * Updates the session token in Redis.
   * @param userId - The ID of the user.
   * @param sessionId - The session ID.
   * @returns A promise that resolves with the session access token and session continuous token.
   */
  updateSessionTokenToRedis(userId: string, sessionId: string): Promise<{
    sat: string;
    sct: string;
  }>;

  /**
   * Refreshes the session access token.
   * @param userId - The ID of the user.
   * @param sessionId - The session ID.
   * @param sct - The session continuous token.
   * @returns A promise that resolves with the new session access token.
   */
  refreshSessionAccessToken(userId: string, sessionId: string, hashedSatKey: string): Promise<{ sat: string }>;

  /**
   * Validates the session tokens.
   * @param userId - The ID of the user.
   * @param sessionId - The session ID.
   * @param sat - The session access token.
   * @param sct - The session continuous token.
   * @returns return a promise that resolves with the session access token and session continuous token
   */
  validateSessionTokens(userId: string, sessionId: string, sat: string, sct: string): Promise<{ err: unknown; sat: string | undefined; }>


  compareSessionToken(token: string, hashedToken: string): Promise<boolean>;
}
