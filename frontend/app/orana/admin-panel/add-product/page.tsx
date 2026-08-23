"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../../styles/admin/AddProduct.module.css";
import { adminFetch } from "../../../lib/adminFetch";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [washCare, setWashCare] = useState("");
  const [washCareAr, setWashCareAr] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removePreview(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("nameAr", nameAr);
    formData.append("description", description);
    formData.append("descriptionAr", descriptionAr);
    formData.append("washCare", washCare);
    formData.append("washCareAr", washCareAr);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("showOnHomepage", String(showOnHomepage));
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save product");
      }
      setStatus("success");
      setMessage("Product saved successfully!");
      setName(""); setNameAr("");
      setDescription(""); setDescriptionAr("");
      setWashCare(""); setWashCareAr("");
      setPrice("");
      setStock("");
      setShowOnHomepage(false);
      setImageFiles([]);
      setPreviews([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add Product</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {status === "success" && <div className={styles.success}>{message}</div>}
        {status === "error"   && <div className={styles.error}>{message}</div>}

        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Product Name</label>
          <input
            id="name"
            className={styles.input}
            type="text"
            placeholder="e.g. Blue Jilabiya"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            placeholder="Describe the product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Wash Care */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="washCare">Wash Care</label>
          <textarea
            id="washCare"
            className={styles.textarea}
            placeholder="e.g. Hand wash cold, do not bleach..."
            value={washCare}
            onChange={(e) => setWashCare(e.target.value)}
            rows={3}
          />
        </div>

        {/* ── Arabic Version ── */}
        <div className={styles.langDivider}>
          <span className={styles.langDividerLabel}>Arabic Version (النسخة العربية)</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="nameAr">Product Name (Arabic)</label>
          <input
            id="nameAr"
            className={styles.input}
            dir="rtl"
            type="text"
            placeholder="اسم المنتج بالعربية"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="descriptionAr">Description (Arabic)</label>
          <textarea
            id="descriptionAr"
            className={styles.textarea}
            dir="rtl"
            placeholder="الوصف بالعربية..."
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            rows={4}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="washCareAr">Wash Care (Arabic)</label>
          <textarea
            id="washCareAr"
            className={styles.textarea}
            dir="rtl"
            placeholder="تعليمات العناية بالعربية..."
            value={washCareAr}
            onChange={(e) => setWashCareAr(e.target.value)}
            rows={3}
          />
        </div>

        {/* Price */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">Price (Dhs.)</label>
          <div className={styles.priceRow}>
            <span className={styles.currencyTag}>Dhs.</span>
            <input
              id="price"
              className={styles.priceInput}
              type="number"
              placeholder="600"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Stock */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="stock">
            Stock <span className={styles.hint}>(leave empty for unlimited)</span>
          </label>
          <input
            id="stock"
            className={styles.input}
            type="number"
            placeholder="e.g. 50"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            step="1"
          />
        </div>

        {/* Images */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="images">
            Product Images <span className={styles.hint}>(select as many as you want)</span>
          </label>
          <input
            id="images"
            ref={fileRef}
            className={styles.input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
          />
          {previews.length > 0 && (
            <div className={styles.previewGrid}>
              {previews.map((src, i) => (
                <div key={i} className={styles.previewItem}>
                  <Image
                    src={src}
                    alt={`Preview ${i + 1}`}
                    width={80}
                    height={100}
                    className={styles.previewImg}
                    unoptimized
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removePreview(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show on Homepage */}
        <div>
          <div className={styles.checkRow}>
            <input
              id="homepage"
              type="checkbox"
              className={styles.checkbox}
              checked={showOnHomepage}
              onChange={(e) => setShowOnHomepage(e.target.checked)}
            />
            <label htmlFor="homepage" className={styles.checkLabel}>
              Show on Homepage
            </label>
          </div>
          <p className={styles.checkHint}>
            When checked, this product will appear in the Collection section on the homepage.
          </p>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
