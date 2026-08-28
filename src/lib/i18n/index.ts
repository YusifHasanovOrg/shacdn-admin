import { DEFAULT_LOCALE, isLocale, LOCALE_STORAGE_KEY, type Locale } from "./config";
export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  LOCALES,
  localeToIntl,
  type Locale,
} from "./config";
export { createTranslator, translate, type TranslateFn, type TranslateParams } from "./messages";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}
