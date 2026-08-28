"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "../../context/CurrencyContext";
import { useStore } from "../../context/StoreContext";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "../../styles/product-description/ProductDetail.module.css";

interface ProductImage { url: string; publicId: string; }

export interface ProductDetailData {
  _id: string;
  name: string;
  nameAr?: string;
  price: number;
  images: ProductImage[];
  inStock?: boolean;
  description?: string;
  descriptionAr?: string;
  washCare?: string;
  washCareAr?: string;
}

interface Props {
  product: ProductDetailData;
}

const THUMB_PAGE = 3;

export default function ProductDetail({ product }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState<number | null>(null);

  const { formatPrice, language } = useCurrency();
  const { addToCart, openCart } = useStore();
  const router = useRouter();
  const t = useTranslation();
  const pd = t.productDetail;
  const isAr = language === "Arabic";

  const displayName        = isAr && product.nameAr        ? product.nameAr        : product.name;
  const displayDescription = isAr && product.descriptionAr ? product.descriptionAr : product.description;
  const displayWashCare    = isAr && product.washCareAr    ? product.washCareAr    : product.washCare;

  const images = product.images ?? [];
  const mainImgUrl = images[activeImg]?.url ?? null;

  const accordions = [
    { label: pd.productDetails,    content: displayDescription || pd.productDetailsContent },
    { label: pd.washCare,          content: displayWashCare    || pd.washCareContent },
    { label: pd.shippingDetails,   content: pd.shippingContent },
    { label: pd.returnsExchanges,  content: pd.returnsContent },
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    openCart();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    router.push("/checkout");
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.shop.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&rsaquo;</span>
        <Link href="/shop" className={styles.breadcrumbLink}>{t.shop.breadcrumbShop}</Link>
      </nav>

      {/* Two-column layout */}
      <div className={styles.main}>

        {/* ── Image column ── */}
        <div className={styles.imageCol}>
          <div className={styles.mainImageWrap}>
            {mainImgUrl ? (
              <Image
                src={mainImgUrl}
                alt={product.name}
                fill
                className={styles.mainImage}
                sizes="45vw"
              />
            ) : (
              <div className={styles.imgPlaceholder} />
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbCarousel}>
              {/* Prev arrow */}
              <button
                className={styles.thumbNav}
                onClick={() => setThumbStart((s) => Math.max(0, s - THUMB_PAGE))}
                disabled={thumbStart === 0}
                aria-label="Previous images"
              >
                ‹
              </button>

              {/* 3 visible thumbnails */}
              <div className={styles.thumbTrack}>
                {images.slice(thumbStart, thumbStart + THUMB_PAGE).map((img, i) => {
                  const realIdx = thumbStart + i;
                  return (
                    <button
                      key={realIdx}
                      className={`${styles.thumbBtn} ${activeImg === realIdx ? styles.thumbBtnActive : ""}`}
                      onClick={() => setActiveImg(realIdx)}
                    >
                      <Image
                        src={img.url}
                        alt={`${product.name} view ${realIdx + 1}`}
                        fill
                        className={styles.thumbImage}
                        sizes="90px"
                      />
                    </button>
                  );
                })}
                {/* Empty slots to keep row width stable */}
                {Array.from({ length: Math.max(0, THUMB_PAGE - images.slice(thumbStart, thumbStart + THUMB_PAGE).length) }).map((_, i) => (
                  <div key={`empty-${i}`} className={styles.thumbEmpty} />
                ))}
              </div>

              {/* Next arrow */}
              <button
                className={styles.thumbNav}
                onClick={() => setThumbStart((s) => s + THUMB_PAGE)}
                disabled={thumbStart + THUMB_PAGE >= images.length}
                aria-label="Next images"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* ── Detail column ── */}
        <div className={styles.detailCol}>

          {/* Name + Price */}
          <div className={styles.titleRow}>
            <h1 className={styles.productName}>{displayName}</h1>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>

          {/* Stars */}
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={styles.star}>★</span>
            ))}
          </div>

          {/* Description */}
          {displayDescription && (
            <p className={styles.description}>{displayDescription}</p>
          )}

          <hr className={styles.divider} />

          {/* Accordions */}
          <div className={styles.accordionList}>
            {accordions.map(({ label, content }, i) => (
              <div key={i} className={styles.accordionItem}>
                <button
                  className={styles.accordionBtn}
                  onClick={() => setOpenAcc(openAcc === i ? null : i)}
                  aria-expanded={openAcc === i}
                >
                  <span className={styles.accordionLabel}>{label}</span>
                  <svg
                    className={`${styles.chevron} ${openAcc === i ? styles.chevronOpen : ""}`}
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openAcc === i && (
                  <div className={styles.accordionContent}>
                    <p>{content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className={styles.divider} />

          {/* Qty + Actions */}
          {product.inStock === false ? (
            <div className={styles.oosBlock}>
              <p className={styles.oosLabel}>Out of Stock</p>
            </div>
          ) : (
            <div className={styles.actions}>
              <div className={styles.qtyRow}>
                <div className={styles.qtyWrap}>
                  <button className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className={styles.qtyNum}>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <button className={styles.addToCart} onClick={handleAddToCart}>
                  {t.collection.addToCart}
                </button>
              </div>
              <button className={styles.buyNow} onClick={handleBuyNow}>
                {pd.buyNow}
              </button>
            </div>
          )}

        </div>
      </div>

      </div>
    </div>
  );
}
