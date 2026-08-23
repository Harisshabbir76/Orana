"use client";

import Image from "next/image";
import Link from "next/link";
import heroBg from "../../images/homepage/herosection.webp";
import { useTranslation } from "../../hooks/useTranslation";
import { useCMS } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/HeroSection.module.css";

export default function HeroSection() {
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

  const heroBgUrl = getContent("hero-image", "");

  return (
    <section className={styles.hero} suppressHydrationWarning>
      {heroBgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroBgUrl} alt="Hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Image className={styles.heroImage} src={heroBg} alt={t.hero.heading} fill priority sizes="100vw" />
      )}

      {cmsMode && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 1, cursor: "pointer",
            outline: selectedId === "hero-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
            outlineOffset: "-4px",
          }}
          title="Click to change background image"
          onClick={() => selectElement("hero-image")}
        />
      )}

      <div className={styles.overlay} />
      <div className={styles.content} style={{ position: "relative", zIndex: 2 }}>
        <h1 className={styles.heading} {...ce("hero-heading")}>
          {getContent("hero-heading", t.hero.heading)}
        </h1>
        <p className={styles.subtitle} {...ce("hero-subtitle")}>
          {getContent("hero-subtitle", t.hero.subtitle)}
        </p>
        {cmsMode ? (
          <span className={styles.btn} {...ce("hero-btn", { display: "inline-block" })}>
            {getContent("hero-btn", t.hero.btn)}
          </span>
        ) : (
          <Link href="/shop" className={styles.btn} style={getStyle("hero-btn")}>
            {getContent("hero-btn", t.hero.btn)}
          </Link>
        )}
      </div>
    </section>
  );
}
