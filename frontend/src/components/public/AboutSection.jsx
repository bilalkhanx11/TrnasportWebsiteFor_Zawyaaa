import { Shield, Zap, Users, FileCheck, Users2 } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const PILLAR_ICONS = [Shield, Zap, Users, FileCheck, Users2];
const PILLAR_KEYS = ['reliability', 'flexibility', 'clientFocused', 'contractBased', 'partnerships'];

export function AboutSection() {
  const { t } = useLang();

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="reveal-left">
            <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">{t.about.overline}</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary leading-tight mb-6">
              {t.about.title} <span className="text-brand-secondary">{t.about.titleHighlight}</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">{t.about.p1}</p>
            <p className="text-gray-600 leading-relaxed mb-5">{t.about.p2}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{t.about.p3}</p>
            <a
              href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              {t.about.cta}
            </a>
          </div>

          {/* Pillars grid */}
          <div className="reveal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PILLAR_KEYS.map((key, i) => {
                const Icon = PILLAR_ICONS[i];
                const pillar = t.about.pillars[key];
                return (
                  <div
                    key={key}
                    className={`p-5 rounded-2xl border border-gray-100 hover:border-brand-secondary/30 hover:shadow-lg transition-all duration-300 group ${i === 4 ? 'sm:col-span-2' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-3 group-hover:bg-brand-secondary/10 transition-colors">
                      <Icon className="text-brand-primary group-hover:text-brand-secondary transition-colors" size={20} />
                    </div>
                    <h3 className="font-semibold text-brand-primary text-sm mb-1">{pillar.label}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
