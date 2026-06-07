import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: mongoose.Types.ObjectId;
  addresses: {
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  isActive: boolean;
  isEmailVerified: boolean;
  loyaltyPoints: number;
  wishlist: mongoose.Types.ObjectId[];
  loginHistory: {
    ip: string;
    userAgent: string;
    timestamp: Date;
  }[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    avatar: { type: String },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0 },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ createdAt: -1 });

// Soft delete filter
UserSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

UserSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
