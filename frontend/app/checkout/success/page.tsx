"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "../../styles/checkout/CheckoutResult.module.css";

const AED_TO_USD = 1 / 3.6725;

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  currency: string;
}

function fmtPrice(aed: number, currency: string): string {
  if (currency === "USD") return `$ ${(aed * AED_TO_USD).toFixed(2)}`;
  return `Dhs. ${aed}`;
}

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const t = useTranslation();
  const s = t.checkout.success;

  const countryLabels: Record<string, string> = t.checkout.countries;

  useEffect(() => {
    if (!orderId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data))
      .catch(() => {});
  }, [orderId]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>✓</div>
        <h1 className={styles.title}>{s.title}</h1>
        <p className={styles.subtitle}>
          {s.thankYou}{order ? `, ${order.customer.firstName}` : ""}{s.orderPlaced}
          {order?.paymentMethod === "cod" ? s.codNote : ""}
        </p>

        {orderId && (
          <p className={styles.orderIdRow}>
            {s.orderId} <span className={styles.orderId}>{orderId}</span>
          </p>
        )}

        {order && (
          <>
            {/* ── Items ── */}
            <div className={styles.divider} />
            <div className={styles.orderItems}>
              <p className={styles.orderItemsTitle}>{s.itemsOrdered}</p>
              {order.items.map((item, i) => (
                <div key={i} className={styles.orderItem}>
                  <span>
                    {item.name}
                    <span className={styles.orderItemQty}> × {item.quantity}</span>
                  </span>
                  <span>{fmtPrice(item.price * item.quantity, order.currency)}</span>
                </div>
              ))}
              <div className={styles.orderSummaryRows}>
                <div className={styles.orderSummaryRow}>
                  <span>{s.subtotal}</span>
                  <span>{fmtPrice(order.subtotal, order.currency)}</span>
                </div>
                <div className={styles.orderSummaryRow}>
                  <span>{s.shipping}</span>
                  <span>{order.shipping === 0 ? s.free : fmtPrice(order.shipping, order.currency)}</span>
                </div>
              </div>
              <div className={styles.orderTotal}>
                <span>{s.total}</span>
                <span>{fmtPrice(order.total, order.currency)}</span>
              </div>
            </div>

            {/* ── Customer & Delivery info ── */}
            <div className={styles.divider} />
            <div className={styles.infoGrid}>
              <div className={styles.infoBlock}>
                <p className={styles.infoBlockTitle}>{s.contact}</p>
                <p className={styles.infoLine}>{order.customer.firstName} {order.customer.lastName}</p>
                <p className={styles.infoLine}>{order.customer.email}</p>
                <p className={styles.infoLine}>{order.customer.phone}</p>
              </div>
              <div className={styles.infoBlock}>
                <p className={styles.infoBlockTitle}>{s.deliveryAddress}</p>
                <p className={styles.infoLine}>{order.customer.address}</p>
                <p className={styles.infoLine}>{order.customer.city}</p>
                <p className={styles.infoLine}>{countryLabels[order.customer.country] ?? order.customer.country}</p>
              </div>
              <div className={styles.infoBlock}>
                <p className={styles.infoBlockTitle}>{s.payment}</p>
                <p className={styles.infoLine}>
                  {order.paymentMethod === "cod" ? s.cashOnDelivery : s.cardPayment}
                </p>
              </div>
            </div>
          </>
        )}

        <div className={styles.actions}>
          <Link href="/shop" className={styles.btnPrimary}>{s.continueShopping}</Link>
          <Link href="/" className={styles.btnSecondary}>{s.backToHome}</Link>
        </div>
      </div>
    </div>
  );
}
