"use client";

import { useEffect, useState } from "react";
import panelStyles from "../../../styles/admin/AdminPanel.module.css";
import styles from "../../../styles/admin/Messages.module.css";
import { adminFetch } from "../../../lib/adminFetch";
import ConfirmModal from "../../../components/admin/ConfirmModal";
import TrashIcon from "../../../components/admin/TrashIcon";

interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  contactNo: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

type DateFilterType = "today" | "yesterday" | "last7" | "specific" | "range" | null;

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d: Date)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const [dateFilter, setDateFilter]     = useState<DateFilterType>(null);
  const [specificDate, setSpecificDate] = useState("");
  const [rangeFrom, setRangeFrom]       = useState("");
  const [rangeTo, setRangeTo]           = useState("");
  const [calMonth, setCalMonth]         = useState<Date>(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [hoverDate, setHoverDate]       = useState("");

  useEffect(() => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, []);

  const markRead = async (id: string) => {
    await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}/read`, { method: "PATCH" });
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, read: true } : m)));
  };

  function toggleChecked(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const ids = pendingDelete;
    setPendingDelete(null);
    try {
      const res = ids.length === 1
        ? await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${ids[0]}`, { method: "DELETE" })
        : await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/bulk-delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          });
      if (!res.ok) return;
      const removed = new Set(ids);
      setMessages((prev) => prev.filter((m) => !removed.has(m._id)));
      setCheckedIds((prev) => new Set([...prev].filter((id) => !removed.has(id))));
    } catch {}
  }

  function clearDateFilter() {
    setDateFilter(null); setSpecificDate(""); setRangeFrom(""); setRangeTo("");
  }
  function toggleDateFilter(f: DateFilterType) {
    if (dateFilter === f) { clearDateFilter(); return; }
    setDateFilter(f);
    if (f !== "specific") setSpecificDate("");
    if (f !== "range") { setRangeFrom(""); setRangeTo(""); }
  }
  function isInDateFilter(m: Message): boolean {
    if (!dateFilter) return true;
    const d = new Date(m.createdAt);
    const now = new Date();
    const todayStart = startOfDay(now), todayEnd = endOfDay(now);
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
  function prevMonth() { setCalMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() - 1); return d; }); }
  function nextMonth() { setCalMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() + 1); return d; }); }
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
    if (!rangeFrom || rangeTo) { setRangeFrom(ymd); setRangeTo(""); }
    else if (ymd === rangeFrom) { setRangeFrom(""); }
    else if (ymd < rangeFrom)  { setRangeTo(rangeFrom); setRangeFrom(ymd); }
    else                        { setRangeTo(ymd); }
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
            const ymd  = toYMD(day);
            const sel  = isSelected(ymd);
            const rang = inRange?.(ymd) ?? false;
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

  const filtered = messages.filter(isInDateFilter);
  const unreadCount = filtered.filter((m) => !m.read).length;

  // Only messages visible under the current filter can be bulk-deleted
  const checkedVisible = filtered.filter((m) => checkedIds.has(m._id)).map((m) => m._id);
  const allVisibleChecked = filtered.length > 0 && checkedVisible.length === filtered.length;
  function toggleAllVisible() {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) filtered.forEach((m) => next.delete(m._id));
      else filtered.forEach((m) => next.add(m._id));
      return next;
    });
  }

  return (
    <div className={panelStyles.page}>
      <div className={panelStyles.header}>
        <div className={styles.titleRow}>
          <h1 className={panelStyles.title}>Messages</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} new</span>
          )}
        </div>
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
            <button className={styles.dateFilterClear} onClick={clearDateFilter}>✕ Clear</button>
          )}
        </div>

        {dateFilter === "specific" && (
          <div className={styles.calContainer}>
            {renderCalendar(selectSpecificDate, (ymd) => ymd === specificDate)}
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

      {filtered.length === 0 ? (
        <p className={panelStyles.empty}>No messages{dateFilter ? " for this period" : " yet"}.</p>
      ) : (
        <>
        <div className={panelStyles.bulkBar}>
          <label className={panelStyles.bulkSelectAll}>
            <input
              type="checkbox"
              className={panelStyles.checkbox}
              checked={allVisibleChecked}
              onChange={toggleAllVisible}
            />
            Select all
          </label>
          {checkedVisible.length > 0 && (
            <>
              <span className={panelStyles.bulkCount}>{checkedVisible.length} selected</span>
              <button className={panelStyles.deleteRowBtn} onClick={() => setPendingDelete(checkedVisible)}>
                Delete Selected
              </button>
              <button className={panelStyles.bulkClearBtn} onClick={() => setCheckedIds(new Set())}>
                Clear Selection
              </button>
            </>
          )}
        </div>
        <div className={styles.list}>
          {filtered.map((m) => (
            <div
              key={m._id}
              className={`${styles.card} ${m.read ? styles.cardRead : styles.cardUnread}`}
            >
              <div className={styles.cardHeader}>
                <label className={styles.nameWrap}>
                  <input
                    type="checkbox"
                    className={panelStyles.checkbox}
                    checked={checkedIds.has(m._id)}
                    onChange={() => toggleChecked(m._id)}
                    aria-label="Select message"
                  />
                  <span className={styles.name}>{m.firstName} {m.lastName}</span>
                </label>
                <span className={styles.date}>
                  {new Date(m.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.meta}>
                <span>{m.email}</span>
                {m.contactNo && <span>· {m.contactNo}</span>}
              </div>
              <p className={styles.text}>{m.message}</p>
              <div className={styles.cardFooter}>
                {m.read ? (
                  <span className={styles.readLabel}>Read</span>
                ) : (
                  <button className={styles.markReadBtn} onClick={() => markRead(m._id)}>
                    Mark as read
                  </button>
                )}
                <button
                  className={panelStyles.iconDeleteBtn}
                  onClick={() => setPendingDelete([m._id])}
                  title="Delete message"
                  aria-label="Delete message"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {pendingDelete && (
        <ConfirmModal
          title={pendingDelete.length === 1 ? "Delete Message" : `Delete ${pendingDelete.length} Messages`}
          message={pendingDelete.length === 1
            ? "Are you sure you want to delete this message? This cannot be undone."
            : `Are you sure you want to delete ${pendingDelete.length} messages? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
