"use client";
import Image from "next/image";
import bornImg from "../../images/abouts-us/born.webp";
import collageImg from "../../images/abouts-us/Collage.webp";
import styles from "../../styles/about-us/Born.module.css";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";

export default function Born() {
  const t = useTranslation();
  const a = t.aboutUs;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const bornUrl = getContent("about-born-image", "");
  const collageUrl = getContent("about-collage-image", "");

  return (
    <section className={styles.section}>
      {/*
        imageWrap is the click target for the born image.
        textContent fills it with position:absolute;inset:0 but each
        text element calls stopPropagation, so clicks on empty image
        area bubble up to imageWrap and trigger selectElement.
      */}
      <div
        className={styles.imageWrap}
        onClick={cmsMode ? () => selectElement("about-born-image") : undefined}
        style={cmsMode ? {
          cursor: "pointer",
          outline: selectedId === "about-born-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
          outlineOffset: "-4px",
        } : undefined}
        title={cmsMode ? "Click to change background image" : undefined}
      >
        {bornUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bornUrl} alt="Born from a life in motion" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Image src={bornImg} alt="Born from a life in motion" fill className={styles.image} sizes="43vw" />
        )}
        <div className={styles.textContent}>
          <h2 className={styles.heading} {...ce("about-born-heading")}>{getContent("about-born-heading", a.bornHeading)}</h2>
          <p className={styles.para} {...ce("about-born-para1")}>{getContent("about-born-para1", a.bornPara1)}</p>
          <p className={styles.para} {...ce("about-born-para2")}>{getContent("about-born-para2", a.bornPara2)}</p>
          <p className={styles.para} {...ce("about-born-para3")}>{getContent("about-born-para3", a.bornPara3)}</p>
          <p className={styles.para} {...ce("about-born-para4")}>{getContent("about-born-para4", a.bornPara4)}</p>
        </div>
      </div>

      <div className={styles.craftedSection}>
        <h2 className={styles.craftedHeading} {...ce("about-crafted-heading")}>{getContent("about-crafted-heading", a.craftedHeading)}</h2>
        <div
          className={styles.collageWrap}
          onClick={cmsMode ? () => selectElement("about-collage-image") : undefined}
          style={cmsMode ? {
            cursor: "pointer",
            outline: selectedId === "about-collage-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
            outlineOffset: "-4px",
          } : undefined}
          title={cmsMode ? "Click to change collage image" : undefined}
        >
          {collageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={collageUrl} alt="Orana collage" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <Image src={collageImg} alt="Orana collage" fill className={styles.collageImg} sizes="560px" />
          )}
        </div>
        <div className={styles.craftedText}>
          <p className={styles.craftedPara} {...ce("about-crafted-para1")}>{getContent("about-crafted-para1", a.craftedPara1)}</p>
          <p className={styles.craftedPara} {...ce("about-crafted-para2")}>{getContent("about-crafted-para2", a.craftedPara2)}</p>
          <p className={styles.craftedParaBold} {...ce("about-crafted-para-bold")}>{getContent("about-crafted-para-bold", a.craftedParaBold)}</p>
        </div>
      </div>
    </section>
  );
}
