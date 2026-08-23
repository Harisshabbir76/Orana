"use client";

import { createContext, useContext, useState } from "react";

type Currency = "AED" | "USD";
type Language = "English" | "Arabic";

const AED_TO_USD = 1 / 3.6725; // official UAE dirham peg
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

interface CurrencyContextType {
  currency: Currency;
  language: Language;
  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
  formatPrice: (aedPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "AED",
  language: "English",
  setCurrency: () => {},
  setLanguage: () => {},
  formatPrice: (p) => `Dhs. ${p}`,
});

interface Props {
  children: React.ReactNode;
  initialLanguage?: string;
  initialCurrency?: string;
}

export function CurrencyProvider({ children, initialLanguage = "English", initialCurrency = "AED" }: Props) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency as Currency);
  const [language, setLanguageState] = useState<Language>(initialLanguage as Language);

  const setCurrency = (c: Currency) => {
    setCookie("orana_currency", c);
    setCurrencyState(c);
  };

  const setLanguage = (l: Language) => {
    setCookie("orana_language", l);
    setLanguageState(l);
  };

  const formatPrice = (aedPrice: number): string => {
    if (currency === "USD") {
      return `$ ${(aedPrice * AED_TO_USD).toFixed(2)}`;
    }
    return `Dhs. ${aedPrice}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, language, setCurrency, setLanguage, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
