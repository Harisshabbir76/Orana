"use client";

import Image from "next/image";
import { useStore } from "../context/StoreContext";
import { useCurrency } from "../context/CurrencyContext";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/WishlistSidebar.module.css";

export default function WishlistSidebar() {
  const { wishlistItems, wishlistOpen, closeWishlist, removeFromWishlist, addToCart, openCart } = useStore();
  const { formatPrice } = useCurrency();
  const t = useTranslation();

  return (
    <>
      {wishlistOpen && <div className={styles.overlay} onClick={closeWishlist} />}

      <div className={`${styles.sidebar} ${wishlistOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t.wishlist.title} <span className={styles.count}>({wishlistItems.length})</span>
          </h2>
          <button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.items}>
          {wishlistItems.length === 0 ? (
            <p className={styles.empty}>{t.wishlist.empty}</p>
          ) : (
            wishlistItems.map((product) => (
              <div key={product._id} className={styles.item}>
                <div className={styles.imageWrap}>
                  {product.images?.[0]?.url && (
                    <Image src={product.images[0].url} alt={product.name} fill className={styles.image} sizes="72px" />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{product.name}</p>
                  <p className={styles.itemPrice}>{formatPrice(product.price)}</p>
                  <button
                    className={styles.addBtn}
                    onClick={() => { addToCart(product); openCart(); closeWishlist(); }}
                  >
                    {t.wishlist.addToCart}
                  </button>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFromWishlist(product._id)} aria-label="Remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
