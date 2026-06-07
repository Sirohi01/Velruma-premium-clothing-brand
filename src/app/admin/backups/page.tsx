import Link from 'next/link';
import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function BackupsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-white">Quick CSV Exports</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {['products', 'orders', 'customers', 'suppliers', 'invoices', 'full'].map((type) => (
            <Link key={type} href={`/api/backups/export?type=${type}`} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold capitalize text-black hover:bg-amber-400">
              Export {type}
            </Link>
          ))}
        </div>
      </div>
      <Phase9ModulePage
        title="Backup Jobs"
        description="Create backup/export jobs for products, orders, customers, suppliers and invoices."
        endpoint="/api/backups"
        defaults={{ exportType: 'full', status: 'ready', isActive: true }}
        fields={[
          { key: 'title', label: 'Title', required: true },
          { key: 'exportType', label: 'Export Type', type: 'select', options: ['products', 'orders', 'customers', 'suppliers', 'invoices', 'full'] },
          { key: 'status', label: 'Status', type: 'select', options: ['ready', 'running', 'completed', 'failed'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        columns={[
          { key: 'title', label: 'Job' },
          { key: 'exportType', label: 'Type', type: 'status' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: 'createdAt', label: 'Created', type: 'date' },
        ]}
      />
    </div>
  );
}
