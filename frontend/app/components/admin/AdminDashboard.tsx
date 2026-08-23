"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/admin/AdminPanel.module.css";
import ConfirmModal from "./ConfirmModal";
import { adminFetch } from "../../lib/adminFetch";

interface ProductImage {
  url: string;
  publicId: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  showOnHomepage: boolean;
  stock: number | null;
}

interface Props {
  initialProducts?: Product[];
}

export default function AdminDashboard({ initialProducts = [] }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function confirmDelete() {
    if (!confirmId) return;
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p._id !== confirmId));
    } catch {
      /* silent */
    } finally {
      setConfirmId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <Link href="/orana/admin-panel/add-product" className={styles.addBtn}>
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>No products yet. Add your first product.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Homepage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const thumb = p.images?.[0]?.url ?? null;
                  const stockLabel = p.stock === null || p.stock === undefined ? "Unlimited" : String(p.stock);
                  const stockStyle = p.stock === 0 ? { color: "#c62828", fontWeight: 700 } : {};
                  return (
                    <tr key={p._id}>
                      <td>
                        {thumb ? (
                          <Image src={thumb} alt={p.name} width={48} height={60} className={styles.thumb} />
                        ) : "—"}
                      </td>
                      <td>{p.name}</td>
                      <td>Dhs. {p.price}</td>
                      <td style={stockStyle}>{stockLabel}</td>
                      <td>
                        <span className={p.showOnHomepage ? styles.badgeYes : styles.badgeNo}>
                          {p.showOnHomepage ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <Link href={`/orana/admin-panel/edit-product/${p._id}`} className={styles.editBtn}>
                          Edit
                        </Link>
                        <button className={styles.deleteRowBtn} onClick={() => setConfirmId(p._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card grid (2 per row) */}
          <div className={styles.mobileGrid}>
            {products.map((p) => {
              const thumb = p.images?.[0]?.url ?? null;
              return (
                <div key={p._id} className={styles.mobileCard}>
                  <div className={styles.mobileCardImg}>
                    {thumb ? (
                      <Image src={thumb} alt={p.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div className={styles.mobileCardNoImg}>—</div>
                    )}
                    {p.showOnHomepage && (
                      <span className={styles.mobileCardBadge}>Homepage</span>
                    )}
                  </div>
                  <div className={styles.mobileCardBody}>
                    <p className={styles.mobileCardName}>{p.name}</p>
                    <p className={styles.mobileCardPrice}>Dhs. {p.price}</p>
                    <p className={styles.mobileCardPrice} style={p.stock === 0 ? { color: "#c62828", fontWeight: 700 } : { color: "#aaa" }}>
                      {p.stock === null || p.stock === undefined ? "∞ stock" : `Stock: ${p.stock}`}
                    </p>
                    <div className={styles.mobileCardActions}>
                      <Link href={`/orana/admin-panel/edit-product/${p._id}`} className={styles.editBtn}>
                        Edit
                      </Link>
                      <button className={styles.deleteRowBtn} onClick={() => setConfirmId(p._id)}>
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {confirmId && (
        <ConfirmModal
          title="Delete Product"
          message="Are you sure you want to delete this product? All images will also be permanently removed. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
