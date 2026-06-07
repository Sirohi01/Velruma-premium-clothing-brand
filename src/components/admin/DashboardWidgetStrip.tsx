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
    <section className="rounded-2xl border border-white/[0.06] bg-[#12121A] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Puzzle className="h-4 w-4 text-amber-400" />
        <h2 className="text-[15px] font-semibold text-white">Configured Dashboard Widgets</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {widgets.slice(0, 6).map((widget) => (
          <div key={widget._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">{widget.title}</p>
            <p className="mt-1 text-xs capitalize text-zinc-500">{widget.widgetType} / {widget.size}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
