"use client";

import { useEffect, useState } from "react";
import panelStyles from "../../../styles/admin/AdminPanel.module.css";
import styles from "../../../styles/admin/EmailMarketing.module.css";
import { adminFetch } from "../../../lib/adminFetch";

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

interface RegisteredUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

type MainTab = "subscribers" | "users";
type DateFilterType = "today" | "yesterday" | "last7" | "specific" | "range" | null;

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d: Date)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }

function toYMD(d: Date) {
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

function isInRange(dateStr: string, filter: DateFilterType, specificDate: string, rangeFrom: string, rangeTo: string): boolean {
  if (!filter) return true;
  const d = new Date(dateStr);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);
  if (filter === "today") return d >= todayStart && d <= todayEnd;
  if (filter === "yesterday") {
    const ys = new Date(todayStart); ys.setDate(ys.getDate()-1);
    const ye = new Date(todayEnd);   ye.setDate(ye.getDate()-1);
    return d >= ys && d <= ye;
  }
  if (filter === "last7") {
    const s = new Date(todayStart); s.setDate(s.getDate()-6);
    return d >= s;
  }
  if (filter === "specific" && specificDate) {
    const base = new Date(specificDate + "T00:00:00");
    return d >= startOfDay(base) && d <= endOfDay(base);
  }
  if (filter === "range") {
    if (rangeFrom && d < startOfDay(new Date(rangeFrom + "T00:00:00"))) return false;
    if (rangeTo   && d > endOfDay(new Date(rangeTo   + "T00:00:00"))) return false;
    return true;
  }
  return true;
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function EmailMarketingPage() {
  const [mainTab, setMainTab] = useState<MainTab>("subscribers");

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers]             = useState<RegisteredUser[]>([]);
  const [loadingSub, setLoadingSub]   = useState(true);
  const [loadingUsr, setLoadingUsr]   = useState(true);

  // Date filter state (shared per tab via prefixed state would be complex — keep one set, reset on tab change)
  const [dateFilter, setDateFilter]     = useState<DateFilterType>(null);
  const [specificDate, setSpecificDate] = useState("");
  const [rangeFrom, setRangeFrom]       = useState("");
  const [rangeTo, setRangeTo]           = useState("");
  const [calMonth, setCalMonth]         = useState<Date>(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; });
  const [hoverDate, setHoverDate]       = useState("");

  // Search
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subscribers`)
      .then(r => r.json()).then(d => setSubscribers(Array.isArray(d) ? d : [])).catch(() => setSubscribers([])).finally(() => setLoadingSub(false));
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`)
      .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => setUsers([])).finally(() => setLoadingUsr(false));
  }, []);

  function clearDateFilter() { setDateFilter(null); setSpecificDate(""); setRangeFrom(""); setRangeTo(""); }
  function toggleDateFilter(f: DateFilterType) {
    if (dateFilter === f) { clearDateFilter(); return; }
    setDateFilter(f);
    if (f !== "specific") setSpecificDate("");
    if (f !== "range") { setRangeFrom(""); setRangeTo(""); }
  }

  function switchTab(t: MainTab) { setMainTab(t); clearDateFilter(); setSearch(""); }

  // Calendar helpers
  function prevMonth() { setCalMonth(p => { const d = new Date(p); d.setMonth(d.getMonth()-1); return d; }); }
  function nextMonth() { setCalMonth(p => { const d = new Date(p); d.setMonth(d.getMonth()+1); return d; }); }
  function getCalDays(month: Date): (Date|null)[] {
    const y = month.getFullYear(), m = month.getMonth();
    const firstDow = new Date(y,m,1).getDay();
    const lastDate = new Date(y,m+1,0).getDate();
    const days: (Date|null)[] = Array(firstDow).fill(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(y,m,i));
    return days;
  }
  function selectSpecificDate(day: Date) {
    const ymd = toYMD(day);
    setSpecificDate(prev => prev === ymd ? "" : ymd);
  }
  function selectRangeDate(day: Date) {
    const ymd = toYMD(day);
    if (!rangeFrom || rangeTo) { setRangeFrom(ymd); setRangeTo(""); }
    else if (ymd === rangeFrom) { setRangeFrom(""); }
    else if (ymd < rangeFrom) { setRangeTo(rangeFrom); setRangeFrom(ymd); }
    else { setRangeTo(ymd); }
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
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(w => <span key={w} className={styles.calDow}>{w}</span>)}
          {days.map((day, i) => {
            if (!day) return <span key={i} className={styles.calEmpty} />;
            const ymd = toYMD(day);
            const sel  = isSelected(ymd);
            const rang = inRange?.(ymd) ?? false;
            const today = ymd === todayYMD && !sel;
            return (
              <button
                key={i}
                className={[styles.calDay, sel ? styles.calDaySelected : "", rang ? styles.calDayInRange : "", today ? styles.calDayToday : ""].filter(Boolean).join(" ")}
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

  // Filtered data
  const filteredSubs = subscribers.filter(s =>
    isInRange(s.createdAt, dateFilter, specificDate, rangeFrom, rangeTo) &&
    (!search || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredUsers = users.filter(u =>
    isInRange(u.createdAt, dateFilter, specificDate, rangeFrom, rangeTo) &&
    (!search || u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  function exportSubscribersCSV() {
    const rows = [
      ["Email", "Subscribed On"],
      ...filteredSubs.map(s => [
        s.email,
        new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ]),
    ];
    downloadCSV(rows, `orana-subscribers-${toYMD(new Date())}.csv`);
  }

  function exportUsersCSV() {
    const rows = [
      ["First Name", "Last Name", "Email", "Phone", "Registered On"],
      ...filteredUsers.map(u => [
        u.firstName,
        u.lastName,
        u.email,
        u.phone || "",
        new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ]),
    ];
    downloadCSV(rows, `orana-users-${toYMD(new Date())}.csv`);
  }

  const loading = mainTab === "subscribers" ? loadingSub : loadingUsr;
  const count   = mainTab === "subscribers" ? filteredSubs.length : filteredUsers.length;

  return (
    <div className={panelStyles.page}>
      <div className={panelStyles.header}>
        <h1 className={panelStyles.title}>Email Marketing</h1>
      </div>

      {/* Main tabs */}
      <div className={styles.mainTabs}>
        <button
          className={`${styles.mainTab} ${mainTab === "subscribers" ? styles.mainTabActive : ""}`}
          onClick={() => switchTab("subscribers")}
        >
          Newsletter Subscribers
          <span className={`${styles.tabCount} ${mainTab === "subscribers" ? styles.tabCountActive : ""}`}>
            {subscribers.length}
          </span>
        </button>
        <button
          className={`${styles.mainTab} ${mainTab === "users" ? styles.mainTabActive : ""}`}
          onClick={() => switchTab("users")}
        >
          Registered Users
          <span className={`${styles.tabCount} ${mainTab === "users" ? styles.tabCountActive : ""}`}>
            {users.length}
          </span>
        </button>
      </div>

      {/* Toolbar + floating calendar */}
      <div className={styles.filterWrap}>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={mainTab === "subscribers" ? "Search email..." : "Search name or email..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.dateFilterRow}>
            {(["today","yesterday","last7","specific","range"] as DateFilterType[]).map(f => (
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
        </div>

        {dateFilter === "specific" && (
          <div className={styles.calContainer}>
            {renderCalendar(selectSpecificDate, ymd => ymd === specificDate)}
            {specificDate && (
              <p className={styles.calLabel}>
                {new Date(specificDate + "T00:00:00").toLocaleDateString("en-GB", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
              </p>
            )}
          </div>
        )}
        {dateFilter === "range" && (
          <div className={styles.calContainer}>
            {renderCalendar(
              selectRangeDate,
              ymd => ymd === rangeFrom || ymd === rangeTo,
              ymd => {
                if (!rangeFrom) return false;
                const end = rangeTo || (hoverDate && hoverDate !== rangeFrom ? hoverDate : "");
                if (!end) return false;
                const [s, e] = rangeFrom <= end ? [rangeFrom, end] : [end, rangeFrom];
                return ymd > s && ymd < e;
              }
            )}
            <p className={styles.calLabel}>
              {rangeFrom ? new Date(rangeFrom+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "Pick start date"}
              {" → "}
              {rangeTo ? new Date(rangeTo+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : rangeFrom ? "Pick end date" : "—"}
            </p>
          </div>
        )}
      </div>

      {/* Results header */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultCount}>{count} {count === 1 ? "record" : "records"}</span>
        <button
          className={styles.exportBtn}
          onClick={mainTab === "subscribers" ? exportSubscribersCSV : exportUsersCSV}
          disabled={count === 0}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Tables */}
      {loading ? (
        <p className={panelStyles.empty}>Loading...</p>
      ) : mainTab === "subscribers" ? (
        filteredSubs.length === 0 ? (
          <p className={panelStyles.empty}>No subscribers found.</p>
        ) : (
          <table className={panelStyles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Subscribed On</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((s, i) => (
                <tr key={s._id}>
                  <td className={styles.rowNum}>{i + 1}</td>
                  <td className={styles.emailCell}>{s.email}</td>
                  <td className={styles.dateCell}>
                    {new Date(s.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        filteredUsers.length === 0 ? (
          <p className={panelStyles.empty}>No registered users found.</p>
        ) : (
          <table className={panelStyles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u._id}>
                  <td className={styles.rowNum}>{i + 1}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td className={styles.emailCell}>{u.email}</td>
                  <td className={styles.dateCell}>{u.phone || "—"}</td>
                  <td className={styles.dateCell}>
                    {new Date(u.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
