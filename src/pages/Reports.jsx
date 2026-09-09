// pages/Reports.jsx
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import { employeeService }  from '../services/employeeService';
import { leaveService }     from '../services/leaveService';
import { attendanceService } from '../services/attendanceService';
import {
  DEPARTMENT_DISTRIBUTION, ATTENDANCE_TREND,
} from '../data/dashboard';
import { EMPLOYMENT_STATUSES } from '../utils/constants';
import Card, { CardHeader } from '../components/common/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export default function Reports() {
  const employees = employeeService.getEmployees();
  const leaves    = leaveService.getLeaves();

  // Department counts
  const deptData = DEPARTMENT_DISTRIBUTION;

  // Status distribution
  const statusData = EMPLOYMENT_STATUSES.map((s) => ({
    name: s,
    count: employees.filter((e) => e.employmentStatus === s).length,
  })).filter((d) => d.count > 0);

  // Leave type breakdown
  const leaveTypeData = [
    'Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave',
  ].map((t) => ({
    name: t.replace(' Leave', ''),
    total: leaves.filter((l) => l.leaveType === t).length,
    approved: leaves.filter((l) => l.leaveType === t && l.status === 'Approved').length,
    pending: leaves.filter((l) => l.leaveType === t && l.status === 'Pending').length,
  })).filter((d) => d.total > 0);

  const totalAttendance = attendanceService.getAttendance();
  const presentPct = totalAttendance.length
    ? Math.round((totalAttendance.filter((r) => r.status === 'Present').length / totalAttendance.length) * 100)
    : 0;
  const absentPct = totalAttendance.length
    ? Math.round((totalAttendance.filter((r) => r.status === 'Absent').length / totalAttendance.length) * 100)
    : 0;
  const latePct = totalAttendance.length
    ? Math.round((totalAttendance.filter((r) => r.status === 'Late').length / totalAttendance.length) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees',  value: employees.length,                     color: 'text-primary-600' },
          { label: 'Active',           value: employees.filter(e => e.employmentStatus === 'Active').length, color: 'text-emerald-600' },
          { label: 'Attendance Rate',  value: `${presentPct}%`,                     color: 'text-blue-600' },
          { label: 'Pending Leaves',   value: leaves.filter(l => l.status === 'Pending').length, color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Employees by Department - Bar */}
        <Card padding={false} className="p-5">
          <CardHeader title="Employees by Department" subtitle="Headcount per department" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" name="Employees" radius={[4, 4, 0, 0]}>
                {deptData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Employment Status - Pie */}
        <Card padding={false} className="p-5">
          <CardHeader title="Employment Status" subtitle="Active vs inactive employees" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-slate-600">{d.name}</span>
                  <span className="font-semibold text-slate-900 ml-auto pl-2">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Trend */}
        <Card padding={false} className="p-5">
          <CardHeader title="Attendance Trend" subtitle="Weekly breakdown" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ATTENDANCE_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="absent"  name="Absent"  stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="late"    name="Late"    stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Leave Summary */}
        <Card padding={false} className="p-5">
          <CardHeader title="Leave Summary by Type" subtitle="Approved vs Pending breakdown" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveTypeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="approved" name="Approved" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending"  name="Pending"  fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Attendance breakdown table */}
      <Card>
        <CardHeader title="Attendance Summary" subtitle="Overall attendance breakdown" />
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Present Rate', value: `${presentPct}%`, bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'Absent Rate',  value: `${absentPct}%`,  bg: 'bg-red-50',     text: 'text-red-700' },
            { label: 'Late Rate',    value: `${latePct}%`,    bg: 'bg-amber-50',   text: 'text-amber-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
              <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-sm text-slate-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
