import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const analyses = await db.buyBoxAnalysis.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(analyses);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const analysis = await db.buyBoxAnalysis.create({ data });
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    const analysis = await db.buyBoxAnalysis.update({ where: { id }, data: updateData });
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
