"use client";
import Image from "next/image";
import img1 from "../../images/abouts-us/img1.webp";
import img2 from "../../images/abouts-us/img2.webp";
import img3 from "../../images/abouts-us/img3.webp";
import lemon from "../../images/abouts-us/lemon.webp";
import styles from "../../styles/about-us/OrangeSoul.module.css";
import { useTranslation } from "../../hooks/useTranslation";
import { usePageCMS } from "../../context/PageCMSContext";
import { useCurrency } from "../../context/CurrencyContext";

export default function OrangeSoul() {
  const t = useTranslation();
  const a = t.aboutUs;
  const { getContent, getStyle, cmsMode, selectedId, selectElement } = usePageCMS();
  const { language } = useCurrency();
  const isArabic = language === "Arabic";

  function ce(id: string, extra: React.CSSProperties = {}): React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties } {
    const base: React.CSSProperties = { ...getStyle(id), ...extra };
    if (!cmsMode) return { style: base };
    return {
      style: { ...base, cursor: "pointer", outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)", outlineOffset: "3px" },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectElement(id); },
    };
  }

  function imgOverlay(id: string) {
    if (!cmsMode) return null;
    return (
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 10, cursor: "pointer",
          outline: selectedId === id ? "2px solid #DB663B" : "1px dashed rgba(219,102,59,0.4)",
          outlineOffset: "-2px",
        }}
        onClick={(e) => { e.stopPropagation(); selectElement(id); }}
        title="Click to change image"
      />
    );
  }

  const url1 = getContent("about-soul-img1", "");
  const url2 = getContent("about-soul-img2", "");
  const url3 = getContent("about-soul-img3", "");
  const urlLemon = getContent("about-soul-lemon", "");

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.collage}>
          <div className={styles.img1Wrap}>
            {url1
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={url1} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              : <Image src={img1} alt="" fill className={styles.img} sizes="185px" />}
            {imgOverlay("about-soul-img1")}
          </div>
          <div className={styles.img2Wrap}>
            {url2
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={url2} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              : <Image src={img2} alt="" fill className={styles.img} sizes="175px" />}
            {imgOverlay("about-soul-img2")}
          </div>
          <div className={styles.img3Wrap}>
            {url3
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={url3} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              : <Image src={img3} alt="" fill className={styles.img} sizes="145px" />}
            {imgOverlay("about-soul-img3")}
          </div>
          <div className={styles.lemonWrap}>
            {urlLemon
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={urlLemon} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              : <Image src={lemon} alt="" fill className={styles.lemonImg} sizes="90px" />}
            {imgOverlay("about-soul-lemon")}
          </div>
        </div>

        <div className={styles.textCol}>
          <p className={styles.para} {...ce("about-soul-para1")}>{getContent("about-soul-para1", a.soulPara1)}</p>
          <p className={styles.para} {...ce("about-soul-para2")}>{getContent("about-soul-para2", a.soulPara2)}</p>
          <p className={styles.para} {...ce("about-soul-para3")}>
            {getContent("about-soul-para3", a.soulPara3)}
            <strong
              {...ce("about-soul-para3-bold")}
              style={{ ...ce("about-soul-para3-bold").style, ...(isArabic ? { display: "block" } : {}) }}
            >
              {getContent("about-soul-para3-bold", a.soulPara3Bold)}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}
