"use client";

import translations from "../../../translations";
import PageCMSEditor from "../../../components/admin/PageCMSEditor";
import ContactHeroSection from "../../../components/contact-us/HeroSection";
import ContactForm from "../../../components/contact-us/ContactForm";

const IMAGE_IDS = new Set(["contact-hero-image", "contact-note-image"]);

const en = translations.English.contactUs;
const ar = translations.Arabic.contactUs;

const ELEMENT_LABELS: Record<string, string> = {
  "contact-hero-image":           "Hero — Background Image",
  "contact-note-image":           "Form — Note Background Image",
  "contact-hero-heading":         "Hero — Heading",
  "contact-hero-subtitle":        "Hero — Subtitle",
  "contact-card-heading":         "Form Card — Heading",
  "contact-card-subtitle":        "Form Card — Subtitle",
  "contact-newsletter-heading":   "Newsletter — Heading",
  "contact-newsletter-subtitle":  "Newsletter — Subtitle",
};

const DEFAULTS: Record<string, string> = {
  "contact-hero-heading":        en.heroHeading,
  "contact-hero-subtitle":       en.heroSubtitle,
  "contact-card-heading":        en.cardHeading,
  "contact-card-subtitle":       en.cardSubtitle,
  "contact-newsletter-heading":  en.newsletterHeading,
  "contact-newsletter-subtitle": en.newsletterSubtitle,
};

const AR_DEFAULTS: Record<string, string> = {
  "contact-hero-heading":        ar.heroHeading,
  "contact-hero-subtitle":       ar.heroSubtitle,
  "contact-card-heading":        ar.cardHeading,
  "contact-card-subtitle":       ar.cardSubtitle,
  "contact-newsletter-heading":  ar.newsletterHeading,
  "contact-newsletter-subtitle": ar.newsletterSubtitle,
};

export default function ContactCMSPage() {
  return (
    <PageCMSEditor
      page="contact"
      elementLabels={ELEMENT_LABELS}
      imageIds={IMAGE_IDS}
      defaults={DEFAULTS}
      arDefaults={AR_DEFAULTS}
    >
      {() => (
        <div style={{ background: "#FFF5F2" }}>
          <ContactHeroSection />
          <ContactForm />
        </div>
      )}
    </PageCMSEditor>
  );
}
