import Setting from '@/models/Setting';
import { renderMarketingEmail, sendSmtpMail } from '@/lib/smtp-mailer';

type SettingMap = Record<string, unknown>;

function valueAsString(settings: SettingMap, key: string, fallback = '') {
  const value = settings[key];
  return typeof value === 'string' ? value : value == null ? fallback : String(value);
}

function valueAsNumber(settings: SettingMap, key: string, fallback: number) {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : fallback;
}

function valueAsBoolean(settings: SettingMap, key: string, fallback = false) {
  const value = settings[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return fallback;
}

async function getEmailSettings() {
  const rows = await Setting.find({ group: { $in: ['email', 'brand'] } }).lean();
  return rows.reduce<SettingMap>((map, item: any) => {
    map[item.key] = item.value;
    return map;
  }, {});
}

function statusMessage(order: any, status: string) {
  const tracking = order.trackingNumber
    ? `\n\nCourier: ${order.courierName || '-'}\nTracking number: ${order.trackingNumber}`
    : '';

  const messages: Record<string, string> = {
    Pending: 'We have received your order request and it is waiting for review.',
    Confirmed: 'Your order is confirmed. We will start preparing it now.',
    Processing: 'Your order is being processed by our team.',
    Packed: 'Your order has been packed and is ready for dispatch.',
    Shipped: `Your order has been shipped.${tracking}`,
    'Out for Delivery': `Your order is out for delivery today.${tracking}`,
    Delivered: 'Your order has been delivered. Thank you for shopping with VELRUMA.',
    Cancelled: 'Your order has been cancelled. If this was unexpected, please contact support.',
    Returned: 'Your order has been marked as returned.',
  };

  return messages[status] || `Your order status changed to ${status}.`;
}

async function sendOrderEmail(order: any, subject: string, headline: string, body: string) {
  if (!order?.email) return;

  const settings = await getEmailSettings();
  const smtp = {
    host: valueAsString(settings, 'smtp_host'),
    port: valueAsNumber(settings, 'smtp_port', 587),
    secure: valueAsBoolean(settings, 'smtp_secure', false),
    user: valueAsString(settings, 'smtp_user'),
    password: valueAsString(settings, 'smtp_password'),
  };
  const fromEmail = valueAsString(settings, 'smtp_from_email', valueAsString(settings, 'brand_email', 'hello@velruma.com'));
  const fromName = valueAsString(settings, 'smtp_from_name', valueAsString(settings, 'brand_name', 'VELRUMA'));
  const replyTo = valueAsString(settings, 'marketing_reply_to', fromEmail);
  const logo = valueAsString(settings, 'marketing_default_logo', '');
  const footerNote = valueAsString(settings, 'marketing_footer_text', 'VELRUMA - Premium oversized essentials crafted in India.');

  await sendSmtpMail(smtp, {
    fromName,
    fromEmail,
    replyTo,
    to: [order.email],
    subject,
    html: renderMarketingEmail({
      logo,
      headline,
      body: `Hi ${order.customerName || 'there'},\n\n${body}\n\nOrder ID: ${order.orderId}\nTotal: INR ${Number(order.total || 0).toLocaleString('en-IN')}`,
      ctaLabel: 'Track order',
      ctaUrl: `/track-order?order=${encodeURIComponent(order.orderId)}`,
      footerNote,
      preheader: subject,
    }),
  });
}

async function safelySend(callback: () => Promise<void>) {
  try {
    await callback();
  } catch (error) {
    console.error('Order email error:', error);
  }
}

export async function notifyPaymentVerification(order: any) {
  await safelySend(() => sendOrderEmail(
    order,
    `Payment verification started for ${order.orderId}`,
    'Payment Verification Started',
    'We have received your manual payment proof. Our team will verify it and place your order confirmation after payment is approved.'
  ));
}

export async function notifyOrderConfirmed(order: any) {
  await safelySend(() => sendOrderEmail(
    order,
    `Order confirmed: ${order.orderId}`,
    'Order Confirmed',
    'Your order is confirmed. We will start preparing it now and keep you updated at every step.'
  ));
}

export async function notifyOrderStatusChanged(order: any, status: string) {
  await safelySend(() => sendOrderEmail(
    order,
    `Order ${status}: ${order.orderId}`,
    `Order ${status}`,
    statusMessage(order, status)
  ));
}

function documentLabel(type: string) {
  const labels: Record<string, string> = {
    estimate: 'Estimate',
    proforma: 'Proforma Invoice',
    receipt: 'Payment Receipt',
    invoice: 'Invoice',
  };
  return labels[type] || 'Document';
}

export async function notifyBusinessDocument(document: any) {
  const label = documentLabel(document.documentType);
  await safelySend(() => sendOrderEmail(
    {
      email: document.customerEmail,
      customerName: document.customerName,
      orderId: document.reference || document.documentNumber,
      total: document.total,
    },
    `${label}: ${document.documentNumber}`,
    label,
    `${label} ${document.documentNumber} has been generated for your order.\n\nReference: ${document.reference || '-'}\nAmount: INR ${Number(document.total || 0).toLocaleString('en-IN')}\nStatus: ${document.status || '-'}${document.notes ? `\n\nNotes: ${document.notes}` : ''}`
  ));
}

export async function notifyInvoice(invoice: any) {
  await safelySend(() => sendOrderEmail(
    {
      email: invoice.customerEmail,
      customerName: invoice.customerName,
      orderId: invoice.order?.orderId || invoice.invoiceNumber,
      total: invoice.total,
    },
    `Invoice: ${invoice.invoiceNumber}`,
    'Invoice',
    `Invoice ${invoice.invoiceNumber} has been issued for your order.\n\nAmount: INR ${Number(invoice.total || 0).toLocaleString('en-IN')}\nStatus: ${invoice.status || '-'}`
  ));
}

export async function notifyPaymentReceipt(document: any) {
  await safelySend(() => sendOrderEmail(
    {
      email: document.customerEmail,
      customerName: document.customerName,
      orderId: document.reference || document.documentNumber,
      total: document.total,
    },
    `Payment receipt: ${document.documentNumber}`,
    'Payment Receipt',
    `Your payment has been received. Receipt ${document.documentNumber} has been generated.\n\nReference: ${document.reference || '-'}\nAmount: INR ${Number(document.total || 0).toLocaleString('en-IN')}`
  ));
}
