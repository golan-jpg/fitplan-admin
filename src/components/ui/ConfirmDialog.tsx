"use client";

import { AppModal } from "@/components/ui/AppModal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  isLoading = false,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmClass =
    variant === "danger"
      ? "rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300"
      : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400";

  return (
    <AppModal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmClass}
          >
            {isLoading ? "שומר..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-700">{message}</p>
    </AppModal>
  );
}
