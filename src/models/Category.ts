import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  sizeChartImage?: string;
  sizeChartImageAlt?: string;
  sizeChart?: {
    sizes: string[];
    measurements: { name: string; values: string[] }[];
  };
  parentCategory?: mongoose.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  seo: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    imageAlt: { type: String, trim: true },
    sizeChartImage: { type: String },
    sizeChartImageAlt: { type: String, trim: true },
    sizeChart: {
      sizes: [{ type: String }],
      measurements: [
        {
          name: { type: String },
          values: [{ type: String }],
        },
      ],
    },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isFeatured: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
