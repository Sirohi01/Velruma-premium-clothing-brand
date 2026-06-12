'use client';

import { Download, Printer, Send } from 'lucide-react';
import { toast } from 'sonner';
import { buildInvoicePdf, downloadInvoicePdf, type InvoicePdfData } from '@/lib/invoice-pdf';

export default function InvoiceActions({ invoice }: { invoice: InvoicePdfData }) {
  const printInvoice = () => {
    const doc = buildInvoicePdf(invoice);
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  const sendInvoice = async () => {
    const res = await fetch(`/api/invoices/${invoice._id}/send`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      toast.success('Invoice sent');
    } else {
      toast.error(data.error || 'Invoice email failed');
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={sendInvoice} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400">
        <Send className="h-4 w-4" />
        Send Email
      </button>
      <button onClick={() => downloadInvoicePdf(invoice)} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400">
        <Download className="h-4 w-4" />
        Download PDF
      </button>
      <button onClick={printInvoice} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">
        <Printer className="h-4 w-4" />
        Preview/Print
      </button>
    </div>
  );
}
