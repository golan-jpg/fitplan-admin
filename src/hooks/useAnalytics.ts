"use client";

import { useEffect, useState } from "react";
import { AnalyticsKpi } from "@/types";
import { getAnalyticsSummary } from "@/services/analyticsService";

export function useAnalytics() {
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsKpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getAnalyticsSummary();
        setAnalyticsSummary(result);
      } catch {
        setError("טעינת הנתונים האנליטיים נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 420);

    return () => clearTimeout(timer);
  }, []);

  return {
    analyticsSummary,
    isLoading,
    error,
  };
}
