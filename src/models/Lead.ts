import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  source: 'website' | 'instagram' | 'whatsapp' | 'referral' | 'exhibition' | 'manual';
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: number;
  interest?: string;
  value: number;
  assignedTo?: mongoose.Types.ObjectId;
  nextFollowUpAt?: Date;
  notes?: string;
  timeline: {
    type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'note';
    note: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    source: { type: String, enum: ['website', 'instagram', 'whatsapp', 'referral', 'exhibition', 'manual'], default: 'manual' },
    stage: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'], default: 'new' },
    score: { type: Number, default: 10, min: 0, max: 100 },
    interest: String,
    value: { type: Number, default: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    nextFollowUpAt: Date,
    notes: String,
    timeline: [{
      type: { type: String, enum: ['call', 'whatsapp', 'email', 'meeting', 'note'], default: 'note' },
      note: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

LeadSchema.index({ stage: 1, score: -1 });
LeadSchema.index({ nextFollowUpAt: 1 });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
