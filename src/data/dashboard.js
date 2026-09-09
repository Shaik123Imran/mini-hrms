// data/dashboard.js
// Static mock data for dashboard KPIs and charts

export const DASHBOARD_STATS = {
  totalEmployees: 20,
  presentToday: 16,
  onLeave: 3,
  newJoiners: 3, // joined this month
};

export const DEPARTMENT_DISTRIBUTION = [
  { name: 'Engineering', value: 6, color: '#3b82f6' },
  { name: 'HR',          value: 2, color: '#8b5cf6' },
  { name: 'Finance',     value: 2, color: '#10b981' },
  { name: 'Marketing',   value: 2, color: '#f59e0b' },
  { name: 'Operations',  value: 2, color: '#ef4444' },
  { name: 'Sales',       value: 2, color: '#06b6d4' },
  { name: 'Product',     value: 1, color: '#6366f1' },
  { name: 'Design',      value: 2, color: '#ec4899' },
  { name: 'Others',      value: 1, color: '#64748b' },
];

export const ATTENDANCE_TREND = [
  { day: 'Mon', present: 18, absent: 1, late: 1 },
  { day: 'Tue', present: 17, absent: 2, late: 1 },
  { day: 'Wed', present: 19, absent: 1, late: 0 },
  { day: 'Thu', present: 16, absent: 2, late: 2 },
  { day: 'Fri', present: 15, absent: 3, late: 2 },
];
