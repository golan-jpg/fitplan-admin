"use client";

import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useExercises } from "@/hooks/useExercises";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { Exercise } from "@/types";

const statusTabs = [
  { label: "הכול", value: "all" },
  { label: "פעיל", value: "active" },
  { label: "לא פעיל", value: "inactive" },
];

const categoryLabel: Record<Exercise["category"], string> = {
  strength: "כוח",
  cardio: "אירובי",
  mobility: "מוביליות",
  core: "ליבה",
};

const levelLabel: Record<Exercise["level"], string> = {
  beginner: "מתחילים",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

export default function ExercisesPage() {
  const { session } = useDemoAuth();
  const canEdit = session?.role === "admin" || session?.role === "coach";

  const {
    exercises,
    isLoading: isExercisesLoading,
    error,
    createExercise,
    updateExercise,
  } = useExercises();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [formState, setFormState] = useState<Omit<Exercise, "id">>({
    name: "",
    category: "strength",
    level: "beginner",
    equipment: "",
    status: "active",
    muscleGroup: "",
    description: "",
    instructions: "",
    safetyNotes: "",
  });

  const rows = useMemo(() => {
    return exercises.filter((exercise) => {
      const statusMatch = statusFilter === "all" || exercise.status === statusFilter;
      const searchMatch =
        searchTerm.trim().length === 0 ||
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryLabel[exercise.category].includes(searchTerm) ||
        levelLabel[exercise.level].includes(searchTerm) ||
        (exercise.muscleGroup ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, exercises]);

  function openAddModal() {
    setEditingExerciseId(null);
    setFormState({
      name: "",
      category: "strength",
      level: "beginner",
      equipment: "",
      status: "active",
      muscleGroup: "",
      description: "",
      instructions: "",
      safetyNotes: "",
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(exercise: Exercise) {
    setEditingExerciseId(exercise.id);
    setFormState({
      name: exercise.name,
      category: exercise.category,
      level: exercise.level,
      equipment: exercise.equipment,
      status: exercise.status,
      muscleGroup: exercise.muscleGroup ?? "",
      description: exercise.description ?? "",
      instructions: exercise.instructions ?? "",
      safetyNotes: exercise.safetyNotes ?? "",
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function saveExercise() {
    if (!formState.name.trim() || !formState.equipment.trim()) {
      setErrorMessage("יש למלא שם תרגיל וציוד נדרש.");
      setToast({ type: "error", message: "לא ניתן לשמור: חסרים שדות חובה." });
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      if (editingExerciseId) {
        await updateExercise(editingExerciseId, formState);
        setToast({ type: "success", message: "התרגיל עודכן בהצלחה." });
      } else {
        await createExercise(formState);
        setToast({ type: "success", message: "התרגיל נוסף בהצלחה." });
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 650);
  }

  function confirmArchive() {
    if (!archiveTargetId) return;
    setIsArchiving(true);
    setTimeout(async () => {
      await updateExercise(archiveTargetId, { status: "inactive" });
      setIsArchiving(false);
      setArchiveTargetId(null);
      setToast({ type: "success", message: "התרגיל הועבר לארכיון." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
  }

  const columns: DataTableColumn<Exercise>[] = [
    { key: "name", header: "שם תרגיל", render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: "category", header: "קטגוריה", render: (row) => categoryLabel[row.category] },
    { key: "level", header: "רמה", render: (row) => levelLabel[row.level] },
    { key: "equipment", header: "ציוד", render: (row) => row.equipment },
    { key: "muscleGroup", header: "קבוצת שריר", render: (row) => row.muscleGroup ?? "—" },
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
            {row.status === "active" ? (
              <button
                type="button"
                onClick={() => setArchiveTargetId(row.id)}
                className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                ארכוב
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  updateExercise(row.id, { status: "active" }).then(() =>
                    setToast({ type: "success", message: "התרגיל הופעל מחדש." })
                  )
                }
                className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                הפעלה
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
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "תרגילים" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="ספריית תרגילים" subtitle="ניהול קטלוג תרגילים לפי קטגוריה, רמה וסטטוס" />
        {canEdit && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + הוספת תרגיל
          </button>
        )}
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם, קטגוריה, רמה או קבוצת שריר" />
        <FilterTabs tabs={statusTabs} activeValue={statusFilter} onChange={setStatusFilter} />
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isExercisesLoading}
        emptyState={{
          emoji: "🧘",
          title: "לא נמצאו תרגילים",
          description: "אין תוצאות עבור החיפוש או הסטטוס שבחרת כרגע.",
          actionLabel: "ניקוי סינונים",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      <AppModal
        isOpen={isModalOpen}
        title={editingExerciseId ? "עריכת תרגיל" : "הוספת תרגיל"}
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
              onClick={saveExercise}
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
            <span className="font-semibold text-slate-700">שם תרגיל *</span>
            <input
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="לדוגמה: סקוואט עם מוט"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">קטגוריה</span>
            <select
              value={formState.category}
              onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value as Exercise["category"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="strength">כוח</option>
              <option value="cardio">אירובי</option>
              <option value="mobility">מוביליות</option>
              <option value="core">ליבה</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">רמת קושי</span>
            <select
              value={formState.level}
              onChange={(event) => setFormState((prev) => ({ ...prev, level: event.target.value as Exercise["level"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="beginner">מתחילים</option>
              <option value="intermediate">בינוני</option>
              <option value="advanced">מתקדם</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">ציוד נדרש *</span>
            <input
              value={formState.equipment}
              onChange={(event) => setFormState((prev) => ({ ...prev, equipment: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="לדוגמה: מוט ומשקולות"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">קבוצת שריר</span>
            <input
              value={formState.muscleGroup ?? ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, muscleGroup: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="לדוגמה: ארבע ראשי, גב עליון"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">סטטוס</span>
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as Exercise["status"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="active">פעיל</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">תיאור קצר</span>
            <textarea
              value={formState.description ?? ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="תיאור קצר של התרגיל ומטרתו"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">הוראות ביצוע</span>
            <textarea
              value={formState.instructions ?? ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, instructions: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="פרט את שלבי הביצוע הנכון"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">דגשי בטיחות</span>
            <textarea
              value={formState.safetyNotes ?? ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, safetyNotes: event.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="אזהרות, הגבלות, או הנחיות חשובות"
            />
          </label>
        </div>
        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(archiveTargetId)}
        title="ארכוב תרגיל"
        message="האם לארכב את התרגיל? הוא יועבר לסטטוס לא פעיל ולא יוצג למשתמשים."
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
