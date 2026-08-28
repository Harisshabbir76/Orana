"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "../images/logo.svg";
import instaIcon from "../images/insta.webp";
import whatsappIcon from "../images/whatsapp.webp";
import { useCurrency } from "../context/CurrencyContext";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  const { currency, language, setCurrency, setLanguage } = useCurrency();
  const t = useTranslation();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <footer className={styles.footer}>
      {/* Upper */}
      <div className={styles.upper}>
        <div className={styles.logoBadge}>
          <Image src={logo} alt="Orana logo" width={50} height={50} className={styles.logoImg} />
        </div>

        <nav className={styles.nav}>
          <Link href="/shop" className={styles.navLink}>{t.footer.shop}</Link>
          <Link href="/our-story" className={styles.navLink}>{t.footer.aboutUs}</Link>
          <Link href="/faq" className={styles.navLink}>{t.footer.faq}</Link>
          <Link href="/legal" className={styles.navLink}>{t.footer.legal}</Link>
        </nav>

        <div className={styles.divider} />

        <div className={styles.contactRow}>
          
          <a
            href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            aria-label="Instagram"
          >
            <Image src={instaIcon} alt="Instagram" width={22} height={22} />
          </a>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            aria-label="WhatsApp"
          >
            <Image src={whatsappIcon} alt="WhatsApp" width={22} height={22} />
          </a>
        </div>
      </div>

      {/* Lower bar */}
      <div className={styles.lower}>
        <span className={styles.copyright}>{t.footer.copyright}</span>

        <div className={styles.selectors}>
          {/* Currency dropdown — options always in English */}
          <div className={styles.dropdownWrap}>
            <button className={styles.selector} onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}>
              {t.selectors.currencies[currency]}
              <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l4 4 4-4"/>
              </svg>
            </button>
            {currencyOpen && (
              <div className={styles.dropdown}>
                {(["AED", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    className={`${styles.dropdownItem} ${currency === c ? styles.active : ""}`}
                    onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language dropdown — each option in its own native language */}
          <div className={styles.dropdownWrap}>
            <button className={styles.selector} onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}>
              {t.selectors.languages[language]}
              <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l4 4 4-4"/>
              </svg>
            </button>
            {langOpen && (
              <div className={styles.dropdown}>
                {(["English", "Arabic"] as const).map((l) => (
                  <button
                    key={l}
                    className={`${styles.dropdownItem} ${language === l ? styles.active : ""}`}
                    onClick={() => { setLanguage(l); setLangOpen(false); }}
                  >
                    {l === "English" ? "English" : "العربية"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
