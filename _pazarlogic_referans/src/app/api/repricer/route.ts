import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rules = await db.repricerRule.findMany({ orderBy: { createdAt: 'desc' } });
    const logs = await db.repricerLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return NextResponse.json({ rules, logs });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const rule = await db.repricerRule.create({ data });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    const rule = await db.repricerRule.update({ where: { id }, data: updateData });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await db.repricerRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
