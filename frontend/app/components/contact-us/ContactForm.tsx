"use client";

import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import styles from "../../styles/contact-us/ContactForm.module.css";

export default function ContactForm() {
  const t = useTranslation();
  const c = t.contactUs;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  const [form, setForm] = useState({ firstName: "", lastName: "", contactNo: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"success" | "error" | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cmsMode) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setForm({ firstName: "", lastName: "", contactNo: "", email: "", message: "" });
      setModal("success");
    } catch {
      setModal("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modal && !cmsMode && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={modal === "success" ? styles.modalIconSuccess : styles.modalIconError}>
              {modal === "success" ? "✓" : "✕"}
            </div>
            <h3 className={styles.modalTitle}>{modal === "success" ? c.modalSuccessTitle : c.modalErrorTitle}</h3>
            <p className={styles.modalText}>{modal === "success" ? c.modalSuccessText : c.modalErrorText}</p>
            <button className={styles.modalClose} onClick={() => setModal(null)}>{c.modalClose}</button>
          </div>
        </div>
      )}

      <section className={styles.section}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2 className={styles.heading} {...ce("contact-card-heading")}>{getContent("contact-card-heading", c.cardHeading)}</h2>
            <p className={styles.subtitle} {...ce("contact-card-subtitle")}>{getContent("contact-card-subtitle", c.cardSubtitle)}</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>{c.firstName}</label>
                  <input className={styles.input} type="text" name="firstName" value={form.firstName} onChange={handleChange} required disabled={cmsMode} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{c.lastName}</label>
                  <input className={styles.input} type="text" name="lastName" value={form.lastName} onChange={handleChange} required disabled={cmsMode} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>{c.contactNo}</label>
                  <input className={styles.input} type="tel" name="contactNo" value={form.contactNo} onChange={handleChange} required disabled={cmsMode} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{c.emailAddress}</label>
                  <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required disabled={cmsMode} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{c.message}</label>
                <textarea className={styles.textarea} name="message" value={form.message} onChange={handleChange} rows={5} required disabled={cmsMode} />
              </div>
              <div className={styles.submitRow}>
                <button type="submit" className={styles.btn} disabled={loading || cmsMode}>{loading ? "Sending..." : c.submit}</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className={styles.newsletter}>
        <h2 className={styles.newsletterHeading} {...ce("contact-newsletter-heading")}>{getContent("contact-newsletter-heading", c.newsletterHeading)}</h2>
        <p className={styles.newsletterSubtitle} {...ce("contact-newsletter-subtitle")}>{getContent("contact-newsletter-subtitle", c.newsletterSubtitle)}</p>
        <div className={styles.newsletterRow}>
          <input
            className={styles.newsletterInput}
            type="email"
            placeholder={c.newsletterPlaceholder}
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            disabled={cmsMode || newsletterState === "loading" || newsletterState === "success"}
          />
          <button
            type="button"
            className={styles.newsletterBtn}
            disabled={cmsMode || newsletterState === "loading" || newsletterState === "success" || !newsletterEmail}
            onClick={async () => {
              if (!newsletterEmail || cmsMode) return;
              setNewsletterState("loading");
              try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: newsletterEmail }),
                });
                setNewsletterState("success");
                setNewsletterEmail("");
              } catch {
                setNewsletterState("error");
              }
            }}
          >
            {newsletterState === "loading" ? "..." : newsletterState === "success" ? "Subscribed!" : c.newsletterSubmit}
          </button>
        </div>
        {newsletterState === "error" && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#cc2200", marginTop: 8, textAlign: "center" }}>
            Something went wrong. Please try again.
          </p>
        )}
      </section>
    </>
  );
}
