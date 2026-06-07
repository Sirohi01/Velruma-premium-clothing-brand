'use client';

import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import DashboardWidgetStrip from '@/components/admin/DashboardWidgetStrip';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, HeadphonesIcon } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(() => undefined);
  }, []);

  const kpis = data?.kpis || {};
  const salesData = data?.salesData || [];
  const categoryData = data?.categoryData || [];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Dashboard</h1>
          <p className="text-sm text-zinc-500">Live sales, catalog, customers and operations snapshot.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">Real data</span>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatsCard title="Revenue Today" value={formatCurrency(kpis.revenueToday || 0)} icon={<DollarSign className="h-5 w-5" />} />
        <StatsCard title="Orders Today" value={kpis.ordersToday || 0} icon={<ShoppingCart className="h-5 w-5" />} />
        <StatsCard title="Customers" value={kpis.customers || 0} icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Active Products" value={kpis.activeProducts || 0} icon={<Package className="h-5 w-5" />} />
        <StatsCard title="Low Stock" value={kpis.lowStock || 0} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatsCard title="Open Tickets" value={kpis.openTickets || 0} icon={<HeadphonesIcon className="h-5 w-5" />} />
      </div>

      <DashboardWidgetStrip />

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm xl:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-950">7-Day Revenue</h2>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D89A22" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#D89A22" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E1D5" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip />
                <Area dataKey="sales" stroke="#D89A22" strokeWidth={2} fill="url(#sales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950">Products by Category</h2>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E1D5" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} />
                <YAxis type="category" dataKey="name" width={90} stroke="#71717a" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#111827" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950">Recent Orders</h2>
          <div className="mt-3 divide-y divide-zinc-100">
            {(data?.recentOrders || []).length === 0 ? <p className="py-6 text-sm text-zinc-500">No orders today.</p> : data.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                <div><p className="font-medium text-zinc-950">{order.id}</p><p className="text-zinc-500">{order.customer}</p></div>
                <div className="text-right"><p className="font-semibold">{formatCurrency(order.total || 0)}</p><p className="text-xs text-zinc-500">{order.status}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950">Top Products</h2>
          <div className="mt-3 divide-y divide-zinc-100">
            {(data?.topProducts || []).length === 0 ? <p className="py-6 text-sm text-zinc-500">Sales data will appear after orders.</p> : data.topProducts.map((product: any, index: number) => (
              <div key={product.name} className="flex items-center justify-between py-3 text-sm">
                <p className="font-medium text-zinc-950">{index + 1}. {product.name}</p>
                <p className="text-zinc-500">{product.sales} sold / {formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
