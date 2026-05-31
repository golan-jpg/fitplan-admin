import { AnalyticsKpi } from "@/types";
import { ApiResponse, DateRangeFilter } from "@/contracts/apiTypes";

export const ANALYTICS_ENDPOINTS = {
  summary: "/analytics/summary",
} as const;

export const ANALYTICS_METHODS = {
  summary: "GET",
} as const;

export type AnalyticsFilter = {
  dateRange?: DateRangeFilter;
};

export type GetAnalyticsSummaryRequest = AnalyticsFilter;

export type GetAnalyticsSummaryResponse = ApiResponse<AnalyticsKpi[]>;
