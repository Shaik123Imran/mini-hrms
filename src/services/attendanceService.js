// services/attendanceService.js
// Mock attendance service backed by localStorage.

import { storage } from '../utils/localStorage';
import { INITIAL_ATTENDANCE } from '../data';
import { assertAuthenticated } from './apiClient';

const KEY = 'attendance';

function getAll() {
  return storage.get(KEY, INITIAL_ATTENDANCE);
}

function saveAll(records) {
  storage.set(KEY, records);
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function statusForCheckIn(time) {
  // Scheduled start is 09:00. Arrivals after 09:30 are marked Late.
  return time && time > '09:30' ? 'Late' : 'Present';
}

export const attendanceService = {
  getAttendance() {
    return getAll();
  },

  getByEmployee(employeeId) {
    return getAll().filter((a) => a.employeeId === employeeId);
  },

  getByDate(date) {
    return getAll().filter((a) => a.date === date);
  },

  getByEmployeeAndDate(employeeId, date) {
    return getAll().find((a) => a.employeeId === employeeId && a.date === date) || null;
  },

  getSummaryByDate(date) {
    const records = attendanceService.getByDate(date);
    return {
      present: records.filter((r) => r.status === 'Present').length,
      absent: records.filter((r) => r.status === 'Absent').length,
      late: records.filter((r) => r.status === 'Late').length,
      total: records.length,
    };
  },

  /**
   * Clock in for the given employee on today's date.
   * Creates or updates today's record. Returns the record.
   */
  clockIn(employeeId, employeeName, department) {
    assertAuthenticated();
    const all = getAll();
    const date = todayStr();
    const idx = all.findIndex((a) => a.employeeId === employeeId && a.date === date);
    const checkIn = nowTime();
    const status = statusForCheckIn(checkIn);

    if (idx === -1) {
      const nextNum = all.reduce((max, a) => {
        const n = parseInt(a.id.replace(/\D/g, ''), 10);
        return !isNaN(n) ? Math.max(max, n) : max;
      }, 0) + 1;
      const record = {
        id: `ATT${String(nextNum).padStart(4, '0')}`,
        employeeId,
        employeeName,
        department,
        date,
        checkIn,
        checkOut: null,
        status,
      };
      saveAll([...all, record]);
      return record;
    }

    const updated = { ...all[idx], checkIn, checkOut: null, status };
    const copy = [...all];
    copy[idx] = updated;
    saveAll(copy);
    return updated;
  },

  /**
   * Clock out for the given employee on today's date.
   * Returns the updated record, or null if no open record exists.
   */
  clockOut(employeeId) {
    assertAuthenticated();
    const all = getAll();
    const date = todayStr();
    const idx = all.findIndex((a) => a.employeeId === employeeId && a.date === date);
    if (idx === -1) return null;

    const copy = [...all];
    copy[idx] = { ...copy[idx], checkOut: nowTime() };
    saveAll(copy);
    return copy[idx];
  },
};
