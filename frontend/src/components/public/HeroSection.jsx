import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const SLIDES = [
  { bg: 'from-brand-primary via-[#0f2d4a] to-[#1a3a5c]' },
  { bg: 'from-[#071524] via-brand-primary to-[#0f2d4a]' },
  { bg: 'from-[#0a1e32] via-[#0B1F33] to-[#1a3050]' },
];

export function HeroSection() {
  const { t, isRTL } = useLang();
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${SLIDES[slide].bg} transition-all duration-1000`} />

      {/* Road pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated road lines */}
      <div className="absolute bottom-20 left-0 right-0 overflow-hidden h-1 opacity-20">
        <div className="road-lines flex gap-16 w-[200%]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-24 h-1 bg-brand-secondary rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* Decorative geometric shapes */}
      <div className="absolute top-1/4 right-10 lg:right-20 opacity-10">
        <div className="w-64 h-64 border-2 border-brand-secondary rotate-45 transform" />
      </div>
      <div className="absolute bottom-1/4 right-1/4 opacity-5">
        <div className="w-32 h-32 border border-brand-secondary rotate-12 transform" />
      </div>
      <div className="absolute top-1/3 right-1/3 opacity-[0.07]">
        <div className="w-16 h-16 bg-brand-secondary rotate-45 transform" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="max-w-3xl">
          {/* Label */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-secondary/40 bg-brand-secondary/10 text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '0.1s' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
            {t.hero.badge}
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl lg:text-7xl font-extrabold text-white leading-none mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.2s' }}
          >
            <span className="block">{t.hero.headline1}</span>
            <span className="block text-brand-secondary">{t.hero.headline2}</span>
            <span className="block text-white/80 text-4xl lg:text-5xl font-bold mt-1">{t.hero.headline3}</span>
          </h1>

          {/* Sub */}
          <p
            className={`text-lg text-gray-300 max-w-xl leading-relaxed mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.35s' }}
          >
            {t.hero.sub}
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.5s' }}
          >
            <button
              onClick={() => scrollTo('contact')}
              className="btn-gold px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 justify-center"
            >
              {t.hero.ctaPrimary}
              <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="px-8 py-4 rounded-xl border border-white/30 text-white text-base font-semibold hover:bg-white/10 transition-colors flex items-center gap-2 justify-center"
            >
              {t.hero.ctaSecondary}
            </button>
          </div>

          {/* Tagline */}
          <p
            className={`mt-10 text-xs text-gray-500 font-medium tracking-[0.2em] uppercase transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.65s' }}
          >
            {t.hero.tagline}
          </p>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`rounded-full transition-all duration-300 ${i === slide ? 'w-8 h-2 bg-brand-secondary' : 'w-2 h-2 bg-white/30'}`}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollTo('about')}
        className="absolute bottom-10 right-8 text-white/40 hover:text-brand-secondary transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
