// data/attendance.js
// Mock attendance records for the current month

const TODAY = new Date();
const YEAR = TODAY.getFullYear();
const MONTH = TODAY.getMonth(); // 0-indexed

function dateStr(day) {
  return `${YEAR}-${String(MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Employee IDs used in attendance records
const EMP_IDS = [
  { id: 'EMP1001', name: 'Arjun Sharma',     department: 'Engineering' },
  { id: 'EMP1002', name: 'Priya Nair',        department: 'Human Resources' },
  { id: 'EMP1003', name: 'Rahul Verma',       department: 'Finance' },
  { id: 'EMP1004', name: 'Sneha Patel',       department: 'Marketing' },
  { id: 'EMP1005', name: 'Vikram Singh',      department: 'Operations' },
  { id: 'EMP1006', name: 'Divya Krishnan',    department: 'Engineering' },
  { id: 'EMP1007', name: 'Rohan Mehta',       department: 'Sales' },
  { id: 'EMP1008', name: 'Ananya Gupta',      department: 'Product' },
  { id: 'EMP1009', name: 'Suresh Babu',       department: 'Engineering' },
  { id: 'EMP1010', name: 'Neha Joshi',        department: 'Design' },
];

const STATUSES = ['Present', 'Present', 'Present', 'Present', 'Late', 'Absent'];

let id = 1;
export const INITIAL_ATTENDANCE = [];

for (let day = 1; day <= Math.min(TODAY.getDate(), 28); day++) {
  const date = new Date(YEAR, MONTH, day);
  // Skip weekends
  if (date.getDay() === 0 || date.getDay() === 6) continue;

  EMP_IDS.forEach((emp) => {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const checkIn  = status === 'Absent' ? null : status === 'Late' ? '10:15' : `0${8 + Math.floor(Math.random() * 2)}:${Math.random() > 0.5 ? '00' : '30'}`;
    const checkOut = status === 'Absent' ? null : `17:${Math.random() > 0.5 ? '00' : '30'}`;

    INITIAL_ATTENDANCE.push({
      id: `ATT${String(id++).padStart(4, '0')}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: dateStr(day),
      checkIn,
      checkOut,
      status,
    });
  });
}
