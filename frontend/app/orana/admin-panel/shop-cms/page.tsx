"use client";

import translations from "../../../translations";
import PageCMSEditor from "../../../components/admin/PageCMSEditor";
import ShopPage from "../../../components/shop/ShopPage";
import GotQuestions from "../../../components/shop/GotQuestions";

const IMAGE_IDS = new Set<string>();

const en = translations.English;
const ar = translations.Arabic;

// Build FAQ entry labels and defaults
const faqLabels: Record<string, string> = {};
const faqDefaults: Record<string, string> = {};
const faqArDefaults: Record<string, string> = {};

en.shop.faqs.forEach((faq, i) => {
  faqLabels[`shop-faq-q-${i}`] = `FAQ ${i + 1} — Question`;
  faqLabels[`shop-faq-a-${i}`] = `FAQ ${i + 1} — Answer`;
  faqDefaults[`shop-faq-q-${i}`] = faq.q;
  faqDefaults[`shop-faq-a-${i}`] = faq.a;
  faqArDefaults[`shop-faq-q-${i}`] = ar.shop.faqs[i]?.q ?? faq.q;
  faqArDefaults[`shop-faq-a-${i}`] = ar.shop.faqs[i]?.a ?? faq.a;
});

const ELEMENT_LABELS: Record<string, string> = {
  "shop-heading":       "Shop — Heading",
  "shop-subtitle":      "Shop — Subtitle",
  "shop-faq-heading":   "FAQ Section — Heading",
  "shop-faq-subtitle":  "FAQ Section — Subtitle",
  "shop-faq-viewall":   "FAQ Section — View All Link",
  "shop-faqs":          "FAQ Items",
  ...faqLabels,
};

const DEFAULTS: Record<string, string> = {
  "shop-heading":      en.shop.heading,
  "shop-subtitle":     en.shop.subtitle,
  "shop-faq-heading":  en.shop.faqHeading,
  "shop-faq-subtitle": en.shop.faqSubtitle,
  "shop-faq-viewall":  en.shop.faqViewAll,
  ...faqDefaults,
};

const AR_DEFAULTS: Record<string, string> = {
  "shop-heading":      ar.shop.heading,
  "shop-subtitle":     ar.shop.subtitle,
  "shop-faq-heading":  ar.shop.faqHeading,
  "shop-faq-subtitle": ar.shop.faqSubtitle,
  "shop-faq-viewall":  ar.shop.faqViewAll,
  ...faqArDefaults,
};

// Group for FAQ items
const faqSubIds = en.shop.faqs.flatMap((_, i) => [`shop-faq-q-${i}`, `shop-faq-a-${i}`]);
const GROUPS = {
  "shop-faqs": {
    label: "FAQ Items",
    subIds: faqSubIds,
    subLabel: (i: number) => {
      const itemIndex = Math.floor(i / 2);
      return i % 2 === 0 ? `Q${itemIndex + 1}: Question` : `A${itemIndex + 1}: Answer`;
    },
  },
};

export default function ShopCMSPage() {
  return (
    <PageCMSEditor
      page="shop"
      elementLabels={ELEMENT_LABELS}
      imageIds={IMAGE_IDS}
      defaults={DEFAULTS}
      arDefaults={AR_DEFAULTS}
      groups={GROUPS}
    >
      {() => (
        <>
          <ShopPage initialProducts={[]} />
          <GotQuestions />
        </>
      )}
    </PageCMSEditor>
  );
}
