// components/common/Toast.jsx
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />,
  error:   <XCircle      size={18} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
  info:    <Info          size={18} className="text-blue-500 flex-shrink-0" />,
};

const BORDER = {
  success: 'border-l-emerald-500',
  error:   'border-l-red-500',
  warning: 'border-l-amber-500',
  info:    'border-l-blue-500',
};

function ToastItem({ toast }) {
  const { removeToast } = useToast();
  return (
    <div
      className={`flex items-start gap-3 bg-white rounded-xl shadow-dropdown border border-slate-200 border-l-4 ${BORDER[toast.type] || BORDER.info} px-4 py-3 min-w-[280px] max-w-sm animate-slide-in`}
      role="alert"
    >
      {ICONS[toast.type] || ICONS.info}
      <p className="text-sm text-slate-700 flex-1 mt-0.5">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
