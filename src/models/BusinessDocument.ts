import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBusinessDocument extends Document {
  documentNumber: string;
  documentType: 'estimate' | 'proforma' | 'receipt' | 'delivery_challan' | 'credit_note' | 'debit_note' | 'purchase_invoice' | 'payment_voucher';
  customerName: string;
  customerEmail?: string;
  reference?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Draft' | 'Issued' | 'Paid' | 'Cancelled';
  notes?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessDocumentSchema = new Schema<IBusinessDocument>(
  {
    documentNumber: { type: String, required: true, unique: true },
    documentType: {
      type: String,
      enum: ['estimate', 'proforma', 'receipt', 'delivery_challan', 'credit_note', 'debit_note', 'purchase_invoice', 'payment_voucher'],
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    customerEmail: String,
    reference: String,
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Issued', 'Paid', 'Cancelled'], default: 'Draft' },
    notes: String,
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BusinessDocument: Model<IBusinessDocument> =
  mongoose.models.BusinessDocument || mongoose.model<IBusinessDocument>('BusinessDocument', BusinessDocumentSchema);

export default BusinessDocument;
