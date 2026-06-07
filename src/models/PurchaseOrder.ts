import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPurchaseOrder extends Document {
  _id: mongoose.Types.ObjectId;
  poNumber: string;
  supplier: mongoose.Types.ObjectId;
  items: {
    product?: mongoose.Types.ObjectId;
    description: string;
    sku?: string;
    quantity: number;
    unitCost: number;
    receivedQuantity: number;
  }[];
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  expectedDelivery?: Date;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  followUps: {
    channel: 'call' | 'whatsapp' | 'email' | 'meeting';
    note: string;
    followUpAt?: Date;
    completed: boolean;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      description: { type: String, required: true },
      sku: String,
      quantity: { type: Number, required: true, min: 1 },
      unitCost: { type: Number, required: true, min: 0 },
      receivedQuantity: { type: Number, default: 0, min: 0 },
    }],
    status: { type: String, enum: ['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'], default: 'draft' },
    expectedDelivery: Date,
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    notes: String,
    followUps: [{
      channel: { type: String, enum: ['call', 'whatsapp', 'email', 'meeting'], default: 'call' },
      note: { type: String, required: true },
      followUpAt: Date,
      completed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ supplier: 1, status: 1 });

const PurchaseOrder: Model<IPurchaseOrder> =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

export default PurchaseOrder;
