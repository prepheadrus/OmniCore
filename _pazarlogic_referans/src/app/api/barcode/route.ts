import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const scans = await db.barcodeScan.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return NextResponse.json(scans);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const scan = await db.barcodeScan.create({ data });
    return NextResponse.json(scan);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
