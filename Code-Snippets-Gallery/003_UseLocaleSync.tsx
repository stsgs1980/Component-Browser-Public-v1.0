// --- source: Code-Snippets-Gallery / use-locale.tsx ---
// Client-side i18n using useSyncExternalStore (avoids React 19 lint warnings).
// Supports localStorage persistence, browser auto-detection, and <html lang> sync.
// De-hardcoded: generic Locales type parameter, configurable storage key & default locale.

import {
  createContext, useContext, useCallback, useEffect,
  useSyncExternalStore, type ReactNode,
} from 'react';

// ============================================================
//  TYPES
// ============================================================

/** Subset of the dictionary your app passes in */
export type TranslationDict = Record<string, Record<string, string>>;

// ============================================================
//  PROVIDER FACTORY
// ============================================================

interface LocaleContextValue<L extends string> {
  locale: L;
  setLocale: (l: L) => void;
  /** Translate a dictionary key */
  t: (key: string) => string;
}

/**
 * Create a typed locale provider + hook pair.
 *
 * @param dict       - Full translation dictionary `{ key: { en: '...', ru: '...' } }`
 * @param options.storageKey    - localStorage key (default 'app-locale')
 * @param options.defaultLocale - Fallback locale
 * @param options.supportedLocales - Allowed locale values (auto-detected from browser)
 *
 * @returns `{ LocaleProvider, useLocale }`
 */
export function createLocaleSystem<L extends string>(
  dict: TranslationDict,
  options: {
    storageKey?: string;
    defaultLocale: L;
    supportedLocales: readonly L[];
  },
) {
  const { storageKey = 'app-locale', defaultLocale, supportedLocales } = options;

  const LocaleContext = createContext<LocaleContextValue<L> | null>(null);

  let cachedLocale: L | null = null;
  const listeners = new Set<() => void>();

  function emitChange() {
    for (const fn of listeners) fn();
  }

  function subscribe(fn: () => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }

  function getSnapshot(): L {
    if (cachedLocale !== null) return cachedLocale;
    if (typeof window === 'undefined') return defaultLocale;
    try {
      const stored = localStorage.getItem(storageKey) as L | null;
      if (stored && (supportedLocales as readonly string[]).includes(stored)) {
        cachedLocale = stored;
        return stored;
      }
    } catch { /* noop */ }
    const browserLang = navigator.language?.slice(0, 2);
    const detected = (supportedLocales as readonly string[]).includes(browserLang)
      ? (browserLang as L)
      : defaultLocale;
    cachedLocale = detected;
    return detected;
  }

  function getServerSnapshot(): L {
    return defaultLocale;
  }

  function applyLocale(l: L) {
    cachedLocale = l;
    try { localStorage.setItem(storageKey, l); } catch { /* noop */ }
    emitChange();
  }

  // --- Provider ---

  function LocaleProvider({ children }: { children: ReactNode }) {
    const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    useEffect(() => {
      document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = useCallback((l: L) => {
      applyLocale(l);
    }, []);

    const t = useCallback((key: string): string => {
      const entry = dict[key];
      if (!entry) return key;
      return entry[locale] ?? entry[defaultLocale] ?? key;
    }, [locale]);

    return (
      <LocaleContext.Provider value={{ locale, setLocale, t }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  // --- Hook ---

  function useLocale(): LocaleContextValue<L> {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
    return ctx;
  }

  return { LocaleProvider, useLocale };
}
