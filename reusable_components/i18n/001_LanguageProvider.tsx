'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────

export interface LocaleOption {
  code: string;
  label: string;
  detect?: (browserLang: string) => boolean;
}

export interface LanguageContextType<T extends string = string> {
  language: T;
  setLanguage: (lang: T) => void;
  isReady: boolean;
}

// ─── Provider ─────────────────────────────────────────────────────────

interface LanguageProviderProps<T extends string = string> {
  children: React.ReactNode;
  locales: LocaleOption[];
  defaultLocale?: string;
  storageKey?: string;
}

export function LanguageProvider<T extends string = string>({
  children,
  locales,
  defaultLocale,
  storageKey = 'language',
}: LanguageProviderProps<T>) {
  const fallback = defaultLocale || locales[0]?.code || 'en';
  const [language, setLanguageState] = useState<T>(fallback as T);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as T | null;
    if (saved && locales.some(l => l.code === saved)) {
      setLanguageState(saved);
    } else {
      const detected = locales.find(l => l.detect?.(navigator.language));
      if (detected) setLanguageState(detected.code as T);
    }
    setIsReady(true);
  }, [storageKey, locales]);

  const setLanguage = (lang: T) => {
    setLanguageState(lang);
    localStorage.setItem(storageKey, lang);
  };

  if (!isReady) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Context ──────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Hook ─────────────────────────────────────────────────────────────

export function useLanguage<T extends string = string>(): LanguageContextType<T> {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en' as T, setLanguage: () => {}, isReady: false };
  }
  return context as LanguageContextType<T>;
}

export default LanguageProvider;
