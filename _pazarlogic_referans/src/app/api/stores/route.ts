import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stores = await db.store.findMany();
    return NextResponse.json(stores);
  } catch {
    return NextResponse.json({ error: 'Magazalar yuklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = await db.store.create({ data: { name: body.name, code: body.code, domain: body.domain || '', plan: body.plan || 'basic', ownerId: body.ownerId || '' } });
    return NextResponse.json(store, { status: 201 });
  } catch { return NextResponse.json({ error: 'Magaza olusturulamadi' }, { status: 500 }); }
}
