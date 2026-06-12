import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BusinessDocument from '@/models/BusinessDocument';
import { notifyBusinessDocument } from '@/lib/order-email';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const document = await BusinessDocument.findById(id);
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    if (!document.customerEmail) return NextResponse.json({ success: false, error: 'Customer email is missing' }, { status: 400 });

    document.status = document.status === 'Draft' ? 'Sent' : document.status;
    await document.save();
    await notifyBusinessDocument(document);

    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document email failed' }, { status: 500 });
  }
}
