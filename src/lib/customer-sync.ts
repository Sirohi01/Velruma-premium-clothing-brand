import Order from '@/models/Order';
import Role from '@/models/Role';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

async function ensureCustomerRole() {
  let role = await Role.findOne({ slug: 'customer' });
  if (!role) {
    role = await Role.create({
      name: 'Customer',
      slug: 'customer',
      description: 'Regular customer with access to their own dashboard',
      permissions: new Map(),
      isSystem: true,
      isActive: true,
    });
  }
  return role;
}

function orderAddress(order: any) {
  const address = order.shippingAddress || {};
  if (!address.addressLine1 || !address.city || !address.state || !address.pincode) return [];
  return [{
    label: 'Shipping',
    fullName: order.customerName || 'Customer',
    phone: order.phone || '',
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || '',
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: true,
  }];
}

export async function syncCustomerFromOrder(order: any) {
  const email = String(order?.email || '').trim().toLowerCase();
  if (!email) return null;

  const role = await ensureCustomerRole();
  const existing = await User.findOne({ email }).select('+password');
  const addresses = orderAddress(order);

  if (existing) {
    const update: Record<string, unknown> = {};
    if (!existing.phone && order.phone) update.phone = order.phone;
    if (!existing.name && order.customerName) update.name = order.customerName;
    if ((existing.addresses || []).length === 0 && addresses.length) update.addresses = addresses;
    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: existing._id }, { $set: update });
    }
    return existing;
  }

  return User.create({
    name: order.customerName || email.split('@')[0] || 'Customer',
    email,
    phone: order.phone || '',
    password: await hashPassword(`velruma-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    role: role._id,
    isActive: true,
    isEmailVerified: false,
    loyaltyPoints: 0,
    addresses,
  });
}

export async function syncCustomersFromOrders(limit = 250) {
  const orders = await Order.find({ email: { $exists: true, $ne: '' } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const seen = new Set<string>();
  for (const order of orders as any[]) {
    const email = String(order.email || '').toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    await syncCustomerFromOrder(order);
  }
}
