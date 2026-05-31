"use client";

import { useMemo, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { KpiCard } from "@/components/ui/KpiCard";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useProgressReports } from "@/hooks/useProgressReports";
import { ProgressReport } from "@/types";

const tabs = [
  { label: "הכול", value: "all" },
  { label: "במסלול", value: "on_track" },
  { label: "דורש תשומת לב", value: "needs_attention" },
];

export default function ProgressPage() {
  const { progressReports, isLoading } = useProgressReports();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = useMemo(() => {
    return progressReports.filter((report) => {
      const statusMatch = statusFilter === "all" || report.status === statusFilter;
      const searchMatch =
        searchTerm.trim().length === 0 || report.userName.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, progressReports]);

  const averageNutritionAdherence = useMemo(() => {
    if (progressReports.length === 0) {
      return 0;
    }

    const total = progressReports.reduce((sum, report) => sum + report.nutritionAdherence, 0);
    return Math.round(total / progressReports.length);
  }, [progressReports]);

  const onTrackCount = useMemo(
    () => progressReports.filter((report) => report.status === "on_track").length,
    [progressReports]
  );

  const columns: DataTableColumn<ProgressReport>[] = [
    { key: "name", header: "משתמש", render: (row) => <span className="font-semibold">{row.userName}</span> },
    { key: "week", header: "שבוע", render: (row) => row.weekLabel },
    {
      key: "workouts",
      header: "אימונים",
      render: (row) => `${row.workoutsCompleted}/${row.workoutsPlanned}`,
    },
    { key: "nutrition", header: "עמידה תזונתית", render: (row) => `${row.nutritionAdherence}%` },
    { key: "weight", header: "שינוי משקל", render: (row) => `${row.weightChangeKg} ק"ג` },
    { key: "status", header: "סטטוס", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="מעקב התקדמות" subtitle="בקרה שבועית על עמידה באימונים ותזונה" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="ממוצע עמידה תזונתית" value={`${averageNutritionAdherence}%`} delta="+2.4%" trend="up" />
        <KpiCard label="משתמשים במסלול" value={`${onTrackCount}`} delta="+1" trend="up" />
        <KpiCard label="משתמשים דורשי תשומת לב" value={`${progressReports.length - onTrackCount}`} delta="-1" trend="down" />
        <KpiCard label="דוחות שבועיים" value={`${progressReports.length}`} delta="0%" trend="up" />
      </section>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם משתמש" />
        <FilterTabs tabs={tabs} activeValue={statusFilter} onChange={setStatusFilter} />
      </div>

      <DataTable rows={rows} columns={columns} isLoading={isLoading} emptyText="לא נמצאו דוחות התקדמות" />
    </div>
  );
}
