import { NextRequest } from 'next/server';
import { createRecord, listRecords } from '@/lib/phase9-api';

export async function GET(request: NextRequest) {
  return listRecords('designations', request);
}

export async function POST(request: NextRequest) {
  return createRecord('designations', request, { isActive: true });
}
