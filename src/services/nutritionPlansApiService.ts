import { request } from "@/lib/httpClient";
import { NutritionPlan, PlanStatus } from "@/types";
import {
  GetNutritionPlansRequest,
  GetNutritionPlansResponse,
  NUTRITION_PLANS_ENDPOINTS,
  UpdateNutritionPlanStatusRequest,
  UpdateNutritionPlanStatusResponse,
} from "@/contracts";

export async function getNutritionPlans(
  params?: GetNutritionPlansRequest
): Promise<GetNutritionPlansResponse["data"]> {
  const response = await request<GetNutritionPlansResponse>({
    method: "GET",
    url: NUTRITION_PLANS_ENDPOINTS.list,
    query: params,
  });

  return response.data;
}

export async function updateNutritionPlanStatus(
  _currentPlans: NutritionPlan[],
  planId: string,
  status: PlanStatus
): Promise<UpdateNutritionPlanStatusResponse["data"]> {
  void _currentPlans;
  const response = await request<UpdateNutritionPlanStatusResponse, UpdateNutritionPlanStatusRequest>({
    method: "PATCH",
    url: NUTRITION_PLANS_ENDPOINTS.updateStatus(planId),
    body: { planId, status },
  });

  return response.data;
}
