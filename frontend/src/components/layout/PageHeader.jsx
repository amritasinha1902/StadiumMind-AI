import clsx from 'clsx';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
}) {
  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center flex-shrink-0 mt-0.5 shadow-nexus">
            <Icon size={20} className="text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-display font-bold text-nexus-text leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-nexus-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
