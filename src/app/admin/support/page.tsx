'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Edit2, HeadphonesIcon, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const blankForm = {
  customerName: '',
  email: '',
  phone: '',
  subject: '',
  category: 'other',
  priority: 'medium',
  status: 'open',
  message: '',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [closeTarget, setCloseTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState<any>(blankForm);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setReply('');
    setForm(blankForm);
    setModalOpen(true);
  };

  const openEdit = (ticket: any) => {
    setEditTarget(ticket);
    setReply('');
    setForm({
      customerName: ticket.customerName || '',
      email: ticket.email || '',
      phone: ticket.phone || '',
      subject: ticket.subject || '',
      category: ticket.category || 'other',
      priority: ticket.priority || 'medium',
      status: ticket.status || 'open',
      message: ticket.messages?.[0]?.message || '',
    });
    setModalOpen(true);
  };

  const saveTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = editTarget && reply
        ? { status: form.status, priority: form.priority, reply: { senderType: 'admin', senderName: 'VELRUMA Support', message: reply, attachments: [] } }
        : form;
      const res = await fetch(editTarget ? `/api/support/${editTarget._id}` : '/api/support', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Ticket save failed');
        return;
      }
      toast.success(editTarget ? 'Ticket updated' : 'Ticket created');
      setModalOpen(false);
      fetchTickets();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const closeTicket = async () => {
    if (!closeTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/support/${closeTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Ticket closed');
        setCloseTarget(null);
        fetchTickets();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Support Desk</h1>
          <p className="text-sm text-zinc-500">Manage customer tickets, replies, priority and resolution status.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />New Ticket</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
            <tr><th className="px-6 py-4 font-medium">Ticket</th><th className="px-6 py-4 font-medium">Customer</th><th className="px-6 py-4 font-medium">Category</th><th className="px-6 py-4 font-medium">Priority</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">Loading tickets...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><HeadphonesIcon className="mx-auto mb-3 h-8 w-8 opacity-20" />No tickets found.</td></tr>
            ) : tickets.map((ticket) => (
              <tr key={ticket._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4"><p className="font-mono text-xs">{ticket.ticketNumber}</p><p className="font-medium text-zinc-900 dark:text-white">{ticket.subject}</p></td>
                <td className="px-6 py-4"><p>{ticket.customerName}</p><p className="text-xs text-zinc-500">{ticket.email || ticket.phone}</p></td>
                <td className="px-6 py-4 capitalize">{ticket.category}</td>
                <td className="px-6 py-4 capitalize">{ticket.priority}</td>
                <td className="px-6 py-4"><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{ticket.status}</span></td>
                <td className="px-6 py-4 text-right"><button onClick={() => openEdit(ticket)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button><button onClick={() => setCloseTarget(ticket)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Update Ticket' : 'New Ticket'}</h2><button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button></div>
            <form onSubmit={saveTicket} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required disabled={!!editTarget} placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input disabled={!!editTarget} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input disabled={!!editTarget} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input required disabled={!!editTarget} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['order', 'payment', 'return', 'product', 'shipping', 'other'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['low', 'medium', 'high', 'urgent'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['open', 'pending', 'resolved', 'closed'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              {!editTarget && <textarea required placeholder="Customer message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={4} />}
              {editTarget && <textarea placeholder="Admin reply" value={reply} onChange={(e) => setReply(e.target.value)} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={4} />}
              <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Ticket'}</button></div>
            </form>
          </div>
        </div>
      )}

      {closeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10"><AlertTriangle className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Close ticket?</h2><p className="mt-1 text-sm text-zinc-500">{closeTarget.ticketNumber} will move to closed status.</p></div></div><div className="mt-5 flex justify-end gap-3"><button onClick={() => setCloseTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep Open</button><button onClick={closeTicket} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Close Ticket</button></div></div></div>
      )}
    </div>
  );
}
