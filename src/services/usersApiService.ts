import { User } from "@/types";
import { request } from "@/lib/httpClient";
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByIdResponse,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateUserStatusResponse,
  USERS_ENDPOINTS,
} from "@/contracts";

export type CreateUserPayload = CreateUserRequest;
export type UpdateUserPayload = UpdateUserRequest["payload"];

export async function getUsers(params?: GetUsersRequest): Promise<GetUsersResponse["data"]> {
  const response = await request<GetUsersResponse>({
    method: "GET",
    url: USERS_ENDPOINTS.list,
    query: params,
  });

  return response.data;
}

export async function getUserById(userId: string, _sourceUsers?: User[]): Promise<GetUserByIdResponse["data"]> {
  void _sourceUsers;
  const response = await request<GetUserByIdResponse>({
    method: "GET",
    url: USERS_ENDPOINTS.byId(userId),
  });

  return response.data;
}

export async function createUser(
  _currentUsers: User[],
  payload: CreateUserPayload
): Promise<CreateUserResponse["data"]> {
  void _currentUsers;
  const response = await request<CreateUserResponse, CreateUserPayload>({
    method: "POST",
    url: USERS_ENDPOINTS.create,
    body: payload,
  });

  return response.data;
}

export async function updateUser(
  _currentUsers: User[],
  userId: string,
  payload: UpdateUserPayload
): Promise<UpdateUserResponse["data"]> {
  void _currentUsers;
  const response = await request<UpdateUserResponse, UpdateUserPayload>({
    method: "PATCH",
    url: USERS_ENDPOINTS.update(userId),
    body: payload,
  });

  return response.data;
}

export async function updateUserStatus(
  _currentUsers: User[],
  userId: string,
  status: User["status"]
): Promise<UpdateUserStatusResponse["data"]> {
  void _currentUsers;
  const response = await request<UpdateUserStatusResponse, { status: User["status"] }>({
    method: "PATCH",
    url: USERS_ENDPOINTS.updateStatus(userId),
    body: { status },
  });

  return response.data;
}
