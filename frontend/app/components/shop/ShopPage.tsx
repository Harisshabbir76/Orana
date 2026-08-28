"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "../../context/CurrencyContext";
import { useStore } from "../../context/StoreContext";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/shop/ShopPage.module.css";

interface ProductImage { url: string; publicId: string; }
interface Product { _id: string; name: string; nameAr?: string; slug?: string; price: number; images: ProductImage[]; inStock?: boolean; }

type SortMode = "az" | "za" | "low-high" | "high-low" | null;
type ViewMode = "grid2" | "grid3" | "list";
type Avail = "all" | "in-stock" | "out-of-stock";

interface Props {
  initialProducts?: Product[];
}

function getInitialPriceMax(products: Product[]) {
  if (products.length === 0) return 1000;
  return Math.max(...products.map((p) => p.price));
}

export default function ShopPage({ initialProducts = [] }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [view, setView] = useState<ViewMode>("grid3");
  const [sortMode, setSortMode] = useState<SortMode>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(() => getInitialPriceMax(initialProducts));
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(() => getInitialPriceMax(initialProducts));
  const [availability, setAvailability] = useState<Avail>("all");

  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { formatPrice, language } = useCurrency();
  const { addToCart, addToWishlist, isInWishlist, openCart } = useStore();
  const t = useTranslation();
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();
  const isAr = language === "Arabic";

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  /* Close dropdowns on outside click */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Apply filter + sort */
  const displayed = [...products]
    .filter((p) => {
      const priceOk = p.price >= minVal && p.price <= maxVal;
      const stockOk =
        availability === "all" ||
        (availability === "in-stock"     && p.inStock !== false) ||
        (availability === "out-of-stock" && p.inStock === false);
      return priceOk && stockOk;
    })
    .sort((a, b) => {
      if (sortMode === "az") return a.name.localeCompare(b.name);
      if (sortMode === "za") return b.name.localeCompare(a.name);
      if (sortMode === "low-high") return a.price - b.price;
      if (sortMode === "high-low") return b.price - a.price;
      return 0;
    });

  const sortLabels: { key: SortMode; label: string }[] = [
    { key: "az",       label: t.shop.sortAZ },
    { key: "za",       label: t.shop.sortZA },
    { key: "low-high", label: t.shop.sortLowHigh },
    { key: "high-low", label: t.shop.sortHighLow },
  ];

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t.shop.breadcrumbHome}</Link>
        <span className={styles.breadcrumbSep}>&rsaquo;</span>
        <span className={styles.breadcrumbCurrent}>{t.shop.breadcrumbShop}</span>
      </nav>

      {/* Page header */}
      <div className={styles.header}>
        <h1 className={styles.heading} {...ce("shop-heading")}>{getContent("shop-heading", t.shop.heading)}</h1>
        <p className={styles.subtitle} {...ce("shop-subtitle")}>{getContent("shop-subtitle", t.shop.subtitle)}</p>
      </div>

      {/* Controls bar */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>

          {/* Sort */}
          <div className={styles.controlWrap} ref={sortRef}>
            <button
              className={`${styles.controlBtn} ${sortOpen ? styles.controlBtnActive : ""}`}
              aria-label="Sort"
              onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="16" y2="12"/>
                <line x1="3" y1="18" x2="11" y2="18"/>
                <polyline points="19 9 22 6 19 3" fill="none" strokeLinejoin="round"/>
              </svg>
            </button>

            {sortOpen && (
              <div className={styles.dropdown}>
                {sortLabels.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`${styles.sortOption} ${sortMode === key ? styles.sortOptionActive : ""}`}
                    onClick={() => { setSortMode(key); setSortOpen(false); }}
                  >
                    <span className={styles.sortDot}>{sortMode === key ? "●" : "○"}</span>
                    {label}
                  </button>
                ))}
                {sortMode && (
                  <button className={styles.clearBtn} onClick={() => { setSortMode(null); setSortOpen(false); }}>
                    {t.shop.clearSort}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter */}
          <div className={styles.controlWrap} ref={filterRef}>
            <button
              className={`${styles.controlBtn} ${filterOpen ? styles.controlBtnActive : ""}`}
              aria-label="Filter"
              onClick={() => { setFilterOpen((o) => !o); setSortOpen(false); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M3 4h18l-7 8v7l-4 2V12L3 4z"/>
              </svg>
            </button>

            {filterOpen && (
              <div className={styles.filterPanel}>

                {/* ── Availability ── */}
                <p className={styles.filterSectionLabel}>{t.shop.filterAvailability}</p>
                <div className={styles.availOptions}>
                  {(["in-stock", "out-of-stock"] as const).map((key) => (
                    <button
                      key={key}
                      className={`${styles.availOption} ${availability === key ? styles.availOptionActive : ""}`}
                      onClick={() => setAvailability(availability === key ? "all" : key)}
                    >
                      {key === "in-stock" ? t.shop.filterInStock : t.shop.filterOutOfStock}
                    </button>
                  ))}
                </div>

                <hr className={styles.filterDivider} />

                {/* ── Price ── */}
                <div className={styles.priceHeader}>
                  <p className={styles.filterSectionLabel}>{t.shop.filterPrice}</p>
                </div>

                <div className={styles.sliderWrap}>
                  {/* filled track */}
                  <div className={styles.sliderTrack}>
                    <div
                      className={styles.sliderFill}
                      style={{
                        left: `${(minVal / priceMax) * 100}%`,
                        right: `${100 - (maxVal / priceMax) * 100}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range" min={0} max={priceMax} value={minVal}
                    onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - 1))}
                    className={styles.rangeInput}
                  />
                  <input
                    type="range" min={0} max={priceMax} value={maxVal}
                    onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + 1))}
                    className={styles.rangeInput}
                  />
                </div>

                <p className={styles.priceDisplay}>
                  Price: Dhs. {minVal.toFixed(2)} AED — Dhs. {maxVal.toFixed(2)} AED
                </p>

                {(minVal > 0 || maxVal < priceMax) && (
                  <button className={styles.clearBtn} onClick={() => { setMinVal(0); setMaxVal(priceMax); }}>
                    {t.shop.filterReset}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === "grid2" ? styles.viewBtnActive : ""}`} onClick={() => setView("grid2")} aria-label="2-column grid">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="7" rx="1"/>
              <rect x="9" y="0" width="7" height="7" rx="1"/>
              <rect x="0" y="9" width="7" height="7" rx="1"/>
              <rect x="9" y="9" width="7" height="7" rx="1"/>
            </svg>
          </button>
          <button className={`${styles.viewBtn} ${view === "grid3" ? styles.viewBtnActive : ""}`} onClick={() => setView("grid3")} aria-label="3-column grid">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="4" height="4" rx="0.5"/><rect x="6" y="0" width="4" height="4" rx="0.5"/><rect x="12" y="0" width="4" height="4" rx="0.5"/>
              <rect x="0" y="6" width="4" height="4" rx="0.5"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><rect x="12" y="6" width="4" height="4" rx="0.5"/>
              <rect x="0" y="12" width="4" height="4" rx="0.5"/><rect x="6" y="12" width="4" height="4" rx="0.5"/><rect x="12" y="12" width="4" height="4" rx="0.5"/>
            </svg>
          </button>
          <button className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`} onClick={() => setView("list")} aria-label="List view">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="0" y1="4" x2="16" y2="4"/>
              <line x1="0" y1="8" x2="16" y2="8"/>
              <line x1="0" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Product grid */}
      {displayed.length === 0 ? (
        <p className={styles.empty}>{t.shop.noProducts}</p>
      ) : (
        <div className={`${styles.grid} ${styles[view]}`}>
          {displayed.map((product) => {
            const firstImage = product.images?.[0]?.url ?? null;
            const oos = product.inStock === false;
            return (
              <div key={product._id} className={`${styles.card} ${oos ? styles.cardOos : ""}`}>
                <div className={styles.imageWrap}>
                  {firstImage ? (
                    <Image src={firstImage} alt={product.name} fill className={styles.productImage} sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className={styles.placeholder}>No image</div>
                  )}
                  {oos && <span className={styles.oosBadge}>Out of Stock</span>}
                  {!oos && (
                    <div className={styles.iconGroup}>
                      <button className={styles.iconBtn} aria-label="Add to wishlist" onClick={() => addToWishlist(product)} style={{ color: isInWishlist(product._id) ? "#A74419" : undefined }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isInWishlist(product._id) ? "#A74419" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                      <button className={styles.iconBtn} aria-label="Quick view" onClick={() => router.push(`/shop/${product.slug || product._id}`)}>
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
                    <button className={styles.addToCart} onClick={() => { addToCart(product); openCart(); }}>
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
      )}
    </div>
  );
}
