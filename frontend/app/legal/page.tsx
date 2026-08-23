"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";
import { usePageCMS, PageCMSProvider } from "../context/PageCMSContext";
import styles from "../styles/legal/Legal.module.css";
import Destination from "../components/homepage/Destination";
import Instagram from "../components/homepage/Instagram";

type TabKey = "privacy" | "terms" | "shipping" | "returns";

interface Section {
  title?: string;
  text?: string;
  items?: string[];
  email?: string;
}

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
    { key: "privacy",  label: l.tabPrivacy },
    { key: "terms",    label: l.tabTerms },
    { key: "shipping", label: l.tabShipping },
    { key: "returns",  label: l.tabReturns },
  ];

  const sections = l.content[activeTab].sections as Section[];

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
            {(() => {
              const deletedRaw = getContent(`legal-${activeTab}-deleted-sections`, "[]");
              const deletedSet = new Set<number>(JSON.parse(deletedRaw || "[]"));

              const translationRows = sections.map((section, i) => {
                if (deletedSet.has(i)) return null;
                const titleId = `legal-${activeTab}-section-${i}-title`;
                const textId  = `legal-${activeTab}-section-${i}-text`;
                return (
                  <div key={i} className={styles.section}>
                    {section.title && <h2 className={styles.sectionTitle} {...ce(titleId)}>{getContent(titleId, section.title)}</h2>}
                    {section.text  && <p  className={styles.sectionText}  {...ce(textId)}>{getContent(textId, section.text)}</p>}
                    {section.items && <ul className={styles.sectionList}>{section.items.map((item, j) => <li key={j} className={styles.sectionListItem}>{item}</li>)}</ul>}
                    {section.email && (() => {
                      const emailId = `legal-${activeTab}-section-${i}-email`;
                      const emailVal = getContent(emailId, section.email);
                      return <a href={`mailto:${emailVal}`} className={styles.email}>{emailVal}</a>;
                    })()}
                  </div>
                );
              });

              const extraCountStr = getContent(`legal-${activeTab}-extra-count`, "");
              const extraCount = extraCountStr ? parseInt(extraCountStr) : 0;
              const extraRows = Array.from({ length: extraCount }, (_, i) => {
                const titleId = `legal-${activeTab}-extra-${i}-title`;
                const textId  = `legal-${activeTab}-extra-${i}-text`;
                const title = getContent(titleId, "");
                const text  = getContent(textId, "");
                return (
                  <div key={`extra-${i}`} className={styles.section}>
                    {title && <h2 className={styles.sectionTitle}>{title}</h2>}
                    {text  && <p  className={styles.sectionText}>{text}</p>}
                  </div>
                );
              });

              return [...translationRows, ...extraRows];
            })()}
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
