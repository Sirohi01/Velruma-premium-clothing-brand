import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Link from 'next/link';

export default async function AdminInvoicesPage() {
  await dbConnect();
  const invoices = await Invoice.find({}).populate('order', 'orderId').sort({ createdAt: -1 }).lean();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Invoices</h1><p className="text-sm text-zinc-500">Issued order invoices.</p></div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-white/5 text-xs uppercase text-zinc-500"><tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-white/5">{invoices.map((invoice: any) => <tr key={invoice._id.toString()}><td className="px-5 py-3"><Link href={`/admin/invoices/${invoice._id}`} className="text-amber-400">{invoice.invoiceNumber}</Link></td><td className="px-5 py-3">{invoice.order?.orderId}</td><td className="px-5 py-3">{invoice.customerName}</td><td className="px-5 py-3">INR {invoice.total.toLocaleString()}</td><td className="px-5 py-3">{invoice.status}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
