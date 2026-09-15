// services/apiClient.js
// Thin client-side "API" layer that enforces a valid JWT before any
// protected/mutating operation. Services call assertAuthenticated() (and may
// use getAuthHeaders()) so the token is required exactly where it matters.
// Swap this module for real Axios/fetch calls with the same header shape.

import { jwt, JWT_SECRET } from '../utils/jwt';
import { authService } from './authService';

/** All successful requests can read the current token as `Authorization`. */
export function getAuthHeaders() {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Throws if the caller is missing a valid, unexpired JWT.
 * Call from any service method that must be gated behind authentication.
 */
export function assertAuthenticated() {
  const token = authService.getToken();
  if (!token || !jwt.verify(token, JWT_SECRET)) {
    throw new Error('Unauthorized: a valid session token is required.');
  }
  return { Authorization: `Bearer ${token}` };
}