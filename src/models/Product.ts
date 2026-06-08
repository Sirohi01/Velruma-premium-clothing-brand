import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  size: string;
  color: string;
  sku: string;
  barcode?: string;
  stock: number;
  extraPrice: number;
  isActive: boolean;
}

export interface IProductImage {
  _id?: mongoose.Types.ObjectId;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface IProductVideo {
  _id?: mongoose.Types.ObjectId;
  url: string;
  title?: string;
  isPrimary: boolean;
}

export interface IProductHighlight {
  _id?: mongoose.Types.ObjectId;
  icon: string;
  title: string;
  subtitle: string;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  collections: mongoose.Types.ObjectId[];
  brand: string;
  brandSlug?: string;
  brandRef?: mongoose.Types.ObjectId;
  gender: 'male' | 'female' | 'unisex';
  tags: string[];
  status: 'draft' | 'active' | 'archived';
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  discountType: 'none' | 'percentage' | 'fixed';
  discountValue: number;
  images: IProductImage[];
  videos: IProductVideo[];
  variants: IProductVariant[];
  productHighlights: IProductHighlight[];
  productDetails: string[];
  washCare: string[];
  deliveryReturns: string[];
  specifications: Map<string, string>;
  isFeatured: boolean;
  seo: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String, required: true, unique: true, sparse: true },
  barcode: { type: String, sparse: true },
  stock: { type: Number, default: 0, min: 0 },
  extraPrice: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const ProductVideoSchema = new Schema<IProductVideo>({
  url: { type: String, required: true },
  title: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const ProductHighlightSchema = new Schema<IProductHighlight>({
  icon: { type: String, default: 'shirt' },
  title: { type: String, default: '', trim: true },
  subtitle: { type: String, default: '', trim: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    brand: { type: String, default: 'VELRUMA' },
    brandSlug: { type: String, default: 'velruma', lowercase: true, trim: true, index: true },
    brandRef: { type: Schema.Types.ObjectId, ref: 'Brand' },
    gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex', index: true },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    discountType: { type: String, enum: ['none', 'percentage', 'fixed'], default: 'none' },
    discountValue: { type: Number, default: 0, min: 0 },
    images: [ProductImageSchema],
    videos: [ProductVideoSchema],
    variants: [ProductVariantSchema],
    productHighlights: [ProductHighlightSchema],
    productDetails: [{ type: String, trim: true }],
    washCare: [{ type: String, trim: true }],
    deliveryReturns: [{ type: String, trim: true }],
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
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

ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ basePrice: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
