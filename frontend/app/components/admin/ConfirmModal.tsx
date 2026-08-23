"use client";

import styles from "../../styles/admin/ConfirmModal.module.css";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
