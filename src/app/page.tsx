"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiCard } from "@/components/ui/KpiCard";
import { PageTitle } from "@/components/ui/PageTitle";
import { KpiCardSkeleton } from "@/components/ui/Skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProgressReports } from "@/hooks/useProgressReports";
import { useUsers } from "@/hooks/useUsers";

export default function Home() {
  const { users, isLoading: isUsersLoading } = useUsers();
  const { progressReports, isLoading: isProgressLoading } = useProgressReports();
  const { analyticsSummary, isLoading: isAnalyticsLoading } = useAnalytics();
  const [quickAction, setQuickAction] = useState<"add_user" | "create_workout" | "create_nutrition" | "at_risk" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionInput, setActionInput] = useState("");

  const atRiskUsers = useMemo(() => users.filter((user) => user.status === "at_risk").length, [users]);

  function closeQuickAction() {
    if (isSaving) {
      return;
    }

    setQuickAction(null);
    setActionInput("");
  }

  function runQuickAction() {
    if ((quickAction === "add_user" || quickAction === "create_workout" || quickAction === "create_nutrition") && !actionInput.trim()) {
      setToast({ type: "error", message: "יש למלא את שדה החובה לפני אישור הפעולה." });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setQuickAction(null);
      setActionInput("");

      if (quickAction === "add_user") {
        setToast({ type: "success", message: "משתמש חדש נוסף בהצלחה (דמו)." });
        return;
      }

      if (quickAction === "create_workout") {
        setToast({ type: "success", message: "תוכנית אימון נוצרה בהצלחה (דמו)." });
        return;
      }

      if (quickAction === "create_nutrition") {
        setToast({ type: "success", message: "תפריט תזונה נוצר בהצלחה (דמו)." });
        return;
      }

      setToast({ type: "success", message: `נמצאו ${atRiskUsers} משתמשים בסיכון.` });
    }, 700);
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="סקירה כללית"
        subtitle="תמונת מצב עדכנית של משתמשים, תוכניות ועמידה ביעדים"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isAnalyticsLoading
          ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
          : analyticsSummary.map((item) => (
              <KpiCard
                key={item.id}
                label={item.label}
                value={item.value}
                delta={item.delta}
                trend={item.trend}
              />
            ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">משתמשים אחרונים</h2>
            <Link href="/users" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              מעבר לניהול משתמשים
            </Link>
          </div>
          {isUsersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl border border-slate-100 bg-slate-100" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              emoji="👤"
              title="עדיין אין משתמשים להצגה"
              description="ניתן להוסיף משתמש ראשון מתוך פעולות מהירות כדי להתחיל דמו מלא."
              actionLabel="הוספת משתמש דמו"
              onAction={() => setQuickAction("add_user")}
            />
          ) : (
            <div className="space-y-3">
              {users.slice(0, 4).map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">מעקב התקדמות שבועי</h2>
            <Link href="/progress" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              דוחות מלאים
            </Link>
          </div>
          {isProgressLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl border border-slate-100 bg-slate-100" />
              ))}
            </div>
          ) : progressReports.length === 0 ? (
            <EmptyState
              emoji="📉"
              title="אין דוחות התקדמות זמינים"
              description="ברגע שיצטברו דוחות שבועיים, הם יוצגו כאן בצורה מרוכזת."
            />
          ) : (
            <div className="space-y-3">
              {progressReports.map((report) => (
                <div key={report.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{report.userName}</p>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-sm text-slate-600">
                    אימונים: {report.workoutsCompleted}/{report.workoutsPlanned} · עמידה תזונתית: {report.nutritionAdherence}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">פעולות מהירות</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setQuickAction("add_user")}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            הוספת משתמש
          </button>
          <button
            type="button"
            onClick={() => setQuickAction("create_workout")}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            יצירת תוכנית אימון
          </button>
          <button
            type="button"
            onClick={() => setQuickAction("create_nutrition")}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            יצירת תפריט תזונה
          </button>
          <button
            type="button"
            onClick={() => setQuickAction("at_risk")}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            צפייה במשתמשים בסיכון
          </button>
        </div>
        <div className="mt-4 text-sm text-slate-600">
          קיצורים נוספים:
          <Link href="/users" className="mr-2 font-semibold text-slate-800 hover:text-slate-900">משתמשים</Link>
          <Link href="/workout-plans" className="mr-2 font-semibold text-slate-800 hover:text-slate-900">תוכניות אימון</Link>
          <Link href="/nutrition-plans" className="mr-2 font-semibold text-slate-800 hover:text-slate-900">תוכניות תזונה</Link>
        </div>
      </section>

      <AppModal
        isOpen={quickAction !== null}
        title={
          quickAction === "add_user"
            ? "הוספת משתמש מהירה"
            : quickAction === "create_workout"
              ? "יצירת תוכנית אימון מהירה"
              : quickAction === "create_nutrition"
                ? "יצירת תפריט תזונה מהיר"
                : "משתמשים בסיכון"
        }
        subtitle="פעולת דמו בלבד ללא שמירה בשרת"
        onClose={closeQuickAction}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeQuickAction}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={runQuickAction}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "שומר..." : "אישור"}
            </button>
          </div>
        }
      >
        {quickAction === "at_risk" ? (
          <p className="text-sm text-slate-700">
            כרגע יש <span className="font-bold">{atRiskUsers}</span> משתמשים במצב בסיכון.
          </p>
        ) : (
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">שם פעולה *</span>
            <input
              value={actionInput}
              onChange={(event) => setActionInput(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="לדוגמה: משתמש חדש / תוכנית 12 שבועות"
            />
          </label>
        )}
      </AppModal>

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
