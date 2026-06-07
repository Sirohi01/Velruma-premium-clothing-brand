import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { VendorPortalAccount } from '@/models/Phase9';
import PurchaseOrder from '@/models/PurchaseOrder';
import '@/models/Supplier';
import '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const code = new URL(request.url).searchParams.get('code')?.trim();
    if (!code) return NextResponse.json({ success: false, error: 'Supplier code is required' }, { status: 400 });

    const account: any = await VendorPortalAccount.findOne({
      supplierCode: { $regex: `^${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      accessStatus: 'active',
      isActive: true,
    }).lean();

    if (!account) return NextResponse.json({ success: false, error: 'Active supplier portal access not found' }, { status: 404 });

    const purchaseOrders = await PurchaseOrder.find({})
      .populate('supplier', 'name code')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    const relatedOrders = purchaseOrders.filter((order: any) => order.supplier?.code === account.supplierCode || order.supplier?.name === account.supplierName);
    return NextResponse.json({ success: true, data: { account, purchaseOrders: relatedOrders } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Vendor portal access failed' }, { status: 500 });
  }
}
