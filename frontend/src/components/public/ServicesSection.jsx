import { Truck, Package, Building2, Factory, ArrowLeftRight, Calendar, FileText, Globe, Wrench, Clock } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const SERVICE_ICONS = [Truck, Package, Globe, Building2, Factory, Wrench, Clock, ArrowLeftRight, Calendar, FileText];

export function ServicesSection() {
  const { t } = useLang();

  return (
    <section id="services" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">{t.services.overline}</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary mb-4">
            {t.services.title} <span className="text-brand-secondary">{t.services.titleHighlight}</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base">{t.services.sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 stagger">
          {t.services.items.map((s, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <div key={i} className="service-card reveal bg-white rounded-2xl p-6 border border-gray-100 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-colors duration-300">
                  <Icon className="text-brand-primary group-hover:text-white transition-colors duration-300" size={22} />
                </div>
                <h3 className="font-semibold text-brand-primary text-sm leading-snug mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                <div className="mt-4 w-8 h-0.5 bg-brand-secondary/40 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
