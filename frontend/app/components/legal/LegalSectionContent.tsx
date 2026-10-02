"use client";

import Link from "next/link";
import type { LegalSection } from "../../translations";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/legal/Legal.module.css";

type CE = (id: string) => React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties };

// Paragraphs in legal text are separated by a blank line
function paragraphs(text: string) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

export default function LegalSectionContent({ section, idPrefix, index, ce }: { section: LegalSection; idPrefix: string; index: number; ce: CE }) {
  const { getContent, cmsMode } = usePageCMS();
  const id = (part: string) => `${idPrefix}-section-${index}-${part}`;

  const textParas = section.text ? paragraphs(getContent(id("text"), section.text)) : [];
  const afterParas = section.textAfter ? paragraphs(getContent(id("after"), section.textAfter)) : [];
  const linkText = section.linkText ? getContent(id("link"), section.linkText) : "";

  return (
    <>
      {section.title && <h2 className={styles.sectionTitle} {...ce(id("title"))}>{getContent(id("title"), section.title)}</h2>}
      {textParas.length > 0 && (
        <div className={styles.sectionBody} {...ce(id("text"))}>
          {textParas.map((p, j) => {
            const isLast = j === textParas.length - 1;
            return (
              <p key={j} className={styles.sectionText}>
                {p}
                {isLast && section.linkHref && linkText && (
                  <>
                    {" "}
                    <Link href={cmsMode ? "#" : section.linkHref} className={styles.email}>{linkText}</Link>.
                  </>
                )}
              </p>
            );
          })}
        </div>
      )}
      {section.items && (
        <ul className={styles.sectionList}>
          {section.items.map((item, j) => <li key={j} className={styles.sectionListItem}>{item}</li>)}
        </ul>
      )}
      {afterParas.length > 0 && (
        <div className={styles.sectionBody} {...ce(id("after"))}>
          {afterParas.map((p, j) => <p key={j} className={styles.sectionText}>{p}</p>)}
        </div>
      )}
    </>
  );
}
