import { User, UserStatus } from "@/types";
import {
  ApiResponse,
  DateRangeFilter,
  EntityId,
  PaginationMeta,
  PaginationParams,
  SortParams,
} from "@/contracts/apiTypes";

export const USERS_ENDPOINTS = {
  list: "/users",
  byId: (userId: EntityId) => `/users/${userId}`,
  create: "/users",
  update: (userId: EntityId) => `/users/${userId}`,
  updateStatus: (userId: EntityId) => `/users/${userId}/status`,
} as const;

export const USERS_METHODS = {
  list: "GET",
  byId: "GET",
  create: "POST",
  update: "PATCH",
  updateStatus: "PATCH",
} as const;

export type UserSortField = "fullName" | "lastActive" | "adherenceScore" | "assignedPlans";

export type UsersFilter = {
  search?: string;
  statuses?: UserStatus[];
  roles?: User["role"][];
  primaryPlanTypes?: User["primaryPlanType"][];
  lastActiveRange?: DateRangeFilter;
};

export type GetUsersRequest = PaginationParams & SortParams<UserSortField> & UsersFilter;

export type GetUsersResponse = ApiResponse<User[], PaginationMeta>;

export type GetUserByIdRequest = {
  userId: EntityId;
};

export type GetUserByIdResponse = ApiResponse<User | null>;

export type CreateUserRequest = Omit<User, "id" | "lastActive" | "assignedPlans" | "adherenceScore"> & {
  lastActive?: string;
  assignedPlans?: number;
  adherenceScore?: number;
};

export type CreateUserResponse = ApiResponse<User>;

export type UpdateUserRequest = {
  userId: EntityId;
  payload: Partial<Omit<User, "id">>;
};

export type UpdateUserResponse = ApiResponse<User | null>;

export type UpdateUserStatusRequest = {
  userId: EntityId;
  status: UserStatus;
};

export type UpdateUserStatusResponse = ApiResponse<User | null>;
