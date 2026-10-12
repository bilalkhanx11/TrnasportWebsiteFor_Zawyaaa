import { ClipboardList, Map, FileText, Truck, Headphones } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const STEP_ICONS = [ClipboardList, Map, FileText, Truck, Headphones];

export function HowWeWorkSection() {
  const { t } = useLang();
  const hw = t.howWeWork;

  return (
    <section id="how-we-work" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">{hw.overline}</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary mb-4">
            {hw.title} <span className="text-brand-secondary">{hw.titleHighlight}</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">{hw.sub}</p>
        </div>

        {/* Desktop timeline */}
        <div className="hidden lg:grid grid-cols-5 gap-0 relative mb-4">
          <div className="absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-secondary/30 via-brand-secondary to-brand-secondary/30" />
          {hw.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={i} className="reveal flex flex-col items-center text-center px-4 relative" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="w-20 h-20 rounded-full bg-brand-primary border-4 border-white shadow-lg flex items-center justify-center mb-5 z-10 group hover:bg-brand-secondary transition-colors duration-300 cursor-default">
                  <Icon className="text-brand-secondary group-hover:text-brand-primary transition-colors" size={28} />
                </div>
                <div className="text-brand-secondary text-xs font-bold tracking-widest mb-2">{step.num}</div>
                <h3 className="font-semibold text-brand-primary text-sm mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile timeline */}
        <div className="lg:hidden flex flex-col gap-6">
          {hw.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={i} className="reveal flex gap-5" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
                    <Icon className="text-brand-secondary" size={20} />
                  </div>
                  {i < hw.steps.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                </div>
                <div className="pb-6">
                  <div className="text-brand-secondary text-xs font-bold tracking-wider mb-1">{step.num}</div>
                  <h3 className="font-semibold text-brand-primary mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
