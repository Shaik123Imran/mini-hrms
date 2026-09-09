// components/common/Loader.jsx

/**
 * Full-area loading spinner.
 * @param {string} message - optional text below spinner
 * @param {boolean} fullPage - center in viewport
 */
export default function Loader({ message = 'Loading...', fullPage = false }) {
  const wrapClass = fullPage
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 z-50'
    : 'flex items-center justify-center py-16';

  return (
    <div className={wrapClass}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
        {message && <p className="text-sm text-slate-500">{message}</p>}
      </div>
    </div>
  );
}
