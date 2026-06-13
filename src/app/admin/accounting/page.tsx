'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Edit2, Plus, Trash2, X } from 'lucide-react';
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
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
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
    const expenseTotal = expenses.filter((expense) => expense.status !== 'draft').reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const inputTax = expenses.filter((expense) => expense.status !== 'draft').reduce((sum, expense) => sum + Number(expense.taxAmount || 0), 0);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Accounting</h1>
          <p className="text-sm text-zinc-500">Expenses, GST input/output, profit and accounting summary.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Net Sales" value={money(report?.kpis?.netSales || 0)} />
        <Kpi label="Net Profit" value={money(report?.kpis?.netProfit || 0)} tone={(report?.kpis?.netProfit || 0) >= 0 ? 'green' : 'red'} />
        <Kpi label="Expenses" value={money(totals.expenseTotal)} />
        <Kpi label="GST Payable" value={money(totals.gstPayable)} tone={totals.gstPayable >= 0 ? 'red' : 'green'} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Output GST</p><p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">{money(totals.outputTax)}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Input GST</p><p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">{money(totals.inputTax)}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">COGS</p><p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">{money(report?.kpis?.cogs || 0)}</p></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr><th className="px-6 py-4">Expense</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">GST</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><Calculator className="mx-auto mb-3 h-8 w-8 opacity-20" />No expenses found.</td></tr>
            ) : expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4"><p className="font-medium text-zinc-900 dark:text-white">{expense.title}</p><p className="font-mono text-xs text-zinc-500">{expense.expenseNumber}</p></td>
                <td className="px-6 py-4 capitalize">{expense.category}</td>
                <td className="px-6 py-4">{money(expense.amount)}</td>
                <td className="px-6 py-4">{money(expense.taxAmount)}</td>
                <td className="px-6 py-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{expense.status}</span></td>
                <td className="px-6 py-4 text-right"><button onClick={() => openEdit(expense)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button><button onClick={() => moveDraft(expense)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Expense' : 'Add Expense'}</h2><button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button></div>
            <form onSubmit={saveExpense} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['rent', 'salary', 'marketing', 'shipping', 'packaging', 'purchase', 'software', 'tax', 'other'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input type="number" min="0" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" placeholder="GST / Tax amount" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['upi', 'bank', 'cash', 'card'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="draft">draft</option><option value="approved">approved</option><option value="paid">paid</option></select>
              <input placeholder="Paid to" value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Invoice number" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <ImageUpload label="Proof image" value={form.proofImage} folder="expenses" onChange={(proofImage) => setForm({ ...form, proofImage })} />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Expense'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'red' }) {
  return <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">{label}</p><p className={`mt-2 text-2xl font-semibold ${tone === 'green' ? 'text-green-600 dark:text-green-400' : tone === 'red' ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>{value}</p></div>;
}
