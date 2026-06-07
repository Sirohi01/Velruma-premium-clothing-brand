import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IInventory extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId: string; // Storing string because it refers to the variant _id inside the Product document
  warehouse: string;
  quantity: number;
  movementType: 'in' | 'out' | 'adjustment' | 'return';
  reason?: string;
  referenceId?: string; // Order ID, Purchase Order ID, etc.
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: true },
    warehouse: { type: String, default: 'Main Warehouse' },
    quantity: { type: Number, required: true },
    movementType: { type: String, enum: ['in', 'out', 'adjustment', 'return'], required: true },
    reason: { type: String },
    referenceId: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

InventorySchema.index({ productId: 1, variantId: 1 });
InventorySchema.index({ createdAt: -1 });

const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
