"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../images/logo.svg";
import { useStore } from "../context/StoreContext";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const { cartItems, wishlistItems, openCart, openWishlist } = useStore();
  const { user } = useAuth();
  const t = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <nav className={styles.navbar}>
      {/* Hamburger — mobile only */}
      <button
        className={styles.hamburger}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen(o => !o)}
      >
        {menuOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
          </svg>
        )}
      </button>

      <div className={styles.navbarLeft}>
        <Link href="/" className={styles.navbarLink}>{t.navbar.home}</Link>
        <Link href="/shop" className={styles.navbarLink}>{t.navbar.shop}</Link>
        <Link href="/our-story" className={styles.navbarLink}>{t.navbar.ourStory}</Link>
      </div>

      <div className={styles.navbarLogo}>
        <Link href="/">
          <Image src={logo} alt="Orana Logo" width={40} height={30} priority />
        </Link>
      </div>

      <div className={styles.navbarRight}>
        <Link href="/contact-us" className={`${styles.navbarLink} ${styles.desktopOnly}`}>{t.navbar.contactUs}</Link>
        <div className={styles.navbarIcons}>
          {/* Cart */}
          <button className={styles.navbarIconBtn} aria-label="Cart" onClick={openCart}>
            <span className={styles.iconWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </span>
          </button>

          {/* Wishlist */}
          <button className={styles.navbarIconBtn} aria-label="Wishlist" onClick={openWishlist}>
            <span className={styles.iconWrap}>
              <svg width="15" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </span>
          </button>

          {/* Account */}
          <Link href={user ? "/profile" : "/signup"} className={styles.navbarIconBtn} aria-label="Account">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* Left sidebar */}
      <div className={`${styles.mobileSidebar} ${menuOpen ? styles.mobileSidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Image src={logo} alt="Orana Logo" width={36} height={27} />
          <button className={styles.sidebarClose} onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>{t.navbar.home}</Link>
          <Link href="/shop" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>{t.navbar.shop}</Link>
          <Link href="/our-story" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>{t.navbar.ourStory}</Link>
          <Link href="/contact-us" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>{t.navbar.contactUs}</Link>
        </nav>
      </div>
    </nav>
  );
}
