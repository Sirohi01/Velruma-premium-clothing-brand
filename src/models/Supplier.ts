import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  type: 'fabric' | 'trim' | 'printing' | 'packaging' | 'manufacturer' | 'other';
  contacts: { name: string; phone: string; email?: string; role?: string }[];
  gstNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  rating: number;
  paymentTerms?: string;
  leadTimeDays?: number;
  isActive: boolean;
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

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['fabric', 'trim', 'printing', 'packaging', 'manufacturer', 'other'], default: 'other' },
    contacts: [{
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      role: { type: String },
    }],
    gstNumber: { type: String, trim: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    rating: { type: Number, default: 3, min: 1, max: 5 },
    paymentTerms: { type: String },
    leadTimeDays: { type: Number, default: 7 },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
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

SupplierSchema.index({ type: 1, isActive: 1 });

const Supplier: Model<ISupplier> = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);

export default Supplier;
