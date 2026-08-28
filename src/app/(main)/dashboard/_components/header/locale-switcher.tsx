"use client";

import { useMemo } from "react";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useTranslation } from "@/stores/locale/locale-provider";

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  const labels = useMemo(
    () =>
      LOCALES.reduce<Record<Locale, string>>(
        (acc, code) => {
          acc[code] = t(`locale.${code}`);
          return acc;
        },
        { en: "English", az: "Azərbaycan" },
      ),
    [t],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" aria-label={t("locale.label")}>
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)} aria-current={locale === code}>
            {labels[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
