// App.jsx - Root application router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute    from './routes/ProtectedRoute';
import AppLayout         from './layouts/AppLayout';

// Pages
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import Employees       from './pages/Employees';
import AddEmployee     from './pages/AddEmployee';
import EditEmployee    from './pages/EditEmployee';
import EmployeeProfile from './pages/EmployeeProfile';
import Attendance      from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Reports         from './pages/Reports';
import NotFound        from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected – wrapped in AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"           element={<Dashboard />} />
                <Route path="/employees"           element={<Employees />} />
                <Route path="/employees/add"       element={<AddEmployee />} />
                <Route path="/employees/:id"       element={<EmployeeProfile />} />
                <Route path="/employees/:id/edit"  element={<EditEmployee />} />
                <Route path="/attendance"          element={<Attendance />} />
                <Route path="/leave"               element={<LeaveManagement />} />
                <Route path="/reports"             element={<Reports />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
