import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISeoPage extends Document {
  _id: mongoose.Types.ObjectId;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  metaAuthor?: string;
  metaViewport?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  canonicalUrl?: string;
  robots: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  schemaType: 'WebPage' | 'Product' | 'FAQPage' | 'BlogPosting' | 'CollectionPage' | 'AboutPage' | 'ContactPage' | 'Organization';
  schemaJson?: string;
  breadcrumbsJson?: string;
  sitemapChangefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  sitemapPriority?: number;
  hreflang?: { lang: string; url: string }[];
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
    metaAuthor: String,
    metaViewport: { type: String, default: 'width=device-width, initial-scale=1' },
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    ogType: { type: String, enum: ['website', 'article', 'product'], default: 'website' },
    ogUrl: String,
    twitterCard: { type: String, enum: ['summary', 'summary_large_image'], default: 'summary_large_image' },
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    twitterSite: String,
    twitterCreator: String,
    canonicalUrl: String,
    robots: { type: String, enum: ['index,follow', 'noindex,follow', 'noindex,nofollow'], default: 'index,follow' },
    schemaType: { type: String, enum: ['WebPage', 'Product', 'FAQPage', 'BlogPosting', 'CollectionPage', 'AboutPage', 'ContactPage', 'Organization'], default: 'WebPage' },
    schemaJson: String,
    breadcrumbsJson: String,
    sitemapChangefreq: { type: String, enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'], default: 'weekly' },
    sitemapPriority: { type: Number, default: 0.7, min: 0, max: 1 },
    hreflang: [{
      lang: String,
      url: String,
    }],
    score: { type: Number, default: 70, min: 0, max: 100 },
    redirectTo: String,
    isRedirect: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SeoPageSchema.index({ path: 1, isRedirect: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.SeoPage) {
  delete mongoose.models.SeoPage;
}

const SeoPage: Model<ISeoPage> = mongoose.models.SeoPage || mongoose.model<ISeoPage>('SeoPage', SeoPageSchema);

export default SeoPage;
