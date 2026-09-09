// pages/EditEmployee.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import EmployeeForm from '../components/employee/EmployeeForm';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { UserX } from 'lucide-react';

export default function EditEmployee() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { addToast } = useToast();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const emp = employeeService.getById(id);
    setEmployee(emp);
    setFetching(false);
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    employeeService.updateEmployee(id, data);
    addToast({ message: `${data.firstName} ${data.lastName}'s profile updated successfully!`, type: 'success' });
    setLoading(false);
    navigate(`/employees/${id}`);
  };

  if (fetching) return <Loader />;

  if (!employee) {
    return (
      <EmptyState
        icon={UserX}
        title="Employee not found"
        description="The employee you are trying to edit does not exist."
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Edit Employee</h2>
        <p className="text-sm text-slate-500">Update the details for {employee.firstName} {employee.lastName}.</p>
      </div>
      <EmployeeForm
        initialData={employee}
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() => navigate(`/employees/${id}`)}
      />
    </div>
  );
}
