// components/layout/Navbar.jsx
import { useRef, useState, useEffect } from 'react';
import { Menu, Bell, CalendarClock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leaveService';
import { can } from '../../utils/permissions';
import { formatDate } from '../../utils/formatters';
import Avatar from '../common/Avatar';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/projects':   'Projects',
  '/employees':  'Employees',
  '/employees/add': 'Add Employee',
  '/attendance': 'Attendance',
  '/leave':      'Leave Management',
};

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Resolve page title (handle dynamic routes)
  let title = 'Mini HRMS';
  if (location.pathname.includes('/employees/') && location.pathname.includes('/edit')) {
    title = 'Edit Employee';
  } else if (location.pathname.match(/\/employees\/EMP\d+$/)) {
    title = 'Employee Profile';
  } else {
    title = PAGE_TITLES[location.pathname] || 'Mini HRMS';
  }

  // Notifications derived from pending leave requests. Employees only see their own.
  const canSeeAllLeaves = can(user, 'leaves.view');
  const allLeaves = leaveService.getLeaves();
  const pendingLeaves = allLeaves.filter(
    (l) =>
      l.status === 'Pending' &&
      (canSeeAllLeaves || l.employeeId === user?.employeeId)
  );

  const notifications = [
    {
      id: 'welcome',
      type: 'info',
      title: 'Welcome back!',
      message: `You are signed in as ${user?.role || 'User'}.`,
      time: 'Just now',
      route: '/dashboard',
    },
    ...pendingLeaves.map((l) => ({
      id: l.id,
      type: 'leave',
      title: 'Leave request',
      message: canSeeAllLeaves
        ? `${l.employeeName} (${l.leaveType}) from ${formatDate(l.fromDate)}`
        : `${l.leaveType} from ${formatDate(l.fromDate)} — ${l.status}`,
      time: formatDate(l.appliedOn),
      route: '/leave',
    })),
  ];

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4">
      {/* Left: menu button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900 leading-tight">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
            aria-expanded={open}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-600 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                {notifications.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-slate-200 overflow-hidden z-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                <span className="text-xs text-slate-400">{notifications.length} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setOpen(false);
                        if (n.route && n.route !== location.pathname) navigate(n.route);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${n.type === 'leave' ? 'bg-amber-100' : 'bg-primary-100'}`}>
                        {n.type === 'leave'
                          ? <CalendarClock size={15} className="text-amber-600" />
                          : <Bell size={15} className="text-primary-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 truncate">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 leading-none mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}