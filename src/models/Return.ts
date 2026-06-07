import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IReturn extends Document {
  _id: mongoose.Types.ObjectId;
  returnNumber: string;
  order: mongoose.Types.ObjectId;
  reason: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Received' | 'Refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema = new Schema<IReturn>(
  {
    returnNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Received', 'Refunded'], default: 'Requested' },
    notes: { type: String },
  },
  { timestamps: true }
);

const ReturnModel: Model<IReturn> = mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);

export default ReturnModel;
