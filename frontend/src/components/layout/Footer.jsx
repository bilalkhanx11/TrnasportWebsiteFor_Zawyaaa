import { Truck, Mail, Phone, MapPin } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-secondary flex items-center justify-center">
                <Truck className="text-brand-primary" size={20} />
              </div>
              <div>
                <div className="font-bold text-base">ZAWAYA ALKAYAN</div>
                <div className="text-brand-secondary text-xs tracking-wider">{t.footer.generalContracting}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.footer.description}
            </p>
            <p className="text-brand-secondary text-xs font-medium mt-4 tracking-wider">{t.footer.tagline}</p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm tracking-wider text-brand-secondary mb-4">{t.footer.servicesTitle}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              {t.footer.services.map(s => (
                <li key={s} className="hover:text-brand-secondary transition-colors cursor-default">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm tracking-wider text-brand-secondary mb-4">{t.footer.contactTitle}</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <a href="mailto:info@zawayaalkayan.com" className="flex items-start gap-3 hover:text-brand-secondary transition-colors">
                <Mail size={16} className="mt-0.5 shrink-0 text-brand-secondary" />
                info@zawayaalkayan.com
              </a>
              <a href="tel:+966500826759" className="flex items-start gap-3 hover:text-brand-secondary transition-colors">
                <Phone size={16} className="mt-0.5 shrink-0 text-brand-secondary" />
                +966 500 826 759
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-secondary" />
                Al Urubah Road, Al-Sulaimaniyah, Riyadh, KSA
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{t.footer.copyright(new Date().getFullYear())}</p>
          <p className="text-gray-600">{t.footer.sub}</p>
        </div>
      </div>
    </footer>
  );
}
