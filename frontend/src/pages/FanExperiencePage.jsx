import { Users, MapPin, Utensils, Info, Navigation, Star, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge  from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const services = [
  { icon: MapPin,        title: 'Stadium Navigation',  description: 'AI-guided wayfinding to seats, exits, restrooms, and facilities.',          badge: { text: 'Live',   variant: 'success' } },
  { icon: Utensils,      title: 'Concession Queues',   description: 'Real-time wait times and pre-ordering for food & beverages.',                badge: { text: 'AI',     variant: 'primary' } },
  { icon: Info,          title: 'Match Information',   description: 'Live stats, player profiles, and AI-narrated commentary.',                   badge: { text: 'Live',   variant: 'success' } },
  { icon: Navigation,    title: 'Transport Guide',     description: 'Personalised transport options with crowd-avoidance routing.',                badge: { text: 'Smart',  variant: 'accent'  } },
  { icon: Star,          title: 'Fan Moments',         description: 'AI-curated highlights and personalised shareable match memories.',           badge: { text: 'New',    variant: 'warning' } },
  { icon: MessageCircle, title: 'Fan Support AI',      description: '24/7 multilingual AI chat support powered by Google Gemini.',               badge: { text: 'Gemini', variant: 'primary' } },
];

const metrics = [
  { label: 'Overall Rating', value: '4.8 / 5', variant: 'success' },
  { label: 'App Usage',      value: '73%',      variant: 'primary' },
  { label: 'AI Queries',     value: '12,430',   variant: 'accent'  },
  { label: 'Avg. Wait Time', value: '4.2 min',  variant: 'warning' },
];

export default function FanExperiencePage() {
  const navigate = useNavigate();

  const handleCardClick = (title) => {
    if (title === 'Fan Moments') {
      toast('Fan Moments feature coming soon.');
    } else if (title === 'Match Information') {
      navigate('/command-center');
    } else {
      navigate('/fan-copilot');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fan Experience Hub"
        subtitle="AI-powered services enhancing every fan's World Cup journey"
        icon={Users}
        actions={<Button size="sm" variant="accent" leftIcon={<Star size={14} />}>Fan Portal</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((svc) => (
          <Card
            key={svc.title}
            onClick={() => handleCardClick(svc.title)}
            className="cursor-pointer hover:border-nexus-primary/50 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(26,115,232,0.15)] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-nexus-primary/20 border border-nexus-primary/30 flex items-center justify-center">
                <svc.icon size={18} className="text-nexus-primary-light" />
              </div>
              <Badge variant={svc.badge.variant} size="sm">{svc.badge.text}</Badge>
            </div>
            <h3 className="font-display font-semibold text-nexus-text mb-1">{svc.title}</h3>
            <p className="text-sm text-nexus-muted leading-relaxed">{svc.description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Fan Satisfaction Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="p-4 rounded-xl bg-nexus-surface2 text-center">
                <p className="text-2xl font-display font-bold text-nexus-text mb-1">{m.value}</p>
                <Badge variant={m.variant} size="sm">{m.label}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
