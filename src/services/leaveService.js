// services/leaveService.js
// Mock leave management service backed by localStorage.

import { storage } from '../utils/localStorage';
import { INITIAL_LEAVES } from '../data/leaves';

const KEY = 'leaves';

function getAll() {
  return storage.get(KEY, INITIAL_LEAVES);
}

function saveAll(leaves) {
  storage.set(KEY, leaves);
}

export const leaveService = {
  getLeaves() {
    return getAll();
  },

  getById(id) {
    return getAll().find((l) => l.id === id) || null;
  },

  getByEmployee(employeeId) {
    return getAll().filter((l) => l.employeeId === employeeId);
  },

  updateStatus(id, status) {
    const leaves = getAll();
    const idx = leaves.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    leaves[idx] = { ...leaves[idx], status };
    saveAll(leaves);
    return leaves[idx];
  },

  /**
   * Adds a new leave request.
   * @param {object} data - { employeeId, employeeName, department, leaveType, fromDate, toDate, days, reason }
   */
  addLeave(data) {
    const leaves = getAll();
    const nextNum = leaves.reduce((max, l) => {
      const n = parseInt(l.id.replace(/\D/g, ''), 10);
      return !isNaN(n) ? Math.max(max, n) : max;
    }, 0) + 1;
    const newLeave = {
      id: `LV${String(nextNum).padStart(3, '0')}`,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      department: data.department,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      days: data.days,
      reason: data.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    leaves.unshift(newLeave);
    saveAll(leaves);
    return newLeave;
  },

  getSummary() {
    const leaves = getAll();
    return {
      pending:  leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
      total:    leaves.length,
    };
  },
};
