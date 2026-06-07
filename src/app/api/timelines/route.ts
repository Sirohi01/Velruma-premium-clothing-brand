import { NextRequest } from 'next/server';
import { createRecord, listRecords } from '@/lib/phase9-api';

export async function GET(request: NextRequest) {
  return listRecords('timelines', request);
}

export async function POST(request: NextRequest) {
  return createRecord('timelines', request);
}
