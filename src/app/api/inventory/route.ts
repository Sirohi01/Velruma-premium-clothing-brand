import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inventory from '@/models/Inventory';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const warehouse = searchParams.get('warehouse');

    const query: any = {};
    if (productId) query.productId = productId;
    if (warehouse) query.warehouse = warehouse;

    const history = await Inventory.find(query)
      .populate('productId', 'title slug')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get current user from token
    const token = request.cookies.get('velruma-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, variantId, quantity, movementType, reason, warehouse, referenceId } = body;

    if (!productId || !variantId || quantity === undefined || !movementType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Find the product and the variant
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const variant = product.variants.find((v) => v._id?.toString() === variantId);
    if (!variant) {
      return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
    }

    // Calculate new stock
    let newStock = variant.stock;
    const qty = Number(quantity);

    if (movementType === 'in' || movementType === 'return') {
      newStock += qty;
    } else if (movementType === 'out') {
      if (newStock < qty) {
        return NextResponse.json({ success: false, error: 'Insufficient stock' }, { status: 400 });
      }
      newStock -= qty;
    } else if (movementType === 'adjustment') {
      // Adjustment overrides current stock, but in inventory log it reflects the diff or the final
      // Let's assume quantity in payload for adjustment means "add/remove this much"
      // or if it means "new total", we need to compute the difference. Let's assume the payload quantity is the diff.
      newStock += qty;
      if (newStock < 0) newStock = 0;
    }

    // Update variant stock
    variant.stock = newStock;
    await product.save();

    // Create inventory record
    const inventory = await Inventory.create({
      productId,
      variantId,
      warehouse: warehouse || 'Main Warehouse',
      quantity: qty,
      movementType,
      reason,
      referenceId,
      createdBy: payload.userId,
    });

    return NextResponse.json({ success: true, data: inventory, newStock }, { status: 201 });
  } catch (error: any) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
