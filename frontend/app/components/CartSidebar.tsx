"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "../context/StoreContext";
import { useCurrency } from "../context/CurrencyContext";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/CartSidebar.module.css";

export default function CartSidebar() {
  const { cartItems, cartOpen, closeCart, removeFromCart, updateQty } = useStore();
  const { formatPrice } = useCurrency();
  const t = useTranslation();
  const router = useRouter();

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <>
      {cartOpen && <div className={styles.overlay} onClick={closeCart} />}

      <div className={`${styles.sidebar} ${cartOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t.cart.title} <span className={styles.count}>({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
          </h2>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.items}>
          {cartItems.length === 0 ? (
            <p className={styles.empty}>{t.cart.empty}</p>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div key={product._id} className={styles.item}>
                <div className={styles.imageWrap}>
                  {product.images?.[0]?.url && (
                    <Image src={product.images[0].url} alt={product.name} fill className={styles.image} sizes="72px" />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{product.name}</p>
                  <p className={styles.itemPrice}>{formatPrice(product.price)}</p>
                  <div className={styles.qtyRow}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(product._id, quantity - 1)}>−</button>
                    <span className={styles.qty}>{quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQty(product._id, quantity + 1)}>+</button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFromCart(product._id)} aria-label="Remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>{t.cart.subtotal}</span>
              <span className={styles.subtotalValue}>{formatPrice(total)}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              onClick={() => { closeCart(); router.push("/checkout"); }}
            >
              {t.cart.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
