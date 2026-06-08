"use client";

import { useMemo } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditLogEntry, AuditLogEntityType } from "@/types";

const entityTypeLabel: Record<AuditLogEntityType, string> = {
  exercises: "תרגילים",
  workoutPlans: "תוכניות אימון",
  nutritionPlans: "תוכניות תזונה",
  recipes: "מתכונים",
  users: "משתמשים",
};

const actorRoleLabel: Record<AuditLogEntry["actorRole"], string> = {
  admin: "אדמין",
  coach: "מאמן",
  nutritionist: "תזונאי",
};

const ROLE_ENTITY_MAP: Record<"admin" | "coach" | "nutritionist", AuditLogEntityType[] | undefined> = {
  admin: undefined,
  coach: ["users", "exercises", "workoutPlans"],
  nutritionist: ["users", "recipes", "nutritionPlans"],
};

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AuditLogPage() {
  const { session } = useDemoAuth();

  const roleFilter = session ? ROLE_ENTITY_MAP[session.role] : undefined;

  const {
    filteredEntries,
    search,
    setSearch,
    entityTypeFilter,
    setEntityTypeFilter,
    severityFilter,
    setSeverityFilter,
    actorRoleFilter,
    setActorRoleFilter,
    clearFilters,
  } = useAuditLogs(roleFilter);

  const isFiltered =
    search.trim().length > 0 ||
    entityTypeFilter !== "all" ||
    severityFilter !== "all" ||
    actorRoleFilter !== "all";

  const availableEntityTypes = useMemo<AuditLogEntityType[]>(() => {
    if (roleFilter) return roleFilter;
    return ["exercises", "workoutPlans", "nutritionPlans", "recipes", "users"];
  }, [roleFilter]);

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "timestamp",
      header: "תאריך ושעה",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-slate-500">{formatTimestamp(row.timestamp)}</span>
      ),
    },
    {
      key: "actorName",
      header: "מבצע הפעולה",
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">{row.actorName}</p>
          <p className="text-xs text-slate-500">{actorRoleLabel[row.actorRole]}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "פעולה",
      render: (row) => (
        <span className="text-sm font-medium text-slate-700">{row.action}</span>
      ),
    },
    {
      key: "entityType",
      header: "סוג ישות",
      render: (row) => (
        <span className="text-sm text-slate-600">{entityTypeLabel[row.entityType]}</span>
      ),
    },
    {
      key: "entityName",
      header: "שם הישות",
      render: (row) => (
        <span className="text-sm font-semibold text-slate-800">{row.entityName}</span>
      ),
    },
    {
      key: "severity",
      header: "חומרה",
      render: (row) => <StatusBadge status={row.severity} />,
    },
    {
      key: "description",
      header: "תיאור",
      render: (row) => (
        <p className="max-w-[320px] truncate text-xs text-slate-600" title={row.description}>
          {row.description}
        </p>
      ),
    },
  ];

  return (
    <div className="min-w-0 space-y-5">
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "יומן פעולות" }]} />
      <PageTitle
        title="יומן פעולות"
        subtitle="רישום מלא של פעולות ניהול שבוצעו במערכת, לפי תפקיד ומועד ביצוע"
      />

      {/* פילטרים */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="w-full overflow-x-auto">
          <div className="flex min-w-0 flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="חיפוש לפי משתמש, פעולה או ישות"
          />

          {/* פילטר סוג ישות */}
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value as AuditLogEntityType | "all")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">כל הישויות</option>
            {availableEntityTypes.map((t) => (
              <option key={t} value={t}>
                {entityTypeLabel[t]}
              </option>
            ))}
          </select>

          {/* פילטר חומרה */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AuditLogEntry["severity"] | "all")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">כל החומרות</option>
            <option value="info">מידע</option>
            <option value="success">הצלחה</option>
            <option value="warning">אזהרה</option>
            <option value="danger">חמור</option>
          </select>

          {/* פילטר תפקיד */}
          <select
            value={actorRoleFilter}
            onChange={(e) => setActorRoleFilter(e.target.value as AuditLogEntry["actorRole"] | "all")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">כל התפקידים</option>
            <option value="admin">אדמין</option>
            <option value="coach">מאמן</option>
            <option value="nutritionist">תזונאי</option>
          </select>

          {/* ניקוי */}
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ניקוי סינון
            </button>
          )}
          </div>
        </div>
      </div>

      <DataTable
        rows={filteredEntries}
        columns={columns}
        isLoading={false}
        emptyState={{
          emoji: "📋",
          title: "לא נמצאו פעולות",
          description: isFiltered
            ? "אין פעולות שמתאימות לקריטריונים שבחרת. נסה לנקות את הסינון."
            : "לא בוצעו עדיין פעולות ניהול במערכת.",
          actionLabel: isFiltered ? "ניקוי סינון" : undefined,
          onAction: isFiltered ? clearFilters : undefined,
        }}
      />

      <p className="text-xs text-slate-400">
        סה&quot;כ {filteredEntries.length} פעולות מוצגות
      </p>
    </div>
  );
}
