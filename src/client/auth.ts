import {
  AuthProvider,
  createAuthHttpClient,
  createAuthProvider,
  HTTPClient,
} from 'tushan';

const authStorageKey = 'admin:fxxk';

export const authProvider: AuthProvider = createAuthProvider({
  authStorageKey,
  loginUrl: '/api/login',
});

export const authHTTPClient: HTTPClient = createAuthHttpClient(authStorageKey);
