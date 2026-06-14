import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

export default function DataTable<T>({
  data,
  columns,
  empty = 'No records found.',
  pagination,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  empty?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(24,24,27,0.06)] dark:border-white/10 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#faf8f4] text-[11px] uppercase tracking-[0.08em] text-zinc-500 dark:bg-zinc-800/50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className || 'px-4 py-2.5 font-semibold'}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-500">
                  {empty}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="text-zinc-700 transition-colors hover:bg-[#fbf8f2] dark:text-zinc-300 dark:hover:bg-white/[0.03]">
                  {columns.map((column) => (
                    <td key={column.key} className={column.className || 'px-4 py-2.5'}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex flex-col gap-2 border-t border-zinc-200 bg-[#faf8f4] px-4 py-2.5 text-sm text-zinc-600 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {pagination.page} of {pagination.totalPages} - {pagination.total.toLocaleString('en-IN')} records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
