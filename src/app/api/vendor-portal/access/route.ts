import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { VendorPortalAccount } from '@/models/Phase9';
import PurchaseOrder from '@/models/PurchaseOrder';
import '@/models/Supplier';
import '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get('code')?.trim();
    const token = searchParams.get('token')?.trim();
    if (!code) return NextResponse.json({ success: false, error: 'Supplier code is required' }, { status: 400 });

    const account: any = await VendorPortalAccount.findOne({
      supplierCode: { $regex: `^${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      ...(token ? { portalToken: token } : {}),
      accessStatus: 'active',
      isActive: true,
    });

    if (!account) return NextResponse.json({ success: false, error: 'Active supplier portal access not found' }, { status: 404 });

    const purchaseOrders = await PurchaseOrder.find({})
      .populate('supplier', 'name code')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    const scopedPoNumbers = Array.isArray(account.visiblePurchaseOrders) ? account.visiblePurchaseOrders : [];
    const relatedOrders = purchaseOrders.filter((order: any) => {
      const isSupplierMatch = order.supplier?.code === account.supplierCode || order.supplier?.name === account.supplierName;
      const isScoped = scopedPoNumbers.length === 0 || scopedPoNumbers.includes(order.poNumber);
      return isSupplierMatch && isScoped;
    });

    account.lastLoginAt = new Date();
    await account.save();

    const safeAccount = account.toObject();
    return NextResponse.json({ success: true, data: { account: safeAccount, purchaseOrders: relatedOrders } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Vendor portal access failed' }, { status: 500 });
  }
}
