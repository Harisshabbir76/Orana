"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useCurrency } from "./CurrencyContext";

export interface ElementStyles {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  lineHeight?: string;
  color?: string;
  marginTop?: string; marginRight?: string; marginBottom?: string; marginLeft?: string;
  paddingTop?: string; paddingRight?: string; paddingBottom?: string; paddingLeft?: string;
  maxWidth?: string; maxHeight?: string;
}

export interface ElementData {
  content?: string;
  styles?: ElementStyles;
}

interface CMSContextValue {
  cmsMode: boolean;
  selectedId: string | null;
  elements: Record<string, ElementData>;
  getContent: (id: string, fallback: string) => string;
  getStyle: (id: string) => React.CSSProperties;
  selectElement: (id: string) => void;
}

const defaultCtx: CMSContextValue = {
  cmsMode: false,
  selectedId: null,
  elements: {},
  getContent: (_, fb) => fb,
  getStyle: () => ({}),
  selectElement: () => {},
};

const HomepageCMSContext = createContext<CMSContextValue>(defaultCtx);

// ── View provider — live site fetches from API ────────────────────────────────
export function HomepageCMSProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<Record<string, ElementData>>({});
  const { language } = useCurrency();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-cms`)
      .then(r => r.ok ? r.json() : {})
      .then(d => setElements(d || {}))
      .catch(() => {});
  }, []);

  const getContent = useCallback((id: string, fb: string) => {
    if (language === "Arabic") {
      const arContent = elements[`ar:${id}`]?.content;
      if (arContent) return arContent;
      // Non-empty fb = text element → show Arabic translation default, not English CMS value
      // Empty fb = image/URL element → fall through to shared base key
      if (fb) return fb;
    }
    return elements[id]?.content || fb;
  }, [elements, language]);

  const getStyle = useCallback((id: string): React.CSSProperties => {
    const s = elements[id]?.styles || {};
    return Object.fromEntries(Object.entries(s).filter(([, v]) => !!v)) as React.CSSProperties;
  }, [elements]);

  return (
    <HomepageCMSContext.Provider value={{ cmsMode: false, selectedId: null, elements, getContent, getStyle, selectElement: () => {} }}>
      {children}
    </HomepageCMSContext.Provider>
  );
}

// ── Editor provider — admin uses local draft state ────────────────────────────
export function AdminCMSProvider({ children, elements, selectedId, onSelect }: {
  children: ReactNode;
  elements: Record<string, ElementData>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const getContent = useCallback((id: string, fb: string) =>
    elements[id]?.content || fb, [elements]);

  const getStyle = useCallback((id: string): React.CSSProperties => {
    const s = elements[id]?.styles || {};
    return Object.fromEntries(Object.entries(s).filter(([, v]) => !!v)) as React.CSSProperties;
  }, [elements]);

  return (
    <HomepageCMSContext.Provider value={{ cmsMode: true, selectedId, elements, getContent, getStyle, selectElement: onSelect }}>
      {children}
    </HomepageCMSContext.Provider>
  );
}

export function useCMS() {
  return useContext(HomepageCMSContext);
}
