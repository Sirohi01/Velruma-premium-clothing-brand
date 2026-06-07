import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IQualityCheck extends Document {
  _id: mongoose.Types.ObjectId;
  qcNumber: string;
  productionBatch: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  inspectorName: string;
  checkedQuantity: number;
  passedQuantity: number;
  failedQuantity: number;
  status: 'pending' | 'passed' | 'failed' | 'rework';
  checklist: {
    label: string;
    passed: boolean;
    note?: string;
  }[];
  proofImages: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QualityCheckSchema = new Schema<IQualityCheck>(
  {
    qcNumber: { type: String, required: true, unique: true },
    productionBatch: { type: Schema.Types.ObjectId, ref: 'ProductionBatch', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    inspectorName: { type: String, required: true },
    checkedQuantity: { type: Number, required: true, min: 1 },
    passedQuantity: { type: Number, default: 0, min: 0 },
    failedQuantity: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['pending', 'passed', 'failed', 'rework'], default: 'pending' },
    checklist: [{
      label: { type: String, required: true },
      passed: { type: Boolean, default: false },
      note: String,
    }],
    proofImages: [{ type: String }],
    notes: String,
  },
  { timestamps: true }
);

QualityCheckSchema.index({ productionBatch: 1, status: 1 });

const QualityCheck: Model<IQualityCheck> =
  mongoose.models.QualityCheck || mongoose.model<IQualityCheck>('QualityCheck', QualityCheckSchema);

export default QualityCheck;
