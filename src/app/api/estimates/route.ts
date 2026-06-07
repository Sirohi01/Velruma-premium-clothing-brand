import { NextRequest } from 'next/server';
import { createDocument, listDocuments } from '@/lib/business-document-api';

export async function GET() {
  return listDocuments('estimate');
}

export async function POST(request: NextRequest) {
  return createDocument('estimate', request);
}
