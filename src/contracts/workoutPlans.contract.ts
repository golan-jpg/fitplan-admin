import { PlanStatus, WorkoutPlan } from "@/types";
import { ApiResponse, EntityId, PaginationMeta, PaginationParams, SortParams } from "@/contracts/apiTypes";

export const WORKOUT_PLANS_ENDPOINTS = {
  list: "/workout-plans",
  updateStatus: (planId: EntityId) => `/workout-plans/${planId}/status`,
} as const;

export const WORKOUT_PLANS_METHODS = {
  list: "GET",
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

export type UpdateWorkoutPlanStatusRequest = {
  planId: EntityId;
  status: PlanStatus;
};

export type UpdateWorkoutPlanStatusResponse = ApiResponse<WorkoutPlan | null>;
