// services/authService.js
// Mock authentication service with JWT tokens and role-based users.
// Replace with real API/Axios calls + server-issued JWTs when a backend is ready.

import { storage } from '../utils/localStorage';
import { jwt, JWT_SECRET } from '../utils/jwt';
import { USERS } from '../data';

const AUTH_KEY = 'auth';
const TOKEN_KEY = 'auth_token';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/** Strip sensitive fields (password) before exposing a user anywhere. */
function publicUser(raw) {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    role: raw.role,
    employeeId: raw.employeeId || null,
    avatar: raw.avatar || null,
  };
}

export const authService = {
  /**
   * Attempt login with email + password against the mock user directory.
   * Returns { success, user, token, error }.
   */
  login(email, password) {
    const account = USERS.find(
      (u) => u.email.toLowerCase() === String(email || '').trim().toLowerCase()
    );

    if (!account || account.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const user = publicUser(account);
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
      },
      JWT_SECRET,
      { expiresInMs: TOKEN_TTL_MS }
    );

    const session = { user, token, loggedIn: true };
    storage.set(AUTH_KEY, session);
    storage.set(TOKEN_KEY, token);
    return { success: true, user, token };
  },

  logout() {
    storage.remove(AUTH_KEY);
    storage.remove(TOKEN_KEY);
  },

  /** Returns the stored (decoded) session if the token is valid and unexpired. */
  getSession() {
    const session = storage.get(AUTH_KEY, null);
    if (!session || !session.loggedIn || !session.token) return null;
    if (!jwt.verify(session.token, JWT_SECRET)) return null;
    return session;
  },

  /** Raw JWT string for use as an Authorization header (e.g. `Bearer <token>`). */
  getToken() {
    return storage.get(TOKEN_KEY, null);
  },

  isAuthenticated() {
    return !!authService.getSession();
  },
};