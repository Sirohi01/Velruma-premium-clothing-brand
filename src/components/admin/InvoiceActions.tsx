'use client';

import { Download, Printer } from 'lucide-react';
import { buildInvoicePdf, downloadInvoicePdf, type InvoicePdfData } from '@/lib/invoice-pdf';

export default function InvoiceActions({ invoice }: { invoice: InvoicePdfData }) {
  const printInvoice = () => {
    const doc = buildInvoicePdf(invoice);
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex gap-2">
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
