import { Truck, Warehouse, Factory, Settings, ShoppingCart, Globe, BarChart3, Briefcase } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const ICONS   = [Truck, Warehouse, Factory, Settings, ShoppingCart, Globe, BarChart3, Briefcase];
const COLORS  = ['bg-blue-50 text-blue-700','bg-purple-50 text-purple-700','bg-orange-50 text-orange-700','bg-slate-50 text-slate-700','bg-green-50 text-green-700','bg-sky-50 text-sky-700','bg-yellow-50 text-yellow-700','bg-rose-50 text-rose-700'];

export function IndustriesSection() {
  const { t } = useLang();
  const ind = t.industries;

  return (
    <section id="industries" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">{ind.overline}</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary mb-4">
            {ind.title} <span className="text-brand-secondary">{ind.titleHighlight}</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{ind.sub}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10 stagger">
          {ind.items.map((label, i) => {
            const Icon = ICONS[i] || Truck;
            return (
              <div
                key={i}
                className="reveal bg-white rounded-2xl p-6 flex flex-col items-center text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl ${COLORS[i]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} />
                </div>
                <span className="text-brand-primary font-semibold text-sm">{label}</span>
              </div>
            );
          })}
        </div>

        <p className="reveal text-center text-gray-400 text-sm italic">{ind.note}</p>
      </div>
    </section>
  );
}
