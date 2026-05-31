import { workoutPlans as workoutPlansMock } from "@/data/mockData";
import { USE_MOCK_API } from "@/config/runtimeConfig";
import { PlanStatus, WorkoutPlan } from "@/types";
import {
  GetWorkoutPlansRequest,
  GetWorkoutPlansResponse,
  UpdateWorkoutPlanStatusResponse,
} from "@/contracts";
import * as workoutPlansApiService from "@/services/workoutPlansApiService";

export async function getWorkoutPlans(_params?: GetWorkoutPlansRequest): Promise<GetWorkoutPlansResponse["data"]> {
  if (!USE_MOCK_API) {
    return workoutPlansApiService.getWorkoutPlans(_params);
  }

  void _params;
  return workoutPlansMock.map((plan) => ({ ...plan }));
}

export async function updateWorkoutPlanStatus(
  currentPlans: WorkoutPlan[],
  planId: string,
  status: PlanStatus
): Promise<UpdateWorkoutPlanStatusResponse["data"]> {
  if (!USE_MOCK_API) {
    return workoutPlansApiService.updateWorkoutPlanStatus(currentPlans, planId, status);
  }

  const target = currentPlans.find((plan) => plan.id === planId);
  if (!target) {
    return null;
  }

  return { ...target, status };
}
