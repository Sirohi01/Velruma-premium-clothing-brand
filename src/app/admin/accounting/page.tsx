'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Edit2, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const blankExpense = {
  title: '',
  category: 'other',
  amount: 0,
  taxAmount: 0,
  paymentMethod: 'upi',
  paidTo: '',
  invoiceNumber: '',
  proofImage: '',
  notes: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  status: 'paid',
};

function money(value: number) {
  return `Rs.${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function AccountingPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankExpense);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [expenseRes, reportRes] = await Promise.all([
        fetch('/api/expenses', { cache: 'no-store' }),
        fetch('/api/reports/summary?range=all', { cache: 'no-store' }),
      ]);
      const [expenseData, reportData] = await Promise.all([expenseRes.json(), reportRes.json()]);
      if (expenseData.success) setExpenses(expenseData.data);
      else toast.error(expenseData.error || 'Failed to load expenses');
      if (reportData.success) setReport(reportData.data);
      else toast.error(reportData.error || 'Failed to load accounting summary');
    } catch {
      toast.error('Failed to load accounting data');
    }
  };

  const totals = useMemo(() => {
    const approvedExpenses = expenses.filter((expense) => expense.status !== 'draft');
    const expenseTotal = approvedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const inputTax = approvedExpenses.reduce((sum, expense) => sum + Number(expense.taxAmount || 0), 0);
    const outputTax = Number(report?.kpis?.taxCollected || 0);
    return { expenseTotal, inputTax, outputTax, gstPayable: outputTax - inputTax };
  }, [expenses, report]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankExpense);
    setModalOpen(true);
  };

  const openEdit = (expense: any) => {
    setEditTarget(expense);
    setForm({
      title: expense.title || '',
      category: expense.category || 'other',
      amount: expense.amount || 0,
      taxAmount: expense.taxAmount || 0,
      paymentMethod: expense.paymentMethod || 'upi',
      paidTo: expense.paidTo || '',
      invoiceNumber: expense.invoiceNumber || '',
      proofImage: expense.proofImage || '',
      notes: expense.notes || '',
      expenseDate: expense.expenseDate ? expense.expenseDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: expense.status || 'paid',
    });
    setModalOpen(true);
  };

  const saveExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/expenses/${editTarget._id}` : '/api/expenses', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Expense save failed');
        return;
      }
      toast.success(editTarget ? 'Expense updated' : 'Expense added');
      setModalOpen(false);
      fetchAll();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const moveDraft = async (expense: any) => {
    await fetch(`/api/expenses/${expense._id}`, { method: 'DELETE' });
    toast.success('Expense moved to draft');
    fetchAll();
  };

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: "'Playfair Display', serif" }}>Accounting</h1>
              <p className="text-sm text-zinc-500">Expenses, GST input/output, COGS and profit summary.</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </section>

      <div className="grid gap-2 md:grid-cols-4">
        <Kpi label="Net Sales" value={money(report?.kpis?.netSales || 0)} />
        <Kpi label="Net Profit" value={money(report?.kpis?.netProfit || 0)} tone={(report?.kpis?.netProfit || 0) >= 0 ? 'green' : 'red'} />
        <Kpi label="Expenses" value={money(totals.expenseTotal)} />
        <Kpi label="GST Payable" value={money(totals.gstPayable)} tone={totals.gstPayable >= 0 ? 'red' : 'green'} />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <MiniCard label="Output GST" value={money(totals.outputTax)} />
        <MiniCard label="Input GST" value={money(totals.inputTax)} />
        <MiniCard label="COGS" value={money(report?.kpis?.cogs || 0)} />
      </div>

      {Number(report?.kpis?.missingCostItems || 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {report.kpis.missingCostItems} sold item(s) have missing cost price. Add Cost Price / Landed Cost in products to make COGS and Net Profit exact.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-[#faf8f4] px-3 py-2.5">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Expense Ledger</h2>
            <p className="text-xs text-zinc-500">Operational spend and input GST records.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500 ring-1 ring-zinc-200">{expenses.length} entries</span>
        </div>
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-white text-[11px] uppercase tracking-[0.08em] text-zinc-400">
            <tr><th className="px-3 py-2">Expense</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">GST</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500"><Calculator className="mx-auto mb-3 h-8 w-8 opacity-20" />No expenses found.</td></tr>
            ) : expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-[#fbf8f2]">
                <td className="px-3 py-2"><p className="font-bold text-zinc-950">{expense.title}</p><p className="font-mono text-xs text-zinc-500">{expense.expenseNumber}</p></td>
                <td className="px-3 py-2 capitalize">{expense.category}</td>
                <td className="px-3 py-2 font-semibold text-zinc-950">{money(expense.amount)}</td>
                <td className="px-3 py-2">{money(expense.taxAmount)}</td>
                <td className="px-3 py-2"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold capitalize text-zinc-700">{expense.status}</span></td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => openEdit(expense)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => moveDraft(expense)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-950">{editTarget ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveExpense} className="mt-4 grid gap-3 md:grid-cols-2">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500">{['rent', 'salary', 'marketing', 'shipping', 'packaging', 'purchase', 'software', 'tax', 'other'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input type="number" min="0" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500" />
              <input type="number" min="0" placeholder="GST / Tax amount" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500" />
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500">{['upi', 'bank', 'cash', 'card'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500"><option value="draft">draft</option><option value="approved">approved</option><option value="paid">paid</option></select>
              <input placeholder="Paid to" value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500" />
              <input placeholder="Invoice number" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500" />
              <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500" />
              <ImageUpload label="Proof image" value={form.proofImage} folder="expenses" onChange={(proofImage) => setForm({ ...form, proofImage })} />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-lg border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-amber-500 md:col-span-2" rows={3} />
              <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Expense'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'red' }) {
  return <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">{label}</p><p className={`mt-1 text-2xl font-bold ${tone === 'green' ? 'text-green-600' : tone === 'red' ? 'text-red-500' : 'text-zinc-950'}`}>{value}</p></div>;
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">{label}</p><p className="mt-1 text-xl font-bold text-zinc-950">{value}</p></div>;
}
