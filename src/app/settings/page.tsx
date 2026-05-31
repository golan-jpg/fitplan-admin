"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui/PageTitle";

export default function SettingsPage() {
  const [dashboardLanguage, setDashboardLanguage] = useState("he");
  const [isRtlEnabled, setIsRtlEnabled] = useState(true);
  const [autoReports, setAutoReports] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setIsSaving(true);
    setMessage(null);

    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      setMessage("ההגדרות נשמרו מקומית (Mock בלבד).");
    }, 700);
  }

  return (
    <div className="space-y-6">
      <PageTitle title="הגדרות" subtitle="הגדרות מערכת לניהול לוח הבקרה" />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">תצוגה ושפה</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">שפת מערכת</span>
            <select
              value={dashboardLanguage}
              onChange={(event) => {
                setDashboardLanguage(event.target.value);
                setHasChanges(true);
                setMessage(null);
              }}
              disabled={isSaving}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="he">עברית</option>
              <option value="en">אנגלית</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isRtlEnabled}
              onChange={(event) => {
                setIsRtlEnabled(event.target.checked);
                setHasChanges(true);
                setMessage(null);
              }}
              disabled={isSaving}
            />
            כיוון ימין לשמאל מופעל
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">דיווחים והתראות</h2>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={autoReports}
            onChange={(event) => {
              setAutoReports(event.target.checked);
              setHasChanges(true);
              setMessage(null);
            }}
            disabled={isSaving}
          />
          יצירת דוח שבועי אוטומטי למאמנים
        </label>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSaving ? "שומר..." : "שמירת הגדרות"}
      </button>

      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
    </div>
  );
}
