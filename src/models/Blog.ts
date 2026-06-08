import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  cardImage?: string;
  heroImage?: string;
  heroImageAspectRatio?: string;
  heroImagePosition?: string;
  heroImageFit?: 'cover' | 'contain';
  video?: string;
  videoAspectRatio?: string;
  videoPosition?: string;
  videoFit?: 'cover' | 'contain';
  category: string;
  tags: string[];
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  publishedAt?: Date;
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

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: String,
    content: { type: String, required: true },
    coverImage: String,
    cardImage: String,
    heroImage: String,
    heroImageAspectRatio: { type: String, default: '16 / 5' },
    heroImagePosition: { type: String, default: 'center' },
    heroImageFit: { type: String, enum: ['cover', 'contain'], default: 'cover' },
    video: String,
    videoAspectRatio: { type: String, default: '16 / 9' },
    videoPosition: { type: String, default: 'center' },
    videoFit: { type: String, enum: ['cover', 'contain'], default: 'contain' },
    category: { type: String, default: 'Style' },
    tags: [{ type: String }],
    authorName: { type: String, default: 'VELRUMA Editorial' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    featured: { type: Boolean, default: false },
    publishedAt: Date,
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

BlogSchema.index({ status: 1, publishedAt: -1 });

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
