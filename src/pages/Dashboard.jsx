// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, CalendarX, UserPlus,
  TrendingUp, ArrowRight, Clock, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { employeeService } from '../services/employeeService';
import { leaveService }    from '../services/leaveService';
import {
  DASHBOARD_STATS, DEPARTMENT_DISTRIBUTION, ATTENDANCE_TREND,
} from '../data/dashboard';
import { formatDate } from '../utils/formatters';
import Avatar from '../components/common/Avatar';
import Badge, { getStatusVariant } from '../components/common/Badge';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';

function KPICard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card p-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves]       = useState([]);

  useEffect(() => {
    setEmployees(employeeService.getEmployees());
    setLeaves(leaveService.getLeaves());
  }, []);

  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
    .slice(0, 5);

  const recentLeaves = [...leaves]
    .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
    .slice(0, 5);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employmentStatus === 'Active').length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          color="bg-primary-500"
          subtitle={`${activeEmployees} active`}
        />
        <KPICard
          title="Present Today"
          value={DASHBOARD_STATS.presentToday}
          icon={UserCheck}
          color="bg-emerald-500"
          subtitle="Based on today's attendance"
        />
        <KPICard
          title="On Leave"
          value={DASHBOARD_STATS.onLeave}
          icon={CalendarX}
          color="bg-amber-500"
          subtitle="This week"
        />
        <KPICard
          title="New Joiners"
          value={DASHBOARD_STATS.newJoiners}
          icon={UserPlus}
          color="bg-purple-500"
          subtitle="This month"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 card p-5">
          <CardHeader
            title="Weekly Attendance Overview"
            subtitle="Present, Absent, and Late counts this week"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ATTENDANCE_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent"  name="Absent"  fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late"    name="Late"    fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="card p-5">
          <CardHeader
            title="By Department"
            subtitle="Employee distribution"
          />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={DEPARTMENT_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {DEPARTMENT_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {DEPARTMENT_DISTRIBUTION.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent employees + recent leaves */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Employees */}
        <Card padding={false}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Employees</h3>
              <p className="text-xs text-slate-500">Latest additions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/employees')}
              className="gap-1"
            >
              View all <ArrowRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {emp.designation} · {emp.department}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <Badge variant={getStatusVariant(emp.employmentStatus)} dot>
                    {emp.employmentStatus}
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(emp.joiningDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Leave Requests */}
        <Card padding={false}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500">Latest applications</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leave')}
              className="gap-1"
            >
              View all <ArrowRight size={14} />
            </Button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={leave.employeeName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{leave.employeeName}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Clock size={11} />
                    {leave.leaveType} · {leave.days} day{leave.days > 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant={getStatusVariant(leave.status)}>
                  {leave.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/employees/add')}>
            <UserPlus size={16} /> Add Employee
          </Button>
          <Button variant="secondary" onClick={() => navigate('/attendance')}>
            <CalendarX size={16} /> View Attendance
          </Button>
          <Button variant="secondary" onClick={() => navigate('/leave')}>
            <TrendingUp size={16} /> Leave Requests
          </Button>
          <Button variant="secondary" onClick={() => navigate('/reports')}>
            <BarChart3 size={16} /> View Reports
          </Button>
        </div>
      </Card>
    </div>
  );
}
