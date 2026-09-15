// pages/EmployeeProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, User } from 'lucide-react';
import { employeeService }  from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { leaveService }      from '../services/leaveService';
import { formatDate }        from '../utils/formatters';
import { useAuth }           from '../context/AuthContext';
import { can }               from '../utils/permissions';
import Avatar                from '../components/common/Avatar';
import Badge, { getStatusVariant } from '../components/common/Badge';
import Button                from '../components/common/Button';
import Loader                from '../components/common/Loader';
import EmptyState            from '../components/common/EmptyState';
import { UserX }             from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function EmployeeProfile() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit  = can(user, 'employees.edit');

  const [employee, setEmployee]     = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves]         = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const emp  = employeeService.getById(id);
    const att  = attendanceService.getByEmployee(id);
    const lvs  = leaveService.getByEmployee(id);
    setEmployee(emp);
    setAttendance(att);
    setLeaves(lvs);
    setLoading(false);
  }, [id]);

  if (loading) return <Loader />;
  if (!employee) {
    return (
      <EmptyState
        icon={UserX}
        title="Employee not found"
        description="No employee exists with this ID."
        action={<Button variant="secondary" size="sm" onClick={() => navigate('/employees')}>Back to Employees</Button>}
      />
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const presentDays = attendance.filter((a) => a.status === 'Present').length;
  const absentDays  = attendance.filter((a) => a.status === 'Absent').length;
  const lateDays    = attendance.filter((a) => a.status === 'Late').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Profile header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={fullName} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                <p className="text-slate-500 text-sm mt-0.5">{employee.designation}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="blue">{employee.department}</Badge>
                  <Badge variant={getStatusVariant(employee.employmentStatus)} dot>
                    {employee.employmentStatus}
                  </Badge>
                  <span className="text-xs text-slate-400">{employee.id}</span>
                </div>
              </div>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/employees/${id}/edit`)}
                  className="flex-shrink-0"
                >
                  <Pencil size={14} /> Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <SummaryCard label="Present Days"  value={presentDays}    sub="This month" color="bg-emerald-50" />
          <SummaryCard label="Absent Days"   value={absentDays}     sub="This month" color="bg-red-50" />
          <SummaryCard label="Late Days"     value={lateDays}       sub="This month" color="bg-amber-50" />
          <SummaryCard label="Leaves Taken"  value={approvedLeaves} sub="All time"   color="bg-blue-50" />
        </div>
      </div>

      {/* Details panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
            <User size={15} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-slate-700">Personal Information</h3>
          </div>
          <InfoRow icon={User}     label="Full Name"    value={fullName} />
          <InfoRow icon={User}     label="Gender"       value={employee.gender} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
          <InfoRow icon={Mail}     label="Email"        value={employee.email} />
          <InfoRow icon={Phone}    label="Phone"        value={employee.phone} />
        </div>

        {/* Job Info */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
            <Briefcase size={15} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-slate-700">Job Information</h3>
          </div>
          <InfoRow icon={Briefcase} label="Employee ID"       value={employee.id} />
          <InfoRow icon={Briefcase} label="Department"        value={employee.department} />
          <InfoRow icon={Briefcase} label="Designation"       value={employee.designation} />
          <InfoRow icon={Calendar}  label="Joining Date"      value={formatDate(employee.joiningDate)} />
          <InfoRow icon={User}      label="Employment Status" value={employee.employmentStatus} />
        </div>

        {/* Contact Info */}
        <div className="card p-5 md:col-span-2">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
            <MapPin size={15} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-slate-700">Contact Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <InfoRow icon={MapPin} label="Address" value={employee.address} />
            <InfoRow icon={MapPin} label="City"    value={employee.city} />
            <InfoRow icon={MapPin} label="State"   value={employee.state} />
          </div>
        </div>
      </div>
    </div>
  );
}
