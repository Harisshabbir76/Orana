"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "../../context/CurrencyContext";
import { useStore } from "../../context/StoreContext";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "../../styles/product-description/ExploreDesigns.module.css";

interface ProductImage { url: string; publicId: string; }
interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  slug?: string;
  price: number;
  images: ProductImage[];
  inStock?: boolean;
}

interface Props {
  currentId?: string;
}

export default function ExploreDesigns({ currentId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  const { formatPrice, language } = useCurrency();
  const { addToCart, addToWishlist, isInWishlist, openCart } = useStore();
  const t = useTranslation();
  const e = t.exploreDesigns;
  const isAr = language === "Arabic";

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const list = Array.isArray(data) ? data : [];
        const filtered = currentId ? list.filter((p) => p._id !== currentId) : list;
        setProducts(filtered.slice(0, 4));
      })
      .catch(() => setProducts([]));
  }, [currentId]);

  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{e.heading}</h2>
        <p className={styles.subtitle}>{e.subtitle}</p>
      </div>

      <div className={styles.grid}>
        {products.map((product) => {
          const firstImage = product.images?.[0]?.url ?? null;
          const oos = product.inStock === false;
          return (
            <div key={product._id} className={`${styles.card} ${oos ? styles.cardOos : ""}`}>
              <div className={styles.imageWrap}>
                {firstImage ? (
                  <Image
                    src={firstImage}
                    alt={product.name}
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : (
                  <div className={styles.placeholder}>No image</div>
                )}

                {oos && <span className={styles.oosBadge}>Out of Stock</span>}
                {!oos && (
                  <div className={styles.iconGroup}>
                    <button
                      className={styles.iconBtn}
                      aria-label="Add to wishlist"
                      onClick={() => addToWishlist(product)}
                      style={{ color: isInWishlist(product._id) ? "#A74419" : undefined }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isInWishlist(product._id) ? "#A74419" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <button
                      className={styles.iconBtn}
                      aria-label="Quick view"
                      onClick={() => router.push(`/shop/${product.slug || product._id}`)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                )}

                {oos ? (
                  <button className={`${styles.addToCart} ${styles.addToCartOos}`} disabled>
                    Out of Stock
                  </button>
                ) : (
                  <button
                    className={styles.addToCart}
                    onClick={() => { addToCart(product); openCart(); }}
                  >
                    {t.collection.addToCart}
                  </button>
                )}
              </div>

              <div className={styles.info}>
                <p className={styles.name}>{isAr && product.nameAr ? product.nameAr : product.name}</p>
                <p className={styles.price}>{formatPrice(product.price)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.btnWrap}>
        <Link href="/shop" className={styles.viewAll}>{e.viewAll}</Link>
      </div>
    </section>
  );
}
