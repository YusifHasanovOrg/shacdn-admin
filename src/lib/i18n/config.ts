export const LOCALES = ["en", "az"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "admin_locale";

export const LOCALE_COOKIE_KEY = "admin_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "az";
}

export function localeToIntl(locale: Locale) {
  return locale === "az" ? "az-AZ" : "en-US";
}
