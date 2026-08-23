"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { AdminPageCMSProvider } from "../../context/PageCMSContext";
import type { ElementData } from "../../context/PageCMSContext";
import translations from "../../translations";
import styles from "../../styles/admin/HomepageCMS.module.css";
import { adminFetch } from "../../lib/adminFetch";

export type ImageIdSet = Set<string>;

export interface ElementLabel {
  [id: string]: string;
}

interface Props {
  page: string;
  elementLabels: ElementLabel;
  imageIds: ImageIdSet;
  defaults: Record<string, string>;
  arDefaults: Record<string, string>;
  children: (
    elements: Record<string, ElementData>,
    selectedId: string | null,
    setSelectedId: (id: string | null) => void,
    setElements: React.Dispatch<React.SetStateAction<Record<string, ElementData>>>,
  ) => ReactNode;
  // Special group elements: when selectedId matches a key, show a list of sub-inputs instead of single textarea
  groups?: Record<string, { label: string; subIds: string[]; subLabel: (i: number) => string }>;
}

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Sans-serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];

export default function PageCMSEditor({ page, elementLabels, imageIds, defaults, arDefaults, children, groups = {} }: Props) {
  const [elements, setElements] = useState<Record<string, ElementData>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cms/${page}`)
      .then(r => r.ok ? r.json() : {})
      .then(d => setElements(d || {}))
      .catch(() => {});
  }, [page]);

  const isImg = selectedId ? imageIds.has(selectedId) : false;
  const isGroup = selectedId ? !!groups[selectedId] : false;
  const activeDefaults = langTab === "ar" ? arDefaults : defaults;

  function contentKey(id: string) {
    return langTab === "ar" && !imageIds.has(id) ? `ar:${id}` : id;
  }

  const selContentId = selectedId && !isGroup ? contentKey(selectedId) : null;
  const selContent = selContentId ? (elements[selContentId] ?? {}) : null;
  const selStyles = selectedId && !isGroup ? (elements[selectedId]?.styles ?? {}) : {};

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

  function px(val: string | undefined) {
    return val?.replace("px", "") ?? "";
  }

  function resetEl() {
    if (!selectedId) return;
    if (isGroup) {
      const grp = groups[selectedId];
      setElements(p => {
        const n = { ...p };
        grp.subIds.forEach(id => { delete n[id]; delete n[`ar:${id}`]; });
        return n;
      });
    } else if (langTab === "ar") {
      const key = `ar:${selectedId}`;
      setElements(p => { const n = { ...p }; delete n[key]; return n; });
    } else {
      setElements(p => { const n = { ...p }; delete n[selectedId!]; delete n[`ar:${selectedId!}`]; return n; });
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cms/${page}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements }),
      });
      if (res.ok) { setSavedMsg("Saved!"); setTimeout(() => setSavedMsg(""), 2500); }
    } catch { setSavedMsg("Save failed"); }
    finally { setSaving(false); }
  }

  async function uploadImg(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cms/${page}/image`, { method: "POST", body: fd });
      if (res.ok) { const { url } = await res.json(); setContent(url); }
    } finally { setUploading(false); }
  }

  const panelOpen = !!selectedId;

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        {/* Preview */}
        <div className={styles.preview} style={{ marginRight: panelOpen ? 380 : 0 }}>
          <AdminPageCMSProvider elements={elements} selectedId={selectedId} onSelect={setSelectedId}>
            {children(elements, selectedId, setSelectedId, setElements)}
          </AdminPageCMSProvider>
        </div>

        {/* Properties panel */}
        <div className={`${styles.panel} ${panelOpen ? styles.panelOpen : ""}`}>
          {selectedId && (
            <>
              <div className={styles.panelHeader}>
                <div style={{ flex: 1 }}>
                  <div className={styles.panelLabel}>{elementLabels[selectedId] ?? selectedId}</div>
                  <div className={styles.panelId}>{selectedId}</div>
                  {!isImg && !isGroup && (
                    <div className={styles.langTabs}>
                      <button className={`${styles.langTab} ${langTab === "en" ? styles.langTabActive : ""}`} onClick={() => setLangTab("en")}>EN</button>
                      <button className={`${styles.langTab} ${langTab === "ar" ? styles.langTabActive : ""}`} onClick={() => setLangTab("ar")}>AR</button>
                    </div>
                  )}
                </div>
                <button className={styles.closeBtn} onClick={() => setSelectedId(null)}>✕</button>
              </div>

              <div className={styles.panelBody}>

                {/* ── Group (e.g. FAQ items) ─────────────────── */}
                {isGroup && (() => {
                  const grp = groups[selectedId!];
                  return (
                    <div className={styles.sec}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div className={styles.secTitle} style={{ marginBottom: 0 }}>{elementLabels[selectedId!] ?? selectedId}</div>
                        <div className={styles.langTabs} style={{ marginTop: 0 }}>
                          <button className={`${styles.langTab} ${langTab === "en" ? styles.langTabActive : ""}`} onClick={() => setLangTab("en")}>EN</button>
                          <button className={`${styles.langTab} ${langTab === "ar" ? styles.langTabActive : ""}`} onClick={() => setLangTab("ar")}>AR</button>
                        </div>
                      </div>
                      {grp.subIds.map((subId, i) => {
                        const key = langTab === "ar" ? `ar:${subId}` : subId;
                        const def = (langTab === "ar" ? arDefaults : defaults)[subId] ?? "";
                        const saved = elements[key]?.content;
                        const isAnswer = grp.subLabel(i).toLowerCase().includes("answer") || grp.subLabel(i).toLowerCase().includes("a:");
                        return (
                          <div key={subId} className={styles.field} style={{ marginBottom: 12 }}>
                            <label className={styles.fieldLabel}>{grp.subLabel(i)}</label>
                            {isAnswer ? (
                              <textarea
                                className={styles.textarea}
                                rows={3}
                                dir={langTab === "ar" ? "rtl" : "ltr"}
                                value={saved ?? def}
                                onChange={e => setElements(p => ({ ...p, [key]: { ...p[key], content: e.target.value } }))}
                                placeholder={def}
                              />
                            ) : (
                              <input
                                className={styles.input}
                                type="text"
                                dir={langTab === "ar" ? "rtl" : "ltr"}
                                value={saved ?? def}
                                onChange={e => setElements(p => ({ ...p, [key]: { ...p[key], content: e.target.value } }))}
                                placeholder={def}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* ── Image ─────────────────────────────────── */}
                {!isGroup && isImg && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Image</div>
                    {selContent?.content && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selContent.content} alt="preview" className={styles.imgPreview} />
                    )}
                    <input className={styles.input} type="url" placeholder="Paste image URL…" value={selContent?.content ?? ""} onChange={e => setContent(e.target.value)} />
                    <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? "Uploading…" : "Upload Image"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImg(f); e.target.value = ""; }} />
                  </div>
                )}

                {/* ── Text content ──────────────────────────── */}
                {!isGroup && !isImg && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Content</div>
                    <textarea
                      className={styles.textarea}
                      rows={4}
                      dir={langTab === "ar" ? "rtl" : "ltr"}
                      placeholder="Enter text…"
                      value={selContent?.content ?? activeDefaults[selectedId ?? ""] ?? ""}
                      onChange={e => setContent(e.target.value)}
                    />
                  </div>
                )}

                {/* ── Typography ────────────────────────────── */}
                {!isImg && !isGroup && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Typography</div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Font Size</label>
                        <div className={styles.inputWithUnit}>
                          <input className={styles.numInput} type="number" min={6} max={300} placeholder="–" value={px(selStyles.fontSize)} onChange={e => setStyle("fontSize", e.target.value ? `${e.target.value}px` : "")} />
                          <span className={styles.unit}>px</span>
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Line Height</label>
                        <input className={styles.numInput} type="number" min={0.5} max={6} step={0.1} placeholder="–" value={selStyles.lineHeight ?? ""} onChange={e => setStyle("lineHeight", e.target.value)} />
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
                          {[100,200,300,400,500,600,700,800,900].map(w => <option key={w} value={String(w)}>{w}</option>)}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Color</label>
                        <input type="color" className={styles.colorPicker} value={selStyles.color ?? "#000000"} onChange={e => setStyle("color", e.target.value)} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Style</label>
                      <div className={styles.toggleGroup}>
                        <button className={`${styles.toggle} ${(selStyles.fontWeight === "700" || selStyles.fontWeight === "bold") ? styles.toggleOn : ""}`} onClick={() => toggleStyle("fontWeight", "700", "400")} title="Bold"><b>B</b></button>
                        <button className={`${styles.toggle} ${selStyles.fontStyle === "italic" ? styles.toggleOn : ""}`} onClick={() => toggleStyle("fontStyle", "italic", "normal")} title="Italic"><i>I</i></button>
                        <button className={`${styles.toggle} ${selStyles.textDecoration === "underline" ? styles.toggleOn : ""}`} onClick={() => toggleStyle("textDecoration", "underline", "none")} title="Underline"><u>U</u></button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Margin ────────────────────────────────── */}
                {!isImg && !isGroup && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Margin</div>
                    <div className={styles.row4}>
                      {(["Top","Right","Bottom","Left"] as const).map(s => (
                        <div key={s} className={styles.field}>
                          <label className={styles.fieldLabel}>{s}</label>
                          <div className={styles.inputWithUnit}>
                            <input className={styles.numInput} type="number" placeholder="0" value={px(selStyles[`margin${s}` as keyof typeof selStyles])} onChange={e => setStyle(`margin${s}`, e.target.value ? `${e.target.value}px` : "")} />
                            <span className={styles.unit}>px</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Padding ───────────────────────────────── */}
                {!isImg && !isGroup && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Padding</div>
                    <div className={styles.row4}>
                      {(["Top","Right","Bottom","Left"] as const).map(s => (
                        <div key={s} className={styles.field}>
                          <label className={styles.fieldLabel}>{s}</label>
                          <div className={styles.inputWithUnit}>
                            <input className={styles.numInput} type="number" placeholder="0" value={px(selStyles[`padding${s}` as keyof typeof selStyles])} onChange={e => setStyle(`padding${s}`, e.target.value ? `${e.target.value}px` : "")} />
                            <span className={styles.unit}>px</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Sizing ────────────────────────────────── */}
                {!isImg && !isGroup && (
                  <div className={styles.sec}>
                    <div className={styles.secTitle}>Sizing</div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Max Width</label>
                        <input className={styles.input} type="text" placeholder="e.g. 800px" value={selStyles.maxWidth ?? ""} onChange={e => setStyle("maxWidth", e.target.value)} />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Max Height</label>
                        <input className={styles.input} type="text" placeholder="e.g. 400px" value={selStyles.maxHeight ?? ""} onChange={e => setStyle("maxHeight", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Reset ─────────────────────────────────── */}
                <div className={styles.sec}>
                  <button className={styles.resetBtn} onClick={resetEl}>Reset to Default</button>
                </div>
              </div>

              <div className={styles.panelFooter}>
                <button className={styles.panelSaveBtn} onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {savedMsg && <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600, textAlign: "center" }}>{savedMsg}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
