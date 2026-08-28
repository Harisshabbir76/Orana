"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import styles from "../styles/auth/Auth.module.css";

type Tab = "login" | "signup";
type ForgotStep = "email" | "otp" | "reset";

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslation();
  const s = t.signup;
  const te = t.te;

  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Signup
  const [signupForm, setSignupForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  // Forgot password
  const [forgotStep, setForgotStep] = useState<ForgotStep | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  function enterForgot() {
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotPassword("");
    setForgotConfirm("");
    setForgotSuccess("");
    setError("");
  }

  function exitForgot() {
    setForgotStep(null);
    setError("");
    setForgotSuccess("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(te(data.error) || s.loginFailed); return; }
      login(data.token, data.user);
      router.push("/profile");
    } catch {
      setError(s.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signupForm.password !== signupForm.confirm) { setError(s.passwordMismatch); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: signupForm.firstName, lastName: signupForm.lastName, email: signupForm.email, phone: signupForm.phone, password: signupForm.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(te(data.error) || s.signupFailed); return; }
      login(data.token, data.user);
      router.push("/profile");
    } catch {
      setError(s.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || s.failedSendOtp); return; }
      setForgotStep("otp");
    } catch {
      setError(s.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || s.invalidOtp); return; }
      setForgotStep("reset");
    } catch {
      setError(s.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (forgotPassword !== forgotConfirm) { setError(s.passwordMismatch); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword: forgotPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || s.failedResetPassword); return; }
      setForgotSuccess(s.forgotSuccess);
      setForgotStep(null);
      setTab("login");
    } catch {
      setError(s.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.brand}>ORANA</Link>
        <p className={styles.tagline}>{s.tagline}</p>

        {forgotStep ? (
          <>
            {error && <p className={styles.error}>{error}</p>}

            {forgotStep === "email" && (
              <form className={styles.form} onSubmit={handleForgotEmail}>
                <p className={styles.forgotTitle}>{s.forgotTitle}</p>
                <p className={styles.stepNote}>{s.forgotStepNoteEmail}</p>
                <div className={styles.field}>
                  <label className={styles.label}>{s.email}</label>
                  <input
                    className={styles.input}
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button className={styles.submitBtn} type="submit" disabled={loading}>
                  {loading ? s.sending : s.sendOtp}
                </button>
                <button type="button" className={styles.backBtn} onClick={exitForgot}>
                  {s.backToSignIn}
                </button>
              </form>
            )}

            {forgotStep === "otp" && (
              <form className={styles.form} onSubmit={handleForgotOtp}>
                <p className={styles.forgotTitle}>{s.otpTitle}</p>
                <p className={styles.stepNote}>{s.forgotStepNoteOtp} {forgotEmail}</p>
                <div className={styles.field}>
                  <label className={styles.label}>{s.oneTimeCode}</label>
                  <input
                    className={`${styles.input} ${styles.otpInput}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <button className={styles.submitBtn} type="submit" disabled={loading}>
                  {loading ? s.verifying : s.verifyCode}
                </button>
                <button type="button" className={styles.backBtn} onClick={() => { setForgotStep("email"); setError(""); }}>
                  {s.back}
                </button>
              </form>
            )}

            {forgotStep === "reset" && (
              <form className={styles.form} onSubmit={handleForgotReset}>
                <p className={styles.forgotTitle}>{s.newPasswordTitle}</p>
                <div className={styles.field}>
                  <label className={styles.label}>{s.newPassword}</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className={styles.input}
                      type={showForgotPwd ? "text" : "password"}
                      value={forgotPassword}
                      onChange={(e) => setForgotPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowForgotPwd((v) => !v)} tabIndex={-1}>
                      <EyeIcon visible={showForgotPwd} />
                    </button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{s.confirmNewPassword}</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className={styles.input}
                      type={showForgotConfirm ? "text" : "password"}
                      value={forgotConfirm}
                      onChange={(e) => setForgotConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowForgotConfirm((v) => !v)} tabIndex={-1}>
                      <EyeIcon visible={showForgotConfirm} />
                    </button>
                  </div>
                </div>
                <button className={styles.submitBtn} type="submit" disabled={loading}>
                  {loading ? s.resetting : s.resetPassword}
                </button>
                <button type="button" className={styles.backBtn} onClick={() => { setForgotStep("otp"); setError(""); }}>
                  {s.back}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabBtn} ${tab === "signup" ? styles.tabBtnActive : ""}`}
                onClick={() => { setTab("signup"); setError(""); setForgotSuccess(""); }}
              >
                {s.signupTab}
              </button>
              <button
                className={`${styles.tabBtn} ${tab === "login" ? styles.tabBtnActive : ""}`}
                onClick={() => { setTab("login"); setError(""); }}
              >
                {s.signInTab}
              </button>
            </div>

            {forgotSuccess && <p className={styles.successMsg}>{forgotSuccess}</p>}
            {error && <p className={styles.error}>{error}</p>}

            {tab === "login" && (
              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.field}>
                  <label className={styles.label}>{s.email}</label>
                  <input
                    className={styles.input}
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{s.password}</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className={styles.input}
                      type={showLoginPwd ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowLoginPwd((v) => !v)} tabIndex={-1}>
                      <EyeIcon visible={showLoginPwd} />
                    </button>
                  </div>
                  <button type="button" className={styles.forgotLink} onClick={enterForgot}>
                    {s.forgotPassword}
                  </button>
                </div>
                <button className={styles.submitBtn} type="submit" disabled={loading}>
                  {loading ? s.signingIn : s.signInBtn}
                </button>
                <p className={styles.switchText}>
                  {s.noAccount}{" "}
                  <button type="button" className={styles.switchLink} onClick={() => { setTab("signup"); setError(""); }}>
                    {s.signupLink}
                  </button>
                </p>
              </form>
            )}

            {tab === "signup" && (
              <form className={styles.form} onSubmit={handleSignup}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{s.firstName}</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{s.lastName}</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{s.email}</label>
                    <input
                      className={styles.input}
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{s.phone}</label>
                    <input
                      className={styles.input}
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{s.password}</label>
                    <div className={styles.passwordWrap}>
                      <input
                        className={styles.input}
                        type={showSignupPwd ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowSignupPwd((v) => !v)} tabIndex={-1}>
                        <EyeIcon visible={showSignupPwd} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{s.confirmPassword}</label>
                    <div className={styles.passwordWrap}>
                      <input
                        className={styles.input}
                        type={showSignupConfirm ? "text" : "password"}
                        value={signupForm.confirm}
                        onChange={(e) => setSignupForm({ ...signupForm, confirm: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowSignupConfirm((v) => !v)} tabIndex={-1}>
                        <EyeIcon visible={showSignupConfirm} />
                      </button>
                    </div>
                  </div>
                </div>
                <button className={styles.submitBtn} type="submit" disabled={loading}>
                  {loading ? s.creatingAccount : s.signupBtn}
                </button>
                <p className={styles.switchText}>
                  {s.haveAccount}{" "}
                  <button type="button" className={styles.switchLink} onClick={() => { setTab("login"); setError(""); }}>
                    {s.signInLink}
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
