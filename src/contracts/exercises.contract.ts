import { Exercise } from "@/types";
import { ApiResponse, EntityId, PaginationMeta, PaginationParams, SortParams } from "@/contracts/apiTypes";

export const EXERCISES_ENDPOINTS = {
  list: "/exercises",
  create: "/exercises",
  update: (exerciseId: EntityId) => `/exercises/${exerciseId}`,
} as const;

export const EXERCISES_METHODS = {
  list: "GET",
  create: "POST",
  update: "PATCH",
} as const;

export type ExerciseSortField = "name" | "category" | "level" | "status";

export type ExercisesFilter = {
  search?: string;
  statuses?: Exercise["status"][];
  categories?: Exercise["category"][];
  levels?: Exercise["level"][];
};

export type GetExercisesRequest = PaginationParams & SortParams<ExerciseSortField> & ExercisesFilter;

export type GetExercisesResponse = ApiResponse<Exercise[], PaginationMeta>;

export type CreateExerciseRequest = Omit<Exercise, "id">;

export type CreateExerciseResponse = ApiResponse<Exercise>;

export type UpdateExerciseRequest = {
  exerciseId: EntityId;
  payload: Partial<Omit<Exercise, "id">>;
};

export type UpdateExerciseResponse = ApiResponse<Exercise | null>;
