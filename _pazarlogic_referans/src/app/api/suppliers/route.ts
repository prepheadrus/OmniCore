import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(suppliers);
  } catch {
    return NextResponse.json({ error: 'Tedarikciler yuklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supplier = await db.supplier.create({ data: { name: body.name, contact: body.contact || '', phone: body.phone || '', email: body.email || '', address: body.address || '' } });
    return NextResponse.json(supplier, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
