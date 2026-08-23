"use client";

import { useEffect, useState } from "react";
import panelStyles from "../../../styles/admin/AdminPanel.module.css";
import styles from "../../../styles/admin/Orders.module.css";
import { adminFetch } from "../../../lib/adminFetch";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

const AED_TO_USD = 1 / 3.6725;
function fmtPrice(aed: number, currency: string): string {
  if (currency === "USD") return `$ ${(aed * AED_TO_USD).toFixed(2)}`;
  return `Dhs. ${aed}`;
}

interface Order {
  _id: string;
  items: OrderItem[];
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
  status: string;
  createdAt: string;
  currency: string;
}

const COUNTRY_LABELS: Record<string, string> = {
  UAE: "United Arab Emirates",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
];

type DateFilterType = "today" | "yesterday" | "last7" | "specific" | "range" | null;

function startOfDay(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function endOfDay(d: Date) {
  const x = new Date(d); x.setHours(23, 59, 59, 999); return x;
}

export default function OrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [tab, setTab]           = useState("all");

  const [dateFilter, setDateFilter]     = useState<DateFilterType>(null);
  const [specificDate, setSpecificDate] = useState("");
  const [rangeFrom, setRangeFrom]       = useState("");
  const [rangeTo, setRangeTo]           = useState("");
  const [calMonth, setCalMonth]         = useState<Date>(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [hoverDate, setHoverDate]       = useState("");

  useEffect(() => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, []);

  async function changeStatus(orderId: string, newStatus: string) {
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) return;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selected?._id === orderId) {
        setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch {}
  }

  function clearDateFilter() {
    setDateFilter(null);
    setSpecificDate("");
    setRangeFrom("");
    setRangeTo("");
  }

  function toggleDateFilter(f: DateFilterType) {
    if (dateFilter === f) { clearDateFilter(); return; }
    setDateFilter(f);
    if (f !== "specific") setSpecificDate("");
    if (f !== "range") { setRangeFrom(""); setRangeTo(""); }
  }

  function isInDateFilter(order: Order): boolean {
    if (!dateFilter) return true;
    const d = new Date(order.createdAt);
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd   = endOfDay(now);

    if (dateFilter === "today") return d >= todayStart && d <= todayEnd;
    if (dateFilter === "yesterday") {
      const ys = new Date(todayStart); ys.setDate(ys.getDate() - 1);
      const ye = new Date(todayEnd);   ye.setDate(ye.getDate() - 1);
      return d >= ys && d <= ye;
    }
    if (dateFilter === "last7") {
      const s = new Date(todayStart); s.setDate(s.getDate() - 6);
      return d >= s;
    }
    if (dateFilter === "specific" && specificDate) {
      const base = new Date(specificDate + "T00:00:00");
      return d >= startOfDay(base) && d <= endOfDay(base);
    }
    if (dateFilter === "range") {
      if (rangeFrom && d < startOfDay(new Date(rangeFrom + "T00:00:00"))) return false;
      if (rangeTo   && d > endOfDay(new Date(rangeTo   + "T00:00:00"))) return false;
      return true;
    }
    return true;
  }

  // ── Calendar helpers ──────────────────────────────────────
  function prevMonth() {
    setCalMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() - 1); return d; });
  }
  function nextMonth() {
    setCalMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() + 1); return d; });
  }
  function getCalDays(month: Date): (Date | null)[] {
    const y = month.getFullYear(), m = month.getMonth();
    const firstDow = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();
    const days: (Date | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= lastDate; d++) days.push(new Date(y, m, d));
    return days;
  }
  function toYMD(d: Date) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function selectSpecificDate(day: Date) {
    const ymd = toYMD(day);
    setSpecificDate(prev => prev === ymd ? "" : ymd);
  }
  function selectRangeDate(day: Date) {
    const ymd = toYMD(day);
    if (!rangeFrom || rangeTo) {
      setRangeFrom(ymd); setRangeTo("");
    } else if (ymd === rangeFrom) {
      setRangeFrom("");
    } else if (ymd < rangeFrom) {
      setRangeTo(rangeFrom); setRangeFrom(ymd);
    } else {
      setRangeTo(ymd);
    }
  }
  function renderCalendar(
    onSelect: (d: Date) => void,
    isSelected: (ymd: string) => boolean,
    inRange?: (ymd: string) => boolean
  ) {
    const todayYMD = toYMD(new Date());
    const days = getCalDays(calMonth);
    return (
      <div className={styles.calWrap}>
        <div className={styles.calHeader}>
          <button className={styles.calNav} onClick={prevMonth}>‹</button>
          <span className={styles.calMonthLabel}>
            {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button className={styles.calNav} onClick={nextMonth}>›</button>
        </div>
        <div className={styles.calGrid}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(w => (
            <span key={w} className={styles.calDow}>{w}</span>
          ))}
          {days.map((day, i) => {
            if (!day) return <span key={i} className={styles.calEmpty} />;
            const ymd = toYMD(day);
            const sel   = isSelected(ymd);
            const rang  = inRange?.(ymd) ?? false;
            const today = ymd === todayYMD && !sel;
            return (
              <button
                key={i}
                className={[
                  styles.calDay,
                  sel   ? styles.calDaySelected : "",
                  rang  ? styles.calDayInRange   : "",
                  today ? styles.calDayToday     : "",
                ].filter(Boolean).join(" ")}
                onClick={() => onSelect(day)}
                onMouseEnter={() => setHoverDate(ymd)}
                onMouseLeave={() => setHoverDate("")}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const dateFiltered = orders.filter(isInDateFilter);
  const filtered = tab === "all" ? dateFiltered : dateFiltered.filter((o) => o.status === tab);

  const countFor = (key: string) =>
    key === "all" ? dateFiltered.length : dateFiltered.filter((o) => o.status === key).length;

  return (
    <div className={panelStyles.page}>
      <div className={panelStyles.header}>
        <h1 className={panelStyles.title}>Orders</h1>
      </div>

      {/* ── Date filters ── */}
      <div className={styles.dateFilters}>
        <div className={styles.dateFilterRow}>
          {(["today","yesterday","last7","specific","range"] as DateFilterType[]).map((f) => (
            <button
              key={f}
              className={`${styles.dateFilterBtn} ${dateFilter === f ? styles.dateFilterBtnActive : ""}`}
              onClick={() => toggleDateFilter(f)}
            >
              {f === "today" ? "Today" : f === "yesterday" ? "Yesterday" : f === "last7" ? "Last 7 Days" : f === "specific" ? "On Date" : "Date Range"}
            </button>
          ))}
          {dateFilter && (
            <button className={styles.dateFilterClear} onClick={clearDateFilter}>
              ✕ Clear
            </button>
          )}
        </div>

        {dateFilter === "specific" && (
          <div className={styles.calContainer}>
            {renderCalendar(
              selectSpecificDate,
              (ymd) => ymd === specificDate,
            )}
            {specificDate && (
              <p className={styles.calLabel}>
                {new Date(specificDate + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            )}
          </div>
        )}

        {dateFilter === "range" && (
          <div className={styles.calContainer}>
            {renderCalendar(
              selectRangeDate,
              (ymd) => ymd === rangeFrom || ymd === rangeTo,
              (ymd) => {
                if (!rangeFrom) return false;
                const end = rangeTo || (hoverDate && hoverDate !== rangeFrom ? hoverDate : "");
                if (!end) return false;
                const [s, e] = rangeFrom <= end ? [rangeFrom, end] : [end, rangeFrom];
                return ymd > s && ymd < e;
              }
            )}
            <p className={styles.calLabel}>
              {rangeFrom
                ? new Date(rangeFrom + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : "Pick start date"}
              {" → "}
              {rangeTo
                ? new Date(rangeTo + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : rangeFrom ? "Pick end date" : "—"}
            </p>
          </div>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className={`${styles.tabCount} ${tab === t.key ? styles.tabCountActive : ""}`}>
              {countFor(t.key)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={panelStyles.empty}>No {tab === "all" ? "" : tab} orders.</p>
      ) : (
        <table className={panelStyles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order._id}>
                <td>
                  <span className={styles.orderId}>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td>
                  {order.customer.firstName} {order.customer.lastName}
                  <div className={styles.subText}>{order.customer.email}</div>
                </td>
                <td>{order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</td>
                <td>{fmtPrice(order.total, order.currency)}</td>
                <td>
                  <span className={styles.paymentBadge}>
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <div className={styles.actions}>
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) => changeStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button className={styles.viewBtn} onClick={() => setSelected(order)}>
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Order detail modal ── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Order Details</h2>
                <p className={styles.modalOrderId}>
                  #{selected._id.slice(-8).toUpperCase()}
                  <span className={`${styles.statusBadge} ${styles[`status_${selected.status}`]}`} style={{ marginLeft: 10 }}>
                    {STATUS_LABELS[selected.status] ?? selected.status}
                  </span>
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Items */}
              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Items Ordered</h3>
                <table className={styles.itemsTable}>
                  <colgroup>
                    <col />
                    <col style={{ width: "80px" }} />
                    <col style={{ width: "120px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className={styles.centered}>Qty</th>
                      <th className={styles.right}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td className={styles.centered}>× {item.quantity}</td>
                        <td className={styles.right}>{fmtPrice(item.price * item.quantity, selected.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.totalsBlock}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span>{fmtPrice(selected.subtotal, selected.currency)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Shipping</span>
                    <span>{selected.shipping === 0 ? "Free" : fmtPrice(selected.shipping, selected.currency)}</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalRowBold}`}>
                    <span>Total</span>
                    <span>{fmtPrice(selected.total, selected.currency)}</span>
                  </div>
                </div>
              </section>

              {/* Customer + Address */}
              <div className={styles.infoGrid}>
                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Contact</h3>
                  <p className={styles.infoLine}>{selected.customer.firstName} {selected.customer.lastName}</p>
                  <p className={styles.infoLine}>{selected.customer.email}</p>
                  <p className={styles.infoLine}>{selected.customer.phone}</p>
                </section>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Delivery Address</h3>
                  <p className={styles.infoLine}>{selected.customer.address}</p>
                  <p className={styles.infoLine}>{selected.customer.city}</p>
                  <p className={styles.infoLine}>{COUNTRY_LABELS[selected.customer.country] ?? selected.customer.country}</p>
                </section>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Payment</h3>
                  <p className={styles.infoLine}>
                    {selected.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
                  </p>
                </section>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Date</h3>
                  <p className={styles.infoLine}>
                    {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                  <p className={styles.infoLine}>
                    {new Date(selected.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </section>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.closeModalBtn} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
