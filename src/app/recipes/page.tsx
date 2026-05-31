"use client";

import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useRecipes } from "@/hooks/useRecipes";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { Recipe } from "@/types";

const tabs = [
  { label: "הכול", value: "all" },
  { label: "בוקר", value: "breakfast" },
  { label: "צהריים", value: "lunch" },
  { label: "ערב", value: "dinner" },
  { label: "ביניים", value: "snack" },
];

const mealLabel: Record<Recipe["mealType"], string> = {
  breakfast: "ארוחת בוקר",
  lunch: "ארוחת צהריים",
  dinner: "ארוחת ערב",
  snack: "ארוחת ביניים",
};

export default function RecipesPage() {
  const {
    recipes,
    isLoading: isRecipesLoading,
    error,
    createRecipe,
    updateRecipe,
  } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [mealFilter, setMealFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formState, setFormState] = useState<Omit<Recipe, "id">>({
    name: "",
    mealType: "breakfast",
    calories: 0,
    protein: 0,
    status: "active",
  });

  const rows = useMemo(() => {
    return recipes.filter((recipe) => {
      const mealMatch = mealFilter === "all" || recipe.mealType === mealFilter;
      const searchMatch =
        searchTerm.trim().length === 0 ||
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mealLabel[recipe.mealType].includes(searchTerm);
      return mealMatch && searchMatch;
    });
  }, [searchTerm, mealFilter, recipes]);

  function openAddModal() {
    setEditingRecipeId(null);
    setFormState({
      name: "",
      mealType: "breakfast",
      calories: 0,
      protein: 0,
      status: "active",
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(recipe: Recipe) {
    setEditingRecipeId(recipe.id);
    setFormState({
      name: recipe.name,
      mealType: recipe.mealType,
      calories: recipe.calories,
      protein: recipe.protein,
      status: recipe.status,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function saveRecipe() {
    if (!formState.name.trim()) {
      setErrorMessage("יש למלא שם מתכון.");
      setToast({ type: "error", message: "לא ניתן לשמור: חסר שם מתכון." });
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, formState);
        setToast({ type: "success", message: "המתכון עודכן בהצלחה." });
      } else {
        await createRecipe(formState);
        setToast({ type: "success", message: "המתכון נוסף בהצלחה." });
      }

      setIsSaving(false);
      setIsModalOpen(false);
    }, 650);
  }

  function clearFilters() {
    setSearchTerm("");
    setMealFilter("all");
  }

  const columns: DataTableColumn<Recipe>[] = [
    { key: "name", header: "שם מתכון", render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: "meal", header: "סוג ארוחה", render: (row) => mealLabel[row.mealType] },
    { key: "calories", header: "קלוריות", render: (row) => row.calories },
    { key: "protein", header: "חלבון", render: (row) => `${row.protein} גרם` },
    { key: "status", header: "סטטוס", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "פעולה",
      render: (row) => (
        <button
          type="button"
          onClick={() => openEditModal(row)}
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          עריכת מתכון
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "מתכונים" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="מאגר ארוחות ומתכונים" subtitle="ניהול מתכונים לפי סוג ארוחה וערכים תזונתיים" />
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          הוספת מתכון
        </button>
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם מתכון או סוג ארוחה" />
        <FilterTabs tabs={tabs} activeValue={mealFilter} onChange={setMealFilter} />
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isRecipesLoading}
        emptyState={{
          emoji: "🍽️",
          title: "לא נמצאו מתכונים",
          description: "לא נמצאו מתכונים לפי סוג הארוחה או טקסט החיפוש שהוגדר.",
          actionLabel: "ניקוי סינונים",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      <AppModal
        isOpen={isModalOpen}
        title={editingRecipeId ? "עריכת מתכון" : "הוספת מתכון"}
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
              onClick={saveRecipe}
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
            <span className="font-semibold text-slate-700">שם מתכון *</span>
            <input
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">סוג ארוחה</span>
            <select
              value={formState.mealType}
              onChange={(event) => setFormState((prev) => ({ ...prev, mealType: event.target.value as Recipe["mealType"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="breakfast">ארוחת בוקר</option>
              <option value="lunch">ארוחת צהריים</option>
              <option value="dinner">ארוחת ערב</option>
              <option value="snack">ארוחת ביניים</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">קלוריות</span>
            <input
              type="number"
              value={formState.calories}
              onChange={(event) => setFormState((prev) => ({ ...prev, calories: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">חלבון (גרם)</span>
            <input
              type="number"
              value={formState.protein}
              onChange={(event) => setFormState((prev) => ({ ...prev, protein: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
        </div>
        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
      </AppModal>

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
