"use client";

import { useEffect, useState } from "react";
import panelStyles from "../../../styles/admin/AdminPanel.module.css";
import styles from "../../../styles/admin/Shipping.module.css";
import { adminFetch } from "../../../lib/adminFetch";

export default function ShippingPage() {
  const [price, setPrice]   = useState("");
  const [saved, setSaved]   = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping`)
      .then((r) => r.json())
      .then((data) => { setPrice(String(data.price ?? 0)); setSaved(data.price ?? 0); })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(price) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: data.error || "Failed to save" }); return; }
      setSaved(data.price);
      setMsg({ type: "ok", text: "Shipping price updated successfully." });
    } catch {
      setMsg({ type: "err", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={panelStyles.page}>
      <div className={panelStyles.header}>
        <h1 className={panelStyles.title}>Shipping</h1>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Shipping Price</h2>
        <p className={styles.cardDesc}>
          This charge is added to every order at checkout. Set to <strong>0</strong> for free shipping.
          The price is stored in AED and converted automatically when customers browse in USD.
        </p>

        {msg && (
          <p className={`${styles.msg} ${msg.type === "ok" ? styles.msgOk : styles.msgErr}`}>
            {msg.text}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label className={styles.label}>Price (AED)</label>
            <div className={styles.inputRow}>
              <span className={styles.prefix}>Dhs.</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={styles.input}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {saved !== null && (
          <div className={styles.currentWrap}>
            <span className={styles.currentLabel}>Currently active:</span>
            <span className={styles.currentValue}>
              {saved === 0 ? "Free shipping" : `Dhs. ${saved}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
