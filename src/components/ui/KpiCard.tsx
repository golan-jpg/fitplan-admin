import { Trend } from "@/types";

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
};

export function KpiCard({ label, value, delta, trend }: KpiCardProps) {
  const deltaClass = trend === "up" ? "text-emerald-600" : "text-rose-600";
  const trendLabel = trend === "up" ? "מגמת עלייה" : "מגמת ירידה";

  return (
    <article className="flex min-h-[152px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold leading-none text-slate-900">{value}</p>
      <p className={`mt-4 text-sm font-semibold ${deltaClass}`}>
        {delta} · {trendLabel}
      </p>
    </article>
  );
}
