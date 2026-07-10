import clsx from 'clsx';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
  xl: 'w-16 h-16 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'rounded-full border-nexus-surface2 border-t-nexus-primary animate-spin flex-shrink-0',
        sizes[size],
        className
      )}
    />
  );
}

export function FullPageSpinner({ message = 'Loading FIFA Nexus AI...' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-nexus-bg z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-nexus-muted text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
