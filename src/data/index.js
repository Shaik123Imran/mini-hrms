// data/index.js
// Single source of truth for all mock data. Everything lives in data/data.json.

import rawData from './data.json';

export const ROLES = rawData.roles;
export const USERS = rawData.users;
export const INITIAL_EMPLOYEES = rawData.employees;
export const INITIAL_ATTENDANCE = rawData.attendance;
export const INITIAL_LEAVES = rawData.leaves;
export const INITIAL_PROJECTS = rawData.projects;
export const DASHBOARD_STATS = rawData.dashboardStats;
export const DEPARTMENT_DISTRIBUTION = rawData.departmentDistribution;
export const ATTENDANCE_TREND = rawData.attendanceTrend;

export default rawData;