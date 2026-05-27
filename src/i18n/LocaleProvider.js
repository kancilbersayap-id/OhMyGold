'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { dictionaries } from './dictionaries';
import { defaultLocale, isLocale, LOCALE_COOKIE } from './config';
import { translate } from './translate';

const LocaleContext = createContext(null);

/**
 * Provides the active locale and a `t()` translator to client components.
 *
 * `initialLocale` is resolved on the server (from the locale cookie) and
 * passed down so the first client render matches the server render.
 * `setLocale` persists the choice to a cookie — wire it to a language
 * switcher when one is added.
 */
export function LocaleProvider({ initialLocale = defaultLocale, children }) {
  const [locale, setLocaleState] = useState(
    isLocale(initialLocale) ? initialLocale : defaultLocale
  );

  const setLocale = useCallback((next) => {
    if (!isLocale(next)) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocaleState(next);
  }, []);

  const value = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries[defaultLocale];
    return {
      locale,
      setLocale,
      t: (key, vars) => translate(dict, key, vars),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Access `{ locale, setLocale, t }` inside any client component. */
export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  return ctx;
}
