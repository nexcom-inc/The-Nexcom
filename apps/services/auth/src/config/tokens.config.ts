// Define the available token types and their configurations
export const tokenConfigs  = {
  access_token: {
    expiresIn: '15m', // Access token expires in 15 minutes
  },
  refresh_token: {
    expiresIn: '7d', // Refresh token expires in 7 days
  },
  id_token: {
    expiresIn: '1h', // ID token expires in 1 hour
  },
  csrf_token: {
    expiresIn: '30m', // CSRF token expires in 30 minutes
  },
};

export type TokenTypes = keyof typeof tokenConfigs
