// components/employee/EmployeeForm.jsx
// Reusable form used by both Add and Edit employee pages.
import { useState, useEffect } from 'react';
import { User, Briefcase, MapPin } from 'lucide-react';
import Input    from '../common/Input';
import Select   from '../common/Select';
import Button   from '../common/Button';
import Avatar   from '../common/Avatar';
import { DEPARTMENTS, DESIGNATIONS, EMPLOYMENT_STATUSES, GENDERS } from '../../utils/constants';
import { validateEmployeeForm } from '../../utils/validators';
import { formatDateInput, generateEmployeeId } from '../../utils/formatters';

const EMPTY_FORM = {
  employeeId: '',
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  department: '',
  designation: '',
  joiningDate: '',
  employmentStatus: 'Active',
  address: '',
  city: '',
  state: '',
  avatar: null,
};

function SectionHeading({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <Icon size={16} className="text-primary-600" />
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
    </div>
  );
}

export default function EmployeeForm({ initialData = null, existingIds = [], onSubmit, loading = false, onCancel }) {
  const isEdit = !!initialData;

  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        dateOfBirth: formatDateInput(initialData.dateOfBirth),
        joiningDate: formatDateInput(initialData.joiningDate),
      });
    } else {
      setForm((f) => ({ ...f, employeeId: generateEmployeeId(existingIds) }));
    }
  }, [initialData]);

  useEffect(() => {
    setDesignations(DESIGNATIONS[form.department] || []);
    if (!isEdit) setForm((f) => ({ ...f, designation: '' }));
  }, [form.department]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateEmployeeForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...form, id: form.employeeId });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Personal Details */}
      <div className="card p-6 mb-4">
        <SectionHeading icon={User} label="Personal Details" />

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={`${form.firstName} ${form.lastName}`} size="xl" />
          <div>
            <p className="text-sm font-medium text-slate-700">Profile Photo</p>
            <p className="text-xs text-slate-400 mt-0.5">Avatar generated from name automatically</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="e.g. Arjun"
            value={form.firstName}
            onChange={set('firstName')}
            error={errors.firstName}
            required
          />
          <Input
            label="Last Name"
            placeholder="e.g. Sharma"
            value={form.lastName}
            onChange={set('lastName')}
            error={errors.lastName}
            required
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={set('gender')}
            options={GENDERS}
            error={errors.gender}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={set('dateOfBirth')}
            error={errors.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="employee@company.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            required
          />
        </div>
      </div>

      {/* Job Details */}
      <div className="card p-6 mb-4">
        <SectionHeading icon={Briefcase} label="Job Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            value={form.employeeId}
            onChange={set('employeeId')}
            error={errors.employeeId}
            required
            disabled={isEdit}
            hint={isEdit ? 'Employee ID cannot be changed.' : undefined}
          />
          <Select
            label="Department"
            value={form.department}
            onChange={set('department')}
            options={DEPARTMENTS}
            error={errors.department}
            required
          />
          <Select
            label="Designation"
            value={form.designation}
            onChange={set('designation')}
            options={designations.length ? designations : []}
            placeholder={form.department ? 'Select Designation' : 'Select Department first'}
            error={errors.designation}
            required
            disabled={!form.department}
          />
          <Input
            label="Joining Date"
            type="date"
            value={form.joiningDate}
            onChange={set('joiningDate')}
            error={errors.joiningDate}
            required
          />
          <Select
            label="Employment Status"
            value={form.employmentStatus}
            onChange={set('employmentStatus')}
            options={EMPLOYMENT_STATUSES}
            error={errors.employmentStatus}
            required
          />
        </div>
      </div>

      {/* Contact Details */}
      <div className="card p-6 mb-6">
        <SectionHeading icon={MapPin} label="Contact Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Address"
              placeholder="Street address"
              value={form.address}
              onChange={set('address')}
              error={errors.address}
            />
          </div>
          <Input
            label="City"
            placeholder="e.g. Bangalore"
            value={form.city}
            onChange={set('city')}
            error={errors.city}
          />
          <Input
            label="State"
            placeholder="e.g. Karnataka"
            value={form.state}
            onChange={set('state')}
            error={errors.state}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
