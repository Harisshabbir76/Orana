"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "../../components/admin/AdminSidebar";
import styles from "../../styles/admin/AdminLayout.module.css";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === "/orana/admin-panel";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isRoot) {
    return (
      <div className={styles.wrapper}>
        {/* Mobile top bar — hidden on desktop via CSS */}
        <div className={styles.mobileBar}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <span className={styles.mobileBrand}>ORANA</span>
        </div>

        {/* Overlay behind sidebar on mobile */}
        {sidebarOpen && (
          <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        )}

        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.main}>{children}</main>
      </div>
    );
  }

  return (
    <div className={styles.subPage}>
      <Link href="/orana/admin-panel" className={styles.backBtn}>
        ← Admin Panel
      </Link>
      {children}
    </div>
  );
}
