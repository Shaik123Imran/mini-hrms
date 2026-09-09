// utils/constants.js

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
  'Sales',
  'Customer Support',
  'Legal',
  'Product',
  'Design',
];

export const DESIGNATIONS = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Engineering Manager', 'DevOps Engineer', 'QA Engineer'],
  'Human Resources': ['HR Executive', 'HR Manager', 'Recruiter', 'HR Business Partner', 'Talent Acquisition Lead'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager', 'CFO', 'Payroll Specialist'],
  Marketing: ['Marketing Executive', 'Marketing Manager', 'Content Writer', 'SEO Specialist', 'Brand Manager'],
  Operations: ['Operations Executive', 'Operations Manager', 'Business Analyst', 'Project Manager', 'COO'],
  Sales: ['Sales Executive', 'Sales Manager', 'Account Manager', 'Business Development Manager'],
  'Customer Support': ['Support Executive', 'Support Lead', 'Customer Success Manager'],
  Legal: ['Legal Counsel', 'Compliance Officer', 'Legal Manager'],
  Product: ['Product Manager', 'Product Owner', 'Associate Product Manager'],
  Design: ['UI Designer', 'UX Designer', 'Product Designer', 'Graphic Designer'],
};

export const ALL_DESIGNATIONS = Object.values(DESIGNATIONS).flat();

export const EMPLOYMENT_STATUSES = ['Active', 'Inactive', 'On Probation', 'Terminated'];

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

export const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Half Day'];

export const MOCK_CREDENTIALS = {
  email: 'admin@company.com',
  password: 'admin123',
  name: 'Sarah Mitchell',
  role: 'HR Administrator',
  avatar: null,
};

export const ITEMS_PER_PAGE = 10;
