"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Locale = "en" | "fr" | "ar";
type TranslationDict = Record<string, string | Record<string, string | Record<string, string>>>;

const STORAGE_KEY = "an-nadjah-locale";
const COOKIE_NAME = "NEXT_LOCALE";

const messages: Record<Locale, () => Promise<TranslationDict>> = {
  en: () => import("@/locales/en.json").then((m) => m.default),
  fr: () => import("@/locales/fr.json").then((m) => m.default),
  ar: () => import("@/locales/ar.json").then((m) => m.default),
};

const dirs: Record<Locale, "ltr" | "rtl"> = { en: "ltr", fr: "ltr", ar: "rtl" };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && ["en", "fr", "ar"].includes(stored)) return stored;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match) {
    const val = match[1] as Locale;
    if (["en", "fr", "ar"].includes(val)) return val;
  }
  return "fr";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [translations, setTranslations] = useState<TranslationDict>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, locale);
    setCookie(COOKIE_NAME, locale);
    document.documentElement.dir = dirs[locale];
    document.documentElement.lang = locale;
    messages[locale]().then(setTranslations);
  }, [locale, mounted]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const parts = key.split(".");
      let value: unknown = translations;
      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }
      if (typeof value !== "string") return key;
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, p) => String(params[p] ?? `{{${p}}}`));
      }
      return value;
    },
    [translations]
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: dirs[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
