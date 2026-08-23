"use client";

import { useCurrency } from "../context/CurrencyContext";
import translations from "../translations";

export function useTranslation() {
  const { language } = useCurrency();
  const t = translations[language as keyof typeof translations] ?? translations.English;

  function te(msg: string): string {
    return t.apiErrors[msg] ?? msg;
  }

  return Object.assign(t, { te });
}
