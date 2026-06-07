'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, Edit2, Plus, Trash2, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';

const stages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const blankForm = {
  name: '',
  email: '',
  phone: '',
  source: 'manual',
  stage: 'new',
  score: 10,
  interest: '',
  value: 0,
  nextFollowUpAt: '',
  notes: '',
};

export default function CrmPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [lostTarget, setLostTarget] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(blankForm);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    pipeline: leads.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
    followUps: leads.filter((lead) => lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) <= new Date()).length,
    won: leads.filter((lead) => lead.stage === 'won').length,
  }), [leads]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm);
    setModalOpen(true);
  };

  const openEdit = (lead: any) => {
    setEditTarget(lead);
    setForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'manual',
      stage: lead.stage || 'new',
      score: lead.score || 10,
      interest: lead.interest || '',
      value: lead.value || 0,
      nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 16) : '',
      notes: lead.notes || '',
    });
    setModalOpen(true);
  };

  const saveLead = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editTarget ? `/api/leads/${editTarget._id}` : '/api/leads', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Lead save failed');
        return;
      }
      toast.success(editTarget ? 'Lead updated' : 'Lead added');
      setModalOpen(false);
      fetchLeads();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const markLost = async () => {
    if (!lostTarget?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lostTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead marked lost');
        setLostTarget(null);
        fetchLeads();
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>CRM & Leads</h1>
          <p className="text-sm text-zinc-500">Track leads, score intent, and schedule manual follow-ups.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-black">
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Pipeline Value</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">₹{stats.pipeline.toLocaleString('en-IN')}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Due Follow-ups</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{stats.followUps}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Won Leads</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{stats.won}</p></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-6">
        {stages.map((stage) => (
          <div key={stage} className="min-h-80 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-950/40">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold capitalize text-zinc-900 dark:text-white">{stage}</h2>
              <span className="rounded-full bg-white px-2 py-1 text-xs text-zinc-500 dark:bg-white/10">{leads.filter((lead) => lead.stage === stage).length}</span>
            </div>
            <div className="space-y-3">
              {loading ? <p className="text-sm text-zinc-500">Loading...</p> : leads.filter((lead) => lead.stage === stage).map((lead) => (
                <div key={lead._id} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.phone || lead.email || 'No contact'}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{lead.score}</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{lead.interest || 'General enquiry'}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>₹{Number(lead.value || 0).toLocaleString('en-IN')}</span>
                    {lead.nextFollowUpAt && <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{lead.nextFollowUpAt.slice(0, 10)}</span>}
                  </div>
                  <div className="mt-3 flex justify-end gap-1">
                    <button onClick={() => openEdit(lead)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setLostTarget(lead)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {!loading && leads.filter((lead) => lead.stage === stage).length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-white/10">
                  <UserCheck className="mx-auto mb-2 h-6 w-6 opacity-30" />
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editTarget ? 'Edit Lead' : 'Add Lead'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveLead} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="Lead name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input placeholder="Interest" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['manual', 'website', 'instagram', 'whatsapp', 'referral', 'exhibition'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{stages.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input type="number" min="0" max="100" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="datetime-local" value={form.nextFollowUpAt} onChange={(e) => setForm({ ...form, nextFollowUpAt: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" rows={3} />
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Cancel</button>
                <button disabled={saving} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">{saving ? 'Saving...' : 'Save Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lostTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950">
            <div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10"><AlertTriangle className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Mark lead lost?</h2><p className="mt-1 text-sm text-zinc-500">{lostTarget.name} will move to lost stage.</p></div></div>
            <div className="mt-5 flex justify-end gap-3"><button onClick={() => setLostTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">Keep Lead</button><button onClick={markLost} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Mark Lost</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
