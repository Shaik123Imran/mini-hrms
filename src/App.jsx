// App.jsx - Root application router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute    from './routes/ProtectedRoute';
import RoleRoute         from './routes/RoleRoute';
import AppLayout         from './layouts/AppLayout';

// Auth pages
import Login  from './pages/auth/Login';
import Logout from './pages/auth/Logout';

// Main pages
import Dashboard       from './pages/Dashboard';
import Projects        from './pages/Projects';
import Employees       from './pages/Employees';
import AddEmployee     from './pages/AddEmployee';
import EditEmployee    from './pages/EditEmployee';
import EmployeeProfile from './pages/EmployeeProfile';
import Attendance      from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"  element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            {/* Protected – wrapped in AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />

                <Route
                  path="/employees"
                  element={
                    <RoleRoute allowedRoles={['Admin', 'HR Manager', 'Manager']}>
                      <Employees />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/employees/add"
                  element={
                    <RoleRoute allowedRoles={['Admin', 'HR Manager']}>
                      <AddEmployee />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/employees/:id/edit"
                  element={
                    <RoleRoute allowedRoles={['Admin', 'HR Manager']}>
                      <EditEmployee />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/employees/:id"
                  element={
                    <RoleRoute allowedRoles={['Admin', 'HR Manager', 'Manager']}>
                      <EmployeeProfile />
                    </RoleRoute>
                  }
                />

                <Route path="/attendance"       element={<Attendance />} />
                <Route path="/leave"            element={<LeaveManagement />} />
              </Route>
            </Route>

            {/* Everything else bounces to the dashboard (or login via guard) */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}