"use client";
import styles from "../../styles/about-us/AboutMarquee.module.css";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";

export default function AboutMarquee() {
  const t = useTranslation();
  const { getContent, cmsMode, selectedId, selectElement } = usePageCMS();
  const text = getContent("about-marquee-text", t.aboutUs.marqueeText);
  const isSelected = selectedId === "about-marquee-text";

  return (
    <div
      className={styles.marquee}
      style={cmsMode ? {
        cursor: "pointer",
        outline: isSelected ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
        outlineOffset: "-2px",
      } : undefined}
      onClick={cmsMode ? (e) => { e.stopPropagation(); selectElement("about-marquee-text"); } : undefined}
      title={cmsMode ? "Click to edit marquee text" : undefined}
    >
      <div className={styles.track}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={styles.item}>{text}</span>
        ))}
      </div>
    </div>
  );
}
