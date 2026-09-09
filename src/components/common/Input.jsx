// components/common/Input.jsx
import { forwardRef } from 'react';

/**
 * Reusable Input with label, error, and hint support.
 */
const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="input-error-msg">{error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  );
});

export default Input;
