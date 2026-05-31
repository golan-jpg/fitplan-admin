"use client";

import { KpiCard } from "@/components/ui/KpiCard";
import { PageTitle } from "@/components/ui/PageTitle";
import { KpiCardSkeleton } from "@/components/ui/Skeletons";
import { useAnalytics } from "@/hooks/useAnalytics";

const monthlyActivity = [
  { month: "ינו", value: 64 },
  { month: "פבר", value: 68 },
  { month: "מרץ", value: 71 },
  { month: "אפר", value: 75 },
  { month: "מאי", value: 82 },
];

export default function AnalyticsPage() {
  const { analyticsSummary, isLoading } = useAnalytics();

  return (
    <div className="space-y-6">
      <PageTitle title="אנליטיקות בסיסיות" subtitle="מדדים מרכזיים, מגמות חודשיות ויעילות תוכניות" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">מגמת עמידה חודשית (%)</h2>
        <div className="space-y-3">
          {monthlyActivity.map((item) => (
            <div key={item.month} className="grid grid-cols-[70px_1fr_48px] items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">{item.month}</span>
              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-slate-900"
                  style={{ width: `${item.value}%` }}
                  aria-hidden
                />
              </div>
              <span className="text-sm text-slate-600">{item.value}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">התפלגות תוכניות</h3>
          <p className="mt-2 text-sm text-slate-600">אימון: 57% · תזונה: 43%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">שימור משתמשים</h3>
          <p className="mt-2 text-sm text-slate-600">87% משתמשים פעילים גם אחרי 30 יום</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">זיהוי סיכון מוקדם</h3>
          <p className="mt-2 text-sm text-slate-600">14 משתמשים סומנו ליצירת קשר עם מאמן</p>
        </article>
      </section>
    </div>
  );
}
