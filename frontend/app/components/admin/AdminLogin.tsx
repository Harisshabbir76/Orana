"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/admin/AdminLogin.module.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>ORANA</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <h2 className={styles.heading}>Sign in to Dashboard</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
