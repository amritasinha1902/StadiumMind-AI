import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Bot, Sparkles } from 'lucide-react';

export default function AIAssistantButton({ className = '' }) {
  return (
    <Link
      to="/ai-assistant"
      className={clsx(
        'fixed bottom-6 right-6 z-40',
        'flex items-center gap-2',
        'px-4 py-3 rounded-full',
        'bg-primary-gradient text-white font-semibold text-sm',
        'shadow-nexus-lg hover:shadow-glow',
        'hover:-translate-y-1 active:translate-y-0',
        'transition-all duration-200',
        'border border-nexus-primary-light/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary focus-visible:ring-offset-2 focus-visible:ring-offset-nexus-bg',
        className
      )}
      aria-label="Open AI Assistant"
    >
      <div className="relative flex-shrink-0">
        <Bot size={20} />
        <Sparkles
          size={9}
          className="absolute -top-1 -right-1 text-nexus-accent animate-pulse"
          aria-hidden="true"
        />
      </div>
      <span>AI Assistant</span>
    </Link>
  );
}
