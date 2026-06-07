import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISeoPage extends Document {
  _id: mongoose.Types.ObjectId;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  robots: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  schemaType: 'WebPage' | 'Product' | 'FAQPage' | 'BlogPosting' | 'CollectionPage';
  score: number;
  redirectTo?: string;
  isRedirect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeoPageSchema = new Schema<ISeoPage>(
  {
    path: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    keywords: [{ type: String }],
    ogImage: String,
    canonicalUrl: String,
    robots: { type: String, enum: ['index,follow', 'noindex,follow', 'noindex,nofollow'], default: 'index,follow' },
    schemaType: { type: String, enum: ['WebPage', 'Product', 'FAQPage', 'BlogPosting', 'CollectionPage'], default: 'WebPage' },
    score: { type: Number, default: 70, min: 0, max: 100 },
    redirectTo: String,
    isRedirect: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SeoPageSchema.index({ path: 1, isRedirect: 1 });

const SeoPage: Model<ISeoPage> = mongoose.models.SeoPage || mongoose.model<ISeoPage>('SeoPage', SeoPageSchema);

export default SeoPage;
