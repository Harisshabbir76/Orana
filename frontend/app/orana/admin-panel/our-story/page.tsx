"use client";

import translations from "../../../translations";
import PageCMSEditor from "../../../components/admin/PageCMSEditor";
import AboutHero from "../../../components/about-us/HeroSection";
import Born from "../../../components/about-us/Born";
import DesignedForWoman from "../../../components/about-us/DesignedForWoman";
import AboutMarquee from "../../../components/about-us/AboutMarquee";
import OrangeSoul from "../../../components/about-us/OrangeSoul";

const IMAGE_IDS = new Set([
  "about-hero-image", "about-born-image", "about-collage-image", "about-designed-image",
  "about-soul-img1", "about-soul-img2", "about-soul-img3", "about-soul-lemon",
]);

const ELEMENT_LABELS: Record<string, string> = {
  "about-hero-image":        "Hero — Background Image",
  "about-hero-heading":      "Hero — Heading",
  "about-born-image":        "Born — Image",
  "about-born-heading":      "Born — Heading",
  "about-born-para1":        "Born — Paragraph 1",
  "about-born-para2":        "Born — Paragraph 2",
  "about-born-para3":        "Born — Paragraph 3",
  "about-born-para4":        "Born — Paragraph 4",
  "about-collage-image":     "Crafted — Collage Image",
  "about-crafted-heading":   "Crafted — Heading",
  "about-crafted-para1":     "Crafted — Paragraph 1",
  "about-crafted-para2":     "Crafted — Paragraph 2",
  "about-crafted-para-bold": "Crafted — Bold Paragraph",
  "about-designed-image":    "Designed — Image",
  "about-designed-heading":  "Designed — Heading",
  "about-designed-bold":     "Designed — Bold Line",
  "about-designed-para1":    "Designed — Paragraph 1",
  "about-designed-para2":    "Designed — Paragraph 2",
  "about-designed-para3":    "Designed — Paragraph 3",
  "about-designed-para4":    "Designed — Paragraph 4",
  "about-marquee-text":      "Marquee — Text",
  "about-soul-img1":         "Soul — Image 1 (left)",
  "about-soul-img2":         "Soul — Image 2 (center)",
  "about-soul-img3":         "Soul — Image 3 (right)",
  "about-soul-lemon":        "Soul — Orange/Lemon Icon",
  "about-soul-para1":        "Soul — Paragraph 1",
  "about-soul-para2":        "Soul — Paragraph 2",
  "about-soul-para3":        "Soul — Paragraph 3",
  "about-soul-para3-bold":   "Soul — Bold Ending",
};

const en = translations.English.aboutUs;
const ar = translations.Arabic.aboutUs;

const DEFAULTS: Record<string, string> = {
  "about-hero-heading":      en.heroHeading,
  "about-born-heading":      en.bornHeading,
  "about-born-para1":        en.bornPara1,
  "about-born-para2":        en.bornPara2,
  "about-born-para3":        en.bornPara3,
  "about-born-para4":        en.bornPara4,
  "about-crafted-heading":   en.craftedHeading,
  "about-crafted-para1":     en.craftedPara1,
  "about-crafted-para2":     en.craftedPara2,
  "about-crafted-para-bold": en.craftedParaBold,
  "about-designed-heading":  en.designedHeading,
  "about-designed-bold":     en.designedBold,
  "about-designed-para1":    en.designedPara1,
  "about-designed-para2":    en.designedPara2,
  "about-designed-para3":    en.designedPara3,
  "about-designed-para4":    en.designedPara4,
  "about-marquee-text":      en.marqueeText,
  "about-soul-para1":        en.soulPara1,
  "about-soul-para2":        en.soulPara2,
  "about-soul-para3":        en.soulPara3,
  "about-soul-para3-bold":   en.soulPara3Bold,
};

const AR_DEFAULTS: Record<string, string> = {
  "about-hero-heading":      ar.heroHeading,
  "about-born-heading":      ar.bornHeading,
  "about-born-para1":        ar.bornPara1,
  "about-born-para2":        ar.bornPara2,
  "about-born-para3":        ar.bornPara3,
  "about-born-para4":        ar.bornPara4,
  "about-crafted-heading":   ar.craftedHeading,
  "about-crafted-para1":     ar.craftedPara1,
  "about-crafted-para2":     ar.craftedPara2,
  "about-crafted-para-bold": ar.craftedParaBold,
  "about-designed-heading":  ar.designedHeading,
  "about-designed-bold":     ar.designedBold,
  "about-designed-para1":    ar.designedPara1,
  "about-designed-para2":    ar.designedPara2,
  "about-designed-para3":    ar.designedPara3,
  "about-designed-para4":    ar.designedPara4,
  "about-marquee-text":      ar.marqueeText,
  "about-soul-para1":        ar.soulPara1,
  "about-soul-para2":        ar.soulPara2,
  "about-soul-para3":        ar.soulPara3,
  "about-soul-para3-bold":   ar.soulPara3Bold,
};

export default function OurStoryCMSPage() {
  return (
    <PageCMSEditor
      page="about"
      elementLabels={ELEMENT_LABELS}
      imageIds={IMAGE_IDS}
      defaults={DEFAULTS}
      arDefaults={AR_DEFAULTS}
    >
      {() => (
        <>
          <AboutHero />
          <Born />
          <DesignedForWoman />
          <AboutMarquee />
          <OrangeSoul />
        </>
      )}
    </PageCMSEditor>
  );
}
