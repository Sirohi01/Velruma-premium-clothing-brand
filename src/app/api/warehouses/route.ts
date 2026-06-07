import { NextRequest } from 'next/server';
import { createRecord, listRecords } from '@/lib/phase9-api';

export async function GET(request: NextRequest) {
  return listRecords('warehouses', request);
}

export async function POST(request: NextRequest) {
  return createRecord('warehouses', request, { code: `WH-${Date.now().toString().slice(-5)}` });
}
