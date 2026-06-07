'use client';

import { useState } from 'react';
import { Truck } from 'lucide-react';

export default function VendorPortalPublicPage() {
  const [code, setCode] = useState('');
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState('');

  const lookup = async () => {
    setError('');
    setData(null);
    const res = await fetch(`/api/vendor-portal/access?code=${encodeURIComponent(code)}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    else setError(json.error || 'Access failed');
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-black">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold">VELRUMA Vendor Portal</h1>
          <p className="mt-2 text-sm text-zinc-400">View purchase orders and delivery status using your supplier code.</p>
        </div>

        <section className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Supplier code, e.g. SUP-ABCD-1234" className="min-h-11 flex-1 rounded-lg bg-zinc-950 px-4 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500" />
            <button onClick={lookup} className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400">Access Portal</button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </section>

        {data && (
          <section className="rounded-xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-xl font-semibold">{data.account.supplierName}</h2>
            <p className="text-sm text-zinc-500">{data.account.contactName} / {data.account.email}</p>
            <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">PO</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.purchaseOrders.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No purchase orders found.</td></tr>
                  ) : data.purchaseOrders.map((order: any) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3">{order.poNumber}</td>
                      <td className="px-4 py-3">{order.status}</td>
                      <td className="px-4 py-3">Rs.{Number(order.total || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
