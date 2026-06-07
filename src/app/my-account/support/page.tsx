'use client';

import { useEffect, useState } from 'react';
import { HeadphonesIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [form, setForm] = useState({ subject: '', category: 'order', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [user?.email]);

  const fetchTickets = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/support?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch {
      toast.error('Failed to load support tickets');
    }
  };

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          customerName: user?.name || 'Customer',
          email: user?.email,
          phone: user?.phone,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Ticket create failed');
        return;
      }
      toast.success('Support ticket created');
      setForm({ subject: '', category: 'order', message: '' });
      fetchTickets();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Support</h1>
        <p className="mt-2 text-sm text-zinc-400">Create tickets and track replies from VELRUMA support.</p>
      </div>
      <form onSubmit={createTicket} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
        <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-amber-500" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-amber-500">
          {['order', 'payment', 'return', 'product', 'shipping', 'other'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <textarea required placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-amber-500 md:col-span-2" rows={4} />
        <button disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60 md:col-span-2">
          <Plus className="h-4 w-4" />
          {saving ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
      <div className="rounded-xl border border-white/10 bg-white/5">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-zinc-400"><HeadphonesIcon className="mx-auto mb-3 h-8 w-8 opacity-30" />No support tickets yet.</div>
        ) : tickets.map((ticket) => (
          <div key={ticket._id} className="border-b border-white/10 p-5 last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-medium text-white">{ticket.subject}</p><p className="mt-1 font-mono text-xs text-zinc-500">{ticket.ticketNumber}</p></div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs capitalize text-zinc-300">{ticket.status}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400">{ticket.messages?.at(-1)?.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
