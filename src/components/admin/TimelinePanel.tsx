'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TimelinePanel({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    const res = await fetch(`/api/timelines?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`);
    const data = await res.json();
    if (data.success) setItems(data.data);
  };

  useEffect(() => {
    load();
  }, [entityType, entityId]);

  const add = async () => {
    if (!title.trim()) return;
    const res = await fetch('/api/timelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, title, note, channel: 'note', status: 'open' }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Timeline note added');
      setTitle('');
      setNote('');
      load();
    } else {
      toast.error(data.error || 'Timeline note failed');
    }
  };

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900 p-5">
      <h2 className="font-semibold text-white">Universal Activity Timeline</h2>
      <div className="mt-4 grid gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Timeline title" className="rounded-lg bg-zinc-950 px-3 py-2 text-sm text-white" />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" rows={3} className="rounded-lg bg-zinc-950 px-3 py-2 text-sm text-white" />
        <button onClick={add} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black">
          <Plus className="h-4 w-4" />
          Add Timeline Note
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? <p className="text-sm text-zinc-500">No universal timeline notes yet.</p> : items.map((item) => (
          <div key={item._id} className="border-l-2 border-amber-500 pl-4 text-sm">
            <p className="font-medium text-white">{item.title}</p>
            <p className="text-zinc-500">{item.note}</p>
            <p className="mt-1 text-xs text-zinc-600">{item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : ''}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
