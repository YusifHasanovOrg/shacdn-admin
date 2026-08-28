"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";

import {
  createTranslator,
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  type Locale,
  type TranslateFn,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function persistLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const nextLocale = isLocale(stored) ? stored : DEFAULT_LOCALE;
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    setReady(true);
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);

  if (!ready) {
    return (
      <LocaleContext.Provider
        value={{
          locale: DEFAULT_LOCALE,
          setLocale,
          t: createTranslator(DEFAULT_LOCALE),
        }}
      >
        {children}
      </LocaleContext.Provider>
    );
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const context = use(LocaleContext);
  if (!context) throw new Error("Missing LocaleProvider");

  return {
    locale: context.locale,
    setLocale: context.setLocale,
    t: context.t,
  };
}
