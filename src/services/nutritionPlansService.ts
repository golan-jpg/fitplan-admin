import { nutritionPlans as nutritionPlansMock } from "@/data/mockData";
import { USE_MOCK_API } from "@/config/runtimeConfig";
import { NutritionPlan, PlanStatus } from "@/types";
import {
  CreateNutritionPlanRequest,
  CreateNutritionPlanResponse,
  GetNutritionPlansRequest,
  GetNutritionPlansResponse,
  UpdateNutritionPlanRequest,
  UpdateNutritionPlanResponse,
  UpdateNutritionPlanStatusResponse,
} from "@/contracts";
import * as nutritionPlansApiService from "@/services/nutritionPlansApiService";

export type CreateNutritionPlanPayload = CreateNutritionPlanRequest;
export type UpdateNutritionPlanPayload = UpdateNutritionPlanRequest["payload"];

export async function getNutritionPlans(
  _params?: GetNutritionPlansRequest
): Promise<GetNutritionPlansResponse["data"]> {
  if (!USE_MOCK_API) {
    return nutritionPlansApiService.getNutritionPlans(_params);
  }

  void _params;
  return nutritionPlansMock.map((plan) => ({ ...plan }));
}

export async function createNutritionPlan(
  currentPlans: NutritionPlan[],
  payload: CreateNutritionPlanPayload
): Promise<CreateNutritionPlanResponse["data"]> {
  void currentPlans;
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `np-${Math.floor(Math.random() * 900 + 100)}`,
    assignedUsers: 0,
    updatedAt: today,
    ...payload,
  };
}

export async function updateNutritionPlan(
  currentPlans: NutritionPlan[],
  planId: string,
  payload: UpdateNutritionPlanPayload
): Promise<UpdateNutritionPlanResponse["data"]> {
  const target = currentPlans.find((plan) => plan.id === planId);
  if (!target) {
    return null;
  }

  return { ...target, ...payload, updatedAt: new Date().toISOString().slice(0, 10) };
}

export async function updateNutritionPlanStatus(
  currentPlans: NutritionPlan[],
  planId: string,
  status: PlanStatus
): Promise<UpdateNutritionPlanStatusResponse["data"]> {
  if (!USE_MOCK_API) {
    return nutritionPlansApiService.updateNutritionPlanStatus(currentPlans, planId, status);
  }

  const target = currentPlans.find((plan) => plan.id === planId);
  if (!target) {
    return null;
  }

  return { ...target, status };
}
