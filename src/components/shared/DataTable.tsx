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
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className || 'px-5 py-3 font-medium'}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-zinc-500">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td key={column.key} className={column.className || 'px-5 py-3'}>
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
