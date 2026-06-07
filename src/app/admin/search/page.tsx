'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function GlobalSearchPage() {
  const [q, setQ] = useState('');
  const [groups, setGroups] = useState<any[]>([]);

  const runSearch = async (value: string) => {
    setQ(value);
    if (value.trim().length < 2) {
      setGroups([]);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    if (data.success) setGroups(data.data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Global Search</h1>
        <p className="text-sm text-zinc-500">Search products, customers, orders, invoices, suppliers, leads and tickets.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input value={q} onChange={(e) => runSearch(e.target.value)} placeholder="Type at least 2 characters..." className="w-full rounded-xl border border-zinc-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-amber-500 dark:border-white/10 dark:bg-zinc-900 dark:text-white" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.filter((group) => group.items.length > 0).map((group) => (
          <section key={group.group} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
            <h2 className="font-semibold text-zinc-900 dark:text-white">{group.group}</h2>
            <div className="mt-3 space-y-2">
              {group.items.map((item: any, index: number) => (
                <Link key={index} href={item.href} className="block rounded-lg border border-zinc-100 p-3 text-sm hover:border-amber-400 dark:border-white/5">
                  <span className="font-medium text-zinc-900 dark:text-white">{item.title}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{item.subtitle}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
