import { request } from "@/lib/httpClient";
import { PlanStatus, WorkoutPlan } from "@/types";
import {
  GetWorkoutPlansRequest,
  GetWorkoutPlansResponse,
  UpdateWorkoutPlanStatusRequest,
  UpdateWorkoutPlanStatusResponse,
  WORKOUT_PLANS_ENDPOINTS,
} from "@/contracts";

export async function getWorkoutPlans(params?: GetWorkoutPlansRequest): Promise<GetWorkoutPlansResponse["data"]> {
  const response = await request<GetWorkoutPlansResponse>({
    method: "GET",
    url: WORKOUT_PLANS_ENDPOINTS.list,
    query: params,
  });

  return response.data;
}

export async function updateWorkoutPlanStatus(
  _currentPlans: WorkoutPlan[],
  planId: string,
  status: PlanStatus
): Promise<UpdateWorkoutPlanStatusResponse["data"]> {
  void _currentPlans;
  const response = await request<UpdateWorkoutPlanStatusResponse, UpdateWorkoutPlanStatusRequest>({
    method: "PATCH",
    url: WORKOUT_PLANS_ENDPOINTS.updateStatus(planId),
    body: { planId, status },
  });

  return response.data;
}
