"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/profile/Profile.module.css";

type Tab = "info" | "orders";

const AED_TO_USD = 1 / 3.6725;
function fmtPrice(aed: number, currency: string): string {
  if (currency === "USD") return `$ ${(aed * AED_TO_USD).toFixed(2)}`;
  return `Dhs. ${aed}`;
}

interface OrderItem { name: string; quantity: number; price: number; image?: string; productId?: string; }
interface Order {
  _id: string;
  items: OrderItem[];
  customer: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string; country: string; };
  subtotal: number; shipping: number; total: number;
  paymentMethod: string; status: string; createdAt: string;
  currency: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   styles.statusPending,
  confirmed: styles.statusConfirmed,
  cancelled: styles.statusCancelled,
  completed: styles.statusCompleted,
};

export default function ProfilePage() {
  const { user, token, login, logout } = useAuth();
  const { addToCart, openCart } = useStore();
  const router = useRouter();
  const t = useTranslation();
  const p = t.profile;
  const te = t.te;

  const [tab, setTab] = useState<Tab>("info");

  // Info state
  const [info, setInfo] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password state
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) { router.push("/signup"); return; }
    setInfo({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone ?? "" });
  }, [user, token, router]);

  // Load orders when tab switches to orders
  useEffect(() => {
    if (tab !== "orders" || !token) return;
    setOrdersLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) { logout(); router.push("/signup"); return null; }
        return r.json();
      })
      .then((d) => d && setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [tab, token, logout, router]);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoSaving(true);
    setInfoMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(info),
      });
      if (res.status === 401) { logout(); router.push("/signup"); return; }
      const data = await res.json();
      if (!res.ok) { setInfoMsg({ type: "err", text: te(data.error) || p.saveFailed }); return; }
      login(token!, { id: data.id, firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone });
      setInfoMsg({ type: "ok", text: p.savedOk });
    } catch {
      setInfoMsg({ type: "err", text: p.genericError });
    } finally {
      setInfoSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { setPwdMsg({ type: "err", text: p.passwordMismatch }); return; }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      if (res.status === 401) { logout(); router.push("/signup"); return; }
      const data = await res.json();
      if (!res.ok) { setPwdMsg({ type: "err", text: te(data.error) || p.passwordFailed }); return; }
      setPwd({ current: "", next: "", confirm: "" });
      setPwdMsg({ type: "ok", text: p.passwordUpdated });
    } catch {
      setPwdMsg({ type: "err", text: p.genericError });
    } finally {
      setPwdSaving(false);
    }
  }

  async function logoutAll() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      logout();
      router.push("/signup");
    }
  }

  function orderAgain(order: Order) {
    order.items.forEach((item) => {
      addToCart({
        _id: item.productId || item.name,
        name: item.name,
        price: item.price,
        images: item.image ? [{ url: item.image, publicId: "" }] : [],
      });
    });
    openCart();
  }

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className={styles.page}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>{initials}</div>
        <p className={styles.sidebarName}>{user.firstName} {user.lastName}</p>
        <p className={styles.sidebarEmail}>{user.email}</p>

        <div className={styles.sidebarDivider} />

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.sidebarLink} ${tab === "info" ? styles.sidebarLinkActive : ""}`}
            onClick={() => setTab("info")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {p.accountInfo}
          </button>
          <button
            className={`${styles.sidebarLink} ${tab === "orders" ? styles.sidebarLinkActive : ""}`}
            onClick={() => setTab("orders")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {p.myOrders}
          </button>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>

        {/* ── INFO TAB ── */}
        {tab === "info" && (
          <div className={styles.content}>
            <h1 className={styles.contentTitle}>{p.accountInfo}</h1>

            {/* Personal info */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{p.personalInfo}</h2>
              {infoMsg && (
                <p className={`${styles.msg} ${infoMsg.type === "ok" ? styles.msgOk : styles.msgErr}`}>
                  {infoMsg.text}
                </p>
              )}
              <form className={styles.form} onSubmit={saveInfo}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{p.firstName}</label>
                    <input className={styles.input} value={info.firstName}
                      onChange={(e) => setInfo({ ...info, firstName: e.target.value })} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{p.lastName}</label>
                    <input className={styles.input} value={info.lastName}
                      onChange={(e) => setInfo({ ...info, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{p.email}</label>
                    <input className={styles.input} type="email" value={info.email}
                      onChange={(e) => setInfo({ ...info, email: e.target.value })} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{p.phone}</label>
                    <input className={styles.input} type="tel" value={info.phone}
                      onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
                  </div>
                </div>
                <button className={styles.btnPrimary} type="submit" disabled={infoSaving}>
                  {infoSaving ? p.saving : p.saveChanges}
                </button>
              </form>
            </section>

            {/* Change password */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{p.changePassword}</h2>
              {pwdMsg && (
                <p className={`${styles.msg} ${pwdMsg.type === "ok" ? styles.msgOk : styles.msgErr}`}>
                  {pwdMsg.text}
                </p>
              )}
              <form className={styles.form} onSubmit={savePassword}>
                <div className={styles.field}>
                  <label className={styles.label}>{p.currentPassword}</label>
                  <input className={styles.input} type="password" value={pwd.current}
                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })} required />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{p.newPassword}</label>
                    <input className={styles.input} type="password" value={pwd.next}
                      onChange={(e) => setPwd({ ...pwd, next: e.target.value })} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{p.confirmNewPassword}</label>
                    <input className={styles.input} type="password" value={pwd.confirm}
                      onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
                  </div>
                </div>
                <button className={styles.btnPrimary} type="submit" disabled={pwdSaving}>
                  {pwdSaving ? p.updating : p.updatePassword}
                </button>
              </form>
            </section>

            {/* Session */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{p.session}</h2>
              <p className={styles.sessionDesc}>{p.sessionDesc}</p>
              <div className={styles.sessionBtns}>
                <button className={styles.btnOutline} onClick={() => { logout(); router.push("/signup"); }}>
                  {p.logOut}
                </button>
                <button className={styles.btnDanger} onClick={logoutAll}>
                  {p.logOutAll}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className={styles.content}>
            <h1 className={styles.contentTitle}>{p.myOrdersTitle}</h1>

            {ordersLoading ? (
              <p className={styles.empty}>{p.loadingOrders}</p>
            ) : orders.length === 0 ? (
              <p className={styles.empty}>{p.noOrders}</p>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order._id} className={styles.orderCard}>
                    <div className={styles.orderCardTop}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                        <span className={`${styles.statusBadge} ${STATUS_COLORS[order.status] ?? ""}`}>
                          {p.statusLabels[order.status as keyof typeof p.statusLabels] ?? order.status}
                        </span>
                      </div>
                      <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className={styles.orderItems}>
                      {order.items.map((item, i) => (
                        <div key={i} className={styles.orderItemRow}>
                          <span className={styles.orderItemName}>{item.name}</span>
                          <span className={styles.orderItemQty}>× {item.quantity}</span>
                          <span className={styles.orderItemPrice}>{fmtPrice(item.price * item.quantity, order.currency)}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderCardBottom}>
                      <div className={styles.orderTotals}>
                        <span className={styles.orderTotalLabel}>{p.total}</span>
                        <span className={styles.orderTotalValue}>{fmtPrice(order.total, order.currency)}</span>
                        <span className={styles.orderPayment}>
                          {order.paymentMethod === "cod" ? p.cashOnDelivery : p.card}
                        </span>
                      </div>
                      <button className={styles.orderAgainBtn} onClick={() => orderAgain(order)}>
                        {p.orderAgain}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
