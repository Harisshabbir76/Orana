"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../../styles/admin/AdminSidebar.module.css";

const mainLinks = [
  { href: "/orana/admin-panel",                  label: "Products" },
  { href: "/orana/admin-panel/orders",            label: "Orders" },
  { href: "/orana/admin-panel/messages",          label: "Messages" },
  { href: "/orana/admin-panel/add-product",       label: "Add Product" },
  { href: "/orana/admin-panel/email-marketing",   label: "Email Marketing" },
  { href: "/orana/admin-panel/shipping",          label: "Shipping" },
];

const cmsLinks = [
  { href: "/orana/admin-panel/homepage",    label: "Homepage" },
  { href: "/orana/admin-panel/our-story",   label: "Our Story" },
  { href: "/orana/admin-panel/shop-cms",    label: "Shop" },
  { href: "/orana/admin-panel/contact-cms", label: "Contact" },
  { href: "/orana/admin-panel/faq-cms",     label: "FAQ" },
  { href: "/orana/admin-panel/legal-cms",   label: "Legal" },
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isCmsActive = cmsLinks.some(l => pathname === l.href);
  const [pagesOpen, setPagesOpen] = useState(isCmsActive);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function handleLinkClick() {
    onClose?.();
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.brand}>
        ORANA
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          ✕
        </button>
      </div>

      <nav className={styles.nav}>
        {mainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
            onClick={handleLinkClick}
          >
            {link.label}
          </Link>
        ))}

        {/* Pages dropdown */}
        <button
          className={`${styles.dropdownTrigger} ${isCmsActive ? styles.active : ""} ${pagesOpen ? styles.dropdownTriggerOpen : ""}`}
          onClick={() => setPagesOpen(v => !v)}
        >
          Pages
          <svg
            className={`${styles.chevron} ${pagesOpen ? styles.chevronOpen : ""}`}
            width="10" height="10" viewBox="0 0 10 10" fill="none"
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {pagesOpen && (
          <div className={styles.dropdownMenu}>
            {cmsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.dropdownLink} ${pathname === link.href ? styles.dropdownLinkActive : ""}`}
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        Sign Out
      </button>
    </aside>
  );
}
