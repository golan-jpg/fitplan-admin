import { nutritionPlans as nutritionPlansMock } from "@/data/mockData";
import { NutritionPlan, PlanStatus } from "@/types";
import {
  GetNutritionPlansRequest,
  GetNutritionPlansResponse,
  UpdateNutritionPlanStatusResponse,
} from "@/contracts";

export async function getNutritionPlans(
  _params?: GetNutritionPlansRequest
): Promise<GetNutritionPlansResponse["data"]> {
  void _params;
  return nutritionPlansMock.map((plan) => ({ ...plan }));
}

export async function updateNutritionPlanStatus(
  currentPlans: NutritionPlan[],
  planId: string,
  status: PlanStatus
): Promise<UpdateNutritionPlanStatusResponse["data"]> {
  const target = currentPlans.find((plan) => plan.id === planId);
  if (!target) {
    return null;
  }

  return { ...target, status };
}
