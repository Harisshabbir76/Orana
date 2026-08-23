"use client";

import Image from "next/image";
import Link from "next/link";
import inspiredImg from "../../images/homepage/inspired.webp";
import { useTranslation } from "../../hooks/useTranslation";
import { useCMS } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/Inspired.module.css";

export default function Inspired() {
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

  const imgUrl = getContent("inspired-image", "");

  return (
    <section className={styles.section}>
      <h2 className={styles.heading} {...ce("inspired-heading")}>
        {getContent("inspired-heading", t.inspired.heading)}
      </h2>
      <div className={styles.imageWrap} style={{ position: "relative" }}>
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt="Inspired" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <Image src={inspiredImg} alt={t.inspired.heading} fill className={styles.image} sizes="200px" />
        )}
        {cmsMode && (
          <div
            style={{
              position: "absolute", inset: 0, cursor: "pointer",
              outline: selectedId === "inspired-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
              outlineOffset: "-4px",
            }}
            onClick={() => selectElement("inspired-image")}
            title="Click to change image"
          />
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.para} {...ce("inspired-para1")}>{getContent("inspired-para1", t.inspired.para1)}</p>
        <p className={styles.para} {...ce("inspired-para2")}>{getContent("inspired-para2", t.inspired.para2)}</p>
        <p className={styles.para} {...ce("inspired-para3")}>{getContent("inspired-para3", t.inspired.para3)}</p>
      </div>
      {cmsMode ? (
        <span className={styles.btn} {...ce("inspired-btn", { display: "inline-block" })}>
          {getContent("inspired-btn", t.inspired.btn)}
        </span>
      ) : (
        <Link href="/our-story" className={styles.btn} style={getStyle("inspired-btn")}>
          {getContent("inspired-btn", t.inspired.btn)}
        </Link>
      )}
    </section>
  );
}
