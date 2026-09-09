// components/common/Avatar.jsx
import { getInitials, getAvatarColor } from '../../utils/formatters';

/**
 * Avatar component showing an image or colored initials fallback.
 * @param {string} name - used for initials and color
 * @param {string|null} src - optional image URL
 * @param {string} size - xs | sm | md | lg | xl
 */
export default function Avatar({ name = '', src = null, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6  h-6  text-xs',
    sm: 'w-8  h-8  text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const colorClass = getAvatarColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${colorClass} ${sizes[size]} ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
