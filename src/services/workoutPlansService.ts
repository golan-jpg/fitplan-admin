import { workoutPlans as workoutPlansMock } from "@/data/mockData";
import { USE_MOCK_API } from "@/config/runtimeConfig";
import { PlanStatus, WorkoutPlan } from "@/types";
import {
  CreateWorkoutPlanRequest,
  CreateWorkoutPlanResponse,
  GetWorkoutPlansRequest,
  GetWorkoutPlansResponse,
  UpdateWorkoutPlanRequest,
  UpdateWorkoutPlanResponse,
  UpdateWorkoutPlanStatusResponse,
} from "@/contracts";
import * as workoutPlansApiService from "@/services/workoutPlansApiService";

export type CreateWorkoutPlanPayload = CreateWorkoutPlanRequest;
export type UpdateWorkoutPlanPayload = UpdateWorkoutPlanRequest["payload"];

export async function getWorkoutPlans(_params?: GetWorkoutPlansRequest): Promise<GetWorkoutPlansResponse["data"]> {
  if (!USE_MOCK_API) {
    return workoutPlansApiService.getWorkoutPlans(_params);
  }

  void _params;
  return workoutPlansMock.map((plan) => ({ ...plan }));
}

export async function createWorkoutPlan(
  currentPlans: WorkoutPlan[],
  payload: CreateWorkoutPlanPayload
): Promise<CreateWorkoutPlanResponse["data"]> {
  void currentPlans;
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `wp-${Math.floor(Math.random() * 900 + 100)}`,
    assignedUsers: 0,
    updatedAt: today,
    ...payload,
  };
}

export async function updateWorkoutPlan(
  currentPlans: WorkoutPlan[],
  planId: string,
  payload: UpdateWorkoutPlanPayload
): Promise<UpdateWorkoutPlanResponse["data"]> {
  const target = currentPlans.find((plan) => plan.id === planId);
  if (!target) {
    return null;
  }

  return { ...target, ...payload, updatedAt: new Date().toISOString().slice(0, 10) };
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
