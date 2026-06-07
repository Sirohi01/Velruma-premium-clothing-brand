import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISupportTicket extends Document {
  _id: mongoose.Types.ObjectId;
  ticketNumber: string;
  customer?: mongoose.Types.ObjectId;
  customerName: string;
  email?: string;
  phone?: string;
  subject: string;
  category: 'order' | 'payment' | 'return' | 'product' | 'shipping' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  assignedTo?: mongoose.Types.ObjectId;
  messages: {
    senderType: 'customer' | 'admin';
    senderName: string;
    message: string;
    attachments: string[];
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['order', 'payment', 'return', 'product', 'shipping', 'other'], default: 'other' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'pending', 'resolved', 'closed'], default: 'open' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [{
      senderType: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      senderName: { type: String, required: true },
      message: { type: String, required: true },
      attachments: [{ type: String }],
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

SupportTicketSchema.index({ status: 1, priority: 1 });

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);

export default SupportTicket;
