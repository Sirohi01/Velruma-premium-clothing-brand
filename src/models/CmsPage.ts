import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICmsPage extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  type: 'page' | 'policy' | 'faq' | 'lookbook' | 'home-banner' | 'popup' | 'testimonial';
  status: 'draft' | 'published' | 'archived';
  heroImage?: string;
  heroImageAspectRatio?: string;
  heroImagePosition?: string;
  heroVideo?: string;
  heroVideoAspectRatio?: string;
  heroVideoPosition?: string;
  excerpt?: string;
  content?: string;
  sections: {
    type: 'text' | 'image' | 'faq' | 'gallery' | 'banner' | 'testimonial';
    title?: string;
    body?: string;
    image?: string;
    imageAspectRatio?: string;
    imagePosition?: string;
    video?: string;
    videoAspectRatio?: string;
    videoPosition?: string;
    mediaFit?: 'cover' | 'contain';
    items?: { title?: string; body?: string; image?: string; link?: string }[];
  }[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    schemaType?: string;
    schemaJson?: string;
    robots?: string;
  };
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
    heroImageAspectRatio: { type: String, default: '16 / 9' },
    heroImagePosition: { type: String, default: 'center' },
    heroVideo: String,
    heroVideoAspectRatio: { type: String, default: '16 / 9' },
    heroVideoPosition: { type: String, default: 'center' },
    excerpt: String,
    content: String,
    sections: [{
      type: { type: String, enum: ['text', 'image', 'faq', 'gallery', 'banner', 'testimonial'], default: 'text' },
      title: String,
      body: String,
      image: String,
      imageAspectRatio: { type: String, default: '16 / 9' },
      imagePosition: { type: String, default: 'center' },
      video: String,
      videoAspectRatio: { type: String, default: '16 / 9' },
      videoPosition: { type: String, default: 'center' },
      mediaFit: { type: String, enum: ['cover', 'contain'], default: 'cover' },
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
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      twitterTitle: String,
      twitterDescription: String,
      schemaType: String,
      schemaJson: String,
      robots: String,
    },
  },
  { timestamps: true }
);

CmsPageSchema.index({ type: 1, status: 1 });


const CmsPage: Model<ICmsPage> = mongoose.models.CmsPage || mongoose.model<ICmsPage>('CmsPage', CmsPageSchema);

export default CmsPage;
