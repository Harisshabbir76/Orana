"use client";

import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "../../styles/checkout/CheckoutResult.module.css";

export default function CheckoutFailed() {
  const t = useTranslation();
  const f = t.checkout.failed;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.iconWrap} ${styles.iconFailed}`}>!</div>
        <h1 className={styles.title}>{f.title}</h1>
        <p className={styles.subtitle}>{f.subtitle}</p>
        <div className={styles.actions}>
          <Link href="/checkout" className={styles.btnPrimary}>{f.tryAgain}</Link>
          <Link href="/shop" className={styles.btnSecondary}>{f.continueShopping}</Link>
        </div>
      </div>
    </div>
  );
}
