import Link from "next/link";
import styles from "./styles/NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.brand}>ORANA</div>

        <div className={styles.codeWrap}>
          <span className={styles.code}>404</span>
        </div>

        <h1 className={styles.heading}>Page Not Found</h1>
        <p className={styles.message}>
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            Go to Home
          </Link>
          <Link href="/shop" className={styles.secondaryBtn}>
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
