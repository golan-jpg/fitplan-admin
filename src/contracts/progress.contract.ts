import { ProgressReport } from "@/types";
import { ApiResponse, DateRangeFilter, PaginationMeta, PaginationParams, SortParams } from "@/contracts/apiTypes";

export const PROGRESS_ENDPOINTS = {
  list: "/progress-reports",
} as const;

export const PROGRESS_METHODS = {
  list: "GET",
} as const;

export type ProgressSortField = "weekLabel" | "nutritionAdherence" | "workoutsCompleted" | "weightChangeKg";

export type ProgressFilter = {
  search?: string;
  statuses?: ProgressReport["status"][];
  userIds?: ProgressReport["userId"][];
  weekRange?: DateRangeFilter;
};

export type GetProgressReportsRequest = PaginationParams & SortParams<ProgressSortField> & ProgressFilter;

export type GetProgressReportsResponse = ApiResponse<ProgressReport[], PaginationMeta>;
