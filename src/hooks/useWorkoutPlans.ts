"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanStatus, WorkoutPlan } from "@/types";
import { getWorkoutPlans, updateWorkoutPlanStatus } from "@/services/workoutPlansService";

export function useWorkoutPlans() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getWorkoutPlans();
        setWorkoutPlans(result);
      } catch {
        setError("טעינת תוכניות האימון נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 420);

    return () => clearTimeout(timer);
  }, []);

  const actions = useMemo(
    () => ({
      updateWorkoutPlanStatus: async (planId: string, status: PlanStatus) => {
        const updated = await updateWorkoutPlanStatus(workoutPlans, planId, status);
        if (!updated) {
          return null;
        }

        setWorkoutPlans((prev) => prev.map((plan) => (plan.id === planId ? updated : plan)));
        return updated;
      },
    }),
    [workoutPlans]
  );

  return {
    workoutPlans,
    isLoading,
    error,
    ...actions,
  };
}
