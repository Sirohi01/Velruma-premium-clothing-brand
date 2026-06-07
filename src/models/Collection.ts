import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  products: mongoose.Types.ObjectId[];
  isActive: boolean;
  seo: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    bannerImage: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ isActive: 1 });

const Collection: Model<ICollection> = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
