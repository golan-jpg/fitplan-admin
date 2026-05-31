import { NutritionPlan, PlanStatus } from "@/types";
import { ApiResponse, EntityId, PaginationMeta, PaginationParams, SortParams } from "@/contracts/apiTypes";

export const NUTRITION_PLANS_ENDPOINTS = {
  list: "/nutrition-plans",
  updateStatus: (planId: EntityId) => `/nutrition-plans/${planId}/status`,
} as const;

export const NUTRITION_PLANS_METHODS = {
  list: "GET",
  updateStatus: "PATCH",
} as const;

export type NutritionPlanSortField = "title" | "updatedAt" | "assignedUsers" | "caloriesTarget";

export type NutritionPlansFilter = {
  search?: string;
  statuses?: PlanStatus[];
  goals?: NutritionPlan["goal"][];
};

export type GetNutritionPlansRequest = PaginationParams & SortParams<NutritionPlanSortField> & NutritionPlansFilter;

export type GetNutritionPlansResponse = ApiResponse<NutritionPlan[], PaginationMeta>;

export type UpdateNutritionPlanStatusRequest = {
  planId: EntityId;
  status: PlanStatus;
};

export type UpdateNutritionPlanStatusResponse = ApiResponse<NutritionPlan | null>;
