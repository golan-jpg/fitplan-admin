"use client";

import { useEffect, useMemo, useState } from "react";
import { Exercise } from "@/types";
import {
  createExercise,
  CreateExercisePayload,
  getExercises,
  updateExercise,
  UpdateExercisePayload,
} from "@/services/exercisesService";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getExercises();
        setExercises(result);
      } catch {
        setError("טעינת התרגילים נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 430);

    return () => clearTimeout(timer);
  }, []);

  const actions = useMemo(
    () => ({
      createExercise: async (payload: CreateExercisePayload) => {
        const created = await createExercise(exercises, payload);
        setExercises((prev) => [created, ...prev]);
        return created;
      },
      updateExercise: async (exerciseId: string, payload: UpdateExercisePayload) => {
        const updated = await updateExercise(exercises, exerciseId, payload);
        if (!updated) {
          return null;
        }

        setExercises((prev) => prev.map((exercise) => (exercise.id === exerciseId ? updated : exercise)));
        return updated;
      },
    }),
    [exercises]
  );

  return {
    exercises,
    isLoading,
    error,
    ...actions,
  };
}
