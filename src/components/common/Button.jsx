// components/common/Button.jsx
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component.
 * @param {string} variant - primary | secondary | danger | success | ghost
 * @param {string} size - sm | md | lg
 * @param {boolean} loading - shows spinner and disables button
 * @param {boolean} fullWidth - stretches to container width
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
