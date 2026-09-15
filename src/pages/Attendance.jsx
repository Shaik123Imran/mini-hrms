// pages/Attendance.jsx
import { useState, useMemo, useEffect } from 'react';
import { UserCheck, UserX, Clock, X, LogIn, LogOut, CalendarCheck } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import { DEPARTMENTS, ATTENDANCE_STATUSES } from '../utils/constants';
import { formatDate, formatTime } from '../utils/formatters';
import { useAuth }   from '../context/AuthContext';
import { useToast }  from '../context/ToastContext';
import { can }       from '../utils/permissions';
import SearchBar  from '../components/common/SearchBar';
import Select     from '../components/common/Select';
import Badge, { getStatusVariant } from '../components/common/Badge';
import Avatar     from '../components/common/Avatar';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Button     from '../components/common/Button';

const ITEMS = 10;

function SummaryPill({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const myEmployeeId = user?.employeeId || null;
  const canViewAll = can(user, 'attendance.view');

  const [records, setRecords]   = useState(() => attendanceService.getAttendance());
  const todayStr                = new Date().toISOString().split('T')[0];

  const [dateFilter, setDate]   = useState(todayStr);
  const [search, setSearch]     = useState('');
  const [deptFilter, setDept]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]         = useState(1);

  // Employees only see their own records; managers/HR/admins see everything.
  const visible = useMemo(
    () => (canViewAll ? records : records.filter((r) => r.employeeId === myEmployeeId)),
    [records, canViewAll, myEmployeeId]
  );

  // Live clock for the clock-in/out card
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myRecord    = records.find((r) => r.employeeId === myEmployeeId && r.date === todayStr) || null;
  const isClockedIn = !!myRecord?.checkIn && !myRecord.checkOut;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return visible.filter((r) => {
      const matchDate   = !dateFilter  || r.date === dateFilter;
      const matchSearch = !q || r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q);
      const matchDept   = !deptFilter   || r.department === deptFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchDate && matchSearch && matchDept && matchStatus;
    });
  }, [visible, dateFilter, search, deptFilter, statusFilter]);

  useEffect(() => { setPage(1); }, [dateFilter, search, deptFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginated  = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const present = filtered.filter((r) => r.status === 'Present').length;
  const absent  = filtered.filter((r) => r.status === 'Absent').length;
  const late    = filtered.filter((r) => r.status === 'Late').length;

  const clearFilters = () => { setSearch(''); setDept(''); setStatus(''); };
  const hasFilters = search || deptFilter || statusFilter;

  const handleClock = () => {
    if (!myEmployeeId) {
      addToast({ message: 'Your account is not linked to an employee profile.', type: 'warning' });
      return;
    }
    const emp = employeeService.getById(myEmployeeId);
    if (!isClockedIn) {
      const rec = attendanceService.clockIn(
        myEmployeeId,
        emp ? `${emp.firstName} ${emp.lastName}` : user?.name || 'Employee',
        emp?.department || 'Human Resources'
      );
      setRecords(attendanceService.getAttendance());
      addToast({
        message: `Checked in at ${formatTime(rec.checkIn)}.`,
        type: rec.status === 'Late' ? 'warning' : 'success',
      });
    } else {
      const rec = attendanceService.clockOut(myEmployeeId);
      setRecords(attendanceService.getAttendance());
      addToast({ message: `Checked out at ${formatTime(rec.checkOut)}.`, type: 'success' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Clock in / out */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'}`}>
            {isClockedIn ? <LogIn size={22} className="text-white" /> : <LogOut size={22} className="text-white" />}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isClockedIn
                ? `Checked in at ${formatTime(myRecord.checkIn)} — welcome back, ${user?.name?.split(' ')[0] || 'HR'}!`
                : 'Not checked in yet today. Clock in to mark your attendance.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {myRecord?.checkIn && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Status</p>
              <Badge variant={getStatusVariant(myRecord.status)} dot>{myRecord.status}</Badge>
            </div>
          )}
          <Button variant={isClockedIn ? 'danger' : 'success'} onClick={handleClock}>
            {isClockedIn ? (<><LogOut size={16} /> Clock Out</>) : (<><LogIn size={16} /> Clock In</>)}
          </Button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryPill icon={UserCheck} label="Present" value={present} color="bg-emerald-500" />
        <SummaryPill icon={UserX}    label="Absent"  value={absent}  color="bg-red-500" />
        <SummaryPill icon={Clock}    label="Late"    value={late}    color="bg-amber-500" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDate(e.target.value)}
          className="input-field w-full sm:w-44"
          aria-label="Filter by date"
        />
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search employee..." />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={deptFilter}
            onChange={(e) => setDept(e.target.value)}
            options={DEPARTMENTS}
            placeholder="All Departments"
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            options={ATTENDANCE_STATUSES}
            placeholder="All Statuses"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {paginated.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description={dateFilter ? `No records found for ${formatDate(dateFilter)}.` : 'Adjust your filters to see records.'}
            action={hasFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-th pl-5">Employee</th>
                    <th className="table-th hidden sm:table-cell">Department</th>
                    <th className="table-th">Date</th>
                    <th className="table-th hidden md:table-cell">Check In</th>
                    <th className="table-th hidden md:table-cell">Check Out</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="table-td pl-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.employeeName} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{r.employeeName}</p>
                            <p className="text-xs text-slate-400">{r.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td hidden sm:table-cell text-slate-500">{r.department}</td>
                      <td className="table-td text-slate-500">{formatDate(r.date)}</td>
                      <td className="table-td hidden md:table-cell text-slate-500">
                        {r.checkIn ? formatTime(r.checkIn) : '—'}
                      </td>
                      <td className="table-td hidden md:table-cell text-slate-500">
                        {r.checkOut ? formatTime(r.checkOut) : '—'}
                      </td>
                      <td className="table-td">
                        <Badge variant={getStatusVariant(r.status)} dot>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={ITEMS}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}