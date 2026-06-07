import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QualityCheck from '@/models/QualityCheck';
import '@/models/ProductionBatch';
import '@/models/Product';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const check = await QualityCheck.findById(id)
      .populate('productionBatch', 'batchNumber currentStage status')
      .populate('product', 'title slug');
    if (!check) return NextResponse.json({ success: false, error: 'QC not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: check });
  } catch (error) {
    console.error('Quality GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const check = await QualityCheck.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!check) return NextResponse.json({ success: false, error: 'QC not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: check });
  } catch (error: any) {
    console.error('Quality PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const check = await QualityCheck.findByIdAndUpdate(id, { status: 'failed' }, { returnDocument: 'after', runValidators: true });
    if (!check) return NextResponse.json({ success: false, error: 'QC not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'QC marked failed', data: check });
  } catch (error) {
    console.error('Quality DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
