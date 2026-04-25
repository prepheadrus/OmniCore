import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = await db.customer.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: 'Musteriler yuklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await db.customer.create({ data: { name: body.name, email: body.email || '', phone: body.phone || '', city: body.city || '', segment: body.segment || 'new' } });
    return NextResponse.json(customer, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
