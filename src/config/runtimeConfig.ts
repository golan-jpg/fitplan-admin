export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "/api";

export const USE_MOCK_API = (process.env.NEXT_PUBLIC_USE_MOCK_API ?? "true").toLowerCase() !== "false";

export const runtimeConfig = {
  API_BASE_URL,
  USE_MOCK_API,
} as const;
