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
import { useAuditLogContext } from "@/context/AuditLogContext";
import { PlanStatus, WorkoutPlan } from "@/types";

const statusTabs = [
  { label: "הכול", value: "all" },
  { label: "פעיל", value: "active" },
  { label: "טיוטה", value: "draft" },
  { label: "ארכיון", value: "archived" },
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

const statusLabel: Record<PlanStatus, string> = {
  active: "פעיל",
  draft: "טיוטה",
  archived: "ארכיון",
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
  const { addAuditLog } = useAuditLogContext();
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
      setErrorMessage("יש למלא שם תכנית.");
      setToast({ type: "error", message: "לא ניתן לשמור: חסר שם תכנית." });
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      if (editingPlanId) {
        const previousPlan = workoutPlans.find((plan) => plan.id === editingPlanId);
        const updated = await updateWorkoutPlan(editingPlanId, formState);
        if (updated && session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "עריכת תכנית אימון",
            entityType: "workoutPlans",
            entityName: formState.title,
            entityId: editingPlanId,
            severity: "success",
            description: `עודכנה תכנית אימון: ${formState.title}.`,
          });

          if (previousPlan && previousPlan.status !== formState.status) {
            addAuditLog({
              actorName: session.name,
              actorRole: session.role,
              action: "שינוי סטטוס תכנית אימון",
              entityType: "workoutPlans",
              entityName: formState.title,
              entityId: editingPlanId,
              severity: "warning",
              description: `סטטוס תכנית האימון "${formState.title}" שונה מ-${statusLabel[previousPlan.status]} ל-${statusLabel[formState.status]}.`,
            });
          }
        }
        setToast({ type: "success", message: "תכנית האימון עודכנה בהצלחה." });
      } else {
        const created = await createWorkoutPlan(formState);
        if (session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "יצירת תכנית אימון",
            entityType: "workoutPlans",
            entityName: formState.title,
            entityId: created.id,
            severity: "success",
            description: `נוצרה תכנית אימון חדשה: ${formState.title}.`,
          });
        }
        setToast({ type: "success", message: "תכנית האימון נוצרה בהצלחה." });
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 650);
  }

  function confirmArchive() {
    if (!archiveTargetId) return;
    setIsArchiving(true);
    const targetPlan = workoutPlans.find((plan) => plan.id === archiveTargetId);

    setTimeout(async () => {
      await updateWorkoutPlanStatus(archiveTargetId, "archived");
      if (session && targetPlan) {
        addAuditLog({
          actorName: session.name,
          actorRole: session.role,
          action: "ארכוב תכנית אימון",
          entityType: "workoutPlans",
          entityName: targetPlan.title,
          entityId: archiveTargetId,
          severity: "danger",
          description: `תכנית אימון הועברה לארכיון: ${targetPlan.title}.`,
        });
      }
      setIsArchiving(false);
      setArchiveTargetId(null);
      setToast({ type: "success", message: "תכנית האימון הועברה לארכיון." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setLevelFilter("all");
  }

  const columns: DataTableColumn<WorkoutPlan>[] = [
    { key: "title", header: "שם תכנית", render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "level", header: "רמה", render: (row) => levelLabel[row.level] },
    { key: "planGoal", header: "מטרה", render: (row) => row.planGoal ?? "—" },
    { key: "users", header: "משתמשים", render: (row) => row.assignedUsers },
    { key: "duration", header: "משך", render: (row) => `${row.durationWeeks} שבועות` },
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
                  updateWorkoutPlanStatus(row.id, "draft").then(() => {
                    if (session) {
                      addAuditLog({
                        actorName: session.name,
                        actorRole: session.role,
                        action: "שחזור תכנית אימון",
                        entityType: "workoutPlans",
                        entityName: row.title,
                        entityId: row.id,
                        severity: "success",
                        description: `תכנית אימון שוחזרה מארכיון: ${row.title}.`,
                      });
                      addAuditLog({
                        actorName: session.name,
                        actorRole: session.role,
                        action: "שינוי סטטוס תכנית אימון",
                        entityType: "workoutPlans",
                        entityName: row.title,
                        entityId: row.id,
                        severity: "warning",
                        description: `סטטוס תכנית האימון "${row.title}" שונה מארכיון לטיוטה.`,
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
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "תוכניות אימון" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="ניהול תוכניות אימון" subtitle="חיפוש, סינון וניהול קטלוג תוכניות אימון" />
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

      <AppModal
        isOpen={isModalOpen}
        title={editingPlanId ? "עריכת תכנית אימון" : "יצירת תכנית אימון"}
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
              placeholder="לדוגמה: תוכנית כוח למתחילים"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">מטרה</span>
            <input
              value={formState.planGoal}
              onChange={(e) => setFormState((prev) => ({ ...prev, planGoal: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="לדוגמה: בניית מסת שריר, חיטוב, שיפור סיבולת"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">רמת קושי</span>
            <select
              value={formState.level}
              onChange={(e) => setFormState((prev) => ({ ...prev, level: e.target.value as WorkoutPlan["level"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="beginner">מתחילים</option>
              <option value="intermediate">בינוני</option>
              <option value="advanced">מתקדם</option>
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
            <span className="font-semibold text-slate-700">משך (שבועות)</span>
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

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">אימונים בשבוע</span>
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
        title="ארכוב תכנית אימון"
        message="האם לארכב את תכנית האימון? הסטטוס ישתנה לארכיון. ניתן לשחזר בהמשך."
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
