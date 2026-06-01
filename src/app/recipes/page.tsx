"use client";

import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { useRecipes } from "@/hooks/useRecipes";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { Recipe } from "@/types";

const mealTabs = [
  { label: "×”×›×•×œ", value: "all" },
  { label: "×‘×•×§×¨", value: "breakfast" },
  { label: "×¦×”×¨×™×™×", value: "lunch" },
  { label: "×¢×¨×‘", value: "dinner" },
  { label: "×‘×™× ×™×™×", value: "snack" },
];

const mealLabel: Record<Recipe["mealType"], string> = {
  breakfast: "××¨×•×—×ª ×‘×•×§×¨",
  lunch: "××¨×•×—×ª ×¦×”×¨×™×™×",
  dinner: "××¨×•×—×ª ×¢×¨×‘",
  snack: "××¨×•×—×ª ×‘×™× ×™×™×",
};

const AVAILABLE_TAGS = [
  { value: "kosher", label: "×›×©×¨" },
  { value: "vegan", label: "×˜×‘×¢×•× ×™" },
  { value: "vegetarian", label: "×¦×ž×—×•× ×™" },
  { value: "glutenFree", label: "×œ×œ× ×’×œ×•×˜×Ÿ" },
  { value: "lactoseFree", label: "×œ×œ× ×œ×§×˜×•×–" },
];

const EMPTY_RECIPE: Omit<Recipe, "id"> = {
  name: "",
  mealType: "breakfast",
  calories: 0,
  protein: 0,
  status: "active",
  carbs: 0,
  fat: 0,
  prepTime: 0,
  tags: [],
  ingredients: "",
  instructions: "",
};

export default function RecipesPage() {
  const { session } = useDemoAuth();
  const canEdit = session?.role === "admin" || session?.role === "nutritionist";

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
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [formState, setFormState] = useState<Omit<Recipe, "id">>(EMPTY_RECIPE);

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
    setFormState(EMPTY_RECIPE);
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
      carbs: recipe.carbs ?? 0,
      fat: recipe.fat ?? 0,
      prepTime: recipe.prepTime ?? 0,
      tags: recipe.tags ?? [],
      ingredients: recipe.ingredients ?? "",
      instructions: recipe.instructions ?? "",
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function toggleTag(tag: string) {
    setFormState((prev) => {
      const current = prev.tags ?? [];
      return {
        ...prev,
        tags: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
      };
    });
  }

  function saveRecipe() {
    if (!formState.name.trim()) {
      setErrorMessage("×™×© ×œ×ž×œ× ×©× ×ž×ª×›×•×Ÿ.");
      setToast({ type: "error", message: "×œ× × ×™×ª×Ÿ ×œ×©×ž×•×¨: ×—×¡×¨ ×©× ×ž×ª×›×•×Ÿ." });
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, formState);
        setToast({ type: "success", message: "×”×ž×ª×›×•×Ÿ ×¢×•×“×›×Ÿ ×‘×”×¦×œ×—×”." });
      } else {
        await createRecipe(formState);
        setToast({ type: "success", message: "×”×ž×ª×›×•×Ÿ × ×•×¡×£ ×‘×”×¦×œ×—×”." });
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 650);
  }

  function confirmArchive() {
    if (!archiveTargetId) return;
    setIsArchiving(true);
    setTimeout(async () => {
      await updateRecipe(archiveTargetId, { status: "inactive" });
      setIsArchiving(false);
      setArchiveTargetId(null);
      setToast({ type: "success", message: "×”×ž×ª×›×•×Ÿ ×”×•×¢×‘×¨ ×œ××¨×›×™×•×Ÿ." });
    }, 600);
  }

  function clearFilters() {
    setSearchTerm("");
    setMealFilter("all");
  }

  const columns: DataTableColumn<Recipe>[] = [
    { key: "name", header: "×©× ×ž×ª×›×•×Ÿ", render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: "meal", header: "×¡×•×’ ××¨×•×—×”", render: (row) => mealLabel[row.mealType] },
    { key: "calories", header: "×§×œ×•×¨×™×•×ª", render: (row) => row.calories },
    { key: "protein", header: "×—×œ×‘×•×Ÿ", render: (row) => `${row.protein}×’` },
    {
      key: "tags",
      header: "×ª×’×™×•×ª",
      render: (row) => {
        const recipeTags = row.tags ?? [];
        if (recipeTags.length === 0) return <span className="text-slate-400">â€”</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {recipeTags.map((tag) => {
              const tagItem = AVAILABLE_TAGS.find((t) => t.value === tag);
              return (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {tagItem?.label ?? tag}
                </span>
              );
            })}
          </div>
        );
      },
    },
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
            {row.status === "active" ? (
              <button
                type="button"
                onClick={() => setArchiveTargetId(row.id)}
                className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                ××¨×›×•×‘
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  updateRecipe(row.id, { status: "active" }).then(() =>
                    setToast({ type: "success", message: "×”×ž×ª×›×•×Ÿ ×”×•×¤×¢×œ ×ž×—×“×©." })
                  )
                }
                className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                ×”×¤×¢×œ×”
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
      <Breadcrumbs items={[{ label: "×“×©×‘×•×¨×“", href: "/" }, { label: "×ž×ª×›×•× ×™×" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="×ž××’×¨ ××¨×•×—×•×ª ×•×ž×ª×›×•× ×™×" subtitle="× ×™×”×•×œ ×ž×ª×›×•× ×™× ×œ×¤×™ ×¡×•×’ ××¨×•×—×” ×•×¢×¨×›×™× ×ª×–×•× ×ª×™×™×" />
        {canEdit && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + ×”×•×¡×¤×ª ×ž×ª×›×•×Ÿ
          </button>
        )}
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="×—×™×¤×•×© ×œ×¤×™ ×©× ×ž×ª×›×•×Ÿ ××• ×¡×•×’ ××¨×•×—×”" />
        <FilterTabs tabs={mealTabs} activeValue={mealFilter} onChange={setMealFilter} />
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isRecipesLoading}
        emptyState={{
          emoji: "ðŸ½ï¸",
          title: "×œ× × ×ž×¦××• ×ž×ª×›×•× ×™×",
          description: "×œ× × ×ž×¦××• ×ž×ª×›×•× ×™× ×œ×¤×™ ×¡×•×’ ×”××¨×•×—×” ××• ×˜×§×¡×˜ ×”×—×™×¤×•×© ×©×”×•×’×“×¨.",
          actionLabel: "× ×™×§×•×™ ×¡×™× ×•× ×™×",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      <AppModal
        isOpen={isModalOpen}
        title={editingRecipeId ? "×¢×¨×™×›×ª ×ž×ª×›×•×Ÿ" : "×”×•×¡×¤×ª ×ž×ª×›×•×Ÿ"}
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
              onClick={saveRecipe}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "×©×•×ž×¨..." : "×©×ž×™×¨×”"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {/* ×©× ×ž×ª×›×•×Ÿ */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×©× ×ž×ª×›×•×Ÿ *</span>
            <input
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×œ×“×•×’×ž×”: ×—×–×” ×¢×•×£ ×¢× ×§×™× ×•××”"
            />
          </label>

          {/* ×¡×•×’ ××¨×•×—×” */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×¡×•×’ ××¨×•×—×”</span>
            <select
              value={formState.mealType}
              onChange={(event) => setFormState((prev) => ({ ...prev, mealType: event.target.value as Recipe["mealType"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="breakfast">××¨×•×—×ª ×‘×•×§×¨</option>
              <option value="lunch">××¨×•×—×ª ×¦×”×¨×™×™×</option>
              <option value="dinner">××¨×•×—×ª ×¢×¨×‘</option>
              <option value="snack">××¨×•×—×ª ×‘×™× ×™×™×</option>
            </select>
          </label>

          {/* ×¡×˜×˜×•×¡ */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×¡×˜×˜×•×¡</span>
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as Recipe["status"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="active">×¤×¢×™×œ</option>
              <option value="inactive">×œ× ×¤×¢×™×œ</option>
            </select>
          </label>

          {/* ×¢×¨×›×™× ×ª×–×•× ×ª×™×™× */}
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×§×œ×•×¨×™×•×ª</span>
            <input
              type="number"
              value={formState.calories}
              onChange={(event) => setFormState((prev) => ({ ...prev, calories: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×—×œ×‘×•×Ÿ (×’×¨×)</span>
            <input
              type="number"
              value={formState.protein}
              onChange={(event) => setFormState((prev) => ({ ...prev, protein: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×¤×—×ž×™×ž×•×ª (×’×¨×)</span>
            <input
              type="number"
              value={formState.carbs ?? 0}
              onChange={(event) => setFormState((prev) => ({ ...prev, carbs: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">×©×•×ž×Ÿ (×’×¨×)</span>
            <input
              type="number"
              value={formState.fat ?? 0}
              onChange={(event) => setFormState((prev) => ({ ...prev, fat: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×–×ž×Ÿ ×”×›× ×” (×“×§×•×ª)</span>
            <input
              type="number"
              value={formState.prepTime ?? 0}
              onChange={(event) => setFormState((prev) => ({ ...prev, prepTime: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              min={0}
            />
          </label>

          {/* ×ª×’×™×•×ª */}
          <div className="space-y-2 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×ª×’×™×•×ª</span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = (formState.tags ?? []).includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    disabled={isSaving}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ×¨×›×™×‘×™× */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×¨×›×™×‘×™×</span>
            <textarea
              value={formState.ingredients ?? ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, ingredients: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×¤×¨×˜ ××ª ×”×¨×›×™×‘×™× ×•××ª ×”×›×ž×•×™×•×ª"
            />
          </label>

          {/* ×”×•×¨××•×ª ×”×›× ×” */}
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">×”×•×¨××•×ª ×”×›× ×”</span>
            <textarea
              value={formState.instructions ?? ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, instructions: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
              placeholder="×¤×¨×˜ ××ª ×©×œ×‘×™ ×”×”×›× ×”"
            />
          </label>
        </div>
        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(archiveTargetId)}
        title="××¨×›×•×‘ ×ž×ª×›×•×Ÿ"
        message="×”×× ×œ××¨×›×‘ ××ª ×”×ž×ª×›×•×Ÿ? ×”×•× ×™×•×¢×‘×¨ ×œ×¡×˜×˜×•×¡ ×œ× ×¤×¢×™×œ ×•×œ× ×™×•×¦×’ ×œ×ž×©×ª×ž×©×™×."
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
