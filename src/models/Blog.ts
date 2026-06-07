import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  publishedAt?: Date;
  seo: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
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
    },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, publishedAt: -1 });

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
