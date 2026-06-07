import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface INewsletter extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  source: 'website' | 'checkout' | 'manual' | 'campaign';
  status: 'subscribed' | 'unsubscribed';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    source: { type: String, enum: ['website', 'checkout', 'manual', 'campaign'], default: 'manual' },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);

export default Newsletter;
