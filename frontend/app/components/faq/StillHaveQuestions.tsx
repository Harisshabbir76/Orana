"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/faq/StillHaveQuestions.module.css";
import dressImg from "../../images/faq/dress.webp";

export default function StillHaveQuestions() {
  const t = useTranslation();
  const s = t.stillHaveQuestions;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const stillImgUrl = getContent("still-image", "");

  return (
    <section className={styles.section} dir="ltr">
      <div className={styles.inner}>
        <h2 className={styles.heading} style={cmsMode ? { pointerEvents: "auto" } : undefined}>
          <span className={styles.headingWhite} {...ce("still-heading1")}>{getContent("still-heading1", s.headingLine1)} </span>
          <span className={styles.headingOrange} {...ce("still-heading2")}>{getContent("still-heading2", s.headingLine2)}</span>
        </h2>
        <div className={styles.imageCol} style={{ position: "relative" }}>
          {stillImgUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={stillImgUrl} alt="Still have questions" className={styles.image} />
            : <Image src={dressImg} alt="Still have questions" width={420} height={270} className={styles.image} />}
          {cmsMode && (
            <div
              style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 3, outline: selectedId === "still-image" ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "-2px" }}
              onClick={(e) => { e.stopPropagation(); selectElement("still-image"); }}
              title="Click to change image"
            />
          )}
        </div>
        <div className={styles.textCol}>
          <p className={styles.text} {...ce("still-text")}>{getContent("still-text", s.text)}</p>
          <Link href="/contact-us" className={styles.btn} {...(cmsMode ? { onClick: (e: React.MouseEvent) => { e.preventDefault(); selectElement("still-btn"); }, style: { ...(selectedId === "still-btn" ? { outline: "2px solid #DB663B" } : { outline: "1px dashed rgba(219,102,59,0.4)" }), outlineOffset: "3px" } } : {})}>
            {getContent("still-btn", s.btn)}
          </Link>
        </div>
      </div>
    </section>
  );
}
