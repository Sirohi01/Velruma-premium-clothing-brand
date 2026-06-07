import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export default async function AdminPaymentsPage() {
  await dbConnect();
  const payments = await Payment.find({}).populate('order', 'orderId customerName').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 }).lean();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Payments</h1><p className="text-sm text-zinc-500">COD and manual UPI payment tracking.</p></div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-white/5 text-xs uppercase text-zinc-500"><tr><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-white/5">{payments.map((payment: any) => <tr key={payment._id.toString()}><td className="px-5 py-3 text-amber-400">{payment.paymentNumber}</td><td className="px-5 py-3">{payment.order?.orderId}</td><td className="px-5 py-3">{payment.method}</td><td className="px-5 py-3">INR {payment.amount.toLocaleString()}</td><td className="px-5 py-3">{payment.status}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
