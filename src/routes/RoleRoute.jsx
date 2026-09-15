// routes/RoleRoute.jsx
// Guards a route so only users with an allowed role can access it.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!allowedRoles || allowedRoles.length === 0) return children;
  if (user && allowedRoles.includes(user.role)) return children;

  // Authenticated but not permitted -> bounce to dashboard.
  return <Navigate to="/dashboard" replace />;
}