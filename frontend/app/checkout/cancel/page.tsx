"use client";

import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "../../styles/checkout/CheckoutResult.module.css";

export default function CheckoutCancel() {
  const t = useTranslation();
  const c = t.checkout.cancel;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.iconWrap} ${styles.iconCancel}`}>✕</div>
        <h1 className={styles.title}>{c.title}</h1>
        <p className={styles.subtitle}>{c.subtitle}</p>
        <div className={styles.actions}>
          <Link href="/checkout" className={styles.btnPrimary}>{c.returnToCheckout}</Link>
          <Link href="/shop" className={styles.btnSecondary}>{c.continueShopping}</Link>
        </div>
      </div>
    </div>
  );
}
