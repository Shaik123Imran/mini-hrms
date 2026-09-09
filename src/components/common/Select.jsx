// components/common/Select.jsx
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Select/Dropdown component.
 */
const Select = forwardRef(function Select(
  { label, error, hint, required, options = [], placeholder = 'Select...', className = '', ...props },
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
      <div className="relative">
        <select
          ref={ref}
          className={`input-field appearance-none pr-8 ${error ? 'input-error' : ''} ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      {error && <p className="input-error-msg">{error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  );
});

export default Select;
