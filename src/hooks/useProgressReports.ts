"use client";

import { useEffect, useState } from "react";
import { ProgressReport } from "@/types";
import { getProgressReports } from "@/services/progressService";

export function useProgressReports() {
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await getProgressReports();
        setProgressReports(result);
      } catch {
        setError("טעינת דוחות ההתקדמות נכשלה.");
      } finally {
        setIsLoading(false);
      }
    }, 420);

    return () => clearTimeout(timer);
  }, []);

  return {
    progressReports,
    isLoading,
    error,
  };
}
