"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AuditLogEntry } from "@/types";
import { AddAuditLogPayload, addAuditLog, getAuditLogs } from "@/services/auditLogService";

type AuditLogContextValue = {
  entries: AuditLogEntry[];
  addAuditLog: (payload: AddAuditLogPayload) => void;
};

const AuditLogContext = createContext<AuditLogContextValue | undefined>(undefined);

type AuditLogProviderProps = {
  children: ReactNode;
};

export function AuditLogProvider({ children }: AuditLogProviderProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => getAuditLogs());

  const handleAddAuditLog = useCallback((payload: AddAuditLogPayload) => {
    setEntries((prev) => addAuditLog(prev, payload));
  }, []);

  const value = useMemo<AuditLogContextValue>(
    () => ({ entries, addAuditLog: handleAddAuditLog }),
    [entries, handleAddAuditLog]
  );

  return <AuditLogContext.Provider value={value}>{children}</AuditLogContext.Provider>;
}

export function useAuditLogContext(): AuditLogContextValue {
  const ctx = useContext(AuditLogContext);
  if (!ctx) {
    throw new Error("useAuditLogContext must be used within AuditLogProvider");
  }
  return ctx;
}
