"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/shop/GotQuestions.module.css";

export default function GotQuestions() {
  const [open, setOpen] = useState<number | null>(null);
  const t = useTranslation();
  const s = t.shop;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); selectElement(id); },
    };
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading} {...ce("shop-faq-heading")}>{getContent("shop-faq-heading", s.faqHeading)}</h2>
        <p className={styles.subtitle} {...ce("shop-faq-subtitle")}>{getContent("shop-faq-subtitle", s.faqSubtitle)}</p>

        <div className={styles.list}>
          {s.faqs.map((faq, i) => {
            const qId = `shop-faq-q-${i}`;
            const aId = `shop-faq-a-${i}`;
            const q = getContent(qId, faq.q);
            const a = getContent(aId, faq.a);
            return (
              <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ""}`}>
                <button
                  className={styles.question}
                  onClick={() => { setOpen(open === i ? null : i); if (cmsMode) selectElement(qId); }}
                  aria-expanded={open === i}
                  style={cmsMode ? { cursor: "pointer", outline: selectedId === qId ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "2px" } : undefined}
                >
                  <span>{q}</span>
                  <span className={`${styles.icon} ${open === i ? styles.iconOpen : ""}`}>+</span>
                </button>
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

        <Link href="/faq" className={styles.viewAll} {...ce("shop-faq-viewall")}>{getContent("shop-faq-viewall", s.faqViewAll)}</Link>
      </div>
    </section>
  );
}
