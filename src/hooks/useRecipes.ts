"use client";

import { useEffect, useMemo, useState } from "react";
import { Recipe } from "@/types";
import {
  createRecipe,
  CreateRecipePayload,
  getRecipes,
  updateRecipe,
  UpdateRecipePayload,
} from "@/services/recipesService";

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getRecipes();
        setRecipes(result);
      } catch {
        setError("טעינת המתכונים נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 430);

    return () => clearTimeout(timer);
  }, []);

  const actions = useMemo(
    () => ({
      createRecipe: async (payload: CreateRecipePayload) => {
        const created = await createRecipe(recipes, payload);
        setRecipes((prev) => [created, ...prev]);
        return created;
      },
      updateRecipe: async (recipeId: string, payload: UpdateRecipePayload) => {
        const updated = await updateRecipe(recipes, recipeId, payload);
        if (!updated) {
          return null;
        }

        setRecipes((prev) => prev.map((recipe) => (recipe.id === recipeId ? updated : recipe)));
        return updated;
      },
    }),
    [recipes]
  );

  return {
    recipes,
    isLoading,
    error,
    ...actions,
  };
}
