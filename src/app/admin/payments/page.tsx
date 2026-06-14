import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Link from 'next/link';

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  await dbConnect();
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page || 1));
  const limit = 8;
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find({}).populate('order', 'orderId customerName').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments({}),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-white">Payments</h1><p className="text-sm text-zinc-500">COD and manual UPI payment tracking.</p></div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-white/5 text-xs uppercase text-zinc-500"><tr><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-500">No payments found.</td></tr>
            ) : payments.map((payment: any) => <tr key={payment._id.toString()}><td className="px-5 py-3 text-amber-400">{payment.paymentNumber}</td><td className="px-5 py-3">{payment.order?.orderId}</td><td className="px-5 py-3">{payment.method}</td><td className="px-5 py-3">INR {payment.amount.toLocaleString()}</td><td className="px-5 py-3">{payment.status}</td></tr>)}
          </tbody>
        </table>
      </div>
      <PaginationFooter basePath="/admin/payments" page={page} totalPages={totalPages} total={total} label="payments" />
    </div>
  );
}

function PaginationFooter({ basePath, page, totalPages, total, label }: { basePath: string; page: number; totalPages: number; total: number; label: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span>Page {page} of {totalPages} - {total.toLocaleString('en-IN')} {label}</span>
      <div className="flex items-center gap-2">
        <Link href={`${basePath}?page=${Math.max(1, page - 1)}`} className={`rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-semibold ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-zinc-50'}`}>Previous</Link>
        <Link href={`${basePath}?page=${Math.min(totalPages, page + 1)}`} className={`rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-semibold ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-zinc-50'}`}>Next</Link>
      </div>
    </div>
  );
}
