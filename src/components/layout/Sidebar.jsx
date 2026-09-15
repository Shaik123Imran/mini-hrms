// components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, CalendarCheck, FileText,
  LogOut, X, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import Avatar from '../common/Avatar';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard, perms: ['dashboard'] },
  { to: '/projects',   label: 'Projects',    icon: FolderKanban,    perms: ['projects.view', 'projects.own'] },
  { to: '/employees',  label: 'Employees',   icon: Users,           perms: ['employees.view'] },
  { to: '/attendance', label: 'Attendance',  icon: CalendarCheck,   perms: ['attendance.view', 'attendance.self'] },
  { to: '/leave',      label: 'Leave Management', icon: FileText,   perms: ['leaves.view', 'leaves.self'] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter((item) =>
    item.perms.some((perm) => can(user, perm))
  );

  const labeled = items.map(({ label, ...rest }) => ({
    ...rest,
    label: user?.role === 'Employee' ? (label === 'Attendance' ? 'My Attendance' : label === 'Leave Management' ? 'My Leaves' : label) : label,
  }));

  const handleLogout = () => {
    onClose();
    navigate('/logout');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-slate-900 flex flex-col transition-transform duration-300
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Mini HRMS</p>
              <p className="text-slate-400 text-xs leading-none mt-0.5">HR Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Menu
          </p>
          {labeled.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section + Logout */}
        <div className="px-3 py-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}