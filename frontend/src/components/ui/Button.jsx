import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'nexus-btn-primary',
  accent:    'nexus-btn-accent',
  secondary: [
    'bg-nexus-surface2 text-nexus-text border border-nexus-border',
    'hover:bg-nexus-border hover:border-nexus-primary',
    'rounded-lg font-semibold transition-all duration-200',
  ].join(' '),
  ghost: [
    'text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2',
    'rounded-lg font-semibold transition-all duration-200',
  ].join(' '),
  danger: [
    'bg-nexus-danger/20 text-nexus-danger border border-nexus-danger/40',
    'hover:bg-nexus-danger hover:text-white',
    'rounded-lg font-semibold transition-all duration-200',
  ].join(' '),
};

const sizes = {
  sm:   'text-xs px-3 py-1.5',
  md:   'text-sm px-5 py-2',
  lg:   'text-base px-6 py-3',
  xl:   'text-lg px-8 py-4',
  icon: 'p-2',
};

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary focus-visible:ring-offset-2 focus-visible:ring-offset-nexus-bg',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading
        ? <Loader2 size={16} className="animate-spin flex-shrink-0" />
        : leftIcon
          ? <span className="flex-shrink-0">{leftIcon}</span>
          : null}
      {children}
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}
