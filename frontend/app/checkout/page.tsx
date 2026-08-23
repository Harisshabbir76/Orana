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
  const [loading, setLoading]   = useState(false);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping`)
      .then((r) => r.json())
      .then((data) => setShipping(data.price ?? 0))
      .catch(() => {});
  }, []);

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card") return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.product._id,
            name:      i.product.name,
            price:     i.product.price,
            quantity:  i.quantity,
            image:     i.product.images?.[0]?.url ?? "",
          })),
          customer: form,
          paymentMethod,
          subtotal,
          shipping,
          total,
          currency,
          userId: user?.id ?? null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
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
                  <span className={styles.summaryItemPrice}>{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span>{c.subtotal}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{c.shipping}</span>
              <span>{shipping === 0 ? c.free : formatPrice(shipping)}</span>
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
