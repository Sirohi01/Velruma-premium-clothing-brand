'use client';

import React, { useEffect, useState } from 'react';
import { MODULE_LABELS, ALL_MODULES, ALL_ACTIONS } from '@/lib/permissions';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingState from '@/components/shared/LoadingState';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => setRoles(data.success ? data.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
        <p className="text-sm text-zinc-500">Manage admin access across VELRUMA modules.</p>
      </div>

      {loading ? (
        <LoadingState label="Loading roles..." />
      ) : (
        <DataTable
          data={roles}
          columns={[
            { key: 'name', header: 'Role', cell: (role) => <span className="font-medium text-white">{role.name}</span> },
            { key: 'slug', header: 'Slug', cell: (role) => <span className="font-mono text-xs">{role.slug}</span> },
            { key: 'status', header: 'Status', cell: (role) => <StatusBadge value={role.isActive ? 'active' : 'inactive'} /> },
            { key: 'type', header: 'Type', cell: (role) => (role.isSystem ? 'System' : 'Custom') },
          ]}
        />
      )}

      <section className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-white">Permission Matrix</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2">Module</th>
                {ALL_ACTIONS.map((action) => (
                  <th key={action} className="px-2 py-2 capitalize">{action}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ALL_MODULES.map((module) => (
                <tr key={module}>
                  <td className="py-2 text-zinc-300">{MODULE_LABELS[module]}</td>
                  {ALL_ACTIONS.map((action) => (
                    <td key={action} className="px-2 py-2 text-zinc-600">Available</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
