"use client";

type EmptyStateProps = {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ emoji = "🔎", title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
