// services/employeeService.js
// Mock employee CRUD service backed by localStorage.
// Replace function bodies with Axios calls when backend is ready.

import { storage } from '../utils/localStorage';
import { INITIAL_EMPLOYEES } from '../data/employees';

const KEY = 'employees';

function getAll() {
  return storage.get(KEY, INITIAL_EMPLOYEES);
}

function saveAll(employees) {
  storage.set(KEY, employees);
}

export const employeeService = {
  getEmployees() {
    return getAll();
  },

  getById(id) {
    return getAll().find((e) => e.id === id) || null;
  },

  addEmployee(data) {
    const employees = getAll();
    const newEmp = { ...data };
    employees.push(newEmp);
    saveAll(employees);
    return newEmp;
  },

  updateEmployee(id, data) {
    const employees = getAll();
    const idx = employees.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    employees[idx] = { ...employees[idx], ...data };
    saveAll(employees);
    return employees[idx];
  },

  deleteEmployee(id) {
    const employees = getAll().filter((e) => e.id !== id);
    saveAll(employees);
    return true;
  },
};
