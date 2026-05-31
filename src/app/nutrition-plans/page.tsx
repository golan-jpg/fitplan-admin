"use client";

import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { NutritionPlan } from "@/types";

const tabs = [
  { label: "הכול", value: "all" },
  { label: "פעיל", value: "active" },
  { label: "טיוטה", value: "draft" },
  { label: "ארכיון", value: "archived" },
];

const goalTabs = [
  { label: "כל המטרות", value: "all" },
  { label: "חיטוב", value: "cutting" },
  { label: "ירידה במשקל", value: "weight_loss" },
  { label: "עלייה במסת שריר", value: "muscle_gain" },
  { label: "שמירה", value: "maintenance" },
];

const typeTabs = [
  { label: "הכול", value: "all" },
  { label: "אימון", value: "workout" },
  { label: "תזונה", value: "nutrition" },
];

const goalLabel: Record<NutritionPlan["goal"], string> = {
  fat_loss: "ירידה בשומן",
  muscle_gain: "עלייה במסת שריר",
  maintenance: "שמירה על משקל",
};

export default function NutritionPlansPage() {
  const {
    nutritionPlans,
    isLoading: isNutritionPlansLoading,
    error,
    updateNutritionPlanStatus,
  } = useNutritionPlans();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const rows = useMemo(() => {
    return nutritionPlans.filter((plan) => {
      const statusMatch = statusFilter === "all" || plan.status === statusFilter;
      const goalMatch =
        goalFilter === "all" ||
        (goalFilter === "muscle_gain" && plan.goal === "muscle_gain") ||
        (goalFilter === "maintenance" && plan.goal === "maintenance") ||
        ((goalFilter === "cutting" || goalFilter === "weight_loss") && plan.goal === "fat_loss");
      const typeMatch = typeFilter === "all" || typeFilter === "nutrition";
      const searchMatch =
        searchTerm.trim().length === 0 ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goalLabel[plan.goal].includes(searchTerm);
      return statusMatch && goalMatch && typeMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, goalFilter, typeFilter, nutritionPlans]);

  function getNextStatus(status: NutritionPlan["status"]): NutritionPlan["status"] {
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
      const currentPlan = nutritionPlans.find((plan) => plan.id === pendingPlanId);
      if (currentPlan) {
        await updateNutritionPlanStatus(pendingPlanId, getNextStatus(currentPlan.status));
      }
      setPendingPlanId(null);
      setIsSaving(false);
      setToast({ type: "success", message: "סטטוס תוכנית התזונה עודכן." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setGoalFilter("all");
    setTypeFilter("all");
  }

  const columns: DataTableColumn<NutritionPlan>[] = [
    { key: "title", header: "שם תוכנית", render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "goal", header: "מטרה", render: (row) => goalLabel[row.goal] },
    { key: "calories", header: "יעד קלורי", render: (row) => `${row.caloriesTarget} קק"ל` },
    { key: "users", header: "משתמשים משויכים", render: (row) => row.assignedUsers },
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
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "תוכניות תזונה" }]} />
      <PageTitle title="ניהול תוכניות תזונה" subtitle="תצוגה וניהול של מסגרות תזונה למשתמשים" />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם תוכנית" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs tabs={tabs} activeValue={statusFilter} onChange={setStatusFilter} />
          <FilterTabs tabs={goalTabs} activeValue={goalFilter} onChange={setGoalFilter} />
          <FilterTabs tabs={typeTabs} activeValue={typeFilter} onChange={setTypeFilter} />
        </div>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isNutritionPlansLoading}
        emptyState={{
          emoji: "🥗",
          title: "אין תוכניות תזונה להצגה",
          description: "לא נמצאו תוכניות לפי המטרה, הסטטוס או החיפוש שבחרת.",
          actionLabel: "ניקוי סינונים",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      <ConfirmDialog
        isOpen={Boolean(pendingPlanId)}
        title="שינוי סטטוס תוכנית תזונה"
        message="האם לעדכן את סטטוס התוכנית? השינוי יוצג מיד בדשבורד (Mock)."
        confirmLabel="עדכון סטטוס"
        isLoading={isSaving}
        onCancel={() => setPendingPlanId(null)}
        onConfirm={confirmStatusChange}
      />

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
