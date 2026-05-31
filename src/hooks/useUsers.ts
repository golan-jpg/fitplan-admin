"use client";

import { useEffect, useMemo, useState } from "react";
import { User, UserStatus } from "@/types";
import {
  createUser,
  CreateUserPayload,
  getUserById,
  getUsers,
  updateUser,
  UpdateUserPayload,
  updateUserStatus,
} from "@/services/usersService";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getUsers();
        setUsers(result);
      } catch {
        setError("טעינת המשתמשים נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const actions = useMemo(
    () => ({
      getUserById: async (userId: string) => getUserById(userId, users),
      createUser: async (payload: CreateUserPayload) => {
        const created = await createUser(users, payload);
        setUsers((prev) => [created, ...prev]);
        return created;
      },
      updateUser: async (userId: string, payload: UpdateUserPayload) => {
        const updated = await updateUser(users, userId, payload);
        if (!updated) {
          return null;
        }

        setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
        return updated;
      },
      updateUserStatus: async (userId: string, status: UserStatus) => {
        const updated = await updateUserStatus(users, userId, status);
        if (!updated) {
          return null;
        }

        setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
        return updated;
      },
    }),
    [users]
  );

  return {
    users,
    isLoading,
    error,
    ...actions,
  };
}
