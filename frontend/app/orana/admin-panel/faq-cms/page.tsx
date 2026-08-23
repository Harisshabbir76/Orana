"use client";

import translations from "../../../translations";
import PageCMSEditor from "../../../components/admin/PageCMSEditor";
import QuestionAnswer from "../../../components/faq/QuestionAnswer";
import StillHaveQuestions from "../../../components/faq/StillHaveQuestions";

const IMAGE_IDS = new Set(["still-image"]);

const en = translations.English;
const ar = translations.Arabic;

// Build FAQ item labels and defaults
const faqLabels: Record<string, string> = {};
const faqDefaults: Record<string, string> = {};
const faqArDefaults: Record<string, string> = {};

en.faq.items.forEach((item, i) => {
  faqLabels[`faq-q-${i}`] = `FAQ ${i + 1} — Question`;
  faqLabels[`faq-a-${i}`] = `FAQ ${i + 1} — Answer`;
  faqDefaults[`faq-q-${i}`] = item.q;
  faqDefaults[`faq-a-${i}`] = item.a;
  faqArDefaults[`faq-q-${i}`] = ar.faq.items[i]?.q ?? item.q;
  faqArDefaults[`faq-a-${i}`] = ar.faq.items[i]?.a ?? item.a;
});

const ELEMENT_LABELS: Record<string, string> = {
  "faq-heading":   "FAQ — Heading",
  "faq-subtitle":  "FAQ — Subtitle",
  "faq-items":     "FAQ Items",
  "still-image":   "Still Have Questions — Image",
  "still-heading1":"Still Have Questions — Heading Line 1",
  "still-heading2":"Still Have Questions — Heading Line 2",
  "still-text":    "Still Have Questions — Text",
  "still-btn":     "Still Have Questions — Button",
  ...faqLabels,
};

const DEFAULTS: Record<string, string> = {
  "faq-heading":   en.faq.heading,
  "faq-subtitle":  en.faq.subtitle,
  "still-heading1":en.stillHaveQuestions.headingLine1,
  "still-heading2":en.stillHaveQuestions.headingLine2,
  "still-text":    en.stillHaveQuestions.text,
  "still-btn":     en.stillHaveQuestions.btn,
  ...faqDefaults,
};

const AR_DEFAULTS: Record<string, string> = {
  "faq-heading":   ar.faq.heading,
  "faq-subtitle":  ar.faq.subtitle,
  "still-heading1":ar.stillHaveQuestions.headingLine1,
  "still-heading2":ar.stillHaveQuestions.headingLine2,
  "still-text":    ar.stillHaveQuestions.text,
  "still-btn":     ar.stillHaveQuestions.btn,
  ...faqArDefaults,
};

const faqSubIds = en.faq.items.flatMap((_, i) => [`faq-q-${i}`, `faq-a-${i}`]);
const GROUPS = {
  "faq-items": {
    label: "FAQ Items",
    subIds: faqSubIds,
    subLabel: (i: number) => {
      const itemIndex = Math.floor(i / 2);
      return i % 2 === 0 ? `Q${itemIndex + 1}: Question` : `A${itemIndex + 1}: Answer`;
    },
  },
};

export default function FAQCMSPage() {
  return (
    <PageCMSEditor
      page="faq"
      elementLabels={ELEMENT_LABELS}
      imageIds={IMAGE_IDS}
      defaults={DEFAULTS}
      arDefaults={AR_DEFAULTS}
      groups={GROUPS}
    >
      {(elements, _sel, _setSel, setElements) => {
        const cmsCountStr = elements["faq-count"]?.content;
        const itemCount = cmsCountStr ? parseInt(cmsCountStr) : en.faq.items.length;

        function addFAQ() {
          setElements(prev => ({
            ...prev,
            "faq-count": { content: String(itemCount + 1) },
            [`faq-q-${itemCount}`]: { content: `${itemCount + 1}. ` },
            [`faq-a-${itemCount}`]: { content: "" },
          }));
        }

        function deleteFAQ(i: number) {
          setElements(prev => {
            const next = { ...prev };
            for (let j = i; j < itemCount - 1; j++) {
              next[`faq-q-${j}`] = next[`faq-q-${j + 1}`] ?? { content: en.faq.items[j + 1]?.q ?? "" };
              next[`faq-a-${j}`] = next[`faq-a-${j + 1}`] ?? { content: en.faq.items[j + 1]?.a ?? "" };
              if (next[`ar:faq-q-${j + 1}`]) next[`ar:faq-q-${j}`] = next[`ar:faq-q-${j + 1}`];
              else delete next[`ar:faq-q-${j}`];
              if (next[`ar:faq-a-${j + 1}`]) next[`ar:faq-a-${j}`] = next[`ar:faq-a-${j + 1}`];
              else delete next[`ar:faq-a-${j}`];
            }
            delete next[`faq-q-${itemCount - 1}`];
            delete next[`faq-a-${itemCount - 1}`];
            delete next[`ar:faq-q-${itemCount - 1}`];
            delete next[`ar:faq-a-${itemCount - 1}`];
            next["faq-count"] = { content: String(Math.max(0, itemCount - 1)) };
            return next;
          });
        }

        return (
          <>
            <QuestionAnswer onAdd={addFAQ} onDeleteItem={deleteFAQ} />
            <StillHaveQuestions />
          </>
        );
      }}
    </PageCMSEditor>
  );
}
