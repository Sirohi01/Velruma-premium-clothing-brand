import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ISetting extends Document {
  _id: mongoose.Types.ObjectId;
  group: string;
  key: string;
  value: unknown;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'image' | 'color' | 'select' | 'textarea';
  options?: string[]; // For select type
  isPublic: boolean; // Whether this setting is accessible to the frontend
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    group: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'image', 'color', 'select', 'textarea'],
      default: 'string',
    },
    options: [{ type: String }],
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

SettingSchema.index({ group: 1 });
SettingSchema.index({ isPublic: 1 });

const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
