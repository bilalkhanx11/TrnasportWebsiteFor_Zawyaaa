import { ShieldCheck, MessageSquare, CheckCircle, BookOpen, Headphones, Star } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const ICONS = [ShieldCheck, Headphones, CheckCircle, BookOpen, MessageSquare, Star];

export function SafetySection() {
  const { t } = useLang();
  const s = t.safety;

  return (
    <section id="safety" className="py-24 bg-brand-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-white" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">
            {s.overline}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {s.title} <span className="text-brand-secondary">{s.titleHighlight}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {s.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {s.items.map((item, i) => {
            const Icon = ICONS[i] || ShieldCheck;
            return (
              <div
                key={i}
                className="reveal bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-brand-secondary/30 transition-all duration-300 group cursor-default"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center mb-4 group-hover:bg-brand-secondary/20 transition-colors">
                  <Icon className="text-brand-secondary" size={22} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
