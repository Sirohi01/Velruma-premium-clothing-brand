import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Supplier from '@/models/Supplier';

function codeFromName(name: string) {
  return `SUP-${name.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Suppliers GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const supplier = await Supplier.create({
      ...body,
      code: body.code || codeFromName(body.name || 'supplier'),
      contacts: body.contacts?.length ? body.contacts : [{ name: body.contactName || 'Primary', phone: body.phone || 'N/A', email: body.email || '' }],
    });
    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  } catch (error: any) {
    console.error('Suppliers POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
