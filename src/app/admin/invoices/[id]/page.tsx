import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import InvoiceActions from '@/components/admin/InvoiceActions';

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { invoiceNumber: id };
  const invoice = await Invoice.findOne(query).populate('order').lean();

  if (!invoice) {
    return <div className="rounded-xl border border-white/10 bg-zinc-900 p-6 text-white">Invoice not found.</div>;
  }

  const plainInvoice = JSON.parse(JSON.stringify(invoice));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{plainInvoice.invoiceNumber}</h1>
          <p className="text-sm text-zinc-500">{plainInvoice.customerName} - INR {plainInvoice.total.toLocaleString()}</p>
        </div>
        <InvoiceActions invoice={plainInvoice} />
      </div>

      <section className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Customer</h2>
            <p className="mt-2 text-sm text-zinc-400">{plainInvoice.customerName}</p>
            <p className="text-sm text-zinc-400">{plainInvoice.customerEmail}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Order</h2>
            <p className="mt-2 text-sm text-zinc-400">{plainInvoice.order?.orderId}</p>
            <p className="text-sm text-zinc-400">{plainInvoice.order?.paymentMethod} / {plainInvoice.order?.paymentStatus}</p>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-white/5 text-xs uppercase text-zinc-500">
              <tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Variant</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(plainInvoice.order?.items || []).map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{[item.variant?.size, item.variant?.color, item.variant?.sku].filter(Boolean).join(' / ')}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">INR {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm text-zinc-300">
          <Row label="Subtotal" value={plainInvoice.subtotal} />
          <Row label="Shipping" value={plainInvoice.shippingFee} />
          <Row label="GST" value={plainInvoice.tax} />
          <Row label="Discount" value={-plainInvoice.discount} />
          <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white"><span>Total</span><span>INR {plainInvoice.total.toLocaleString()}</span></div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between"><span>{label}</span><span>INR {Number(value || 0).toLocaleString()}</span></div>;
}
