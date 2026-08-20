import { useEffect, useState } from 'react';

export function UserAvatar({ name, src, size = 'sm' }: { name: string; src?: string | null; size?: 'sm' | 'lg' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-8 h-8 text-xs';

  useEffect(() => setImageFailed(false), [src]);

  if (!src || imageFailed) {
    const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '?';
    return (
      <span aria-label={`${name} profile`} className={`${sizeClass} shrink-0 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold`}>
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} profile`}
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
      className={`${sizeClass} shrink-0 rounded-full object-cover bg-[#3B82F6]/20`}
    />
  );
}
