import { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../lib/translations/en';
import { ar } from '../lib/translations/ar';

const STORAGE_KEY = 'za_lang';
const TRANSLATIONS = { en, ar };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  useEffect(() => {
    const html = document.documentElement;
    const isAr = lang === 'ar';
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.body.style.fontFamily = isAr
      ? "'Noto Sans Arabic', 'Segoe UI', sans-serif"
      : "'Inter', system-ui, sans-serif";
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const toggleLanguage = () => setLang(l => (l === 'en' ? 'ar' : 'en'));

  return (
    <LanguageContext.Provider
      value={{ lang, isRTL: lang === 'ar', toggleLanguage, t: TRANSLATIONS[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be inside LanguageProvider');
  return ctx;
};
