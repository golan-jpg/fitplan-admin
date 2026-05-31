"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { WorkoutPlan } from "@/types";

const tabs = [
  { label: "הכול", value: "all" },
  { label: "פעיל", value: "active" },
  { label: "טיוטה", value: "draft" },
  { label: "ארכיון", value: "archived" },
];

const typeTabs = [
  { label: "הכול", value: "all" },
  { label: "אימון", value: "workout" },
  { label: "תזונה", value: "nutrition" },
];

const levelTabs = [
  { label: "כל הרמות", value: "all" },
  { label: "מתחילים", value: "beginner" },
  { label: "בינוני", value: "intermediate" },
  { label: "מתקדם", value: "advanced" },
];

const levelLabel: Record<WorkoutPlan["level"], string> = {
  beginner: "מתחילים",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

export default function WorkoutPlansPage() {
  const {
    workoutPlans,
    isLoading: isWorkoutPlansLoading,
    error,
    updateWorkoutPlanStatus,
  } = useWorkoutPlans();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const rows = useMemo(() => {
    return workoutPlans.filter((plan) => {
      const statusMatch = statusFilter === "all" || plan.status === statusFilter;
      const typeMatch = typeFilter === "all" || typeFilter === "workout";
      const levelMatch = levelFilter === "all" || plan.level === levelFilter;
      const searchMatch =
        searchTerm.trim().length === 0 ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        levelLabel[plan.level].includes(searchTerm);
      return statusMatch && typeMatch && levelMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, typeFilter, levelFilter, workoutPlans]);

  function getNextStatus(status: WorkoutPlan["status"]): WorkoutPlan["status"] {
    if (status === "active") {
      return "archived";
    }

    if (status === "archived") {
      return "draft";
    }

    return "active";
  }

  function confirmStatusChange() {
    if (!pendingPlanId) {
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      const currentPlan = workoutPlans.find((plan) => plan.id === pendingPlanId);
      if (currentPlan) {
        await updateWorkoutPlanStatus(pendingPlanId, getNextStatus(currentPlan.status));
      }
      setPendingPlanId(null);
      setIsSaving(false);
      setToast({ type: "success", message: "סטטוס התוכנית עודכן בהצלחה." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setLevelFilter("all");
  }

  const columns: DataTableColumn<WorkoutPlan>[] = [
    { key: "title", header: "שם תוכנית", render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "level", header: "רמה", render: (row) => levelLabel[row.level] },
    { key: "users", header: "משתמשים משויכים", render: (row) => row.assignedUsers },
    { key: "duration", header: "משך", render: (row) => `${row.durationWeeks} שבועות` },
    { key: "updated", header: "עודכן בתאריך", render: (row) => row.updatedAt },
    { key: "status", header: "סטטוס", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "פעולה",
      render: (row) => (
        <button
          type="button"
          onClick={() => setPendingPlanId(row.id)}
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          שינוי סטטוס
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "תוכניות אימון" }]} />
      <PageTitle title="ניהול תוכניות אימון" subtitle="חיפוש, סינון וניהול קטלוג תוכניות אימון" />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם תוכנית" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs tabs={tabs} activeValue={statusFilter} onChange={setStatusFilter} />
          <FilterTabs tabs={typeTabs} activeValue={typeFilter} onChange={setTypeFilter} />
          <FilterTabs tabs={levelTabs} activeValue={levelFilter} onChange={setLevelFilter} />
        </div>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isWorkoutPlansLoading}
        emptyState={{
          emoji: "🏋️",
          title: "אין תוכניות אימון להצגה",
          description: "לא נמצאו תוכניות שעומדות בקריטריונים שנבחרו.",
          actionLabel: "ניקוי סינונים",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      <ConfirmDialog
        isOpen={Boolean(pendingPlanId)}
        title="שינוי סטטוס תוכנית"
        message="הסטטוס יעודכן למחזור הדמו הבא (פעיל/ארכיון/טיוטה). האם לאשר שינוי?"
        confirmLabel="עדכון סטטוס"
        isLoading={isSaving}
        onCancel={() => setPendingPlanId(null)}
        onConfirm={confirmStatusChange}
      />

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
