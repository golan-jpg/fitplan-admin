import { DemoRole } from "@/lib/demoAuth";
import { ApiResponse } from "@/contracts/apiTypes";

export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  logout: "/auth/logout",
  session: "/auth/session",
} as const;

export const AUTH_METHODS = {
  login: "POST",
  logout: "POST",
  session: "GET",
} as const;

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthSession = {
  name: string;
  email: string;
  role: DemoRole;
};

export type LoginResponse = ApiResponse<AuthSession>;

export type LogoutResponse = ApiResponse<{ success: boolean }>;

export type GetSessionResponse = ApiResponse<AuthSession | null>;
