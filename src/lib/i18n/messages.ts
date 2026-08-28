import az from "@/locales/az.json";
import en from "@/locales/en.json";

import type { Locale } from "./config";

const catalogs: Record<Locale, Record<string, unknown>> = {
  en,
  az,
};

export type TranslateParams = Record<string, string | number>;

function resolvePath(source: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

export function translate(locale: Locale, key: string, params?: TranslateParams): string {
  const value = resolvePath(catalogs[locale], key) ?? resolvePath(catalogs.en, key);
  if (typeof value !== "string") return key;

  if (!params) return value;

  return value.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const replacement = params[token];
    return replacement === undefined ? "" : String(replacement);
  });
}

export type TranslateFn = (key: string, params?: TranslateParams) => string;

export function createTranslator(locale: Locale): TranslateFn {
  return (key, params) => translate(locale, key, params);
}
