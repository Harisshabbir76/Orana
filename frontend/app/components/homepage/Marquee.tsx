"use client";

import { useTranslation } from "../../hooks/useTranslation";
import { useCMS } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/Marquee.module.css";

function MarqueeSet({ phrases }: { phrases: string[] }) {
  return (
    <>
      {phrases.map((phrase, i) => (
        <span key={i} className={styles.item}>
          {phrase}
          <span className={styles.dot}>&nbsp;•</span>
        </span>
      ))}
    </>
  );
}

export default function Marquee() {
  const t = useTranslation();
  const { getContent, cmsMode, selectedId, selectElement } = useCMS();

  const phrases = t.marquee.phrases.map((p, i) => getContent(`marquee-phrase-${i}`, p));
  const isSelected = selectedId === "marquee";

  return (
    <div
      className={styles.wrapper}
      style={cmsMode ? {
        cursor: "pointer",
        outline: isSelected ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
        outlineOffset: "-2px",
      } : undefined}
      onClick={cmsMode ? (e) => { e.stopPropagation(); selectElement("marquee"); } : undefined}
      title={cmsMode ? "Click to edit marquee phrases" : undefined}
    >
      <div className={styles.track}>
        <MarqueeSet phrases={phrases} />
        <MarqueeSet phrases={phrases} />
        <MarqueeSet phrases={phrases} />
        <MarqueeSet phrases={phrases} />
      </div>
    </div>
  );
}
