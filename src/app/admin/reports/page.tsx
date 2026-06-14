'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, RefreshCcw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function money(value: number) {
  return `Rs.${Number(value || 0).toLocaleString('en-IN')}`;
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
    <div className="space-y-3">
      <section className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: "'Playfair Display', serif" }}>Reports</h1>
              <p className="text-sm text-zinc-500">Sales, products, customers, suppliers, GST, COD and profit reports.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#faf8f4] p-1.5">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-amber-500" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-amber-500" />
            <button onClick={fetchReport} className="flex h-9 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-bold text-white hover:bg-zinc-800">
              <RefreshCcw className="h-4 w-4" />
              Run
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">Loading report...</div>
      ) : !report ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm"><BarChart3 className="mx-auto mb-3 h-8 w-8 opacity-30" />No report data.</div>
      ) : (
        <>
          <div className="grid gap-2 md:grid-cols-4">
            <Kpi label="Net Sales" value={money(kpis.netSales)} />
            <Kpi label="Orders" value={kpis.orders || 0} />
            <Kpi label="Net Profit" value={money(kpis.netProfit)} tone={kpis.netProfit >= 0 ? 'green' : 'red'} />
            <Kpi label="GST Collected" value={money(kpis.taxCollected)} />
            <Kpi label="Expenses" value={money(kpis.expenses)} />
            <Kpi label="COGS" value={money(kpis.cogs)} />
            <Kpi label="Purchases" value={money(kpis.purchases)} />
            <Kpi label="Returns / Cancelled" value={`${kpis.returnedOrders || 0} / ${kpis.cancelledOrders || 0}`} />
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
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
    <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${tone === 'green' ? 'text-green-600' : tone === 'red' ? 'text-red-500' : 'text-zinc-950'}`}>{value}</p>
        </div>
        <TrendingUp className="h-4 w-4 text-amber-500" />
      </div>
    </div>
  );
}

function ReportTable({ title, rows, columns, onExport }: { title: string; rows: any[]; columns: [string, string][]; onExport: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-[#faf8f4] px-3 py-2.5">
        <h2 className="text-sm font-bold text-zinc-950">{title}</h2>
        <button onClick={onExport} className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
          <Download className="h-3.5 w-3.5" />
          CSV
        </button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-white text-[11px] uppercase tracking-[0.08em] text-zinc-400">
          <tr>{columns.map(([, label]) => <th key={label} className="px-3 py-2 font-bold">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows?.length ? rows.slice(0, 10).map((row, index) => (
            <tr key={index} className="hover:bg-[#fbf8f2]">
              {columns.map(([key]) => <td key={key} className="px-3 py-2 text-zinc-700">{['revenue', 'total', 'amount', 'taxAmount'].includes(key) ? money(row[key]) : row[key]}</td>)}
            </tr>
          )) : <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-500">No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
