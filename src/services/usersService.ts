import { users as usersMock } from "@/data/mockData";
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

export type CreateUserPayload = CreateUserRequest;

export type UpdateUserPayload = UpdateUserRequest["payload"];

export async function getUsers(_params?: GetUsersRequest): Promise<GetUsersResponse["data"]> {
  void _params;
  return usersMock.map((user) => ({ ...user }));
}

export async function getUserById(
  userId: string,
  sourceUsers?: User[]
): Promise<GetUserByIdResponse["data"]> {
  const pool = sourceUsers ?? usersMock;
  const found = pool.find((user) => user.id === userId);
  return found ? { ...found } : null;
}

export async function createUser(
  currentUsers: User[],
  payload: CreateUserPayload
): Promise<CreateUserResponse["data"]> {
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
  const target = currentUsers.find((user) => user.id === userId);
  if (!target) {
    return null;
  }

  return { ...target, status };
}
