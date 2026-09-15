// utils/permissions.js
// Role-based permission checks. Permission lists are defined in data/data.json.

import { ROLES } from '../data';

/**
 * Check whether a user has a given permission for their role.
 * @param {{ role?: string }|null} user
 * @param {string} permission e.g. 'employees.edit'
 */
export function can(user, permission) {
  if (!user || !user.role) return false;
  const perms = ROLES[user.role];
  return Array.isArray(perms) && perms.includes(permission);
}

/** Role the current user sees the app as — used to label nav/UI. */
export function roleLabel(role) {
  switch (role) {
    case 'Admin':      return 'Administrator';
    case 'HR Manager': return 'HR Manager';
    case 'Manager':    return 'Manager';
    case 'Employee':   return 'Employee';
    default:           return role || 'User';
  }
}