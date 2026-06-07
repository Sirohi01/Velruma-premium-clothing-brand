import { NextRequest } from 'next/server';
import { deactivateRecord, getRecord, updateRecord } from '@/lib/phase9-api';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getRecord('ai-ready', id);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateRecord('ai-ready', request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deactivateRecord('ai-ready', id, request);
}
