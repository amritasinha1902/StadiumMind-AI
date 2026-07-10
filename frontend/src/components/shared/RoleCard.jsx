import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';

const colorMap = {
  blue:   { bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   text: 'text-blue-400',   hover: 'hover:border-blue-500/40'   },
  red:    { bg: 'bg-red-500/20',    border: 'border-red-500/30',    text: 'text-red-400',    hover: 'hover:border-red-500/40'    },
  green:  { bg: 'bg-green-500/20',  border: 'border-green-500/30',  text: 'text-green-400',  hover: 'hover:border-green-500/40'  },
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', hover: 'hover:border-purple-500/40' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', hover: 'hover:border-yellow-500/40' },
  cyan:   { bg: 'bg-cyan-500/20',   border: 'border-cyan-500/30',   text: 'text-cyan-400',   hover: 'hover:border-cyan-500/40'   },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', hover: 'hover:border-orange-500/40' },
};

export default function RoleCard({ title, description, icon: Icon, to, color = 'blue', stats }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <Link
      to={to}
      className={clsx(
        'nexus-card p-6 block group transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-nexus-lg',
        c.hover
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
          <Icon size={22} className={c.text} />
        </div>
        <ArrowRight
          size={18}
          className="text-nexus-muted group-hover:text-nexus-text group-hover:translate-x-1 transition-all duration-200"
        />
      </div>

      <h3 className="text-lg font-display font-semibold text-nexus-text mb-1">{title}</h3>
      <p className="text-sm text-nexus-muted leading-relaxed mb-4">{description}</p>

      {stats && (
        <div className="flex items-center gap-6 pt-4 border-t border-nexus-border">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className={clsx('text-lg font-bold', c.text)}>{stat.value}</p>
              <p className="text-[10px] text-nexus-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
