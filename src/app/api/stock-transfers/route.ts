import { NextRequest } from 'next/server';
import { createRecord, listRecords } from '@/lib/phase9-api';

export async function GET(request: NextRequest) {
  return listRecords('stock-transfers', request);
}

export async function POST(request: NextRequest) {
  return createRecord('stock-transfers', request, { transferNumber: `TRF-${Date.now().toString().slice(-6)}` });
}
