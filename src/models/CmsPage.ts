import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICmsPage extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  type: 'page' | 'policy' | 'faq' | 'lookbook' | 'home-banner' | 'popup' | 'testimonial';
  status: 'draft' | 'published' | 'archived';
  heroImage?: string;
  heroImageAlt?: string;
  heroImageAspectRatio?: string;
  heroImagePosition?: string;
  heroImageFit?: 'cover' | 'contain';
  heroVideo?: string;
  heroVideoAlt?: string;
  heroVideoAspectRatio?: string;
  heroVideoPosition?: string;
  heroVideoFit?: 'cover' | 'contain';
  excerpt?: string;
  titleStyle?: Record<string, string>;
  excerptStyle?: Record<string, string>;
  contentStyle?: Record<string, string>;
  content?: string;
  sections: {
    type: 'text' | 'image' | 'faq' | 'gallery' | 'banner' | 'testimonial';
    title?: string;
    titleStyle?: Record<string, string>;
    body?: string;
    bodyStyle?: Record<string, string>;
    image?: string;
    imageAlt?: string;
    imageAspectRatio?: string;
    imagePosition?: string;
    video?: string;
    videoAlt?: string;
    videoAspectRatio?: string;
    videoPosition?: string;
    mediaFit?: 'cover' | 'contain';
    items?: { title?: string; body?: string; image?: string; link?: string; imageAlt?: string }[];
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
    ogType?: string;
    ogUrl?: string;
    twitterCard?: string;
    twitterImage?: string;
    twitterSite?: string;
    twitterCreator?: string;
    breadcrumbsJson?: string;
    sitemapChangefreq?: string;
    sitemapPriority?: number;
    hreflang?: { lang: string; url: string }[];
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
    heroImageAlt: String,
    heroImageAspectRatio: { type: String, default: '16 / 9' },
    heroImagePosition: { type: String, default: 'center' },
    heroImageFit: { type: String, enum: ['cover', 'contain'], default: 'contain' },
    heroVideo: String,
    heroVideoAlt: String,
    heroVideoAspectRatio: { type: String, default: '16 / 9' },
    heroVideoPosition: { type: String, default: 'center' },
    heroVideoFit: { type: String, enum: ['cover', 'contain'], default: 'contain' },
    excerpt: String,
    titleStyle: { type: Schema.Types.Mixed, default: {} },
    excerptStyle: { type: Schema.Types.Mixed, default: {} },
    contentStyle: { type: Schema.Types.Mixed, default: {} },
    content: String,
    sections: [{
      type: { type: String, enum: ['text', 'image', 'faq', 'gallery', 'banner', 'testimonial'], default: 'text' },
      title: String,
      titleStyle: { type: Schema.Types.Mixed, default: {} },
      body: String,
      bodyStyle: { type: Schema.Types.Mixed, default: {} },
      image: String,
      imageAlt: String,
      imageAspectRatio: { type: String, default: '16 / 9' },
      imagePosition: { type: String, default: 'center' },
      video: String,
      videoAlt: String,
      videoAspectRatio: { type: String, default: '16 / 9' },
      videoPosition: { type: String, default: 'center' },
      mediaFit: { type: String, enum: ['cover', 'contain'], default: 'cover' },
      items: [{
        title: String,
        body: String,
        image: String,
        link: String,
        imageAlt: String,
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
      ogType: String,
      ogUrl: String,
      twitterCard: String,
      twitterImage: String,
      twitterSite: String,
      twitterCreator: String,
      breadcrumbsJson: String,
      sitemapChangefreq: String,
      sitemapPriority: Number,
      hreflang: [{
        lang: String,
        url: String,
      }],
      schemaType: String,
      schemaJson: String,
      robots: String,
    },
  },
  { timestamps: true }
);

CmsPageSchema.index({ type: 1, status: 1 });


if (process.env.NODE_ENV !== 'production' && mongoose.models.CmsPage) {
  delete mongoose.models.CmsPage;
}

const CmsPage: Model<ICmsPage> = mongoose.models.CmsPage || mongoose.model<ICmsPage>('CmsPage', CmsPageSchema);

export default CmsPage;
