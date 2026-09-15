// services/projectService.js
// Mock project service backed by localStorage with role-based visibility.
// Visibility hierarchy (matches how major HRMS portals scope projects):
//   - Admin / HR Manager  -> all projects
//   - Manager             -> projects they lead or that belong to their department/team
//   - Employee            -> only projects they are a member of

import { storage } from '../utils/localStorage';
import { INITIAL_PROJECTS } from '../data';
import { employeeService } from './employeeService';
import { assertAuthenticated } from './apiClient';

const KEY = 'projects';

function getAll() {
  return storage.get(KEY, INITIAL_PROJECTS);
}

function saveAll(projects) {
  storage.set(KEY, projects);
}

/** True if any member of the project works in the given department. */
function projectTouchesDepartment(project, department) {
  if (!department) return false;
  if (project.department === department) return true;
  return project.members.some((id) => {
    const emp = employeeService.getById(id);
    return !!emp && emp.department === department;
  });
}

export const projectService = {
  getProjects() {
    return getAll();
  },

  getById(id) {
    return getAll().find((p) => p.id === id) || null;
  },

  /**
   * Returns the projects a given user is allowed to see.
   * @param {{ role?: string, employeeId?: string|null }|null} user
   */
  getProjectsForUser(user) {
    const all = getAll();
    if (!user) return [];

    if (user.role === 'Admin' || user.role === 'HR Manager') return all;

    if (user.role === 'Manager') {
      const manager = employeeService.getById(user.employeeId);
      const department = manager?.department;
      return all.filter(
        (p) =>
          p.lead === user.employeeId ||
          projectTouchesDepartment(p, department)
      );
    }

    // Employee and any other role: only projects they're part of.
    return all.filter((p) => p.members.includes(user.employeeId));
  },

  /** Add a new project. */
  addProject(data) {
    assertAuthenticated();
    const all = getAll();
    const nextNum = all.reduce((max, p) => {
      const n = parseInt(p.id.replace(/\D/g, ''), 10);
      return !isNaN(n) ? Math.max(max, n) : max;
    }, 0) + 1;
    const project = { id: `PRJ${String(nextNum).padStart(3, '0')}`, ...data };
    all.push(project);
    saveAll(all);
    return project;
  },

  updateProject(id, data) {
    assertAuthenticated();
    const all = getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    saveAll(all);
    return all[idx];
  },
};