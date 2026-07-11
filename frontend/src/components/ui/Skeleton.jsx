import clsx from 'clsx';

export default function Skeleton({
  className = '',
  variant = 'text', // 'text' | 'rect' | 'circle'
  width,
  height,
  ...props
}) {
  const styles = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={clsx(
        'skeleton-shimmer bg-white/5',
        variant === 'text' && 'h-4 rounded w-3/4 my-1.5',
        variant === 'circle' && 'rounded-full',
        variant === 'rect' && 'rounded-xl',
        className
      )}
      style={styles}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="nexus-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rect" className="h-20 w-full" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-nexus-surface2/50 border border-nexus-border/50">
          <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="30%" />
          </div>
        </div>
      ))}
    </div>
  );
}
