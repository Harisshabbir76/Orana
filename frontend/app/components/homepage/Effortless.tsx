"use client";

import Image from "next/image";
import effortlessBg from "../../images/homepage/effortless.webp";
import { useTranslation } from "../../hooks/useTranslation";
import { useCMS } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/Effortless.module.css";

export default function Effortless() {
  const t = useTranslation();
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = useCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: {
        ...base,
        cursor: "pointer",
        outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
        outlineOffset: "3px",
      },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const bgUrl = getContent("effortless-image", "");

  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        {bgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgUrl} alt="Effortless" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Image src={effortlessBg} alt="Effortless by design" fill className={styles.bannerImage} sizes="100vw" priority />
        )}
        {cmsMode && (
          <div
            style={{
              position: "absolute", inset: 0, cursor: "pointer", zIndex: 1,
              outline: selectedId === "effortless-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
              outlineOffset: "-4px",
            }}
            onClick={() => selectElement("effortless-image")}
            title="Click to change background image"
          />
        )}
        <div className={styles.bannerOverlay} />
        <h2
          className={styles.heading}
          style={{
            position: "relative", zIndex: 2,
            ...getStyle("effortless-heading"),
            ...(cmsMode ? {
              cursor: "pointer",
              outline: selectedId === "effortless-heading" ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
              outlineOffset: "3px",
            } : {}),
          }}
          onClick={cmsMode ? (e: React.MouseEvent) => { e.stopPropagation(); selectElement("effortless-heading"); } : undefined}
        >
          {getContent("effortless-heading", t.effortless.heading)}
        </h2>
      </div>
      <div className={styles.cardsRow}>
        {t.effortless.cards.map((card, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.badge}>{i + 1}</div>
            <h3 className={styles.cardTitle} {...ce(`effortless-card-${i}-title`)}>
              {getContent(`effortless-card-${i}-title`, card.title)}
            </h3>
            <p className={styles.cardText} {...ce(`effortless-card-${i}-text`)}>
              {getContent(`effortless-card-${i}-text`, card.text)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
