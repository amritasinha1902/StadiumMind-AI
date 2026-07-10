import clsx from 'clsx';

const sizes = {
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const palette = [
  'bg-nexus-primary/30 text-nexus-primary-light',
  'bg-nexus-accent/30  text-nexus-accent',
  'bg-nexus-success/30 text-nexus-success',
  'bg-nexus-warning/30 text-nexus-warning',
  'bg-purple-500/30    text-purple-400',
  'bg-pink-500/30      text-pink-400',
];

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function colorFor(str) {
  if (!str) return palette[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const statusColors = {
  online:  'bg-nexus-success',
  away:    'bg-nexus-warning',
  offline: 'bg-nexus-muted',
};

export default function Avatar({ name, src, size = 'md', className = '', status }) {
  const color = colorFor(name);

  return (
    <div className="relative inline-flex flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={clsx('rounded-full object-cover ring-2 ring-nexus-border', sizes[size], className)}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-semibold ring-2 ring-nexus-border',
            sizes[size],
            color,
            className
          )}
          aria-label={name}
        >
          {initials(name)}
        </div>
      )}

      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-nexus-bg',
            statusColors[status]
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}
