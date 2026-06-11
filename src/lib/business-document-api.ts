import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BusinessDocument from '@/models/BusinessDocument';
import { auditAdminAction, requireAdminAction } from '@/lib/admin-api';
import type { ModuleName } from '@/lib/permissions';

export type BusinessDocumentType = 'estimate' | 'proforma' | 'receipt';

function documentNumber(type: BusinessDocumentType) {
  const prefix = type === 'estimate' ? 'EST' : type === 'proforma' ? 'PRO' : 'RCT';
  return `VEL-${prefix}-${Date.now().toString().slice(-8)}`;
}

function documentModule(type: BusinessDocumentType): ModuleName {
  if (type === 'estimate') return 'estimates';
  if (type === 'proforma') return 'proforma-invoices';
  return 'receipts';
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
    const admin = await requireAdminAction(request, documentModule(type), 'create');
    if (!admin.ok) return admin.response;
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
    await auditAdminAction({ request, context: admin.context, module: documentModule(type), action: 'create', entity: document });
    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document save failed' }, { status: 500 });
  }
}

export async function updateDocument(request: NextRequest, id: string) {
  try {
    await dbConnect();
    const existing = await BusinessDocument.findById(id).lean();
    if (!existing) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    const admin = await requireAdminAction(request, documentModule(existing.documentType as BusinessDocumentType), 'edit');
    if (!admin.ok) return admin.response;
    const body = await request.json();
    const subtotal = Number(body.subtotal ?? existing.subtotal ?? 0);
    const tax = Number(body.tax ?? existing.tax ?? 0);
    const discount = Number(body.discount ?? existing.discount ?? 0);
    const document = await BusinessDocument.findByIdAndUpdate(
      id,
      { ...body, subtotal, tax, discount, total: Number(body.total || subtotal + tax - discount) },
      { returnDocument: 'after', runValidators: true }
    );
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    await auditAdminAction({ request, context: admin.context, module: documentModule(existing.documentType as BusinessDocumentType), action: 'update', entity: document });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document update failed' }, { status: 500 });
  }
}

export async function cancelDocument(id: string, request?: NextRequest) {
  try {
    await dbConnect();
    const existing = await BusinessDocument.findById(id).lean();
    if (!existing) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    const admin = request ? await requireAdminAction(request, documentModule(existing.documentType as BusinessDocumentType), 'delete') : null;
    if (admin && !admin.ok) return admin.response;
    const document = await BusinessDocument.findByIdAndUpdate(id, { status: 'Cancelled' }, { returnDocument: 'after' });
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    if (request && admin?.ok) {
      await auditAdminAction({ request, context: admin.context, module: documentModule(existing.documentType as BusinessDocumentType), action: 'delete', entity: document, description: 'cancelled business document' });
    }
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Document action failed' }, { status: 500 });
  }
}
