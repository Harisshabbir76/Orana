"use client";

import { useState } from "react";
import translations from "../../../translations";
import PageCMSEditor from "../../../components/admin/PageCMSEditor";
import { usePageCMS } from "../../../context/PageCMSContext";
import type { ElementData } from "../../../context/PageCMSContext";
import Link from "next/link";
import lStyles from "../../../styles/legal/Legal.module.css";

const IMAGE_IDS = new Set<string>();

const en = translations.English.legal;
const ar = translations.Arabic.legal;

type TabKey = "privacy" | "terms" | "shipping" | "returns";
const TAB_KEYS: TabKey[] = ["privacy", "terms", "shipping", "returns"];

// Build dynamic labels and defaults from all sections
const sectionLabels: Record<string, string> = {};
const sectionDefaults: Record<string, string> = {};
const sectionArDefaults: Record<string, string> = {};

TAB_KEYS.forEach(tab => {
  const enSections = en.content[tab].sections as Array<{ title?: string; text?: string; email?: string }>;
  const arSections = ar.content[tab].sections as Array<{ title?: string; text?: string; email?: string }>;
  enSections.forEach((sec, i) => {
    const prefix = `${tab.charAt(0).toUpperCase() + tab.slice(1)} — Section ${i + 1}`;
    if (sec.title) {
      const id = `legal-${tab}-section-${i}-title`;
      sectionLabels[id] = `${prefix} Title`;
      sectionDefaults[id] = sec.title;
      sectionArDefaults[id] = arSections[i]?.title ?? sec.title;
    }
    if (sec.text) {
      const id = `legal-${tab}-section-${i}-text`;
      sectionLabels[id] = `${prefix} Text`;
      sectionDefaults[id] = sec.text;
      sectionArDefaults[id] = arSections[i]?.text ?? sec.text;
    }
    if (sec.email) {
      const id = `legal-${tab}-section-${i}-email`;
      sectionLabels[id] = `${prefix} Email`;
      sectionDefaults[id] = sec.email;
      sectionArDefaults[id] = arSections[i]?.email ?? sec.email;
    }
  });
});

const ELEMENT_LABELS: Record<string, string> = {
  "legal-heading":  "Legal — Heading",
  "legal-subtitle": "Legal — Subtitle",
  ...sectionLabels,
};

const DEFAULTS: Record<string, string> = {
  "legal-heading":  en.heading,
  "legal-subtitle": en.subtitle,
  ...sectionDefaults,
};

const AR_DEFAULTS: Record<string, string> = {
  "legal-heading":  ar.heading,
  "legal-subtitle": ar.subtitle,
  ...sectionArDefaults,
};

function LegalPreview({
  elements,
  setElements,
}: {
  elements: Record<string, ElementData>;
  setElements: React.Dispatch<React.SetStateAction<Record<string, ElementData>>>;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("privacy");
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base = getStyle(id);
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); selectElement(id); },
    };
  }

  const l = translations.English.legal;
  const tabs: { key: TabKey; label: string }[] = [
    { key: "privacy",  label: l.tabPrivacy },
    { key: "terms",    label: l.tabTerms },
    { key: "shipping", label: l.tabShipping },
    { key: "returns",  label: l.tabReturns },
  ];

  const sections = l.content[activeTab].sections as Array<{ title?: string; text?: string; items?: string[]; email?: string }>;
  const extraCount = parseInt(elements[`legal-${activeTab}-extra-count`]?.content ?? "0");
  const deletedSet = new Set<number>(
    JSON.parse(elements[`legal-${activeTab}-deleted-sections`]?.content ?? "[]")
  );

  function deleteTranslationSection(i: number) {
    const tab = activeTab;
    setElements(prev => {
      const key = `legal-${tab}-deleted-sections`;
      const existing = new Set<number>(JSON.parse(prev[key]?.content ?? "[]"));
      existing.add(i);
      return { ...prev, [key]: { content: JSON.stringify([...existing]) } };
    });
  }

  function addSection() {
    const tab = activeTab;
    setElements(prev => {
      const key = `legal-${tab}-extra-count`;
      const cur = parseInt(prev[key]?.content ?? "0");
      return { ...prev, [key]: { content: String(cur + 1) } };
    });
  }

  function deleteSection(i: number) {
    const tab = activeTab;
    setElements(prev => {
      const key = `legal-${tab}-extra-count`;
      const cur = parseInt(prev[key]?.content ?? "0");
      const next = { ...prev };
      for (let j = i; j < cur - 1; j++) {
        next[`legal-${tab}-extra-${j}-title`] = next[`legal-${tab}-extra-${j + 1}-title`] ?? {};
        next[`legal-${tab}-extra-${j}-text`]  = next[`legal-${tab}-extra-${j + 1}-text`]  ?? {};
        if (next[`ar:legal-${tab}-extra-${j + 1}-title`]) next[`ar:legal-${tab}-extra-${j}-title`] = next[`ar:legal-${tab}-extra-${j + 1}-title`];
        else delete next[`ar:legal-${tab}-extra-${j}-title`];
        if (next[`ar:legal-${tab}-extra-${j + 1}-text`]) next[`ar:legal-${tab}-extra-${j}-text`] = next[`ar:legal-${tab}-extra-${j + 1}-text`];
        else delete next[`ar:legal-${tab}-extra-${j}-text`];
      }
      delete next[`legal-${tab}-extra-${cur - 1}-title`];
      delete next[`legal-${tab}-extra-${cur - 1}-text`];
      delete next[`ar:legal-${tab}-extra-${cur - 1}-title`];
      delete next[`ar:legal-${tab}-extra-${cur - 1}-text`];
      next[key] = { content: String(Math.max(0, cur - 1)) };
      return next;
    });
  }

  const tabLabel = tabs.find(t => t.key === activeTab)?.label ?? activeTab;

  return (
    <div className={lStyles.page}>
      <div className={lStyles.inner}>
        <nav className={lStyles.breadcrumb}>
          <Link href="/" className={lStyles.breadcrumbLink}>{l.breadcrumbHome}</Link>
          <span className={lStyles.breadcrumbSep}>&gt;</span>
          <span className={lStyles.breadcrumbCurrent}>{l.breadcrumbLegal}</span>
        </nav>
        <div className={lStyles.header}>
          <h1 className={lStyles.heading} {...ce("legal-heading")}>{getContent("legal-heading", l.heading)}</h1>
          <p className={lStyles.subtitle} {...ce("legal-subtitle")}>{getContent("legal-subtitle", l.subtitle)}</p>
        </div>
        <hr className={lStyles.divider} />
        <div className={lStyles.tabs}>
          {tabs.map(tab => (
            <button key={tab.key} className={`${lStyles.tab} ${activeTab === tab.key ? lStyles.tabActive : ""}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
        <hr className={lStyles.divider} />
        <div className={lStyles.content}>

          {/* Existing translation sections */}
          {sections.map((section, i) => {
            if (deletedSet.has(i)) return null;
            const titleId = `legal-${activeTab}-section-${i}-title`;
            const textId  = `legal-${activeTab}-section-${i}-text`;
            return (
              <div key={i} className={lStyles.section} style={{ position: "relative", paddingRight: cmsMode ? 80 : 0 }}>
                {section.title && <h2 className={lStyles.sectionTitle} {...ce(titleId)}>{getContent(titleId, section.title)}</h2>}
                {section.text  && <p  className={lStyles.sectionText}  {...ce(textId)}>{getContent(textId, section.text)}</p>}
                {section.items && <ul className={lStyles.sectionList}>{section.items.map((item, j) => <li key={j} className={lStyles.sectionListItem}>{item}</li>)}</ul>}
                {section.email && (() => {
                  const emailId = `legal-${activeTab}-section-${i}-email`;
                  const emailVal = getContent(emailId, section.email);
                  return <a href={cmsMode ? "#" : `mailto:${emailVal}`} className={lStyles.email} {...ce(emailId)}>{emailVal}</a>;
                })()}
                {cmsMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTranslationSection(i); }}
                    title="Delete this section"
                    style={{ position: "absolute", top: 0, right: 0, background: "#fff0ee", border: "1px solid #cc3300", borderRadius: 3, color: "#cc3300", fontWeight: 700, fontSize: 10, padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
                  >✕ Delete</button>
                )}
              </div>
            );
          })}

          {/* Extra CMS-added sections */}
          {Array.from({ length: extraCount }, (_, i) => {
            const titleId = `legal-${activeTab}-extra-${i}-title`;
            const textId  = `legal-${activeTab}-extra-${i}-text`;
            return (
              <div key={`extra-${i}`} className={lStyles.section} style={{ position: "relative", paddingRight: cmsMode ? 110 : 0 }}>
                <h2
                  className={lStyles.sectionTitle}
                  {...ce(titleId)}
                  style={{ ...ce(titleId).style, minHeight: cmsMode ? 28 : undefined }}
                >
                  {getContent(titleId, "") || (cmsMode ? <span style={{ opacity: 0.4, fontStyle: "italic", fontWeight: 300, fontSize: 13 }}>Click to add title</span> : null)}
                </h2>
                <p
                  className={lStyles.sectionText}
                  {...ce(textId)}
                  style={{ ...ce(textId).style, minHeight: cmsMode ? 28 : undefined }}
                >
                  {getContent(textId, "") || (cmsMode ? <span style={{ opacity: 0.4, fontStyle: "italic" }}>Click to add text</span> : null)}
                </p>
                {cmsMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSection(i); }}
                    title="Delete this section"
                    style={{ position: "absolute", top: 0, right: 0, background: "#fff0ee", border: "1px solid #cc3300", borderRadius: 3, color: "#cc3300", fontWeight: 700, fontSize: 10, padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    ✕ Delete
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Section button */}
          {cmsMode && (
            <button
              onClick={(e) => { e.stopPropagation(); addSection(); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "16px 0 8px", padding: "10px 16px", border: "1.5px dashed #DB663B", background: "transparent", color: "#DB663B", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", width: "100%", textTransform: "uppercase" }}
            >
              + Add Section to {tabLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LegalCMSPage() {
  return (
    <PageCMSEditor
      page="legal"
      elementLabels={ELEMENT_LABELS}
      imageIds={IMAGE_IDS}
      defaults={DEFAULTS}
      arDefaults={AR_DEFAULTS}
    >
      {(elements, _sel, _setSel, setElements) => (
        <LegalPreview elements={elements} setElements={setElements} />
      )}
    </PageCMSEditor>
  );
}
