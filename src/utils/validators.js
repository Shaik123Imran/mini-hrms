// utils/validators.js

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^[+]?[\d\s\-().]{7,15}$/.test(phone);
}

export function validateRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function validateDate(value) {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export function validateMinLength(value, min) {
  return String(value).trim().length >= min;
}

/**
 * Validates the employee form fields.
 * Returns an object { field: errorMessage } for invalid fields.
 */
export function validateEmployeeForm(data) {
  const errors = {};

  if (!validateRequired(data.firstName)) errors.firstName = 'First name is required.';
  else if (!validateMinLength(data.firstName, 2)) errors.firstName = 'First name must be at least 2 characters.';

  if (!validateRequired(data.lastName)) errors.lastName = 'Last name is required.';
  else if (!validateMinLength(data.lastName, 2)) errors.lastName = 'Last name must be at least 2 characters.';

  if (!validateRequired(data.email)) errors.email = 'Email is required.';
  else if (!validateEmail(data.email)) errors.email = 'Enter a valid email address.';

  if (!validateRequired(data.phone)) errors.phone = 'Phone number is required.';
  else if (!validatePhone(data.phone)) errors.phone = 'Enter a valid phone number.';

  if (!validateRequired(data.gender)) errors.gender = 'Gender is required.';

  if (!validateRequired(data.dateOfBirth)) errors.dateOfBirth = 'Date of birth is required.';

  if (!validateRequired(data.department)) errors.department = 'Department is required.';

  if (!validateRequired(data.designation)) errors.designation = 'Designation is required.';

  if (!validateRequired(data.joiningDate)) errors.joiningDate = 'Joining date is required.';

  if (!validateRequired(data.employmentStatus)) errors.employmentStatus = 'Employment status is required.';

  if (!validateRequired(data.employeeId)) errors.employeeId = 'Employee ID is required.';

  return errors;
}
