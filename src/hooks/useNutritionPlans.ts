"use client";

import { useEffect, useMemo, useState } from "react";
import { NutritionPlan, PlanStatus } from "@/types";
import { getNutritionPlans, updateNutritionPlanStatus } from "@/services/nutritionPlansService";

export function useNutritionPlans() {
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getNutritionPlans();
        setNutritionPlans(result);
      } catch {
        setError("טעינת תוכניות התזונה נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 420);

    return () => clearTimeout(timer);
  }, []);

  const actions = useMemo(
    () => ({
      updateNutritionPlanStatus: async (planId: string, status: PlanStatus) => {
        const updated = await updateNutritionPlanStatus(nutritionPlans, planId, status);
        if (!updated) {
          return null;
        }

        setNutritionPlans((prev) => prev.map((plan) => (plan.id === planId ? updated : plan)));
        return updated;
      },
    }),
    [nutritionPlans]
  );

  return {
    nutritionPlans,
    isLoading,
    error,
    ...actions,
  };
}
