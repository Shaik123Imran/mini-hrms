// pages/auth/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function Logout() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) logout();
  }, [isAuthenticated, logout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden text-center">
          {/* Top brand bar */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-6 text-white">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 size={22} className="text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold leading-tight">Mini HRMS</h1>
                <p className="text-primary-200 text-xs">Employee Management System</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-10">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <LogOut size={28} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">You've been logged out</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your session has ended. Your JWT token has been revoked and you'll need
              to sign in again to continue.
            </p>
            <div className="mt-6">
              <Button size="lg" fullWidth onClick={() => navigate('/login')}>
                Sign In Again <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="pb-6 text-center text-xs text-slate-400">
            © 2026 Mini HRMS. Internal use only.
          </div>
        </div>
      </div>
    </div>
  );
}