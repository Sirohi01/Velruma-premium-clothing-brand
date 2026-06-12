import Link from 'next/link';
import { ArrowLeft, Building2, FileText, MapPin, ReceiptText, User } from 'lucide-react';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';
import Setting from '@/models/Setting';
import InvoiceActions from '@/components/admin/InvoiceActions';

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

async function getSettings() {
  const rows = await Setting.find({ key: { $in: ['brand_name', 'brand_logo', 'brand_email', 'brand_phone', 'brand_address', 'gst_number'] } }).lean();
  return rows.reduce<Record<string, string>>((map, setting: any) => {
    map[setting.key] = setting.value == null ? '' : String(setting.value);
    return map;
  }, {});
}

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { invoiceNumber: id };
  const settings = await getSettings();
  let invoice: any = await Invoice.findOne(query).populate('order').lean();

  if (!invoice) {
    const orderQuery = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    const order = await Order.findOne(orderQuery).select('_id').lean();
    if (order) {
      invoice = await Invoice.findOne({ order: order._id }).populate('order').lean();
    }
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400">
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-zinc-600" />
          <h1 className="mt-4 text-xl font-bold text-white">Invoice not found</h1>
          <p className="mt-2 text-sm text-zinc-500">No invoice exists for <span className="font-mono text-zinc-300">{id}</span>. Open the order and regenerate/check invoice documents.</p>
        </div>
      </div>
    );
  }

  const plainInvoice = JSON.parse(JSON.stringify(invoice));
  const order = plainInvoice.order || {};
  const address = order.shippingAddress || {};
  const brandName = settings.brand_name || 'VELRUMA';
  const gstNumber = settings.gst_number || '';
  const isMarketplaceOrder = ['Flipkart', 'Amazon', 'Other'].includes(order.orderSource) || order.paymentMethod === 'PREPAID';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/invoices" className="mt-1 rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{plainInvoice.invoiceNumber}</h1>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">{plainInvoice.status}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{plainInvoice.customerName} - {money(plainInvoice.total)}</p>
          </div>
        </div>
        <InvoiceActions invoice={plainInvoice} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white">
                {settings.brand_logo ? (
                  <img src={settings.brand_logo} alt={brandName} className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xl font-bold tracking-widest text-zinc-950">V</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Tax Invoice</p>
                <h2 className="mt-1 text-3xl font-bold text-white">{brandName}</h2>
                <p className="mt-1 max-w-xl text-sm text-zinc-400">{settings.brand_address || 'Business address not set'}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm">
              <InfoLine label="Invoice No." value={plainInvoice.invoiceNumber} strong />
              <InfoLine label="Invoice Date" value={new Date(plainInvoice.issuedAt || plainInvoice.createdAt).toLocaleDateString('en-IN')} />
              <InfoLine label="Order ID" value={order.orderId || '-'} />
              <InfoLine label="GSTIN" value={gstNumber || 'Not configured'} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MiniCard icon={<Building2 className="h-4 w-4" />} label="Seller Contact" value={[settings.brand_email, settings.brand_phone].filter(Boolean).join(' / ') || '-'} />
            <MiniCard icon={<ReceiptText className="h-4 w-4" />} label="Payment" value={`${order.paymentMethod || '-'} / ${order.paymentStatus || '-'}`} />
            <MiniCard icon={<FileText className="h-4 w-4" />} label="Order Status" value={order.orderStatus || '-'} />
          </div>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-2">
          <PartyCard icon={<User className="h-4 w-4" />} title="Bill To">
            <p className="font-semibold text-white">{plainInvoice.customerName}</p>
            <p>{plainInvoice.customerEmail}</p>
            {order.phone && <p>{order.phone}</p>}
          </PartyCard>
          <PartyCard icon={<MapPin className="h-4 w-4" />} title="Ship To">
            <p>{address.addressLine1 || '-'}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{[address.city, address.state, address.pincode].filter(Boolean).join(', ') || '-'}</p>
            <p>{address.country || 'India'}</p>
          </PartyCard>
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Variant / SKU</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-white/[0.02]">
                {(order.items || []).map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-4 text-zinc-500">{index + 1}</td>
                    <td className="px-4 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-4 py-4 text-zinc-400">{[item.variant?.size, item.variant?.color, item.variant?.sku].filter(Boolean).join(' / ') || '-'}</td>
                    <td className="px-4 py-4 text-center">{item.quantity}</td>
                    <td className="px-4 py-4 text-right">{money(item.price)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-white">{money(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
              <p className="font-semibold text-white">Notes</p>
              <p className="mt-2">This is a computer-generated invoice. Please verify GSTIN, address and tax details before sending to customer.</p>
              {!gstNumber && <p className="mt-2 text-amber-300">GST number is not configured in settings.</p>}
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm">
              <AmountRow label="Subtotal" value={plainInvoice.subtotal} />
              {!isMarketplaceOrder && (
                <>
                  <AmountRow label="Shipping" value={plainInvoice.shippingFee} />
                  <AmountRow label="GST" value={plainInvoice.tax} />
                  <AmountRow label="Discount" value={-plainInvoice.discount} />
                </>
              )}
              {isMarketplaceOrder && (
                <p className="mt-2 rounded-lg bg-white/5 p-2 text-xs leading-5 text-zinc-500">Marketplace order: shipping, tax and collection charges are handled on the source portal.</p>
              )}
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
                <span>Total</span>
                <span>{money(isMarketplaceOrder ? plainInvoice.subtotal : plainInvoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex min-w-72 justify-between gap-4 border-b border-white/5 py-1.5 last:border-0"><span className="text-zinc-500">{label}</span><span className={`text-right ${strong ? 'font-semibold text-white' : 'text-zinc-300'}`}>{value}</span></div>;
}

function MiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-zinc-950 p-3"><div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">{icon}{label}</div><p className="mt-2 truncate text-sm font-semibold text-white">{value}</p></div>;
}

function PartyCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400"><div className="mb-3 flex items-center gap-2 font-semibold text-white">{icon}{title}</div><div className="space-y-1">{children}</div></div>;
}

function AmountRow({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  return <div className="flex justify-between py-1.5 text-zinc-300"><span>{label}</span><span>{money(value)}</span></div>;
}
