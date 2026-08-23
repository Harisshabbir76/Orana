"use client";

import Image from "next/image";
import Link from "next/link";
import destinationImg from "../../images/homepage/destination.webp";
import { useTranslation } from "../../hooks/useTranslation";
import { useCMS, HomepageCMSProvider } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/Destination.module.css";

export function DestinationInner() {
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

  const bgUrl = getContent("destination-image", "");

  return (
    <section className={styles.section}>
      <div className={styles.banner} style={{ position: "relative" }}>
        {bgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgUrl} alt="Destination" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Image src={destinationImg} alt={t.destination.heading} fill className={styles.bannerImage} sizes="100vw" />
        )}
        {cmsMode && (
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 1, cursor: "pointer",
              outline: selectedId === "destination-image" ? "3px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
              outlineOffset: "-4px",
            }}
            onClick={() => selectElement("destination-image")}
            title="Click to change background image"
          />
        )}
        <div className={styles.bannerLeft} style={{ zIndex: 2 }}>
          <h2 className={styles.bannerHeading} {...ce("destination-heading")}>
            {getContent("destination-heading", t.destination.heading)}
          </h2>
          <p className={styles.bannerText} {...ce("destination-text")}>
            {getContent("destination-text", t.destination.text)}
          </p>
          {cmsMode ? (
            <span className={styles.bannerBtn} {...ce("destination-btn", { display: "inline-block" })}>
              {getContent("destination-btn", t.destination.btn)}
            </span>
          ) : (
            <Link href="/shop" className={styles.bannerBtn} style={getStyle("destination-btn")}>
              {getContent("destination-btn", t.destination.btn)}
            </Link>
          )}
        </div>
      </div>
      <div className={styles.discover}>
        <h3 className={styles.discoverHeading} {...ce("destination-discover-heading")}>
          {getContent("destination-discover-heading", t.destination.discoverHeading)}
        </h3>
        <p className={styles.discoverText} {...ce("destination-discover-text")}>
          {getContent("destination-discover-text", t.destination.discoverText)}
        </p>
        {cmsMode ? (
          <span className={styles.discoverBtn} {...ce("destination-discover-btn", { display: "inline-block" })}>
            {getContent("destination-discover-btn", t.destination.discoverBtn)}
          </span>
        ) : (
          <Link href="/shop" className={styles.discoverBtn} style={getStyle("destination-discover-btn")}>
            {getContent("destination-discover-btn", t.destination.discoverBtn)}
          </Link>
        )}
        <div className={styles.divider} />
      </div>
    </section>
  );
}

export default function Destination() {
  return (
    <HomepageCMSProvider>
      <DestinationInner />
    </HomepageCMSProvider>
  );
}
