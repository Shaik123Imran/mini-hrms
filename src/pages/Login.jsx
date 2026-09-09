// pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MOCK_CREDENTIALS } from '../utils/constants';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm]           = useState({ email: '', password: '', remember: false });
  const [errors, setErrors]       = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotSent, setForgotSent]   = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required.';
    if (!form.password.trim()) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // Simulate async delay
    await new Promise((r) => setTimeout(r, 700));

    const result = login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      addToast({ message: 'Welcome back! Logged in successfully.', type: 'success' });
      navigate('/dashboard', { replace: true });
    } else {
      setErrors({ auth: result.error });
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!forgotEmail.trim()) errs.email = 'Email is required.';
    else if (forgotEmail.trim().toLowerCase() !== MOCK_CREDENTIALS.email) {
      errs.email = 'No account found with this email.';
    }
    setForgotErrors(errs);
    if (Object.keys(errs).length) return;

    // Simulate sending a reset email
    await new Promise((r) => setTimeout(r, 600));
    setForgotSent(true);
    addToast({ message: 'Password reset instructions sent. Check your inbox.', type: 'success' });
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotSent(false);
    setForgotEmail('');
    setForgotErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Top brand bar */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Mini HRMS</h1>
                <p className="text-primary-200 text-xs">Employee Management System</p>
              </div>
            </div>
            <p className="text-primary-100 text-sm mt-3">
              Sign in to access your HR dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5" noValidate>
            {/* Auth error banner */}
            {errors.auth && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {errors.auth}
              </div>
            )}

            {/* Demo credentials hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
              <strong>Demo credentials:</strong> admin@company.com / admin123
            </div>

            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="admin@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
            />

            <div className="flex flex-col">
              <label className="input-label" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="input-error-msg">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md w-full justify-center text-base py-2.5"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="px-8 pb-6 text-center text-xs text-slate-400">
            © 2024 Mini HRMS. Internal use only.
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      <Modal open={forgotOpen} onClose={closeForgot} title="Reset Password" size="sm">
        <div className="p-6">
          {forgotSent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <MailCheck size={26} className="text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Check your inbox</h3>
              <p className="text-sm text-slate-500">
                Password reset instructions have been sent to{' '}
                <span className="font-medium text-slate-700">{forgotEmail}</span>.
              </p>
              <Button variant="primary" size="sm" className="mt-5" onClick={closeForgot}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
              <p className="text-sm text-slate-500">
                Enter your account email and we'll send you a link to reset your password.
              </p>
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                error={forgotErrors.email}
                required
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={closeForgot}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
