import { NextRequest } from 'next/server';
import { cancelDocument, updateDocument } from '@/lib/business-document-api';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateDocument(request, id);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return cancelDocument(id, _request);
}
