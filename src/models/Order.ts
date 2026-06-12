import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variant: {
    size: { type: String },
    color: { type: String },
    sku: { type: String }
  }
});

const OrderTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development' && mongoose.models.Order) {
  mongoose.deleteModel('Order');
}

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, can be guest

    // Customer Details
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Shipping Details
    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },

    // Order Items
    items: [OrderItemSchema],

    // Pricing
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Payment
    paymentMethod: { type: String, enum: ['COD', 'UPI', 'PREPAID'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    upiProofImage: { type: String },

    // Source
    orderSource: {
      type: String,
      enum: ['Website', 'Admin Manual', 'WhatsApp', 'Instagram', 'Flipkart', 'Amazon', 'Other'],
      default: 'Website'
    },
    sourceReference: { type: String },

    // Order Status
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending'
    },

    // Tracking
    trackingNumber: { type: String },
    courierName: { type: String },

    // Admin Notes
    adminNotes: { type: String },
    timeline: [OrderTimelineSchema]
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
