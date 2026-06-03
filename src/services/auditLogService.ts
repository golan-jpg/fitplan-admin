import { auditLogs as initialAuditLogs } from "@/data/mockData";
import { AuditLogEntry, AuditLogEntityType, AuditLogSeverity } from "@/types";

export type AddAuditLogPayload = Omit<AuditLogEntry, "id" | "timestamp">;

export type AuditLogFilters = {
  search?: string;
  entityType?: AuditLogEntityType | "all";
  severity?: AuditLogSeverity | "all";
  actorRole?: AuditLogEntry["actorRole"] | "all";
};

export function getAuditLogs(): AuditLogEntry[] {
  return initialAuditLogs.map((entry) => ({ ...entry }));
}

function createAuditLogEntry(payload: AddAuditLogPayload): AuditLogEntry {
  return {
    ...payload,
    id: `al-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
}

export function addAuditLog(
  entries: AuditLogEntry[],
  payload: AddAuditLogPayload
): AuditLogEntry[] {
  const entry = createAuditLogEntry(payload);
  return [entry, ...entries];
}

export function filterAuditLogs(
  entries: AuditLogEntry[],
  filters: AuditLogFilters
): AuditLogEntry[] {
  const searchLower = (filters.search ?? "").trim().toLowerCase();

  return entries.filter((entry) => {
    if (filters.entityType && filters.entityType !== "all" && entry.entityType !== filters.entityType) {
      return false;
    }
    if (filters.severity && filters.severity !== "all" && entry.severity !== filters.severity) {
      return false;
    }
    if (filters.actorRole && filters.actorRole !== "all" && entry.actorRole !== filters.actorRole) {
      return false;
    }
    if (searchLower.length > 0) {
      const matches =
        entry.actorName.toLowerCase().includes(searchLower) ||
        entry.action.toLowerCase().includes(searchLower) ||
        entry.entityType.toLowerCase().includes(searchLower) ||
        entry.entityName.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }
    return true;
  });
}
