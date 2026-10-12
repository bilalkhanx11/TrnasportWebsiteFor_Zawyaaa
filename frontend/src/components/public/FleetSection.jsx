import { Truck } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const CAT_STYLES = [
  { gradient: 'from-blue-50 to-indigo-50', border: 'border-blue-100', featured: false },
  { gradient: 'from-amber-50 to-yellow-50', border: 'border-amber-100', featured: true },
  { gradient: 'from-slate-50 to-gray-50',   border: 'border-slate-100', featured: false },
];

export function FleetSection() {
  const { t } = useLang();
  const f = t.fleet;

  return (
    <section id="fleet" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">{f.overline}</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary mb-4">
            {f.title} <span className="text-brand-secondary">{f.titleHighlight}</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{f.sub}</p>
        </div>

        {/* Fleet categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 stagger">
          {f.categories.map((cat, i) => {
            const style = CAT_STYLES[i];
            return (
              <div
                key={i}
                className={`reveal relative rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} p-8 group hover:shadow-xl transition-all duration-300 ${style.featured ? 'ring-2 ring-brand-secondary' : ''}`}
              >
                {style.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-secondary rounded-full text-brand-primary text-xs font-bold whitespace-nowrap">
                    {f.mostRequested}
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center mb-5">
                  <Truck className="text-brand-secondary" size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-primary mb-2">{cat.type}</h3>
                <p className="text-gray-500 text-sm mb-5">{cat.desc}</p>
                <ul className="space-y-2">
                  {cat.specs.map((spec, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-gray-200">
                  <p className="text-xs text-gray-400">{f.capacityNote}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commercial arrangements */}
        <div className="reveal bg-brand-primary rounded-3xl p-10">
          <div className="text-center mb-8">
            <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-2">{f.contractOverline}</p>
            <h3 className="text-2xl font-bold text-white">{f.contractTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {f.contracts.map((c, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-secondary mb-3" />
                <h4 className="text-white font-semibold text-sm mb-2">{c.label}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
