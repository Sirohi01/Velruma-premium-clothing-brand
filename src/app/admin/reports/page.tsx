'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function todayRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

export default function ReportsPage() {
  const initialRange = useMemo(() => todayRange(), []);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/summary?from=${from}&to=${to}`);
      const data = await res.json();
      if (data.success) setReport(data.data);
      else toast.error(data.error || 'Failed to load reports');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = (rows: any[], name: string) => {
    if (!rows?.length) {
      toast.error('No rows to export');
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => JSON.stringify(row[key] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpis = report?.kpis || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Reports</h1>
          <p className="text-sm text-zinc-500">Sales, products, customers, suppliers, GST, COD and profit reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900 dark:text-white" />
          <button onClick={fetchReport} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">
            <RefreshCcw className="h-4 w-4" />
            Run
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 dark:border-white/10 dark:bg-zinc-900">Loading report...</div>
      ) : !report ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 dark:border-white/10 dark:bg-zinc-900"><BarChart3 className="mx-auto mb-3 h-8 w-8 opacity-30" />No report data.</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Kpi label="Net Sales" value={money(kpis.netSales)} />
            <Kpi label="Orders" value={kpis.orders || 0} />
            <Kpi label="Net Profit" value={money(kpis.netProfit)} tone={kpis.netProfit >= 0 ? 'green' : 'red'} />
            <Kpi label="GST Collected" value={money(kpis.taxCollected)} />
            <Kpi label="Expenses" value={money(kpis.expenses)} />
            <Kpi label="COGS" value={money(kpis.cogs)} />
            <Kpi label="Purchases" value={money(kpis.purchases)} />
            <Kpi label="Returns / Cancelled" value={`${kpis.returnedOrders || 0} / ${kpis.cancelledOrders || 0}`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ReportTable title="Product-wise Sales" rows={report.products} onExport={() => exportCsv(report.products, 'product-sales')} columns={[['title', 'Product'], ['quantity', 'Qty'], ['revenue', 'Revenue']]} />
            <ReportTable title="Category-wise Sales" rows={report.categories} onExport={() => exportCsv(report.categories, 'category-sales')} columns={[['category', 'Category'], ['quantity', 'Qty'], ['revenue', 'Revenue']]} />
            <ReportTable title="Size-wise Sales" rows={report.sizes} onExport={() => exportCsv(report.sizes, 'size-sales')} columns={[['size', 'Size'], ['quantity', 'Qty'], ['revenue', 'Revenue']]} />
            <ReportTable title="Color-wise Sales" rows={report.colors} onExport={() => exportCsv(report.colors, 'color-sales')} columns={[['color', 'Color'], ['quantity', 'Qty'], ['revenue', 'Revenue']]} />
            <ReportTable title="Customer-wise Sales" rows={report.customers} onExport={() => exportCsv(report.customers, 'customer-sales')} columns={[['name', 'Customer'], ['orders', 'Orders'], ['revenue', 'Revenue']]} />
            <ReportTable title="Supplier-wise Purchases" rows={report.suppliers} onExport={() => exportCsv(report.suppliers, 'supplier-purchases')} columns={[['name', 'Supplier'], ['purchases', 'POs'], ['total', 'Total']]} />
            <ReportTable title="Expense Categories" rows={report.expensesByCategory} onExport={() => exportCsv(report.expensesByCategory, 'expense-categories')} columns={[['category', 'Category'], ['amount', 'Amount'], ['taxAmount', 'GST/Input Tax']]} />
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'green' | 'red' }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone === 'green' ? 'text-green-600 dark:text-green-400' : tone === 'red' ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

function ReportTable({ title, rows, columns, onExport }: { title: string; rows: any[]; columns: [string, string][]; onExport: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/10">
        <h2 className="font-semibold text-zinc-900 dark:text-white">{title}</h2>
        <button onClick={onExport} className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
          <Download className="h-3.5 w-3.5" />
          CSV
        </button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
          <tr>{columns.map(([, label]) => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
          {rows?.length ? rows.slice(0, 10).map((row, index) => (
            <tr key={index}>
              {columns.map(([key]) => <td key={key} className="px-5 py-3 text-zinc-700 dark:text-zinc-300">{['revenue', 'total', 'amount', 'taxAmount'].includes(key) ? money(row[key]) : row[key]}</td>)}
            </tr>
          )) : <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-zinc-500">No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
