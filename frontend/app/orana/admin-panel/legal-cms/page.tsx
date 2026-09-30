"use client";

import translations from "../../../translations";
import PageCMSEditor from "../../../components/admin/PageCMSEditor";
import { usePageCMS } from "../../../context/PageCMSContext";
import type { ElementData } from "../../../context/PageCMSContext";
import Link from "next/link";
import lStyles from "../../../styles/legal/Legal.module.css";
import LegalSectionContent from "../../../components/legal/LegalSectionContent";

const IMAGE_IDS = new Set<string>();

const en = translations.English.legal;
const ar = translations.Arabic.legal;

// Build dynamic labels and defaults from all sections
const sectionLabels: Record<string, string> = {};
const sectionDefaults: Record<string, string> = {};
const sectionArDefaults: Record<string, string> = {};

const FIELDS = [
  { key: "title",     part: "title", label: "Title" },
  { key: "text",      part: "text",  label: "Text" },
  { key: "textAfter", part: "after", label: "Text After List" },
  { key: "linkText",  part: "link",  label: "Link Text" },
] as const;

en.sections.forEach((sec, i) => {
  FIELDS.forEach(({ key, part, label }) => {
    const val = sec[key];
    if (!val) return;
    const id = `legal-section-${i}-${part}`;
    sectionLabels[id] = `Section ${i + 1} — ${label}`;
    sectionDefaults[id] = val;
    sectionArDefaults[id] = ar.sections[i]?.[key] ?? val;
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
  const extraCount = parseInt(elements["legal-extra-count"]?.content ?? "0");
  const deletedSet = new Set<number>(JSON.parse(elements["legal-deleted-sections"]?.content ?? "[]"));

  function deleteTranslationSection(i: number) {
    setElements(prev => {
      const key = "legal-deleted-sections";
      const existing = new Set<number>(JSON.parse(prev[key]?.content ?? "[]"));
      existing.add(i);
      return { ...prev, [key]: { content: JSON.stringify([...existing]) } };
    });
  }

  function addSection() {
    setElements(prev => {
      const key = "legal-extra-count";
      const cur = parseInt(prev[key]?.content ?? "0");
      return { ...prev, [key]: { content: String(cur + 1) } };
    });
  }

  function deleteSection(i: number) {
    setElements(prev => {
      const key = "legal-extra-count";
      const cur = parseInt(prev[key]?.content ?? "0");
      const next = { ...prev };
      for (let j = i; j < cur - 1; j++) {
        next[`legal-extra-${j}-title`] = next[`legal-extra-${j + 1}-title`] ?? {};
        next[`legal-extra-${j}-text`]  = next[`legal-extra-${j + 1}-text`]  ?? {};
        if (next[`ar:legal-extra-${j + 1}-title`]) next[`ar:legal-extra-${j}-title`] = next[`ar:legal-extra-${j + 1}-title`];
        else delete next[`ar:legal-extra-${j}-title`];
        if (next[`ar:legal-extra-${j + 1}-text`]) next[`ar:legal-extra-${j}-text`] = next[`ar:legal-extra-${j + 1}-text`];
        else delete next[`ar:legal-extra-${j}-text`];
      }
      delete next[`legal-extra-${cur - 1}-title`];
      delete next[`legal-extra-${cur - 1}-text`];
      delete next[`ar:legal-extra-${cur - 1}-title`];
      delete next[`ar:legal-extra-${cur - 1}-text`];
      next[key] = { content: String(Math.max(0, cur - 1)) };
      return next;
    });
  }

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
        <div className={lStyles.content}>

          {/* Existing translation sections */}
          {l.sections.map((section, i) => {
            if (deletedSet.has(i)) return null;
            return (
              <div key={i} className={lStyles.section} style={{ position: "relative", paddingRight: cmsMode ? 80 : 0 }}>
                <LegalSectionContent section={section} index={i} ce={ce} />
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
            const titleId = `legal-extra-${i}-title`;
            const textId  = `legal-extra-${i}-text`;
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
              + Add Section
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
