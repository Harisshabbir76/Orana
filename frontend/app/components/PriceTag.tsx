"use client";

import { useCurrency } from "../context/CurrencyContext";
import { hasDiscount, effectivePrice, type Priced } from "../lib/price";
import styles from "../styles/PriceTag.module.css";

// Renders the price, with the original struck through when a discounted price is set
export default function PriceTag({ product, quantity = 1 }: { product: Priced; quantity?: number }) {
  const { formatPrice } = useCurrency();

  if (!hasDiscount(product)) return <>{formatPrice(product.price * quantity)}</>;

  return (
    <>
      <s className={styles.original}>{formatPrice(product.price * quantity)}</s>
      <span className={styles.discounted}>{formatPrice(effectivePrice(product) * quantity)}</span>
    </>
  );
}
