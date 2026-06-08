import { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeletons";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  emptyText?: string;
  isLoading?: boolean;
  emptyState?: {
    emoji?: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  skeletonRows?: number;
};

export function DataTable<T>({
  rows,
  columns,
  emptyText,
  isLoading = false,
  emptyState,
  skeletonRows = 6,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={skeletonRows} columns={columns.length} />;
  }

  if (rows.length === 0) {
    if (emptyState) {
      return (
        <EmptyState
          emoji={emptyState.emoji}
          title={emptyState.title}
          description={emptyState.description}
          actionLabel={emptyState.actionLabel}
          onAction={emptyState.onAction}
        />
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText ?? "לא נמצאו נתונים"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full">
        <table className="min-w-[1200px] w-full divide-y divide-slate-200 text-right">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-5 py-3 text-xs font-bold text-slate-600 ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {rows.map((row, index) => (
              <tr key={index} className="odd:bg-white even:bg-slate-50/60 hover:bg-slate-100/70">
                {columns.map((column) => (
                  <td key={column.key} className={`whitespace-nowrap px-5 py-3.5 align-middle ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
