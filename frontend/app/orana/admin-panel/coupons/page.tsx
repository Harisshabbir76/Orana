"use client";

import { useEffect, useState } from "react";
import panelStyles from "../../../styles/admin/AdminPanel.module.css";
import styles from "../../../styles/admin/Coupons.module.css";
import ConfirmModal from "../../../components/admin/ConfirmModal";
import { adminFetch } from "../../../lib/adminFetch";

interface Coupon {
  _id: string;
  code: string;
  percentage: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/coupons`;
const emptyForm = { code: "", percentage: "", startsAt: "", expiresAt: "", active: true };

// ISO date → value for <input type="datetime-local"> in the admin's local time
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function couponStatus(c: Coupon): { label: string; cls: string } {
  const now = Date.now();
  if (!c.active) return { label: "Disabled", cls: styles.statusOff };
  if (now < new Date(c.startsAt).getTime()) return { label: "Scheduled", cls: styles.statusScheduled };
  if (now > new Date(c.expiresAt).getTime()) return { label: "Expired", cls: styles.statusOff };
  return { label: "Active", cls: styles.statusActive };
}

export default function CouponsPage() {
  const [coupons, setCoupons]     = useState<Coupon[]>([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [toDelete, setToDelete]   = useState<Coupon | null>(null);

  useEffect(() => {
    adminFetch(API)
      .then((r) => r.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => setMsg({ type: "err", text: "Failed to load coupons." }))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(c: Coupon) {
    setEditingId(c._id);
    setForm({
      code: c.code,
      percentage: String(c.percentage),
      startsAt: toLocalInput(c.startsAt),
      expiresAt: toLocalInput(c.expiresAt),
      active: c.active,
    });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (new Date(form.expiresAt) <= new Date(form.startsAt)) {
      setMsg({ type: "err", text: "End time must be after start time." });
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          percentage: Number(form.percentage),
          startsAt: new Date(form.startsAt).toISOString(),
          expiresAt: new Date(form.expiresAt).toISOString(),
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: data.error || "Failed to save coupon" }); return; }
      setCoupons((prev) => editingId ? prev.map((c) => (c._id === data._id ? data : c)) : [data, ...prev]);
      setMsg({ type: "ok", text: editingId ? "Coupon updated." : `Coupon ${data.code} created.` });
      resetForm();
    } catch {
      setMsg({ type: "err", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    const c = toDelete;
    setToDelete(null);
    const res = await adminFetch(`${API}/${c._id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((x) => x._id !== c._id));
      if (editingId === c._id) resetForm();
    } else {
      setMsg({ type: "err", text: "Failed to delete coupon." });
    }
  }

  return (
    <div className={panelStyles.page}>
      <div className={panelStyles.header}>
        <h1 className={panelStyles.title}>Coupons</h1>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{editingId ? "Edit Coupon" : "Create Coupon"}</h2>
        <p className={styles.cardDesc}>
          Customers enter the code at checkout to get the discount percentage off their order subtotal.
          The coupon only works between its start and expiry time.
        </p>

        {msg && (
          <p className={`${styles.msg} ${msg.type === "ok" ? styles.msgOk : styles.msgErr}`}>{msg.text}</p>
        )}

        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="code">Coupon Code</label>
              <input
                id="code"
                className={`${styles.input} ${styles.codeInput}`}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                placeholder="e.g. EID20"
                pattern="[A-Za-z0-9_\-]+"
                title="Letters, numbers, - and _ only"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="percentage">Discount Percentage</label>
              <div className={styles.inputRow}>
                <input
                  id="percentage"
                  className={styles.inputBare}
                  type="number"
                  min="1"
                  max="100"
                  step="0.01"
                  value={form.percentage}
                  onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                  placeholder="20"
                  required
                />
                <span className={styles.suffix}>%</span>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="startsAt">Start Date &amp; Time</label>
              <input
                id="startsAt"
                className={styles.input}
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="expiresAt">Expiry Date &amp; Time</label>
              <input
                id="expiresAt"
                className={styles.input}
                type="datetime-local"
                value={form.expiresAt}
                min={form.startsAt || undefined}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                required
              />
            </div>
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Enabled
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update Coupon" : "Create Coupon"}
            </button>
            {editingId && (
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className={`${panelStyles.tableWrap} ${styles.tableWrap}`}>
        {loading ? (
          <p className={panelStyles.empty}>Loading…</p>
        ) : coupons.length === 0 ? (
          <p className={panelStyles.empty}>No coupons yet.</p>
        ) : (
          <table className={panelStyles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Starts</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const st = couponStatus(c);
                return (
                  <tr key={c._id}>
                    <td className={styles.codeCell}>{c.code}</td>
                    <td>{c.percentage}%</td>
                    <td>{fmtDate(c.startsAt)}</td>
                    <td>{fmtDate(c.expiresAt)}</td>
                    <td><span className={`${styles.status} ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div className={panelStyles.actionsCell}>
                        <button className={panelStyles.editBtn} onClick={() => startEdit(c)}>Edit</button>
                        <button className={panelStyles.deleteRowBtn} onClick={() => setToDelete(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Delete Coupon"
          message={`Delete coupon ${toDelete.code}? Customers will no longer be able to use it.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
