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
  { label: "×”×›×•×œ", value: "all" },
  { label: "×¤×¢×™×œ", value: "active" },
  { label: "×˜×™×•×˜×”", value: "draft" },
  { label: "××¨×›×™×•×Ÿ", value: "archived" },
];

const goalTabs = [
  { label: "×›×œ ×”×ž×˜×¨×•×ª", value: "all" },
  { label: "×™×¨×™×“×” ×‘×©×•×ž×Ÿ", value: "fat_loss" },
  { label: "×¢×œ×™×™×” ×‘×ž×¡×”", value: "muscle_gain" },
  { label: "×©×ž×™×¨×”", value: "maintenance" },
];

const goalLabel: Record<NutritionPlan["goal"], string> = {
  fat_loss: "×™×¨×™×“×” ×‘×©×•×ž×Ÿ",
  muscle_gain: "×¢×œ×™×™×” ×‘×ž×¡×ª ×©×¨×™×¨",
  maintenance: "×©×ž×™×¨×” ×¢×œ ×ž×©×§×œ",
};

const statusLabel: Record<PlanStatus, string> = {
  active: "×¤×¢×™×œ",
  draft: "×˜×™×•×˜×”",
  archived: "××¨×›×™×•×Ÿ",
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
      setErrorMessage("×™×© ×œ×ž×œ× ×©× ×ª×•×›× ×™×ª.");
      setToast({ type: "error", message: "×œ× × ×™×ª×Ÿ ×œ×©×ž×•×¨: ×—×¡×¨ ×©× ×ª×•×›× ×™×ª." });
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
        setToast({ type: "success", message: "×ª×•×›× ×™×ª ×”×ª×–×•× ×” ×¢×•×“×›× ×” ×‘×”×¦×œ×—×”." });
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
        setToast({ type: "success", message: "×ª×•×›× ×™×ª ×”×ª×–×•× ×” × ×•×¦×¨×” ×‘×”×¦×œ×—×”." });
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
      setToast({ type: "success", message: "×ª×•×›× ×™×ª ×”×ª×–×•× ×” ×”×•×¢×‘×¨×” ×œ××¨×›×™×•×Ÿ." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setGoalFilter("all");
  }

  const columns: DataTableColumn<NutritionPlan>[] = [
    { key: "title", header: "×©× ×ª×•×›× ×™×ª", render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "goal", header: "×ž×˜×¨×”", render: (row) => goalLabel[row.goal] },
    { key: "calories", header: `×™×¢×“ ×§×§"×œ`, render: (row) => row.caloriesTarget },
    { key: "protein", header: "×™×¢×“ ×—×œ×‘×•×Ÿ", render: (row) => row.proteinTarget ? `${row.proteinTarget}×’` : "â€”" },
    { key: "meals", header: "××¨×•×—×•×ª/×™×•×", render: (row) => row.mealsPerDay ?? "â€”" },
    { key: "users", header: "×ž×©×ª×ž×©×™×", render: (row) => row.assignedUsers },
    { key: "updated", header: "×¢×•×“×›×Ÿ", render: (row) => row.updatedAt },
    { key: "status", header: "×¡×˜×˜×•×¡", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "×¤×¢×•×œ×•×ª",
      render: (row) =>
        canEdit ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ×¢×¨×™×›×”
            </button>
            {row.status !== "archived" && (
              <button
                type="button"
                onClick={() => setArchiveTargetId(row.id)}
                className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                ××¨×›×•×‘
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
                    setToast({ type: "success", message: "×”×ª×•×›× ×™×ª ×”×•×—×–×¨×” ×œ×˜×™×•×˜×”." });
                  })
                }
                className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                ×©×—×–×•×¨
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">××™×Ÿ ×”×¨×©××”</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "×“×©×‘×•×¨×“", href: "/" }, { label: "×ª×•×›× ×™×•×ª ×ª×–×•× ×”" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="× ×™×”×•×œ ×ª×•×›× ×™×•×ª ×ª×–×•× ×”" subtitle="×ª×¦×•×’×” ×•× ×™×”×•×œ ×©×œ ×ž×¡×’×¨×•×ª ×ª×–×•× ×” ×œ×ž×©×ª×ž×©×™×" />
        {canEdit && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + ×™×¦×™×¨×ª ×ª×•×›× ×™×ª
          </button>
        )}
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="×—×™×¤×•×© ×œ×¤×™ ×©× ×ª×•×›× ×™×ª" />
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
          emoji: "ðŸ¥—",
          title: "××™×Ÿ ×ª×•×›× ×™×•×ª ×ª×–×•× ×” ×œ×”×¦×’×”",
          description: "×œ× × ×ž×¦××• ×ª×•×›× ×™×•×ª ×œ×¤×™ ×”×ž×˜×¨×”, ×”×¡×˜×˜×•×¡ ××• ×”×—×™×¤×•×© ×©×‘×—×¨×ª.",
          actionLabel: "× ×™×§×•×™ ×¡×™× ×•× ×™×",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      {/* ×ž×•×“×œ ×™×¦×™×¨×”/×¢×¨×™×›×” */}
      <AppModal
        isOpen={isModalOpen}
        title={editingPlanId ? "×¢×¨×™×›×ª ×ª×•×›× ×™×ª ×ª×–×•× ×”" : "×™×¦×™×¨×ª ×ª×•×›× ×™×ª ×ª×–×•× ×”"}
        subtitle="×©×™× ×•×™×™× × ×©×ž×¨×™× ×‘×–×™×›×¨×•×Ÿ ×‘×œ×‘×“"
        onClose={() => !isSaving && setIsModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ×‘×™×˜×•×œ
            </button>
            <button
              type="button"
              onClick={savePlan}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "×©×•×ž×¨..." : "×©×ž×™×¨×”"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {/* ×©× ×ª×•×›× ×™×ª */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×©× ×ª×•×›× ×™×ª *</span>
            <input
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×œ×“×•×’×ž×”: ×™×¨×™×“×” ×‘××—×•×– ×©×•×ž×Ÿ 1800 ×§×§×´×œ"
            />
          </label>

          {/* ×ž×˜×¨×” */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×ž×˜×¨×”</span>
            <select
              value={formState.goal}
              onChange={(e) => setFormState((prev) => ({ ...prev, goal: e.target.value as NutritionPlan["goal"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="fat_loss">×™×¨×™×“×” ×‘×©×•×ž×Ÿ</option>
              <option value="muscle_gain">×¢×œ×™×™×” ×‘×ž×¡×ª ×©×¨×™×¨</option>
              <option value="maintenance">×©×ž×™×¨×” ×¢×œ ×ž×©×§×œ</option>
            </select>
          </label>

          {/* ×¡×˜×˜×•×¡ */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×¡×˜×˜×•×¡</span>
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

          {/* ×§×œ×•×¨×™×•×ª ×™×¢×“ */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×§×œ×•×¨×™×•×ª ×™×¢×“</span>
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

          {/* ×—×œ×‘×•×Ÿ ×™×¢×“ */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×—×œ×‘×•×Ÿ ×™×¢×“ (×’×¨×)</span>
            <input
              type="number"
              value={formState.proteinTarget}
              onChange={(e) => setFormState((prev) => ({ ...prev, proteinTarget: Number(e.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>

          {/* ×ž×¡×¤×¨ ××¨×•×—×•×ª ×‘×™×•× */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">××¨×•×—×•×ª ×‘×™×•×</span>
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

          {/* ×”×ª××ž×•×ª ×ª×–×•× ×” */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×”×ª××ž×•×ª ×ª×–×•× ×”</span>
            <input
              value={formState.dietaryNotes}
              onChange={(e) => setFormState((prev) => ({ ...prev, dietaryNotes: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×œ×“×•×’×ž×”: ×œ×œ× ×’×œ×•×˜×Ÿ, ×˜×‘×¢×•× ×™, ×›×©×¨"
            />
          </label>

          {/* ×ª×™××•×¨ */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×ª×™××•×¨</span>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×ª×™××•×¨ ×›×œ×œ×™ ×©×œ ×”×ª×•×›× ×™×ª, ×ž×” ×›×•×œ×œ×ª ×•×œ×ž×™ ×ž×ª××™×ž×”"
            />
          </label>
        </div>
        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
      </AppModal>

      {/* ×“×™××œ×•×’ ××¨×›×•×‘ */}
      <ConfirmDialog
        isOpen={Boolean(archiveTargetId)}
        title="××¨×›×•×‘ ×ª×•×›× ×™×ª ×ª×–×•× ×”"
        message="×”×× ×œ××¨×›×‘ ××ª ×ª×•×›× ×™×ª ×”×ª×–×•× ×”? ×”×¡×˜×˜×•×¡ ×™×©×ª× ×” ×œ××¨×›×™×•×Ÿ. × ×™×ª×Ÿ ×œ×©×—×–×¨ ×‘×”×ž×©×š."
        confirmLabel="××¨×›×•×‘"
        variant="danger"
        isLoading={isArchiving}
        onCancel={() => setArchiveTargetId(null)}
        onConfirm={confirmArchive}
      />

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
