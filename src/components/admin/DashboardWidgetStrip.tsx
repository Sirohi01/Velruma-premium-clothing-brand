'use client';

import { useEffect, useState } from 'react';
import { Puzzle } from 'lucide-react';

export default function DashboardWidgetStrip() {
  const [widgets, setWidgets] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/widgets?status=active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWidgets(data.data.filter((item: any) => item.isEnabled).sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0)));
      })
      .catch(() => undefined);
  }, []);

  if (widgets.length === 0) return null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Puzzle className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-zinc-950">Configured Dashboard Widgets</h2>
          <p className="text-xs text-zinc-500">Live widgets selected from admin widget builder.</p>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {widgets.slice(0, 6).map((widget) => (
          <div key={widget._id} className="rounded-lg border border-zinc-200 bg-[#faf8f4] p-2.5">
            <p className="text-sm font-bold text-zinc-950">{widget.title}</p>
            <p className="mt-1 text-xs capitalize text-zinc-500">{widget.widgetType} / {widget.size}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
