import { workoutPlans as workoutPlansMock } from "@/data/mockData";
import { PlanStatus, WorkoutPlan } from "@/types";
import {
  GetWorkoutPlansRequest,
  GetWorkoutPlansResponse,
  UpdateWorkoutPlanStatusResponse,
} from "@/contracts";

export async function getWorkoutPlans(_params?: GetWorkoutPlansRequest): Promise<GetWorkoutPlansResponse["data"]> {
  void _params;
  return workoutPlansMock.map((plan) => ({ ...plan }));
}

export async function updateWorkoutPlanStatus(
  currentPlans: WorkoutPlan[],
  planId: string,
  status: PlanStatus
): Promise<UpdateWorkoutPlanStatusResponse["data"]> {
  const target = currentPlans.find((plan) => plan.id === planId);
  if (!target) {
    return null;
  }

  return { ...target, status };
}
