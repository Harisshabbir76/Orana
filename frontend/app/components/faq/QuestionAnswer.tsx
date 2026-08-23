"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/faq/QuestionAnswer.module.css";

interface Props {
  onAdd?: () => void;
  onDeleteItem?: (i: number) => void;
}

export default function QuestionAnswer({ onAdd, onDeleteItem }: Props = {}) {
  const [open, setOpen] = useState<number | null>(null);
  const t = useTranslation();
  const f = t.faq;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  const cmsCountStr = getContent("faq-count", "");
  const itemCount = cmsCountStr ? parseInt(cmsCountStr) : f.items.length;

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{f.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{f.breadcrumbFaq}</span>
      </nav>

      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.heading} {...ce("faq-heading")}>{getContent("faq-heading", f.heading)}</h1>
          <p className={styles.subtitle} {...ce("faq-subtitle")}>{getContent("faq-subtitle", f.subtitle)}</p>
        </div>

        <div className={styles.list}>
          {Array.from({ length: itemCount }, (_, i) => {
            const qId = `faq-q-${i}`;
            const aId = `faq-a-${i}`;
            const q = getContent(qId, f.items[i]?.q ?? "");
            const a = getContent(aId, f.items[i]?.a ?? "");
            return (
              <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ""}`} style={{ position: "relative" }}>
                <button
                  className={styles.question}
                  onClick={() => { setOpen(open === i ? null : i); if (cmsMode) selectElement(qId); }}
                  aria-expanded={open === i}
                  style={cmsMode ? { cursor: "pointer", outline: selectedId === qId ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "2px", paddingRight: onDeleteItem ? "36px" : undefined } : undefined}
                >
                  <span className={styles.questionText}>{q}</span>
                  <span className={styles.icon}>{open === i ? "−" : "+"}</span>
                </button>
                {cmsMode && onDeleteItem && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteItem(i); }}
                    title="Delete this FAQ item"
                    style={{ position: "absolute", top: "50%", right: 6, transform: "translateY(-50%)", background: "#fff0ee", border: "1px solid #cc3300", borderRadius: 3, color: "#cc3300", fontWeight: 700, fontSize: 11, padding: "2px 6px", cursor: "pointer", lineHeight: 1, zIndex: 5 }}
                  >✕</button>
                )}
                {open === i && (
                  <div
                    className={styles.answer}
                    style={cmsMode ? { cursor: "pointer", outline: selectedId === aId ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "2px" } : undefined}
                    onClick={cmsMode ? (e) => { e.stopPropagation(); selectElement(aId); } : undefined}
                  >
                    <p>{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {cmsMode && onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "14px 0", padding: "10px 16px", border: "1.5px dashed #DB663B", background: "transparent", color: "#DB663B", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", width: "100%", textTransform: "uppercase" }}
          >
            + Add New Question
          </button>
        )}
      </div>
    </div>
  );
}
