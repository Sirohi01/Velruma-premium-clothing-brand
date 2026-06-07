import { NextRequest } from 'next/server';
import { deactivateRecord, getRecord, updateRecord } from '@/lib/phase9-api';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getRecord('warehouses', id);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateRecord('warehouses', request, id);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deactivateRecord('warehouses', id);
}
