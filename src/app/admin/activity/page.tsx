import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import DataTable from '@/components/shared/DataTable';

export const dynamic = 'force-dynamic';

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; action?: string }>;
}) {
  await dbConnect();
  const params = await searchParams;
  const query: Record<string, string> = {};
  if (params.module) query.module = params.module;
  if (params.action) query.action = params.action;

  const [logs, total, loginCount, updateCount] = await Promise.all([
    ActivityLog.find(query).sort({ createdAt: -1 }).limit(100).lean(),
    ActivityLog.countDocuments(query),
    ActivityLog.countDocuments({ action: 'login' }),
    ActivityLog.countDocuments({ action: 'update' }),
  ]);

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
