import { ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export function PartnershipCTA() {
  const { t, isRTL } = useLang();
  const p = t.partnership;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-brand-light to-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* Left — text */}
            <div className="p-10 lg:p-14">
              <div className="reveal">
                <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">
                  {p.overline}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-brand-primary mb-4 leading-tight">
                  {p.title}
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  {p.sub}
                </p>

                {/* Partner type tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {p.partners.map((partner, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-brand-primary/5 text-brand-primary text-xs font-medium rounded-lg"
                    >
                      {partner}
                    </span>
                  ))}
                </div>

                <a
                  href="#contact"
                  onClick={e => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 btn-gold px-8 py-4 rounded-xl text-sm font-semibold"
                >
                  {p.cta}
                  <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                </a>
              </div>
            </div>

            {/* Right — visual panel */}
            <div className="bg-brand-primary relative overflow-hidden min-h-64 flex items-center justify-center p-10">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-2 border-brand-secondary -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border border-brand-secondary translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="relative text-center">
                <div className="text-5xl font-black text-brand-secondary/20 mb-2">KSA</div>
                <p className="text-white text-xl font-bold mb-2">{p.nationwide}</p>
                <p className="text-gray-400 text-sm">{p.nationwideSub}</p>
                <div className="mt-6 flex flex-col gap-2 text-sm text-gray-400">
                  {p.regions.map((region, i) => (
                    <div key={i} className="flex items-center gap-2 justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                      {region}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 justify-center text-brand-secondary/70 text-xs">
                    {p.regionNote}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
