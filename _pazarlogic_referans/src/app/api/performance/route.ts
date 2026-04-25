import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const performances = await db.sellerPerformance.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(performances);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const perf = await db.sellerPerformance.create({ data });
    return NextResponse.json(perf);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
