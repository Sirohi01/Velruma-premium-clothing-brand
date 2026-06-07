import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICmsPage extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  type: 'page' | 'policy' | 'faq' | 'lookbook' | 'home-banner' | 'popup' | 'testimonial';
  status: 'draft' | 'published' | 'archived';
  heroImage?: string;
  excerpt?: string;
  content?: string;
  sections: {
    type: 'text' | 'image' | 'faq' | 'gallery' | 'banner' | 'testimonial';
    title?: string;
    body?: string;
    image?: string;
    items?: { title?: string; body?: string; image?: string; link?: string }[];
  }[];
  seo: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
  createdAt: Date;
  updatedAt: Date;
}

const CmsPageSchema = new Schema<ICmsPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['page', 'policy', 'faq', 'lookbook', 'home-banner', 'popup', 'testimonial'],
      default: 'page',
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    heroImage: String,
    excerpt: String,
    content: String,
    sections: [{
      type: { type: String, enum: ['text', 'image', 'faq', 'gallery', 'banner', 'testimonial'], default: 'text' },
      title: String,
      body: String,
      image: String,
      items: [{
        title: String,
        body: String,
        image: String,
        link: String,
      }],
    }],
    seo: {
      title: String,
      description: String,
      keywords: [{ type: String }],
      ogImage: String,
    },
  },
  { timestamps: true }
);

CmsPageSchema.index({ type: 1, status: 1 });


const CmsPage: Model<ICmsPage> = mongoose.models.CmsPage || mongoose.model<ICmsPage>('CmsPage', CmsPageSchema);

export default CmsPage;
