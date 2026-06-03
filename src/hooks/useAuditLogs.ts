"use client";

import { useMemo, useState } from "react";
import { AuditLogEntityType, AuditLogSeverity, AuditLogEntry } from "@/types";
import { useAuditLogContext } from "@/context/AuditLogContext";
import { AddAuditLogPayload, AuditLogFilters, filterAuditLogs } from "@/services/auditLogService";

export function useAuditLogs(roleFilter?: AuditLogEntityType[]) {
  const { entries, addAuditLog } = useAuditLogContext();

  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<AuditLogEntityType | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AuditLogSeverity | "all">("all");
  const [actorRoleFilter, setActorRoleFilter] = useState<AuditLogEntry["actorRole"] | "all">("all");

  const visibleEntries = useMemo(() => {
    if (!roleFilter) return entries;
    return entries.filter((e) => roleFilter.includes(e.entityType));
  }, [entries, roleFilter]);

  const filters: AuditLogFilters = {
    search,
    entityType: entityTypeFilter,
    severity: severityFilter,
    actorRole: actorRoleFilter,
  };

  const filteredEntries = useMemo(
    () => filterAuditLogs(visibleEntries, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleEntries, search, entityTypeFilter, severityFilter, actorRoleFilter]
  );

  function clearFilters() {
    setSearch("");
    setEntityTypeFilter("all");
    setSeverityFilter("all");
    setActorRoleFilter("all");
  }

  return {
    filteredEntries,
    search,
    setSearch,
    entityTypeFilter,
    setEntityTypeFilter,
    severityFilter,
    setSeverityFilter,
    actorRoleFilter,
    setActorRoleFilter,
    clearFilters,
    addAuditLog: (payload: AddAuditLogPayload) => addAuditLog(payload),
  };
}
