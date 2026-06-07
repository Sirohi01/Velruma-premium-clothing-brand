import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMarketingCampaign extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  channel: 'instagram' | 'whatsapp' | 'email' | 'sms' | 'offline';
  status: 'planned' | 'running' | 'paused' | 'completed';
  audience: string;
  budget: number;
  spend: number;
  leads: number;
  revenue: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>(
  {
    name: { type: String, required: true, trim: true },
    channel: { type: String, enum: ['instagram', 'whatsapp', 'email', 'sms', 'offline'], default: 'instagram' },
    status: { type: String, enum: ['planned', 'running', 'paused', 'completed'], default: 'planned' },
    audience: { type: String, default: 'All customers' },
    budget: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    notes: String,
  },
  { timestamps: true }
);

const MarketingCampaign: Model<IMarketingCampaign> =
  mongoose.models.MarketingCampaign || mongoose.model<IMarketingCampaign>('MarketingCampaign', MarketingCampaignSchema);

export default MarketingCampaign;
