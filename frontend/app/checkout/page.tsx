"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "../context/StoreContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/checkout/Checkout.module.css";
import PriceTag from "../components/PriceTag";
import { effectivePrice, type Priced } from "../lib/price";

const VAT_RATE = 0.05; // UAE VAT — 5% of subtotal + shipping

export default function CheckoutPage() {
  const { cartItems, clearCart } = useStore();
  const { currency, formatPrice } = useCurrency();
  const { user, token } = useAuth();
  const router = useRouter();
  const t = useTranslation();
  const c = t.checkout;

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
    phone:     user?.phone     ?? "",
    address: "", city: "", country: "UAE",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [loading, setLoading]           = useState(false);
  const [shipping, setShipping]         = useState<number | null>(null);
  const [latestPrices, setLatestPrices] = useState<Record<string, Priced>>({});
  const [couponInput, setCouponInput]   = useState("");
  const [coupon, setCoupon]             = useState<{ code: string; percentage: number } | null>(null);
  const [couponError, setCouponError]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Re-fill form when user loads after hard refresh
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: f.firstName || user.firstName,
        lastName:  f.lastName  || user.lastName,
        email:     f.email     || user.email,
        phone:     f.phone     || (user.phone ?? ""),
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping`)
      .then((r) => r.json())
      .then((data) => setShipping(data.price ?? 0))
      .catch(() => setShipping(0));
  }, []);

  // Cart items hold a snapshot of the product — refresh prices so discounts changed since then are reflected
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, Priced> = {};
        data.forEach((p: Priced & { _id: string }) => { map[p._id] = { price: p.price, discountedPrice: p.discountedPrice ?? null }; });
        setLatestPrices(map);
      })
      .catch(() => {});
  }, []);

  const priced = <T extends Priced & { _id: string }>(p: T): T => ({ ...p, ...latestPrices[p._id] });

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(cartItems.reduce((sum, i) => sum + effectivePrice(priced(i.product)) * i.quantity, 0));
  const discount = coupon ? round2(subtotal * coupon.percentage / 100) : 0;
  const vat = round2((subtotal - discount + (shipping ?? 0)) * VAT_RATE);
  const total = round2(subtotal - discount + (shipping ?? 0) + vat);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setCoupon(null); setCouponError(data.error || c.couponError); return; }
      setCoupon({ code: data.code, percentage: data.percentage });
      setCouponInput("");
    } catch {
      setCouponError(c.couponError);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card") return;
    if (shipping === null) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.product._id,
            name:      i.product.name,
            price:     effectivePrice(priced(i.product)),
            quantity:  i.quantity,
            image:     i.product.images?.[0]?.url ?? "",
          })),
          customer: form,
          paymentMethod,
          subtotal,
          couponCode: coupon?.code ?? null,
          shipping,
          vat,
          total,
          currency,
          userId: user?.id ?? null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Coupon expired/invalidated between applying it and placing the order — let the user fix it
        if (coupon && res.status === 400 && /coupon/i.test(data.error ?? "")) {
          setCoupon(null);
          setCouponError(data.error);
          return;
        }
        throw new Error("Failed");
      }
      const order = await res.json();
      clearCart();
      router.push(`/checkout/success?id=${order._id}`);
    } catch {
      router.push("/checkout/failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{c.emptyCart}</p>
          <Link href="/shop" className={styles.shopLink}>{c.continueShopping}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{c.pageTitle}</h1>
      <p className={styles.breadcrumb}>
        <Link href="/shop">{c.breadcrumbShop}</Link>
        <span className={styles.breadcrumbSep}>›</span>
        {c.breadcrumbCart}
        <span className={styles.breadcrumbSep}>›</span>
        {c.breadcrumbCheckout}
      </p>

      <div className={styles.layout}>
        {/* ── Left: form ── */}
        <form className={styles.form} onSubmit={handleSubmit}>

          {/* Contact */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{c.contactInfo}</h2>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{c.firstName}</label>
                <input className={styles.input} name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{c.lastName}</label>
                <input className={styles.input} name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{c.email}</label>
                <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{c.phone}</label>
                <input className={styles.input} type="tel" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{c.shippingAddress}</h2>
            <div className={styles.field}>
              <label className={styles.label}>{c.streetAddress}</label>
              <input className={styles.input} name="address" value={form.address} onChange={handleChange} required />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{c.city}</label>
                <input className={styles.input} name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{c.country}</label>
                <select className={styles.select} name="country" value={form.country} onChange={handleChange}>
                  {Object.entries(c.countries).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{c.paymentMethod}</h2>
            <div className={styles.paymentOptions}>

              {/* Cash on Delivery */}
              <label
                className={`${styles.paymentOption} ${paymentMethod === "cod" ? styles.paymentOptionActive : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <input
                  className={styles.paymentRadio}
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentLabel}>{c.cod}</span>
                  <span className={styles.paymentDesc}>{c.codDesc}</span>
                </div>
              </label>

              {/* Card — display only */}
              <label className={`${styles.paymentOption} ${styles.paymentOptionDisabled}`}>
                <input className={styles.paymentRadio} type="radio" name="paymentMethod" value="card" disabled />
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentLabel}>{c.card}</span>
                  <span className={styles.paymentDesc}>{c.cardDesc}</span>
                </div>
                <span className={styles.comingSoonBadge}>{c.comingSoon}</span>
              </label>

              {/* Card fields — always visible, always disabled */}
              <div className={styles.cardFields}>
                <p className={styles.cardFieldsLabel}>{c.cardDetails}</p>
                <div className={styles.field}>
                  <label className={styles.label}>{c.cardNumber}</label>
                  <input className={styles.input} disabled placeholder="1234  5678  9012  3456" />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{c.expiryDate}</label>
                    <input className={styles.input} disabled placeholder="MM / YY" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{c.cvv}</label>
                    <input className={styles.input} disabled placeholder="•••" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <button type="submit" className={styles.placeOrderBtn} disabled={loading}>
            {loading ? c.placingOrder : c.placeOrder}
          </button>

        </form>

        {/* ── Right: order summary ── */}
        <div>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>{c.orderSummary}</h2>
            <div className={styles.summaryItems}>
              {cartItems.map(({ product, quantity }) => (
                <div key={product._id} className={styles.summaryItem}>
                  <div className={styles.summaryImgWrap}>
                    {product.images?.[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className={styles.summaryImg}
                      />
                    )}
                    <span className={styles.summaryQtyBadge}>{quantity}</span>
                  </div>
                  <span className={styles.summaryItemName}>{product.name}</span>
                  <span className={styles.summaryItemPrice}><PriceTag product={priced(product)} quantity={quantity} /></span>
                </div>
              ))}
            </div>

            <div className={styles.summaryDivider} />
            <div className={styles.couponBox}>
              <label className={styles.label} htmlFor="coupon">{c.coupon}</label>
              {coupon ? (
                <div className={styles.couponApplied}>
                  <span>
                    <strong>{coupon.code}</strong> — {coupon.percentage}% {c.couponApplied}
                  </span>
                  <button type="button" className={styles.couponRemove} onClick={() => setCoupon(null)}>
                    {c.removeCoupon}
                  </button>
                </div>
              ) : (
                <div className={styles.couponRow}>
                  <input
                    id="coupon"
                    className={styles.input}
                    value={couponInput}
                    placeholder={c.couponPlaceholder}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                  />
                  <button
                    type="button"
                    className={styles.couponBtn}
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                  >
                    {couponLoading ? "…" : c.applyCoupon}
                  </button>
                </div>
              )}
              {couponError && <p className={styles.couponError}>{couponError}</p>}
            </div>

            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span>{c.subtotal}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {coupon && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>{c.discount} ({coupon.percentage}%)</span>
                <span>− {formatPrice(discount)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>{c.shipping}</span>
              <span>
                {shipping === null ? "..." : shipping === 0 ? c.free : formatPrice(shipping)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>{c.vat}</span>
              <span>{shipping === null ? "..." : formatPrice(vat)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>{c.total}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
