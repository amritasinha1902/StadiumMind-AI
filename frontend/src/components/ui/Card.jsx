import clsx from 'clsx';

export default function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <div
      className={clsx(
        'nexus-card p-6',
        hover && 'hover:border-nexus-primary/30 hover:scale-[1.01] hover:shadow-nexus-lg cursor-pointer',
        glow  && 'glow-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('mb-4 pb-4 border-b border-nexus-border', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={clsx('text-lg font-display font-semibold text-nexus-text', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={clsx('', className)}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-nexus-border', className)}>
      {children}
    </div>
  );
}
