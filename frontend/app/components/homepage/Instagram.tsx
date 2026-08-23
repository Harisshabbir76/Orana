"use client";

import Image from "next/image";
import ig1 from "../../images/homepage/ig1.webp";
import ig2 from "../../images/homepage/ig2.webp";
import ig3 from "../../images/homepage/ig3.webp";
import ig4 from "../../images/homepage/ig4.webp";
import ig5 from "../../images/homepage/ig5.webp";
import ig6 from "../../images/homepage/ig6.webp";
import ig7 from "../../images/homepage/ig7.webp";
import ig8 from "../../images/homepage/ig8.webp";
import { useTranslation } from "../../hooks/useTranslation";
import { useCMS, HomepageCMSProvider } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/Instagram.module.css";

const igDefaults = [ig1, ig2, ig3, ig4, ig5, ig6, ig7, ig8];

export function InstagramInner() {
  const t = useTranslation();
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = useCMS();

  function ce(id: string): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base = getStyle(id);
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

  return (
    <section className={styles.section}>
      <div className={styles.topLine} />
      <h2 className={styles.heading}>
        <span {...ce("instagram-line1")}>
          {getContent("instagram-line1", t.instagram.line1)}
        </span>
        <br />
        <span {...ce("instagram-line2")}>
          {getContent("instagram-line2", t.instagram.line2)}
        </span>
      </h2>
      <div className={styles.grid}>
        {igDefaults.map((defaultSrc, i) => {
          const imgId = `instagram-img-${i + 1}`;
          const customUrl = getContent(imgId, "");
          return (
            <div key={i} className={styles.imageWrap} style={{ position: "relative" }}>
              {customUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customUrl} alt={`Orana Instagram post ${i + 1}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Image src={defaultSrc} alt={`Orana Instagram post ${i + 1}`} fill className={styles.image} sizes="160px" />
              )}
              {cmsMode && (
                <div
                  style={{
                    position: "absolute", inset: 0, zIndex: 2, cursor: "pointer",
                    outline: selectedId === imgId ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
                    outlineOffset: "-3px",
                  }}
                  onClick={(e) => { e.stopPropagation(); selectElement(imgId); }}
                  title={`Click to change image ${i + 1}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Instagram() {
  return (
    <HomepageCMSProvider>
      <InstagramInner />
    </HomepageCMSProvider>
  );
}
