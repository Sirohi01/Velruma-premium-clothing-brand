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
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(24,24,27,0.06)] dark:border-white/10 dark:bg-zinc-900">
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
  );
}
