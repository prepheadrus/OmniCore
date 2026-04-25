import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const returns = await db.return.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(returns);
  } catch {
    return NextResponse.json({ error: 'Iadeler yuklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ret = await db.return.create({ data: { returnNumber: body.returnNumber, orderNumber: body.orderNumber, customerName: body.customerName, reason: body.reason || '', status: body.status || 'pending', totalAmount: body.totalAmount, type: body.type || 'full' } });
    return NextResponse.json(ret, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
