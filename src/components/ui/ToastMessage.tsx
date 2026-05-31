"use client";

type ToastType = "success" | "error";

type ToastMessageProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

export function ToastMessage({ message, type, onClose }: ToastMessageProps) {
  const toneClass =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <div className={`fixed bottom-5 left-5 z-50 min-w-[280px] rounded-xl border px-4 py-3 shadow-lg ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-current px-2 py-1 text-xs font-semibold opacity-80 hover:opacity-100"
        >
          סגור
        </button>
      </div>
    </div>
  );
}
