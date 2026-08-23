"use client";

import { useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";

export default function LangApplier() {
  const { language } = useCurrency();

  useEffect(() => {
    const isAr = language === "Arabic";
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = isAr ? "ar" : "en";
  }, [language]);

  return null;
}
