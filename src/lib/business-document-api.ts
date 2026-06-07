import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BusinessDocument from '@/models/BusinessDocument';

export type BusinessDocumentType = 'estimate' | 'proforma' | 'receipt';

function documentNumber(type: BusinessDocumentType) {
  const prefix = type === 'estimate' ? 'EST' : type === 'proforma' ? 'PRO' : 'RCT';
  return `VEL-${prefix}-${Date.now().toString().slice(-8)}`;
}

export async function listDocuments(type: BusinessDocumentType) {
  try {
    await dbConnect();
    const documents = await BusinessDocument.find({ documentType: type }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function createDocument(type: BusinessDocumentType, request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const subtotal = Number(body.subtotal || 0);
    const tax = Number(body.tax || 0);
    const discount = Number(body.discount || 0);
    const document = await BusinessDocument.create({
      ...body,
      documentType: type,
      documentNumber: body.documentNumber || documentNumber(type),
      subtotal,
      tax,
      discount,
      total: Number(body.total || subtotal + tax - discount),
    });
    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document save failed' }, { status: 500 });
  }
}

export async function updateDocument(request: NextRequest, id: string) {
  try {
    await dbConnect();
    const body = await request.json();
    const document = await BusinessDocument.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document update failed' }, { status: 500 });
  }
}

export async function cancelDocument(id: string) {
  try {
    await dbConnect();
    const document = await BusinessDocument.findByIdAndUpdate(id, { status: 'Cancelled' }, { returnDocument: 'after' });
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document action failed' }, { status: 500 });
  }
}
