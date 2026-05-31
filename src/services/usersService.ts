import { users as usersMock } from "@/data/mockData";
import { USE_MOCK_API } from "@/config/runtimeConfig";
import { User, UserStatus } from "@/types";
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByIdResponse,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateUserStatusResponse,
} from "@/contracts";
import * as usersApiService from "@/services/usersApiService";

export type CreateUserPayload = CreateUserRequest;

export type UpdateUserPayload = UpdateUserRequest["payload"];

export async function getUsers(_params?: GetUsersRequest): Promise<GetUsersResponse["data"]> {
  if (!USE_MOCK_API) {
    return usersApiService.getUsers(_params);
  }

  void _params;
  return usersMock.map((user) => ({ ...user }));
}

export async function getUserById(
  userId: string,
  sourceUsers?: User[]
): Promise<GetUserByIdResponse["data"]> {
  if (!USE_MOCK_API) {
    return usersApiService.getUserById(userId, sourceUsers);
  }

  const pool = sourceUsers ?? usersMock;
  const found = pool.find((user) => user.id === userId);
  return found ? { ...found } : null;
}

export async function createUser(
  currentUsers: User[],
  payload: CreateUserPayload
): Promise<CreateUserResponse["data"]> {
  if (!USE_MOCK_API) {
    return usersApiService.createUser(currentUsers, payload);
  }

  const newUser: User = {
    id: `u-${Math.floor(Math.random() * 9000 + 1000)}`,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    primaryPlanType: payload.primaryPlanType,
    lastActive: payload.lastActive ?? "טרם התחבר",
    assignedPlans: payload.assignedPlans ?? 0,
    adherenceScore: payload.adherenceScore ?? 0,
  };

  void currentUsers;
  return newUser;
}

export async function updateUser(
  currentUsers: User[],
  userId: string,
  payload: UpdateUserPayload
): Promise<UpdateUserResponse["data"]> {
  if (!USE_MOCK_API) {
    return usersApiService.updateUser(currentUsers, userId, payload);
  }

  const target = currentUsers.find((user) => user.id === userId);
  if (!target) {
    return null;
  }

  return { ...target, ...payload };
}

export async function updateUserStatus(
  currentUsers: User[],
  userId: string,
  status: UserStatus
): Promise<UpdateUserStatusResponse["data"]> {
  if (!USE_MOCK_API) {
    return usersApiService.updateUserStatus(currentUsers, userId, status);
  }

  const target = currentUsers.find((user) => user.id === userId);
  if (!target) {
    return null;
  }

  return { ...target, status };
}
