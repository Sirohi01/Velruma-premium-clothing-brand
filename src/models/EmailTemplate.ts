import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IEmailTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  preheader?: string;
  audience: 'all' | 'newsletter' | 'customers' | 'clients' | 'leads' | 'manual';
  logo?: string;
  banner?: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  theme: 'velruma' | 'minimal' | 'warm';
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    preheader: String,
    audience: { type: String, enum: ['all', 'newsletter', 'customers', 'clients', 'leads', 'manual'], default: 'all' },
    logo: String,
    banner: String,
    headline: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    ctaLabel: String,
    ctaUrl: String,
    footerNote: String,
    theme: { type: String, enum: ['velruma', 'minimal', 'warm'], default: 'velruma' },
  },
  { timestamps: true }
);

EmailTemplateSchema.index({ createdAt: -1 });

const EmailTemplate: Model<IEmailTemplate> =
  mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
