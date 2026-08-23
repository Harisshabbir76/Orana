"use client";
import Image from "next/image";
import heroBg from "../../images/abouts-us/herosection.webp";
import styles from "../../styles/about-us/HeroSection.module.css";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";

export default function AboutHero() {
  const t = useTranslation();
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const bgUrl = getContent("about-hero-image", "");

  return (
    <section className={styles.hero}>
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgUrl} alt="About Orana" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Image src={heroBg} alt="About Orana" fill className={styles.bg} sizes="100vw" priority />
      )}
      {cmsMode && (
        <div
          style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 1, outline: selectedId === "about-hero-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "-4px" }}
          onClick={() => selectElement("about-hero-image")}
          title="Click to change hero image"
        />
      )}
      <h1 className={styles.heading} {...ce("about-hero-heading", { position: "relative", zIndex: 2 })}>
        {getContent("about-hero-heading", t.aboutUs.heroHeading)}
      </h1>
    </section>
  );
}
