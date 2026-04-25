import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = await db.b2BCustomer.findMany({ orderBy: { createdAt: 'desc' } });
    const orders = await db.b2BOrder.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ customers, orders });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (data.type === 'customer') {
      const { type, ...customerData } = data;
      const customer = await db.b2BCustomer.create({ data: customerData });
      return NextResponse.json(customer);
    } else {
      const { type, ...orderData } = data;
      const order = await db.b2BOrder.create({ data: orderData });
      return NextResponse.json(order);
    }
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, type, ...updateData } = data;
    if (type === 'customer') {
      const customer = await db.b2BCustomer.update({ where: { id }, data: updateData });
      return NextResponse.json(customer);
    } else {
      const order = await db.b2BOrder.update({ where: { id }, data: updateData });
      return NextResponse.json(order);
    }
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (type === 'customer') {
      await db.b2BCustomer.delete({ where: { id } });
    } else {
      await db.b2BOrder.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
