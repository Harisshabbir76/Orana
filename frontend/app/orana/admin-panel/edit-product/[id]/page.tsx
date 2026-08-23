"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../../../../styles/admin/AddProduct.module.css";
import ConfirmModal from "../../../../components/admin/ConfirmModal";
import { adminFetch } from "../../../../lib/adminFetch";

interface ExistingImage {
  url: string;
  publicId: string;
}

export default function EditProduct() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [washCare, setWashCare] = useState("");
  const [washCareAr, setWashCareAr] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [pageReady, setPageReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setNameAr(data.nameAr ?? "");
        setDescription(data.description ?? "");
        setDescriptionAr(data.descriptionAr ?? "");
        setWashCare(data.washCare ?? "");
        setWashCareAr(data.washCareAr ?? "");
        setPrice(String(data.price ?? ""));
        setStock(data.stock !== null && data.stock !== undefined ? String(data.stock) : "");
        setShowOnHomepage(data.showOnHomepage ?? false);
        setExistingImages(data.images ?? []);
        setPageReady(true);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Failed to load product.");
        setPageReady(true);
      });
  }, [id]);

  function removeExisting(publicId: string) {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    setRemoveIds((prev) => [...prev, publicId]);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeNew(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const fd = new FormData();
    fd.append("name", name);
    fd.append("nameAr", nameAr);
    fd.append("description", description);
    fd.append("descriptionAr", descriptionAr);
    fd.append("washCare", washCare);
    fd.append("washCareAr", washCareAr);
    fd.append("price", price);
    fd.append("stock", stock);
    fd.append("showOnHomepage", String(showOnHomepage));
    removeIds.forEach((pid) => fd.append("removeImageIds", pid));
    newFiles.forEach((file) => fd.append("images", file));

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: "PUT",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setStatus("success");
      setMessage("Product updated successfully!");
      setRemoveIds([]);
      setNewFiles([]);
      setNewPreviews([]);
      setExistingImages(data.images ?? []);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete() {
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/orana/admin-panel");
    } catch {
      setDeleting(false);
    }
  }

  if (!pageReady) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Edit Product</h1>
        </div>
        <p style={{ color: "#aaa", fontFamily: "var(--font-body)", fontSize: "13px", paddingLeft: "2px" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/orana/admin-panel" className={styles.backBtn}>← Products</Link>
        <h1 className={styles.title}>Edit Product</h1>
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
          <label className={styles.label}>
            Images <span className={styles.hint}>(remove existing or add new ones)</span>
          </label>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <>
              <p className={styles.imagesSectionLabel}>Current images — click ✕ to remove</p>
              <div className={styles.previewGrid}>
                {existingImages.map((img) => (
                  <div key={img.publicId} className={styles.previewItem}>
                    <Image
                      src={img.url}
                      alt="Product image"
                      width={80}
                      height={100}
                      className={styles.previewImg}
                    />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeExisting(img.publicId)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Add new images */}
          <p className={styles.imagesSectionLabel} style={{ marginTop: existingImages.length > 0 ? "14px" : "0" }}>
            Add new images
          </p>
          <input
            ref={fileRef}
            className={styles.input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
          />
          {newPreviews.length > 0 && (
            <div className={styles.previewGrid}>
              {newPreviews.map((src, i) => (
                <div key={i} className={styles.previewItem}>
                  <Image
                    src={src}
                    alt={`New image ${i + 1}`}
                    width={80}
                    height={100}
                    className={styles.previewImg}
                    unoptimized
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeNew(i)}
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

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Product"}
          </button>
        </div>
      </form>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Product"
          message="Are you sure you want to delete this product? All images will also be permanently removed. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
