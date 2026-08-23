"use client";

import Image from "next/image";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/contact-us/HeroSection.module.css";
import heroBg from "../../images/contact-us/herosection.webp";
import noteBg from "../../images/contact-us/Note BG.webp";

export default function ContactHeroSection() {
  const t = useTranslation();
  const c = t.contactUs;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const bgUrl = getContent("contact-hero-image", "");
  const noteUrl = getContent("contact-note-image", "");

  return (
    <section className={styles.hero}>
      <div className={styles.heroBgWrap}>
        {bgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgUrl} alt="Contact Us" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Image src={heroBg} alt="Contact Us" fill priority sizes="100vw" className={styles.heroImage} />
        )}
        {cmsMode && (
          <div
            style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 1, outline: selectedId === "contact-hero-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "-4px" }}
            onClick={() => selectElement("contact-hero-image")}
            title="Click to change hero image"
          />
        )}
      </div>

      <div className={styles.content}>
        <h1 className={styles.heading} {...ce("contact-hero-heading")}>{getContent("contact-hero-heading", c.heroHeading)}</h1>
        <p className={styles.subtitle} {...ce("contact-hero-subtitle")}>{getContent("contact-hero-subtitle", c.heroSubtitle)}</p>
      </div>

      <div
        className={styles.noteCard}
        style={{
          backgroundImage: `url('${noteUrl || noteBg.src}')`,
          ...(cmsMode ? {
            cursor: "pointer",
            outline: selectedId === "contact-note-image" ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
            outlineOffset: "-4px",
          } : {}),
        }}
        onClick={cmsMode ? (e) => { e.stopPropagation(); selectElement("contact-note-image"); } : undefined}
        title={cmsMode ? "Click to change note background image" : undefined}
      />
    </section>
  );
}
