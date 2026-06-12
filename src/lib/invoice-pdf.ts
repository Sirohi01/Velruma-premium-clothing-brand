'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type InvoiceOrderItem = {
  title: string;
  quantity: number;
  price: number;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
};

export type InvoicePdfData = {
  _id?: string;
  invoiceNumber: string;
  issuedAt?: string | Date;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  order?: {
    orderId?: string;
    phone?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    shippingAddress?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    items?: InvoiceOrderItem[];
  };
};

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

export function buildInvoicePdf(invoice: InvoicePdfData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const issuedAt = invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const address = invoice.order?.shippingAddress;

  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 104, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('VELRUMA', 40, 45);
  doc.setFontSize(10);
  doc.text('Premium Clothing Brand', 40, 64);
  doc.setFontSize(18);
  doc.text('TAX INVOICE', pageWidth - 170, 45);
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, pageWidth - 170, 64);

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${issuedAt}`, 40, 135);
  doc.text(`Order: ${invoice.order?.orderId || '-'}`, 40, 152);
  doc.text(`Status: ${invoice.status}`, 40, 169);

  doc.setFontSize(12);
  doc.text('Bill To', 40, 205);
  doc.setFontSize(10);
  doc.text(invoice.customerName, 40, 224);
  doc.text(invoice.customerEmail, 40, 240);
  if (invoice.order?.phone) doc.text(invoice.order.phone, 40, 256);

  doc.setFontSize(12);
  doc.text('Ship To', pageWidth / 2, 205);
  doc.setFontSize(10);
  const lines = [
    address?.addressLine1,
    address?.addressLine2,
    [address?.city, address?.state, address?.pincode].filter(Boolean).join(', '),
    address?.country,
  ].filter(Boolean) as string[];
  lines.forEach((line, index) => doc.text(line, pageWidth / 2, 224 + index * 16));

  autoTable(doc, {
    startY: 305,
    head: [['Item', 'Variant/SKU', 'Qty', 'Rate', 'Amount']],
    body: (invoice.order?.items || []).map((item) => [
      item.title,
      [item.variant?.size, item.variant?.color, item.variant?.sku].filter(Boolean).join(' / ') || '-',
      String(item.quantity),
      money(item.price),
      money(item.price * item.quantity),
    ]),
    styles: { fontSize: 9, cellPadding: 8 },
    headStyles: { fillColor: [10, 10, 15], textColor: [255, 255, 255] },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 380;
  const totalsX = pageWidth - 230;
  const rows = [
    ['Subtotal', invoice.subtotal],
    ['Shipping', invoice.shippingFee],
    ['GST', invoice.tax],
    ['Discount', -invoice.discount],
    ['Total', invoice.total],
  ];
  rows.forEach(([label, amount], index) => {
    const y = finalY + 35 + index * 18;
    doc.setFontSize(index === rows.length - 1 ? 12 : 10);
    doc.text(String(label), totalsX, y);
    doc.text(money(Number(amount)), pageWidth - 40, y, { align: 'right' });
  });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 105);
  doc.text('This is a computer-generated invoice for manual COD/UPI workflow.', 40, 780);
  return doc;
}

export function downloadInvoicePdf(invoice: InvoicePdfData) {
  buildInvoicePdf(invoice).save(`${invoice.invoiceNumber}.pdf`);
}
