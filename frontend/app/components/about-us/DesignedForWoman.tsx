"use client";
import Image from "next/image";
import designedWoman from "../../images/abouts-us/designed-woman.webp";
import styles from "../../styles/about-us/DesignedForWoman.module.css";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";

export default function DesignedForWoman() {
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

  const imgUrl = getContent("about-designed-image", "");

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.imageCol} style={{ position: "relative" }}>
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt="Designed for the modern woman" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Image src={designedWoman} alt="Designed for the modern woman" fill className={styles.image} sizes="45vw" />
          )}
          {cmsMode && (
            <div
              style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 1, outline: selectedId === "about-designed-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "-4px" }}
              onClick={() => selectElement("about-designed-image")}
              title="Click to change image"
            />
          )}
        </div>
        <div className={styles.textCol}>
          <h2 className={styles.heading} {...ce("about-designed-heading")}>{getContent("about-designed-heading", a.designedHeading)}</h2>
          <p className={styles.bold} {...ce("about-designed-bold")}>{getContent("about-designed-bold", a.designedBold)}</p>
          <p className={styles.para} {...ce("about-designed-para1")}>{getContent("about-designed-para1", a.designedPara1)}</p>
          <p className={styles.para} {...ce("about-designed-para2")}>{getContent("about-designed-para2", a.designedPara2)}</p>
          <p className={styles.para} {...ce("about-designed-para3")}>{getContent("about-designed-para3", a.designedPara3)}</p>
          <p className={styles.para} {...ce("about-designed-para4")}>{getContent("about-designed-para4", a.designedPara4)}</p>
        </div>
      </div>
    </section>
  );
}
