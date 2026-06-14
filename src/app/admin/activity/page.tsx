import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import DataTable from '@/components/shared/DataTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; action?: string; page?: string }>;
}) {
  await dbConnect();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 8;
  const skip = (page - 1) * limit;
  const query: Record<string, string> = {};
  if (params.module) query.module = params.module;
  if (params.action) query.action = params.action;

  const [logs, total, loginCount, updateCount] = await Promise.all([
    ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ActivityLog.countDocuments(query),
    ActivityLog.countDocuments({ action: 'login' }),
    ActivityLog.countDocuments({ action: 'update' }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-sm text-zinc-500">Admin audit trail, login history, exports and system actions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Matching Logs" value={total} />
        <Card label="Login Events" value={loginCount} />
        <Card label="Update Events" value={updateCount} />
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">Tip: filter with URL query like <span className="font-mono text-amber-400">?module=auth&action=login</span></p>
      </div>

      <DataTable
        data={logs as any[]}
        empty="No activity recorded yet."
        columns={[
          { key: 'action', header: 'Action', cell: (log) => <span className="font-medium capitalize text-white">{log.action}</span> },
          { key: 'module', header: 'Module', cell: (log) => log.module || '-' },
          { key: 'user', header: 'User', cell: (log) => log.userName || '-' },
          { key: 'description', header: 'Description', cell: (log) => log.description || '-' },
          { key: 'entity', header: 'Entity', cell: (log) => log.entityName || log.entityType || '-' },
          { key: 'ip', header: 'IP', cell: (log) => log.ipAddress || '-' },
          { key: 'time', header: 'Time', cell: (log) => new Date(log.createdAt).toLocaleString('en-IN') },
        ]}
      />
      <PaginationFooter page={page} totalPages={totalPages} total={total} module={params.module} action={params.action} />
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value.toLocaleString('en-IN')}</p>
    </div>
  );
}

function PaginationFooter({
  page,
  totalPages,
  total,
  module,
  action,
}: {
  page: number;
  totalPages: number;
  total: number;
  module?: string;
  action?: string;
}) {
  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set('page', String(Math.min(totalPages, Math.max(1, nextPage))));
    if (module) params.set('module', module);
    if (action) params.set('action', action);
    return `/admin/activity?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
      <span>Page {page} of {totalPages} - {total.toLocaleString('en-IN')} activity logs</span>
      <div className="flex items-center gap-2">
        <Link
          href={pageHref(page - 1)}
          aria-disabled={page <= 1}
          className={`rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-zinc-50 dark:hover:bg-white/10'}`}
        >
          Previous
        </Link>
        <Link
          href={pageHref(page + 1)}
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-zinc-50 dark:hover:bg-white/10'}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
