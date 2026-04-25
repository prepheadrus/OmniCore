import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
