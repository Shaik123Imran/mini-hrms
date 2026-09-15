// components/common/Badge.jsx

const VARIANTS = {
  green:  'badge-green',
  red:    'badge-red',
  yellow: 'badge-yellow',
  blue:   'badge-blue',
  gray:   'badge-gray',
  purple: 'badge-purple',
};

/**
 * Maps common status strings to a badge color variant.
 */
export function getStatusVariant(status) {
  const map = {
    Active:        'green',
    Approved:      'green',
    Present:       'green',
    Completed:     'green',
    Inactive:      'gray',
    Rejected:      'red',
    Absent:        'red',
    Terminated:    'red',
    High:          'red',
    Pending:       'yellow',
    Late:          'yellow',
    'On Hold':     'yellow',
    Medium:        'yellow',
    'On Probation': 'blue',
    'In Progress': 'blue',
    Low:           'blue',
    'Half Day':    'purple',
    'In Review':   'purple',
    'Not Started': 'gray',
  };
  return map[status] || 'gray';
}

export default function Badge({ children, variant = 'gray', dot = false }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.gray}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColors[variant] || 'bg-slate-400'}`} />
      )}
      {children}
    </span>
  );
}

const dotColors = {
  green:  'bg-emerald-500',
  red:    'bg-red-500',
  yellow: 'bg-amber-500',
  blue:   'bg-blue-500',
  gray:   'bg-slate-400',
  purple: 'bg-purple-500',
};
