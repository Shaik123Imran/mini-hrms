// services/authService.js
// Mock authentication service. Replace with real API calls when backend is ready.

import { storage } from '../utils/localStorage';
import { MOCK_CREDENTIALS } from '../utils/constants';

const AUTH_KEY = 'auth';

export const authService = {
  /**
   * Attempt login with email + password.
   * Returns { success, user, error }
   */
  login(email, password) {
    if (
      email.trim().toLowerCase() === MOCK_CREDENTIALS.email &&
      password === MOCK_CREDENTIALS.password
    ) {
      const user = {
        email: MOCK_CREDENTIALS.email,
        name: MOCK_CREDENTIALS.name,
        role: MOCK_CREDENTIALS.role,
      };
      storage.set(AUTH_KEY, { user, loggedIn: true });
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password.' };
  },

  logout() {
    storage.remove(AUTH_KEY);
  },

  getSession() {
    return storage.get(AUTH_KEY, null);
  },

  isAuthenticated() {
    const session = authService.getSession();
    return !!(session && session.loggedIn);
  },
};
