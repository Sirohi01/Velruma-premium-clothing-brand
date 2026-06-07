import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  expenseNumber: string;
  title: string;
  category: 'rent' | 'salary' | 'marketing' | 'shipping' | 'packaging' | 'purchase' | 'software' | 'tax' | 'other';
  amount: number;
  taxAmount: number;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'card';
  paidTo?: string;
  supplier?: mongoose.Types.ObjectId;
  invoiceNumber?: string;
  proofImage?: string;
  notes?: string;
  expenseDate: Date;
  status: 'draft' | 'approved' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['rent', 'salary', 'marketing', 'shipping', 'packaging', 'purchase', 'software', 'tax', 'other'],
      default: 'other',
    },
    amount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'upi', 'card'], default: 'upi' },
    paidTo: String,
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    invoiceNumber: String,
    proofImage: String,
    notes: String,
    expenseDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'approved', 'paid'], default: 'paid' },
  },
  { timestamps: true }
);

ExpenseSchema.index({ category: 1, expenseDate: -1 });
ExpenseSchema.index({ status: 1 });

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
