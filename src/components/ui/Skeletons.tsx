"use client";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

export function KpiCardSkeleton() {
  return (
    <div className="flex min-h-[152px] animate-pulse flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="h-10 w-20 rounded bg-slate-200" />
      <div className="h-4 w-36 rounded bg-slate-200" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={`header-${index}`} className="px-5 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={`cell-${rowIndex}-${colIndex}`} className="px-5 py-3.5">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
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

export function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-5" />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-5" />
    </div>
  );
}
