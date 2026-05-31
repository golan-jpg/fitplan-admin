import { recipes as recipesMock } from "@/data/mockData";
import { Recipe } from "@/types";
import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  GetRecipesRequest,
  GetRecipesResponse,
  UpdateRecipeRequest,
  UpdateRecipeResponse,
} from "@/contracts";

export type CreateRecipePayload = CreateRecipeRequest;
export type UpdateRecipePayload = UpdateRecipeRequest["payload"];

export async function getRecipes(_params?: GetRecipesRequest): Promise<GetRecipesResponse["data"]> {
  void _params;
  return recipesMock.map((recipe) => ({ ...recipe }));
}

export async function createRecipe(
  currentRecipes: Recipe[],
  payload: CreateRecipePayload
): Promise<CreateRecipeResponse["data"]> {
  const createdRecipe: Recipe = {
    id: `rc-${Math.floor(Math.random() * 900 + 100)}`,
    ...payload,
  };

  void currentRecipes;
  return createdRecipe;
}

export async function updateRecipe(
  currentRecipes: Recipe[],
  recipeId: string,
  payload: UpdateRecipePayload
): Promise<UpdateRecipeResponse["data"]> {
  const target = currentRecipes.find((recipe) => recipe.id === recipeId);
  if (!target) {
    return null;
  }

  return { ...target, ...payload };
}
