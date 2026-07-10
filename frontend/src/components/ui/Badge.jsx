import clsx from 'clsx';

const variants = {
  default:  'bg-nexus-surface2  text-nexus-muted   border-nexus-border',
  primary:  'bg-nexus-primary/20 text-nexus-primary-light border-nexus-primary/30',
  accent:   'bg-nexus-accent/20  text-nexus-accent   border-nexus-accent/30',
  success:  'bg-nexus-success/20 text-nexus-success  border-nexus-success/30',
  warning:  'bg-nexus-warning/20 text-nexus-warning  border-nexus-warning/30',
  danger:   'bg-nexus-danger/20  text-nexus-danger   border-nexus-danger/30',
};

const sizes = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const dotColors = {
  default: 'bg-nexus-muted',
  primary: 'bg-nexus-primary animate-pulse',
  accent:  'bg-nexus-accent',
  success: 'bg-nexus-success animate-pulse',
  warning: 'bg-nexus-warning animate-pulse',
  danger:  'bg-nexus-danger  animate-pulse',
};

export default function Badge({
  children,
  variant   = 'default',
  size      = 'md',
  dot       = false,
  className = '',
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
