import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  order: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: 'Draft' | 'Issued' | 'Paid' | 'Cancelled';
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Issued', 'Paid', 'Cancelled'], default: 'Issued' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
