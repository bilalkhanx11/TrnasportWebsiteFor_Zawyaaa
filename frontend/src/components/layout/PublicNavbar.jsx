import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Truck, Languages } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export function PublicNavbar() {
  const { t, lang, isRTL, toggleLanguage } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: t.nav.home, href: 'home' },
    { label: t.nav.about, href: 'about' },
    { label: t.nav.services, href: 'services' },
    { label: t.nav.industries, href: 'industries' },
    { label: t.nav.fleet, href: 'fleet' },
    { label: t.nav.howWeWork, href: 'how-we-work' },
    { label: t.nav.contact, href: 'contact' },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-brand-primary shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" onClick={e => scrollTo(e, 'home')} className="flex items-center gap-3">
          
          <div>
            <div className="text-white font-bold text-base leading-tight">ZAWAYA ALKAYAN</div>
            <div className="text-brand-secondary text-xs font-medium tracking-wider">{t.footer.generalContracting}</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={`#${link.href}`}
              onClick={e => scrollTo(e, link.href)}
              className="px-3 py-2 text-sm text-gray-300 hover:text-brand-secondary transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            title={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
            className="lang-toggle mx-1"
            aria-label="Switch language"
          >
            <Languages size={14} />
            {t.nav.langToggle}
          </button>

          <Link
            to="/login"
            className="ml-2 px-5 py-2.5 rounded-lg bg-brand-secondary text-brand-primary text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            {t.nav.clientLogin}
          </Link>
        </div>

        {/* Mobile: lang toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="lang-toggle"
            aria-label="Switch language"
          >
            <Languages size={13} />
            {t.nav.langToggleMobile}
          </button>
          <button
            className="p-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-brand-primary border-t border-white/10 px-6 pb-6">
          <div className="pt-4 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={e => scrollTo(e, link.href)}
                className="px-4 py-3 text-gray-300 hover:text-brand-secondary hover:bg-white/5 rounded-lg transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-3 px-4 py-3 rounded-lg bg-brand-secondary text-brand-primary text-sm font-semibold text-center"
            >
              {t.nav.clientLogin}
            </Link>
            <a
              href="#contact"
              onClick={e => scrollTo(e, 'contact')}
              className="px-4 py-3 rounded-lg border border-brand-secondary text-brand-secondary text-sm font-semibold text-center"
            >
              {t.nav.requestTransportation}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
