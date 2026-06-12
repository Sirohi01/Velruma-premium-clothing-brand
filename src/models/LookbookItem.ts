import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type LookbookType = 'photo' | 'video' | 'instagram';
export type LookbookStatus = 'draft' | 'published' | 'archived';

export interface ILookbookItem extends Document {
  title: string;
  caption?: string;
  type: LookbookType;
  mediaUrl?: string;
  instagramUrl?: string;
  thumbnailUrl?: string;
  alt?: string;
  category?: string;
  season?: string;
  tags: string[];
  sortOrder: number;
  isFeatured: boolean;
  status: LookbookStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LookbookItemSchema = new Schema<ILookbookItem>(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['photo', 'video', 'instagram'], required: true, default: 'photo' },
    mediaUrl: { type: String, trim: true, default: '' },
    instagramUrl: { type: String, trim: true, default: '' },
    thumbnailUrl: { type: String, trim: true, default: '' },
    alt: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    season: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LookbookItemSchema.index({ status: 1, isActive: 1, sortOrder: 1, createdAt: -1 });
LookbookItemSchema.index({ type: 1 });
LookbookItemSchema.index({ category: 1 });
LookbookItemSchema.index({ season: 1 });

if (process.env.NODE_ENV === 'development' && mongoose.models.LookbookItem) {
  delete mongoose.models.LookbookItem;
}

const LookbookItem: Model<ILookbookItem> =
  mongoose.models.LookbookItem || mongoose.model<ILookbookItem>('LookbookItem', LookbookItemSchema);

export default LookbookItem;
