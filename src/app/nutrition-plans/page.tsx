"use client";

import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { useAuditLogContext } from "@/context/AuditLogContext";
import { NutritionPlan, PlanStatus } from "@/types";

const statusTabs = [
  { label: "הכול", value: "all" },
  { label: "פעיל", value: "active" },
  { label: "טיוטה", value: "draft" },
  { label: "ארכיון", value: "archived" },
];

const goalTabs = [
  { label: "כל המטרות", value: "all" },
  { label: "ירידה בשומן", value: "fat_loss" },
  { label: "עלייה במסה", value: "muscle_gain" },
  { label: "שמירה", value: "maintenance" },
];

const goalLabel: Record<NutritionPlan["goal"], string> = {
  fat_loss: "ירידה בשומן",
  muscle_gain: "עלייה במסת שריר",
  maintenance: "שמירה על משקל",
};

const statusLabel: Record<PlanStatus, string> = {
  active: "פעיל",
  draft: "טיוטה",
  archived: "ארכיון",
};

type NutritionPlanFormState = {
  title: string;
  goal: NutritionPlan["goal"];
  status: PlanStatus;
  caloriesTarget: number;
  proteinTarget: number;
  mealsPerDay: number;
  dietaryNotes: string;
  description: string;
};

const EMPTY_PLAN: NutritionPlanFormState = {
  title: "",
  goal: "fat_loss",
  status: "draft",
  caloriesTarget: 2000,
  proteinTarget: 120,
  mealsPerDay: 4,
  dietaryNotes: "",
  description: "",
};

export default function NutritionPlansPage() {
  const { session } = useDemoAuth();
  const { addAuditLog } = useAuditLogContext();
  const canEdit = session?.role === "admin" || session?.role === "nutritionist";

  const {
    nutritionPlans,
    isLoading: isNutritionPlansLoading,
    error,
    createNutritionPlan,
    updateNutritionPlan,
    updateNutritionPlanStatus,
  } = useNutritionPlans();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<NutritionPlanFormState>(EMPTY_PLAN);
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const rows = useMemo(() => {
    return nutritionPlans.filter((plan) => {
      const statusMatch = statusFilter === "all" || plan.status === statusFilter;
      const goalMatch = goalFilter === "all" || plan.goal === goalFilter;
      const searchMatch =
        searchTerm.trim().length === 0 ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goalLabel[plan.goal].includes(searchTerm);
      return statusMatch && goalMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, goalFilter, nutritionPlans]);

  function openAddModal() {
    setEditingPlanId(null);
    setFormState(EMPTY_PLAN);
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(plan: NutritionPlan) {
    setEditingPlanId(plan.id);
    setFormState({
      title: plan.title,
      goal: plan.goal,
      status: plan.status,
      caloriesTarget: plan.caloriesTarget,
      proteinTarget: plan.proteinTarget ?? 120,
      mealsPerDay: plan.mealsPerDay ?? 4,
      dietaryNotes: plan.dietaryNotes ?? "",
      description: plan.description ?? "",
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function savePlan() {
    if (!formState.title.trim()) {
      setErrorMessage("יש למלא שם תכנית.");
      setToast({ type: "error", message: "לא ניתן לשמור: חסר שם תכנית." });
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      if (editingPlanId) {
        const previousPlan = nutritionPlans.find((plan) => plan.id === editingPlanId);
        const updated = await updateNutritionPlan(editingPlanId, formState);
        if (updated && session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "עריכת תכנית תזונה",
            entityType: "nutritionPlans",
            entityName: formState.title,
            entityId: editingPlanId,
            severity: "success",
            description: `עודכנה תכנית תזונה: ${formState.title}.`,
          });

          if (previousPlan && previousPlan.status !== formState.status) {
            addAuditLog({
              actorName: session.name,
              actorRole: session.role,
              action: "שינוי סטטוס תכנית תזונה",
              entityType: "nutritionPlans",
              entityName: formState.title,
              entityId: editingPlanId,
              severity: "warning",
              description: `סטטוס תכנית התזונה "${formState.title}" שונה מ-${statusLabel[previousPlan.status]} ל-${statusLabel[formState.status]}.`,
            });
          }
        }
        setToast({ type: "success", message: "תכנית התזונה עודכנה בהצלחה." });
      } else {
        const created = await createNutritionPlan(formState);
        if (session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "יצירת תכנית תזונה",
            entityType: "nutritionPlans",
            entityName: formState.title,
            entityId: created.id,
            severity: "success",
            description: `נוצרה תכנית תזונה חדשה: ${formState.title}.`,
          });
        }
        setToast({ type: "success", message: "תכנית התזונה נוצרה בהצלחה." });
      }

      setIsSaving(false);
      setIsModalOpen(false);
    }, 650);
  }

  function confirmArchive() {
    if (!archiveTargetId) return;
    setIsArchiving(true);
    const targetPlan = nutritionPlans.find((plan) => plan.id === archiveTargetId);

    setTimeout(async () => {
      await updateNutritionPlanStatus(archiveTargetId, "archived");
      if (session && targetPlan) {
        addAuditLog({
          actorName: session.name,
          actorRole: session.role,
          action: "ארכוב תכנית תזונה",
          entityType: "nutritionPlans",
          entityName: targetPlan.title,
          entityId: archiveTargetId,
          severity: "danger",
          description: `תכנית תזונה הועברה לארכיון: ${targetPlan.title}.`,
        });
      }
      setIsArchiving(false);
      setArchiveTargetId(null);
      setToast({ type: "success", message: "תכנית התזונה הועברה לארכיון." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setGoalFilter("all");
  }

  const columns: DataTableColumn<NutritionPlan>[] = [
    { key: "title", header: "שם תכנית", render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "goal", header: "מטרה", render: (row) => goalLabel[row.goal] },
    { key: "calories", header: 'יעד קק"ל', render: (row) => row.caloriesTarget },
    { key: "protein", header: "יעד חלבון", render: (row) => (row.proteinTarget ? `${row.proteinTarget}ג` : "—") },
    { key: "meals", header: "ארוחות/יום", render: (row) => row.mealsPerDay ?? "—" },
    { key: "users", header: "משתמשים", render: (row) => row.assignedUsers },
    { key: "updated", header: "עודכן", render: (row) => row.updatedAt },
    { key: "status", header: "סטטוס", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "פעולות",
      render: (row) =>
        canEdit ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              עריכה
            </button>
            {row.status !== "archived" && (
              <button
                type="button"
                onClick={() => setArchiveTargetId(row.id)}
                className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                ארכוב
              </button>
            )}
            {row.status === "archived" && (
              <button
                type="button"
                onClick={() =>
                  updateNutritionPlanStatus(row.id, "draft").then(() => {
                    if (session) {
                      addAuditLog({
                        actorName: session.name,
                        actorRole: session.role,
                        action: "שחזור תכנית תזונה",
                        entityType: "nutritionPlans",
                        entityName: row.title,
                        entityId: row.id,
                        severity: "success",
                        description: `תכנית תזונה שוחזרה מארכיון: ${row.title}.`,
                      });
                      addAuditLog({
                        actorName: session.name,
                        actorRole: session.role,
                        action: "שינוי סטטוס תכנית תזונה",
                        entityType: "nutritionPlans",
                        entityName: row.title,
                        entityId: row.id,
                        severity: "warning",
                        description: `סטטוס תכנית התזונה "${row.title}" שונה מארכיון לטיוטה.`,
                      });
                    }
                    setToast({ type: "success", message: "התכנית שוחזרה לטיוטה." });
                  })
                }
                className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                שחזור
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">אין הרשאה</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "תוכניות תזונה" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="ניהול תוכניות תזונה" subtitle="תצוגה וניהול של מסגרות תזונה למשתמשים" />
        {canEdit && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + יצירת תכנית
          </button>
        )}
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם תכנית" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs tabs={statusTabs} activeValue={statusFilter} onChange={setStatusFilter} />
          <FilterTabs tabs={goalTabs} activeValue={goalFilter} onChange={setGoalFilter} />
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

      <AppModal
        isOpen={isModalOpen}
        title={editingPlanId ? "עריכת תכנית תזונה" : "יצירת תכנית תזונה"}
        subtitle="שינויים נשמרים בזיכרון בלבד"
        onClose={() => !isSaving && setIsModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={savePlan}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "שומר..." : "שמירה"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">שם תכנית *</span>
            <input
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder='לדוגמה: ירידה באחוז שומן 1800 קק"ל'
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">מטרה</span>
            <select
              value={formState.goal}
              onChange={(e) => setFormState((prev) => ({ ...prev, goal: e.target.value as NutritionPlan["goal"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="fat_loss">ירידה בשומן</option>
              <option value="muscle_gain">עלייה במסת שריר</option>
              <option value="maintenance">שמירה על משקל</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">סטטוס</span>
            <select
              value={formState.status}
              onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value as PlanStatus }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              {(Object.keys(statusLabel) as PlanStatus[]).map((s) => (
                <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">קלוריות יעד</span>
            <input
              type="number"
              value={formState.caloriesTarget}
              onChange={(e) => setFormState((prev) => ({ ...prev, caloriesTarget: Number(e.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={500}
              max={6000}
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">חלבון יעד (גרם)</span>
            <input
              type="number"
              value={formState.proteinTarget}
              onChange={(e) => setFormState((prev) => ({ ...prev, proteinTarget: Number(e.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">ארוחות ביום</span>
            <input
              type="number"
              value={formState.mealsPerDay}
              onChange={(e) => setFormState((prev) => ({ ...prev, mealsPerDay: Number(e.target.value) || 1 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={1}
              max={10}
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">התאמות תזונה</span>
            <input
              value={formState.dietaryNotes}
              onChange={(e) => setFormState((prev) => ({ ...prev, dietaryNotes: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="לדוגמה: ללא גלוטן, טבעוני, כשר"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">תיאור</span>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="תיאור כללי של התכנית, מה כוללת ולמי מתאימה"
            />
          </label>
        </div>
        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(archiveTargetId)}
        title="ארכוב תכנית תזונה"
        message="האם לארכב את תכנית התזונה? הסטטוס ישתנה לארכיון. ניתן לשחזר בהמשך."
        confirmLabel="ארכוב"
        variant="danger"
        isLoading={isArchiving}
        onCancel={() => setArchiveTargetId(null)}
        onConfirm={confirmArchive}
      />

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
