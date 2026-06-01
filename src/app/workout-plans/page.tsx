"use client";

import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { PlanStatus, WorkoutPlan } from "@/types";

const statusTabs = [
  { label: "×”×›×•×œ", value: "all" },
  { label: "×¤×¢×™×œ", value: "active" },
  { label: "×˜×™×•×˜×”", value: "draft" },
  { label: "××¨×›×™×•×Ÿ", value: "archived" },
];

const levelTabs = [
  { label: "×›×œ ×”×¨×ž×•×ª", value: "all" },
  { label: "×ž×ª×—×™×œ×™×", value: "beginner" },
  { label: "×‘×™× ×•× ×™", value: "intermediate" },
  { label: "×ž×ª×§×“×", value: "advanced" },
];

const levelLabel: Record<WorkoutPlan["level"], string> = {
  beginner: "×ž×ª×—×™×œ×™×",
  intermediate: "×‘×™× ×•× ×™",
  advanced: "×ž×ª×§×“×",
};

const statusLabel: Record<PlanStatus, string> = {
  active: "×¤×¢×™×œ",
  draft: "×˜×™×•×˜×”",
  archived: "××¨×›×™×•×Ÿ",
};

type WorkoutPlanFormState = {
  title: string;
  level: WorkoutPlan["level"];
  status: PlanStatus;
  durationWeeks: number;
  planGoal: string;
  workoutsPerWeek: number;
  description: string;
};

const EMPTY_PLAN: WorkoutPlanFormState = {
  title: "",
  level: "beginner",
  status: "draft",
  durationWeeks: 8,
  planGoal: "",
  workoutsPerWeek: 3,
  description: "",
};

export default function WorkoutPlansPage() {
  const { session } = useDemoAuth();
  const canEdit = session?.role === "admin" || session?.role === "coach";

  const {
    workoutPlans,
    isLoading: isWorkoutPlansLoading,
    error,
    createWorkoutPlan,
    updateWorkoutPlan,
    updateWorkoutPlanStatus,
  } = useWorkoutPlans();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<WorkoutPlanFormState>(EMPTY_PLAN);

  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const rows = useMemo(() => {
    return workoutPlans.filter((plan) => {
      const statusMatch = statusFilter === "all" || plan.status === statusFilter;
      const levelMatch = levelFilter === "all" || plan.level === levelFilter;
      const searchMatch =
        searchTerm.trim().length === 0 ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        levelLabel[plan.level].includes(searchTerm);
      return statusMatch && levelMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, levelFilter, workoutPlans]);

  function openAddModal() {
    setEditingPlanId(null);
    setFormState(EMPTY_PLAN);
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(plan: WorkoutPlan) {
    setEditingPlanId(plan.id);
    setFormState({
      title: plan.title,
      level: plan.level,
      status: plan.status,
      durationWeeks: plan.durationWeeks,
      planGoal: plan.planGoal ?? "",
      workoutsPerWeek: plan.workoutsPerWeek ?? 3,
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
        await updateWorkoutPlan(editingPlanId, formState);
        setToast({ type: "success", message: "×ª×•×›× ×™×ª ×”××™×ž×•×Ÿ ×¢×•×“×›× ×” ×‘×”×¦×œ×—×”." });
      } else {
        await createWorkoutPlan(formState);
        setToast({ type: "success", message: "×ª×•×›× ×™×ª ×”××™×ž×•×Ÿ × ×•×¦×¨×” ×‘×”×¦×œ×—×”." });
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 650);
  }

  function confirmArchive() {
    if (!archiveTargetId) return;
    setIsArchiving(true);
    setTimeout(async () => {
      await updateWorkoutPlanStatus(archiveTargetId, "archived");
      setIsArchiving(false);
      setArchiveTargetId(null);
      setToast({ type: "success", message: "×ª×•×›× ×™×ª ×”××™×ž×•×Ÿ ×”×•×¢×‘×¨×” ×œ××¨×›×™×•×Ÿ." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setLevelFilter("all");
  }

  const columns: DataTableColumn<WorkoutPlan>[] = [
    { key: "title", header: "×©× ×ª×•×›× ×™×ª", render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "level", header: "×¨×ž×”", render: (row) => levelLabel[row.level] },
    { key: "planGoal", header: "×ž×˜×¨×”", render: (row) => row.planGoal ?? "â€”" },
    { key: "users", header: "×ž×©×ª×ž×©×™×", render: (row) => row.assignedUsers },
    { key: "duration", header: "×ž×©×š", render: (row) => `${row.durationWeeks} ×©×‘×•×¢×•×ª` },
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
                  updateWorkoutPlanStatus(row.id, "draft").then(() =>
                    setToast({ type: "success", message: "×”×ª×•×›× ×™×ª ×”×•×—×–×¨×” ×œ×˜×™×•×˜×”." })
                  )
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
      <Breadcrumbs items={[{ label: "×“×©×‘×•×¨×“", href: "/" }, { label: "×ª×•×›× ×™×•×ª ××™×ž×•×Ÿ" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="× ×™×”×•×œ ×ª×•×›× ×™×•×ª ××™×ž×•×Ÿ" subtitle="×—×™×¤×•×©, ×¡×™× ×•×Ÿ ×•× ×™×”×•×œ ×§×˜×œ×•×’ ×ª×•×›× ×™×•×ª ××™×ž×•×Ÿ" />
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
          <FilterTabs tabs={levelTabs} activeValue={levelFilter} onChange={setLevelFilter} />
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isWorkoutPlansLoading}
        emptyState={{
          emoji: "ðŸ‹ï¸",
          title: "××™×Ÿ ×ª×•×›× ×™×•×ª ××™×ž×•×Ÿ ×œ×”×¦×’×”",
          description: "×œ× × ×ž×¦××• ×ª×•×›× ×™×•×ª ×©×¢×•×ž×“×•×ª ×‘×§×¨×™×˜×¨×™×•× ×™× ×©× ×‘×—×¨×•.",
          actionLabel: "× ×™×§×•×™ ×¡×™× ×•× ×™×",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      {/* ×ž×•×“×œ ×™×¦×™×¨×”/×¢×¨×™×›×” */}
      <AppModal
        isOpen={isModalOpen}
        title={editingPlanId ? "×¢×¨×™×›×ª ×ª×•×›× ×™×ª ××™×ž×•×Ÿ" : "×™×¦×™×¨×ª ×ª×•×›× ×™×ª ××™×ž×•×Ÿ"}
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
              placeholder="×œ×“×•×’×ž×”: ×ª×•×›× ×™×ª ×›×•×— ×œ×ž×ª×—×™×œ×™×"
            />
          </label>

          {/* ×ž×˜×¨×” */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×ž×˜×¨×”</span>
            <input
              value={formState.planGoal}
              onChange={(e) => setFormState((prev) => ({ ...prev, planGoal: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×œ×“×•×’×ž×”: ×‘× ×™×™×ª ×ž×¡×ª ×©×¨×™×¨, ×—×™×˜×•×‘, ×©×™×¤×•×¨ ×¡×™×‘×•×œ×ª"
            />
          </label>

          {/* ×¨×ž×ª ×§×•×©×™ */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×¨×ž×ª ×§×•×©×™</span>
            <select
              value={formState.level}
              onChange={(e) => setFormState((prev) => ({ ...prev, level: e.target.value as WorkoutPlan["level"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="beginner">×ž×ª×—×™×œ×™×</option>
              <option value="intermediate">×‘×™× ×•× ×™</option>
              <option value="advanced">×ž×ª×§×“×</option>
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

          {/* ×ž×©×š ×‘×©×‘×•×¢×•×ª */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×ž×©×š (×©×‘×•×¢×•×ª)</span>
            <input
              type="number"
              value={formState.durationWeeks}
              onChange={(e) => setFormState((prev) => ({ ...prev, durationWeeks: Number(e.target.value) || 1 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={1}
              max={52}
            />
          </label>

          {/* ××™×ž×•× ×™× ×‘×©×‘×•×¢ */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">××™×ž×•× ×™× ×‘×©×‘×•×¢</span>
            <input
              type="number"
              value={formState.workoutsPerWeek}
              onChange={(e) => setFormState((prev) => ({ ...prev, workoutsPerWeek: Number(e.target.value) || 1 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={1}
              max={7}
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
        title="××¨×›×•×‘ ×ª×•×›× ×™×ª ××™×ž×•×Ÿ"
        message="×”×× ×œ××¨×›×‘ ××ª ×ª×•×›× ×™×ª ×”××™×ž×•×Ÿ? ×”×¡×˜×˜×•×¡ ×™×©×ª× ×” ×œ××¨×›×™×•×Ÿ. × ×™×ª×Ÿ ×œ×©×—×–×¨ ×‘×”×ž×©×š."
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
