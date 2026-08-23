"use client";

import Image from "next/image";
import logo from "../../images/logo.svg";
import { useTranslation } from "../../hooks/useTranslation";
import { useCMS } from "../../context/HomepageCMSContext";
import styles from "../../styles/homepage/Designed.module.css";

export default function Designed() {
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

  return (
    <section className={styles.section}>
      <h2 className={styles.heading} {...ce("designed-heading")}>
        {getContent("designed-heading", t.designed.heading)}
      </h2>
      <div className={styles.body}>
        <p className={styles.para} {...ce("designed-para1")}>
          {getContent("designed-para1", t.designed.para1)}
        </p>
        <p className={styles.para} {...ce("designed-para2")}>
          {getContent("designed-para2", t.designed.para2)}
        </p>
      </div>
      {(() => {
        const logoUrl = getContent("designed-logo", "");
        return (
          <div
            className={styles.logo}
            style={cmsMode ? {
              cursor: "pointer",
              outline: selectedId === "designed-logo" ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
              outlineOffset: "6px",
              display: "inline-block",
            } : undefined}
            onClick={cmsMode ? (e) => { e.stopPropagation(); selectElement("designed-logo"); } : undefined}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Orana" style={{ width: 35, height: 35, objectFit: "contain", display: "block" }} />
            ) : (
              <Image src={logo} alt="Orana" width={35} height={35} priority />
            )}
          </div>
        );
      })()}
    </section>
  );
}
