// pages/AddEmployee.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import EmployeeForm from '../components/employee/EmployeeForm';

export default function AddEmployee() {
  const navigate  = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const existingIds = employeeService.getEmployees().map((e) => e.id);

  const handleSubmit = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    employeeService.addEmployee(data);
    addToast({ message: `${data.firstName} ${data.lastName} has been added successfully!`, type: 'success' });
    setLoading(false);
    navigate('/employees');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Add New Employee</h2>
        <p className="text-sm text-slate-500">Fill in the details below to add a new team member.</p>
      </div>
      <EmployeeForm
        existingIds={existingIds}
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() => navigate('/employees')}
      />
    </div>
  );
}
