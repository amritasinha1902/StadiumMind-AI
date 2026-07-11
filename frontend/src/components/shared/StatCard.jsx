import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, className = '' }) {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;
  const hasChange  = typeof change === 'number';

  return (
    <div className={clsx('nexus-card p-5 hover:scale-[1.02] hover:shadow-nexus-lg hover:border-nexus-primary/30 transition-all duration-300', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-nexus-muted font-medium">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-nexus-surface2 flex items-center justify-center flex-shrink-0">
            <Icon size={15} className="text-nexus-muted" />
          </div>
        )}
      </div>

      <p className="text-3xl font-display font-bold text-nexus-text mb-2 leading-none">{value}</p>

      {hasChange && (
        <div className="flex items-center gap-1.5">
          {isPositive && <TrendingUp  size={13} className="text-nexus-success" />}
          {isNegative && <TrendingDown size={13} className="text-nexus-danger"  />}
          {!isPositive && !isNegative && <Minus size={13} className="text-nexus-muted" />}

          <span
            className={clsx(
              'text-xs font-semibold',
              isPositive && 'text-nexus-success',
              isNegative && 'text-nexus-danger',
              !isPositive && !isNegative && 'text-nexus-muted'
            )}
          >
            {isPositive ? '+' : ''}{change}%
          </span>

          {changeLabel && (
            <span className="text-xs text-nexus-muted">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
