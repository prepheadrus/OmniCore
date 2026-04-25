import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const shipments = await db.shipment.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(shipments);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
