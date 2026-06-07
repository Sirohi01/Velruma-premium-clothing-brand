import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProductionBatch from '@/models/ProductionBatch';
import '@/models/Product';
import '@/models/Supplier';
import '@/models/PurchaseOrder';

const stages = ['cutting', 'stitching', 'printing', 'washing', 'qc', 'packing'];

export async function GET() {
  try {
    await dbConnect();
    const batches = await ProductionBatch.find({}).populate('product', 'title slug').populate('supplier', 'name').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: batches });
  } catch (error) {
    console.error('Production GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const batch = await ProductionBatch.create({
      ...body,
      batchNumber: body.batchNumber || `VEL-BATCH-${Date.now().toString().slice(-8)}`,
      stages: body.stages || stages.map((stage, index) => ({ stage, status: index === 0 ? 'in_progress' : 'pending', quantityDone: 0 })),
      status: body.status || 'in_progress',
      currentStage: body.currentStage || 'cutting',
    });
    return NextResponse.json({ success: true, data: batch }, { status: 201 });
  } catch (error: any) {
    console.error('Production POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
