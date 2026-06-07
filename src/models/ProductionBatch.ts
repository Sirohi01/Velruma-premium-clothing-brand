import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type ProductionStage = 'cutting' | 'stitching' | 'printing' | 'washing' | 'qc' | 'packing';

export interface IProductionBatch extends Document {
  _id: mongoose.Types.ObjectId;
  batchNumber: string;
  product: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  purchaseOrder?: mongoose.Types.ObjectId;
  plannedQuantity: number;
  completedQuantity: number;
  rejectedQuantity: number;
  currentStage: ProductionStage;
  status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  targetDate?: Date;
  stages: {
    stage: ProductionStage;
    status: 'pending' | 'in_progress' | 'completed';
    quantityDone: number;
    notes?: string;
    completedAt?: Date;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stageValues = ['cutting', 'stitching', 'printing', 'washing', 'qc', 'packing'];

const ProductionBatchSchema = new Schema<IProductionBatch>(
  {
    batchNumber: { type: String, required: true, unique: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    plannedQuantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
    currentStage: { type: String, enum: stageValues, default: 'cutting' },
    status: { type: String, enum: ['planned', 'in_progress', 'paused', 'completed', 'cancelled'], default: 'planned' },
    startDate: Date,
    targetDate: Date,
    stages: [{
      stage: { type: String, enum: stageValues, required: true },
      status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
      quantityDone: { type: Number, default: 0 },
      notes: String,
      completedAt: Date,
    }],
    notes: String,
  },
  { timestamps: true }
);

ProductionBatchSchema.index({ product: 1, status: 1 });

const ProductionBatch: Model<IProductionBatch> =
  mongoose.models.ProductionBatch || mongoose.model<IProductionBatch>('ProductionBatch', ProductionBatchSchema);

export default ProductionBatch;
