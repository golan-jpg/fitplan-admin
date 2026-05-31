import { Recipe } from "@/types";
import { ApiResponse, EntityId, PaginationMeta, PaginationParams, SortParams } from "@/contracts/apiTypes";

export const RECIPES_ENDPOINTS = {
  list: "/recipes",
  create: "/recipes",
  update: (recipeId: EntityId) => `/recipes/${recipeId}`,
} as const;

export const RECIPES_METHODS = {
  list: "GET",
  create: "POST",
  update: "PATCH",
} as const;

export type RecipeSortField = "name" | "calories" | "protein" | "mealType";

export type RecipesFilter = {
  search?: string;
  statuses?: Recipe["status"][];
  mealTypes?: Recipe["mealType"][];
};

export type GetRecipesRequest = PaginationParams & SortParams<RecipeSortField> & RecipesFilter;

export type GetRecipesResponse = ApiResponse<Recipe[], PaginationMeta>;

export type CreateRecipeRequest = Omit<Recipe, "id">;

export type CreateRecipeResponse = ApiResponse<Recipe>;

export type UpdateRecipeRequest = {
  recipeId: EntityId;
  payload: Partial<Omit<Recipe, "id">>;
};

export type UpdateRecipeResponse = ApiResponse<Recipe | null>;
