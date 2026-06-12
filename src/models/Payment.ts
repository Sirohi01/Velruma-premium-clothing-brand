import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  paymentNumber: string;
  order: mongoose.Types.ObjectId;
  invoice?: mongoose.Types.ObjectId;
  method: 'COD' | 'UPI' | 'PREPAID';
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  amount: number;
  proofImage?: string;
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

if (process.env.NODE_ENV === 'development' && mongoose.models.Payment) {
  mongoose.deleteModel('Payment');
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    method: { type: String, enum: ['COD', 'UPI', 'PREPAID'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    amount: { type: Number, required: true },
    proofImage: { type: String },
    notes: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
