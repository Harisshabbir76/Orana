"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";
import { usePageCMS, PageCMSProvider } from "../context/PageCMSContext";
import styles from "../styles/legal/Legal.module.css";
import LegalSectionContent from "../components/legal/LegalSectionContent";
import Destination from "../components/homepage/Destination";
import Instagram from "../components/homepage/Instagram";

type TabKey = "privacy" | "terms" | "returns";

function LegalContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("privacy");
  const t = useTranslation();
  const l = t.legal;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "privacy", label: l.tabPrivacy },
    { key: "terms",   label: l.tabTerms },
    { key: "returns", label: l.tabReturns },
  ];

  const sections = l.content[activeTab].sections;
  const deletedSet = new Set<number>(JSON.parse(getContent(`legal-${activeTab}-deleted-sections`, "[]") || "[]"));
  const extraCountStr = getContent(`legal-${activeTab}-extra-count`, "");
  const extraCount = extraCountStr ? parseInt(extraCountStr) : 0;

  return (
    <div>
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>{l.breadcrumbHome}</Link>
          <span className={styles.breadcrumbSep}>&gt;</span>
            <span className={styles.breadcrumbCurrent}>{l.breadcrumbLegal}</span>
        </nav>

        <div className={styles.inner}>
          <div className={styles.header}>
            <h1 className={styles.heading} {...ce("legal-heading")}>{getContent("legal-heading", l.heading)}</h1>
            <p className={styles.subtitle} {...ce("legal-subtitle")}>{getContent("legal-subtitle", l.subtitle)}</p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.tabs}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <hr className={styles.divider} />

          <div className={styles.content}>
            {sections.map((section, i) => deletedSet.has(i) ? null : (
              <div key={`${activeTab}-${i}`} className={styles.section}>
                <LegalSectionContent section={section} idPrefix={`legal-${activeTab}`} index={i} ce={ce} />
              </div>
            ))}

            {Array.from({ length: extraCount }, (_, i) => {
              const title = getContent(`legal-${activeTab}-extra-${i}-title`, "");
              const text  = getContent(`legal-${activeTab}-extra-${i}-text`, "");
              return (
                <div key={`${activeTab}-extra-${i}`} className={styles.section}>
                  {title && <h2 className={styles.sectionTitle}>{title}</h2>}
                  {text  && <p  className={styles.sectionText}>{text}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Destination/>
      <Instagram/>
    </div>
  );
}

export default function LegalPage() {
  return (
    <PageCMSProvider page="legal">
      <LegalContent />
    </PageCMSProvider>
  );
}
