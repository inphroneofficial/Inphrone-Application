import { useContext, createContext, useState, useEffect, ReactNode, createElement } from "react";
import { translations, getTranslation } from "@/lib/translations";

interface TranslationContextType {
  language: string;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
}

export const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  t: (key) => key,
  setLanguage: () => {},
});

export const useTranslation = () => useContext(TranslationContext);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('inphrone_language');
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('inphrone_language', lang);
    // Dispatch event for other components to sync
    window.dispatchEvent(new CustomEvent('language-change', { detail: { language: lang } }));
  };

  return createElement(
    TranslationContext.Provider,
    { value: { language, t, setLanguage } },
    children
  );
}
