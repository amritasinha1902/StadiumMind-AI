import { Link } from 'react-router-dom';
import {
  Trophy, Users, Shield, HandHelping,
  Building2, ClipboardList, Bot, ArrowRight, Zap, Globe, Star,
} from 'lucide-react';
import Button  from '@/components/ui/Button';
import RoleCard from '@/components/shared/RoleCard';

const roles = [
  {
    title:       'Fan Experience',
    description: 'Real-time match info, AI-guided stadium navigation, concession queues, and personalised fan support.',
    icon: Users, to: '/fans', color: 'blue',
    stats: [{ value: '80K+', label: 'Fans/Match' }, { value: '26', label: 'Venues' }],
  },
  {
    title:       'Security Operations',
    description: 'AI-powered incident management, crowd density monitoring, and real-time threat assessment.',
    icon: Shield, to: '/security', color: 'red',
    stats: [{ value: '24/7', label: 'Monitoring' }, { value: '<2m', label: 'Response' }],
  },
  {
    title:       'Volunteer Hub',
    description: 'Smart task assignment, shift scheduling, AI guidance, and real-time coordination for volunteers.',
    icon: HandHelping, to: '/volunteers', color: 'green',
    stats: [{ value: '20K+', label: 'Volunteers' }, { value: '100+', label: 'Roles' }],
  },
  {
    title:       'Venue Operations',
    description: 'Facility management, real-time operational status, predictive maintenance, and capacity monitoring.',
    icon: Building2, to: '/venue', color: 'purple',
    stats: [{ value: '26', label: 'Stadiums' }, { value: '99.9%', label: 'Uptime' }],
  },
  {
    title:       'Organizer Tools',
    description: 'Comprehensive event oversight, AI-generated reports, cross-venue analytics, and decision support.',
    icon: ClipboardList, to: '/organizers', color: 'yellow',
    stats: [{ value: '64', label: 'Matches' }, { value: 'AI', label: 'Reports' }],
  },
  {
    title:       'AI Assistant',
    description: 'Your intelligent co-pilot powered by Google Gemini. Ask anything in 50+ languages, get instant answers.',
    icon: Bot, to: '/ai-assistant', color: 'cyan',
    stats: [{ value: 'Gemini', label: 'Powered' }, { value: '24/7', label: 'Available' }],
  },
];

const pillars = [
  { icon: Zap,   label: 'Real-Time AI',    desc: 'Instant insights via Gemini' },
  { icon: Globe, label: 'Multi-Language',  desc: '50+ languages supported'     },
  { icon: Star,  label: 'Premium UX',      desc: 'Purpose-built for every role' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-nexus-bg overflow-x-hidden">

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/5  w-[520px] h-[520px] bg-nexus-primary/20 rounded-full filter blur-[110px]" />
          <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-nexus-accent/10  rounded-full filter blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full nexus-glass border border-nexus-primary/30 text-sm text-nexus-primary font-medium mb-8">
            <Trophy size={14} className="text-nexus-accent" />
            FIFA World Cup 2026 · AI Stadium Operating System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-nexus-text mb-6 leading-[1.1] text-balance">
            The Future of{' '}
            <span className="gradient-text">Stadium Intelligence</span>
          </h1>

          <p className="text-lg sm:text-xl text-nexus-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI-powered operating system unifying fans, volunteers, organizers, security, and
            venue operators through the power of Google Gemini at the{' '}
            <span className="text-nexus-text font-semibold">FIFA World Cup 2026</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                Enter Dashboard
              </Button>
            </Link>
            <Link to="/ai-assistant">
              <Button size="lg" variant="accent" leftIcon={<Bot size={18} />}>
                Try AI Assistant
              </Button>
            </Link>
          </div>

          {/* Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-nexus-border/40">
            {pillars.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-nexus-muted text-sm">
                <p.icon size={16} className="text-nexus-primary flex-shrink-0" />
                <span className="font-medium text-nexus-text">{p.label}</span>
                <span className="hidden sm:inline">— {p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role cards ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-nexus-text mb-3">
            Built for Every Role
          </h2>
          <p className="text-nexus-muted max-w-xl mx-auto">
            Tailored AI experiences for every stakeholder across all 26 FIFA World Cup 2026 venues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard key={role.to} {...role} />
          ))}
        </div>
      </section>
    </div>
  );
}
