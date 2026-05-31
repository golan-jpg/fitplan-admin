"use client";

import { ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function AppModal({ isOpen, title, subtitle, onClose, children, footer }: AppModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            סגירה
          </button>
        </header>

        <div className="p-5">{children}</div>

        {footer ? <footer className="border-t border-slate-200 p-5">{footer}</footer> : null}
      </div>
    </div>
  );
}
