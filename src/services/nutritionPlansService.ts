import { nutritionPlans as nutritionPlansMock } from "@/data/mockData";
import { USE_MOCK_API } from "@/config/runtimeConfig";
import { NutritionPlan, PlanStatus } from "@/types";
import {
  GetNutritionPlansRequest,
  GetNutritionPlansResponse,
  UpdateNutritionPlanStatusResponse,
} from "@/contracts";
import * as nutritionPlansApiService from "@/services/nutritionPlansApiService";

export async function getNutritionPlans(
  _params?: GetNutritionPlansRequest
): Promise<GetNutritionPlansResponse["data"]> {
  if (!USE_MOCK_API) {
    return nutritionPlansApiService.getNutritionPlans(_params);
  }

  void _params;
  return nutritionPlansMock.map((plan) => ({ ...plan }));
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
