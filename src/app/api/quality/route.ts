import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QualityCheck from '@/models/QualityCheck';
import '@/models/ProductionBatch';
import '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const checks = await QualityCheck.find({}).populate('productionBatch', 'batchNumber').populate('product', 'title slug').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: checks });
  } catch (error) {
    console.error('Quality GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const failedQuantity = Number(body.checkedQuantity || 0) - Number(body.passedQuantity || 0);
    const check = await QualityCheck.create({
      ...body,
      qcNumber: body.qcNumber || `VEL-QC-${Date.now().toString().slice(-8)}`,
      failedQuantity: Math.max(0, failedQuantity),
      status: failedQuantity > 0 ? 'rework' : 'passed',
      checklist: body.checklist?.length ? body.checklist : [
        { label: 'Stitching quality', passed: true },
        { label: 'Measurement tolerance', passed: true },
        { label: 'Print / embroidery quality', passed: true },
        { label: 'Fabric defects', passed: true },
        { label: 'Packing readiness', passed: true },
      ],
    });
    return NextResponse.json({ success: true, data: check }, { status: 201 });
  } catch (error: any) {
    console.error('Quality POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
