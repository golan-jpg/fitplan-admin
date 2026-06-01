import { PlanStatus, WorkoutPlan } from "@/types";
import { ApiResponse, EntityId, PaginationMeta, PaginationParams, SortParams } from "@/contracts/apiTypes";

export const WORKOUT_PLANS_ENDPOINTS = {
  list: "/workout-plans",
  create: "/workout-plans",
  update: (planId: EntityId) => `/workout-plans/${planId}`,
  updateStatus: (planId: EntityId) => `/workout-plans/${planId}/status`,
} as const;

export const WORKOUT_PLANS_METHODS = {
  list: "GET",
  create: "POST",
  update: "PATCH",
  updateStatus: "PATCH",
} as const;

export type WorkoutPlanSortField = "title" | "updatedAt" | "assignedUsers" | "durationWeeks";

export type WorkoutPlansFilter = {
  search?: string;
  statuses?: PlanStatus[];
  levels?: WorkoutPlan["level"][];
};

export type GetWorkoutPlansRequest = PaginationParams & SortParams<WorkoutPlanSortField> & WorkoutPlansFilter;

export type GetWorkoutPlansResponse = ApiResponse<WorkoutPlan[], PaginationMeta>;

export type CreateWorkoutPlanRequest = Omit<WorkoutPlan, "id" | "assignedUsers" | "updatedAt">;

export type CreateWorkoutPlanResponse = ApiResponse<WorkoutPlan>;

export type UpdateWorkoutPlanRequest = {
  planId: EntityId;
  payload: Partial<Omit<WorkoutPlan, "id" | "assignedUsers">>;
};

export type UpdateWorkoutPlanResponse = ApiResponse<WorkoutPlan | null>;

export type UpdateWorkoutPlanStatusRequest = {
  planId: EntityId;
  status: PlanStatus;
};

export type UpdateWorkoutPlanStatusResponse = ApiResponse<WorkoutPlan | null>;
