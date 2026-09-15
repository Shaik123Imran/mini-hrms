// pages/Projects.jsx
// Projects dashboard. Every role sees it, but visibility is scoped by hierarchy:
//   Admin / HR Manager -> all projects
//   Manager -> their department / team projects
//   Employee -> only their own projects

import { useState, useMemo } from 'react';
import {
  FolderKanban, ListChecks, CheckCircle2, Gauge,
  X, Eye, Users, CalendarRange, IndianRupee, ShieldCheck, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { employeeService } from '../services/employeeService';
import { can } from '../utils/permissions';
import { PROJECT_STATUSES, PROJECT_PRIORITIES, DEPARTMENTS } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/formatters';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Badge, { getStatusVariant } from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Card, { CardHeader } from '../components/common/Card';

const STATUS_COLORS = {
  'Not Started': '#64748b',
  'In Progress': '#3b82f6',
  'In Review':   '#8b5cf6',
  Completed:     '#10b981',
  'On Hold':     '#f59e0b',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
};

function KPI({ title, value, icon: Icon, color, subtitle }) {
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

function EmployeeChip({ employeeId }) {
  const emp = employeeService.getById(employeeId);
  return (
    <div className="flex items-center gap-2">
      <Avatar name={emp ? `${emp.firstName} ${emp.lastName}` : employeeId} size="sm" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {emp ? `${emp.firstName} ${emp.lastName}` : employeeId}
        </p>
        <p className="text-xs text-slate-400 truncate">{emp ? `${emp.designation} · ${emp.department}` : '—'}</p>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const canViewAll = can(user, 'projects.view');

  const projects = useMemo(() => projectService.getProjectsForUser(user), [user]);

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [priorityFilter, setPriority] = useState('');
  const [deptFilter, setDept]     = useState('');
  const [viewing, setViewing]     = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      const matchStatus   = !statusFilter   || p.status === statusFilter;
      const matchPriority = !priorityFilter || p.priority === priorityFilter;
      const matchDept     = !deptFilter     || p.department === deptFilter;
      return matchSearch && matchStatus && matchPriority && matchDept;
    });
  }, [projects, search, statusFilter, priorityFilter, deptFilter]);

  const total      = projects.length;
  const inProgress = projects.filter((p) => p.status === 'In Progress').length;
  const completed  = projects.filter((p) => p.status === 'Completed').length;
  const avgProgress = total ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / total) : 0;

  const statusData = PROJECT_STATUSES.map((s) => ({
    name: s,
    value: projects.filter((p) => p.status === s).length,
  })).filter((d) => d.value > 0);

  const priorityData = PROJECT_PRIORITIES.map((pr) => ({
    name: pr,
    count: projects.filter((p) => p.priority === pr).length,
  })).filter((d) => d.count > 0);

  const hasFilters = search || statusFilter || priorityFilter || deptFilter;
  const clearFilters = () => { setSearch(''); setStatus(''); setPriority(''); setDept(''); };

  const scopeText = canViewAll
    ? 'Viewing all projects across the organisation'
    : user?.role === 'Manager'
      ? 'Viewing projects for your team and department'
      : 'Viewing the projects assigned to you';

  const memberNames = (p) =>
    p.members
      .map((id) => {
        const emp = employeeService.getById(id);
        return emp ? `${emp.firstName} ${emp.lastName}` : id;
      })
      .join(', ');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500">{scopeText}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-primary-500" />
          Role-aware visibility: {user?.role}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI title="Total Projects" value={total} icon={FolderKanban} color="bg-primary-500" subtitle={`${canViewAll ? 'Organisation-wide' : 'Visible to you'}`} />
        <KPI title="In Progress" value={inProgress} icon={ListChecks} color="bg-blue-500" subtitle="Active work items" />
        <KPI title="Completed" value={completed} icon={CheckCircle2} color="bg-emerald-500" subtitle="Delivered projects" />
        <KPI title="Avg. Progress" value={`${avgProgress}%`} icon={Gauge} color="bg-purple-500" subtitle="Across visible projects" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding={false} className="p-5">
          <CardHeader title="By Status" subtitle="Project status distribution" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] || '#94a3b8' }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>

        <Card padding={false} className="p-5">
          <CardHeader title="By Priority" subtitle="Effort grouped by priority" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex-1 min-w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search project or client..." />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            options={PROJECT_STATUSES}
            placeholder="All Statuses"
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriority(e.target.value)}
            options={PROJECT_PRIORITIES}
            placeholder="All Priorities"
          />
        </div>
        {canViewAll && (
          <div className="w-full sm:w-44">
            <Select
              value={deptFilter}
              onChange={(e) => setDept(e.target.value)}
              options={DEPARTMENTS}
              placeholder="All Departments"
            />
          </div>
        )}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={hasFilters ? 'Try adjusting your search or filters.' : 'No projects are visible for your role yet.'}
          action={hasFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const lead = employeeService.getById(p.lead);
            return (
              <div key={p.id} className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FolderKanban size={13} />
                      <span>{p.id}</span>
                      <span>·</span>
                      <span>{p.department}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mt-1 truncate">{p.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{p.client}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={getStatusVariant(p.status)} dot>{p.status}</Badge>
                    <Badge variant={getStatusVariant(p.priority)}>{p.priority}</Badge>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-800">{p.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                    />
                  </div>
                </div>

                {/* Lead + members */}
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">
                    Lead · {p.members.length + 1} team member{p.members.length > 0 ? 's' : ''}
                  </p>
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {lead && <Avatar name={`${lead.firstName} ${lead.lastName}`} size="sm" />}
                      {p.members.slice(0, 3).map((id) => {
                        const emp = employeeService.getById(id);
                        return <Avatar key={id} name={emp ? `${emp.firstName} ${emp.lastName}` : id} size="sm" />;
                      })}
                      {p.members.length > 3 && (
                        <span className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-slate-500">
                          +{p.members.length - 3}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 ml-3 truncate">
                      {lead ? `${lead.firstName} ${lead.lastName}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1"><CalendarRange size={13} /> {formatDate(p.startDate)} → {formatDate(p.endDate)}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={13} /> {formatCurrency(p.budget)}</span>
                </div>

                <Button variant="secondary" size="sm" onClick={() => setViewing(p)} className="mt-auto">
                  <Eye size={14} /> View Details
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {viewing && (
        <Modal open={!!viewing} onClose={() => setViewing(null)} title="Project Details" size="lg">
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{viewing.id} · {viewing.department}</p>
                <h3 className="text-lg font-bold text-slate-900">{viewing.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Client: {viewing.client}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge variant={getStatusVariant(viewing.status)} dot>{viewing.status}</Badge>
                <Badge variant={getStatusVariant(viewing.priority)}>{viewing.priority} priority</Badge>
              </div>
            </div>

            <p className="text-sm text-slate-600">{viewing.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                ['Start Date', formatDate(viewing.startDate)],
                ['End Date', formatDate(viewing.endDate)],
                ['Budget', formatCurrency(viewing.budget)],
                ['Progress', `${viewing.progress}%`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="font-medium text-slate-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <Users size={15} className="text-primary-600" /> Project Team
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Lead</p>
                  <EmployeeChip employeeId={viewing.lead} />
                </div>
                {viewing.members.map((id) => (
                  <div key={id} className="bg-slate-50 rounded-lg p-3">
                    <EmployeeChip employeeId={id} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={13} /> Team members: {memberNames(viewing)}
              </p>
              <Button size="sm" onClick={() => { setViewing(null); }}>
                Close <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}