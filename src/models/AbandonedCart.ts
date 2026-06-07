import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IAbandonedCart extends Document {
  _id: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  customerName?: string;
  email?: string;
  phone?: string;
  items: {
    product?: mongoose.Types.ObjectId;
    title: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'new' | 'contacted' | 'recovered' | 'lost';
  lastActivityAt: Date;
  followUpNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AbandonedCartSchema = new Schema<IAbandonedCart>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: String,
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      title: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, default: 0 },
    }],
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['new', 'contacted', 'recovered', 'lost'], default: 'new' },
    lastActivityAt: { type: Date, default: Date.now },
    followUpNote: String,
  },
  { timestamps: true }
);

AbandonedCartSchema.index({ status: 1, lastActivityAt: -1 });

const AbandonedCart: Model<IAbandonedCart> =
  mongoose.models.AbandonedCart || mongoose.model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);

export default AbandonedCart;
