"use client";

import { useEffect, useState, useRef } from "react";
import { AdminCMSProvider } from "../../../context/HomepageCMSContext";
import type { ElementData } from "../../../context/HomepageCMSContext";
import HeroSection from "../../../components/homepage/HeroSection";
import Designed from "../../../components/homepage/Designed";
import Marquee from "../../../components/homepage/Marquee";
import Collection from "../../../components/homepage/Collection";
import Effortless from "../../../components/homepage/Effortless";
import Inspired from "../../../components/homepage/Inspired";
import { DestinationInner as Destination } from "../../../components/homepage/Destination";
import { InstagramInner as Instagram } from "../../../components/homepage/Instagram";
import { useTranslation } from "../../../hooks/useTranslation";
import translations from "../../../translations";
import styles from "../../../styles/admin/HomepageCMS.module.css";
import { adminFetch } from "../../../lib/adminFetch";

const IMAGE_IDS = new Set([
  "hero-image", "designed-logo", "effortless-image", "inspired-image", "destination-image",
  "instagram-img-1", "instagram-img-2", "instagram-img-3", "instagram-img-4",
  "instagram-img-5", "instagram-img-6", "instagram-img-7", "instagram-img-8",
]);

const ELEMENT_LABELS: Record<string, string> = {
  "hero-image":                    "Hero — Background Image",
  "hero-heading":                  "Hero — Heading",
  "hero-subtitle":                 "Hero — Subtitle",
  "hero-btn":                      "Hero — Button Text",
  "designed-logo":                 "Designed — Logo Icon",
  "designed-heading":              "Designed — Heading",
  "designed-para1":                "Designed — Paragraph 1",
  "designed-para2":                "Designed — Paragraph 2",
  "marquee":                       "Marquee Band",
  "collection-heading":            "Collection — Heading",
  "collection-subtitle":           "Collection — Subtitle",
  "effortless-image":              "Effortless — Background Image",
  "effortless-heading":            "Effortless — Heading",
  "effortless-card-0-title":       "Effortless — Card 1 Title",
  "effortless-card-0-text":        "Effortless — Card 1 Text",
  "effortless-card-1-title":       "Effortless — Card 2 Title",
  "effortless-card-1-text":        "Effortless — Card 2 Text",
  "effortless-card-2-title":       "Effortless — Card 3 Title",
  "effortless-card-2-text":        "Effortless — Card 3 Text",
  "inspired-image":                "Inspired — Image",
  "inspired-heading":              "Inspired — Heading",
  "inspired-para1":                "Inspired — Paragraph 1",
  "inspired-para2":                "Inspired — Paragraph 2",
  "inspired-para3":                "Inspired — Paragraph 3",
  "inspired-btn":                  "Inspired — Button Text",
  "destination-image":             "Destination — Background Image",
  "destination-heading":           "Destination — Heading",
  "destination-text":              "Destination — Text",
  "destination-btn":               "Destination — Button Text",
  "destination-discover-heading":  "Destination — Discover Heading",
  "destination-discover-text":     "Destination — Discover Text",
  "destination-discover-btn":      "Destination — Discover Button",
  "instagram-line1":               "Instagram — Heading Line 1",
  "instagram-line2":               "Instagram — Heading Line 2",
  "instagram-img-1":               "Instagram — Image 1",
  "instagram-img-2":               "Instagram — Image 2",
  "instagram-img-3":               "Instagram — Image 3",
  "instagram-img-4":               "Instagram — Image 4",
  "instagram-img-5":               "Instagram — Image 5",
  "instagram-img-6":               "Instagram — Image 6",
  "instagram-img-7":               "Instagram — Image 7",
  "instagram-img-8":               "Instagram — Image 8",
};

const AR_DEFAULTS: Record<string, string> = {
  "hero-heading":                translations.Arabic.hero.heading,
  "hero-subtitle":               translations.Arabic.hero.subtitle,
  "hero-btn":                    translations.Arabic.hero.btn,
  "designed-heading":            translations.Arabic.designed.heading,
  "designed-para1":              translations.Arabic.designed.para1,
  "designed-para2":              translations.Arabic.designed.para2,
  "marquee-phrase-0":            translations.Arabic.marquee.phrases[0],
  "marquee-phrase-1":            translations.Arabic.marquee.phrases[1],
  "marquee-phrase-2":            translations.Arabic.marquee.phrases[2],
  "marquee-phrase-3":            translations.Arabic.marquee.phrases[3],
  "collection-heading":          translations.Arabic.collection.heading,
  "collection-subtitle":         translations.Arabic.collection.subtitle,
  "effortless-heading":          translations.Arabic.effortless.heading,
  "effortless-card-0-title":     translations.Arabic.effortless.cards[0].title,
  "effortless-card-0-text":      translations.Arabic.effortless.cards[0].text,
  "effortless-card-1-title":     translations.Arabic.effortless.cards[1].title,
  "effortless-card-1-text":      translations.Arabic.effortless.cards[1].text,
  "effortless-card-2-title":     translations.Arabic.effortless.cards[2].title,
  "effortless-card-2-text":      translations.Arabic.effortless.cards[2].text,
  "inspired-heading":            translations.Arabic.inspired.heading,
  "inspired-para1":              translations.Arabic.inspired.para1,
  "inspired-para2":              translations.Arabic.inspired.para2,
  "inspired-para3":              translations.Arabic.inspired.para3,
  "inspired-btn":                translations.Arabic.inspired.btn,
  "destination-heading":         translations.Arabic.destination.heading,
  "destination-text":            translations.Arabic.destination.text,
  "destination-btn":             translations.Arabic.destination.btn,
  "destination-discover-heading":translations.Arabic.destination.discoverHeading,
  "destination-discover-text":   translations.Arabic.destination.discoverText,
  "destination-discover-btn":    translations.Arabic.destination.discoverBtn,
  "instagram-line1":             translations.Arabic.instagram.line1,
  "instagram-line2":             translations.Arabic.instagram.line2,
};

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Sans-serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];

export default function HomepageCMSEditor() {
  const t = useTranslation();

  const DEFAULTS: Record<string, string> = {
    "hero-heading":               t.hero.heading,
    "hero-subtitle":              t.hero.subtitle,
    "hero-btn":                   t.hero.btn,
    "designed-heading":           t.designed.heading,
    "designed-para1":             t.designed.para1,
    "designed-para2":             t.designed.para2,
    "marquee-phrase-0":           t.marquee.phrases[0],
    "marquee-phrase-1":           t.marquee.phrases[1],
    "marquee-phrase-2":           t.marquee.phrases[2],
    "marquee-phrase-3":           t.marquee.phrases[3],
    "collection-heading":         t.collection.heading,
    "collection-subtitle":        t.collection.subtitle,
    "effortless-heading":         t.effortless.heading,
    "effortless-card-0-title":    t.effortless.cards[0].title,
    "effortless-card-0-text":     t.effortless.cards[0].text,
    "effortless-card-1-title":    t.effortless.cards[1].title,
    "effortless-card-1-text":     t.effortless.cards[1].text,
    "effortless-card-2-title":    t.effortless.cards[2].title,
    "effortless-card-2-text":     t.effortless.cards[2].text,
    "inspired-heading":           t.inspired.heading,
    "inspired-para1":             t.inspired.para1,
    "inspired-para2":             t.inspired.para2,
    "inspired-para3":             t.inspired.para3,
    "inspired-btn":               t.inspired.btn,
    "destination-heading":        t.destination.heading,
    "destination-text":           t.destination.text,
    "destination-btn":            t.destination.btn,
    "destination-discover-heading": t.destination.discoverHeading,
    "destination-discover-text":  t.destination.discoverText,
    "destination-discover-btn":   t.destination.discoverBtn,
    "instagram-line1":            t.instagram.line1,
    "instagram-line2":            t.instagram.line2,
  };

  const [elements, setElements] = useState<Record<string, ElementData>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-cms`)
      .then(r => r.ok ? r.json() : {})
      .then(d => setElements(d || {}))
      .catch(() => {});
  }, []);

  const isMarquee = selectedId === "marquee";
  const isImg = selectedId ? IMAGE_IDS.has(selectedId) : false;

  // For images, always use base key (same image for both languages)
  function contentKey(id: string) {
    return langTab === "ar" && !IMAGE_IDS.has(id) ? `ar:${id}` : id;
  }

  const activeDefaults = langTab === "ar" ? AR_DEFAULTS : DEFAULTS;
  const selContentId = selectedId && !isMarquee ? contentKey(selectedId) : null;
  const selContent = selContentId ? (elements[selContentId] ?? {}) : null;
  // Styles are shared across languages — always read/write from base key
  const selStyles = selectedId && !isMarquee ? (elements[selectedId]?.styles ?? {}) : {};

  function setContent(content: string) {
    if (!selectedId) return;
    const key = contentKey(selectedId);
    setElements(p => ({ ...p, [key]: { ...p[key], content } }));
  }

  function setStyle(key: string, value: string) {
    if (!selectedId) return;
    setElements(p => ({
      ...p,
      [selectedId]: { ...p[selectedId], styles: { ...(p[selectedId]?.styles ?? {}), [key]: value } },
    }));
  }

  function toggleStyle(key: string, on: string, off: string) {
    const cur = selStyles[key as keyof typeof selStyles];
    setStyle(key, cur === on ? off : on);
  }

  function resetEl() {
    if (!selectedId) return;
    if (selectedId === "marquee") {
      setElements(p => {
        const n = { ...p };
        [0, 1, 2, 3].forEach(i => {
          delete n[`marquee-phrase-${i}`];
          delete n[`ar:marquee-phrase-${i}`];
        });
        return n;
      });
    } else if (langTab === "ar") {
      const key = `ar:${selectedId}`;
      setElements(p => { const n = { ...p }; delete n[key]; return n; });
    } else {
      // EN reset: remove content+styles for this element (and its ar: counterpart)
      setElements(p => {
        const n = { ...p };
        delete n[selectedId!];
        delete n[`ar:${selectedId!}`];
        return n;
      });
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-cms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements }),
      });
      if (res.ok) {
        setSavedMsg("Saved!");
        setTimeout(() => setSavedMsg(""), 2500);
      }
    } catch { setSavedMsg("Save failed"); }
    finally { setSaving(false); }
  }

  async function uploadImg(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-cms/image`, { method: "POST", body: fd });
      if (res.ok) { const { url } = await res.json(); setContent(url); }
    } finally { setUploading(false); }
  }

  function px(val: string | undefined) {
    return val?.replace("px", "") ?? "";
  }

  const panelOpen = !!selectedId;

  return (
    <div className={styles.page}>
      {/* Body */}
      <div className={styles.body}>
        {/* Preview */}
        <div className={styles.preview} style={{ marginRight: panelOpen ? 380 : 0 }}>
          <AdminCMSProvider elements={elements} selectedId={selectedId} onSelect={setSelectedId}>
            <HeroSection />
            <Designed />
            <Marquee />
            <Collection initialProducts={[]} />
            <Effortless />
            <Inspired />
            <Destination />
            <Instagram />
          </AdminCMSProvider>
        </div>

        {/* Properties panel */}
        <div className={`${styles.panel} ${panelOpen ? styles.panelOpen : ""}`}>
          {selectedId && (
            <>
              {/* Header */}
              <div className={styles.panelHeader}>
                <div style={{ flex: 1 }}>
                  <div className={styles.panelLabel}>{ELEMENT_LABELS[selectedId] ?? selectedId}</div>
                  <div className={styles.panelId}>{selectedId}</div>
                  {!isImg && (
                    <div className={styles.langTabs}>
                      <button
                        className={`${styles.langTab} ${langTab === "en" ? styles.langTabActive : ""}`}
                        onClick={() => setLangTab("en")}
                      >EN</button>
                      <button
                        className={`${styles.langTab} ${langTab === "ar" ? styles.langTabActive : ""}`}
                        onClick={() => setLangTab("ar")}
                      >AR</button>
                    </div>
                  )}
                </div>
                <button className={styles.closeBtn} onClick={() => setSelectedId(null)}>✕</button>
              </div>

              <div className={styles.panelBody}>
                {/* ── Marquee special case ───────────────────── */}
                {isMarquee && (
                  <div className={styles.sec}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div className={styles.secTitle} style={{ marginBottom: 0 }}>Marquee Phrases</div>
                      <div className={styles.langTabs} style={{ marginTop: 0 }}>
                        <button className={`${styles.langTab} ${langTab === "en" ? styles.langTabActive : ""}`} onClick={() => setLangTab("en")}>EN</button>
                        <button className={`${styles.langTab} ${langTab === "ar" ? styles.langTabActive : ""}`} onClick={() => setLangTab("ar")}>AR</button>
                      </div>
                    </div>
                    {[0, 1, 2, 3].map(i => {
                      const baseId = `marquee-phrase-${i}`;
                      const id = langTab === "ar" ? `ar:${baseId}` : baseId;
                      const defaultText = activeDefaults[baseId] ?? "";
                      const saved = elements[id]?.content;
                      return (
                        <div key={i} className={styles.field} style={{ marginBottom: 12 }}>
                          <label className={styles.fieldLabel}>Phrase {i + 1}</label>
                          <input
                            className={styles.input}
                            type="text"
                            dir={langTab === "ar" ? "rtl" : "ltr"}
                            value={saved ?? defaultText}
                            onChange={e => setElements(p => ({
                              ...p,
                              [id]: { ...p[id], content: e.target.value },
                            }))}
                            placeholder={defaultText}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Content (non-marquee) ─────────────────── */}
                {!isMarquee && <div className={styles.sec}>
                  <div className={styles.secTitle}>{isImg ? "Image" : "Content"}</div>

                  {isImg ? (
                    <>
                      {selContent?.content && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selContent.content} alt="preview" className={styles.imgPreview} />
                      )}
                      <input
                        className={styles.input}
                        type="url"
                        placeholder="Paste image URL…"
                        value={selContent?.content ?? ""}
                        onChange={e => setContent(e.target.value)}
                      />
                      <button
                        className={styles.uploadBtn}
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading…" : "Upload Image"}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadImg(f); e.target.value = ""; }}
                      />
                    </>
                  ) : (
                    <textarea
                      className={styles.textarea}
                      rows={4}
                      dir={langTab === "ar" ? "rtl" : "ltr"}
                      placeholder="Enter text…"
                      value={selContent?.content ?? activeDefaults[selectedId ?? ""] ?? ""}
                      onChange={e => setContent(e.target.value)}
                    />
                  )}
                </div>}

                {/* ── Typography (text elements only) ───────── */}
                {!isImg && !isMarquee && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Typography</div>

                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Font Size</label>
                        <div className={styles.inputWithUnit}>
                          <input
                            className={styles.numInput}
                            type="number"
                            min={6} max={300}
                            placeholder="–"
                            value={px(selStyles.fontSize)}
                            onChange={e => setStyle("fontSize", e.target.value ? `${e.target.value}px` : "")}
                          />
                          <span className={styles.unit}>px</span>
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Line Height</label>
                        <input
                          className={styles.numInput}
                          type="number"
                          min={0.5} max={6} step={0.1}
                          placeholder="–"
                          value={selStyles.lineHeight ?? ""}
                          onChange={e => setStyle("lineHeight", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.field} style={{ marginBottom: 12 }}>
                      <label className={styles.fieldLabel}>Font Family</label>
                      <select className={styles.select} value={selStyles.fontFamily ?? ""} onChange={e => setStyle("fontFamily", e.target.value)}>
                        {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>

                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Font Weight</label>
                        <select className={styles.select} value={selStyles.fontWeight ?? ""} onChange={e => setStyle("fontWeight", e.target.value)}>
                          <option value="">Default</option>
                          {[100,200,300,400,500,600,700,800,900].map(w => (
                            <option key={w} value={String(w)}>{w}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Color</label>
                        <input
                          type="color"
                          className={styles.colorPicker}
                          value={selStyles.color ?? "#000000"}
                          onChange={e => setStyle("color", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Style</label>
                      <div className={styles.toggleGroup}>
                        <button
                          className={`${styles.toggle} ${(selStyles.fontWeight === "700" || selStyles.fontWeight === "bold") ? styles.toggleOn : ""}`}
                          onClick={() => toggleStyle("fontWeight", "700", "400")}
                          title="Bold"
                        ><b>B</b></button>
                        <button
                          className={`${styles.toggle} ${selStyles.fontStyle === "italic" ? styles.toggleOn : ""}`}
                          onClick={() => toggleStyle("fontStyle", "italic", "normal")}
                          title="Italic"
                        ><i>I</i></button>
                        <button
                          className={`${styles.toggle} ${selStyles.textDecoration === "underline" ? styles.toggleOn : ""}`}
                          onClick={() => toggleStyle("textDecoration", "underline", "none")}
                          title="Underline"
                        ><u>U</u></button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Margin ────────────────────────────────── */}
                {!isImg && !isMarquee && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Margin</div>
                    <div className={styles.row4}>
                      {(["Top","Right","Bottom","Left"] as const).map(s => (
                        <div key={s} className={styles.field}>
                          <label className={styles.fieldLabel}>{s}</label>
                          <div className={styles.inputWithUnit}>
                            <input
                              className={styles.numInput}
                              type="number"
                              placeholder="0"
                              value={px(selStyles[`margin${s}` as keyof typeof selStyles])}
                              onChange={e => setStyle(`margin${s}`, e.target.value ? `${e.target.value}px` : "")}
                            />
                            <span className={styles.unit}>px</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Padding ───────────────────────────────── */}
                {!isImg && !isMarquee && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Padding</div>
                    <div className={styles.row4}>
                      {(["Top","Right","Bottom","Left"] as const).map(s => (
                        <div key={s} className={styles.field}>
                          <label className={styles.fieldLabel}>{s}</label>
                          <div className={styles.inputWithUnit}>
                            <input
                              className={styles.numInput}
                              type="number"
                              placeholder="0"
                              value={px(selStyles[`padding${s}` as keyof typeof selStyles])}
                              onChange={e => setStyle(`padding${s}`, e.target.value ? `${e.target.value}px` : "")}
                            />
                            <span className={styles.unit}>px</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Sizing ────────────────────────────────── */}
                {!isImg && !isMarquee && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Sizing</div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Max Width</label>
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="e.g. 800px"
                          value={selStyles.maxWidth ?? ""}
                          onChange={e => setStyle("maxWidth", e.target.value)}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Max Height</label>
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="e.g. 400px"
                          value={selStyles.maxHeight ?? ""}
                          onChange={e => setStyle("maxHeight", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Reset ─────────────────────────────────── */}
                <div className={styles.sec}>
                  <button className={styles.resetBtn} onClick={resetEl}>
                    Reset to Default
                  </button>
                </div>
              </div>

              {/* Sticky footer with save */}
              <div className={styles.panelFooter}>
                <button className={styles.panelSaveBtn} onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {savedMsg && (
                  <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600, textAlign: "center" }}>
                    {savedMsg}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
