type StatusBadgeProps = {
  status:
    | "active"
    | "inactive"
    | "at_risk"
    | "draft"
    | "archived"
    | "on_track"
    | "needs_attention";
};

const labelMap: Record<StatusBadgeProps["status"], string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  at_risk: "בסיכון",
  draft: "טיוטה",
  archived: "ארכיון",
  on_track: "במסלול",
  needs_attention: "דורש תשומת לב",
};

const classMap: Record<StatusBadgeProps["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-700",
  at_risk: "bg-amber-100 text-amber-800",
  draft: "bg-blue-100 text-blue-700",
  archived: "bg-zinc-200 text-zinc-700",
  on_track: "bg-emerald-100 text-emerald-700",
  needs_attention: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classMap[status]}`}
    >
      {labelMap[status]}
    </span>
  );
}
