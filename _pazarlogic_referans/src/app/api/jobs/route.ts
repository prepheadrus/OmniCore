import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const jobs = await db.backgroundJob.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: 'Isler yuklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const job = await db.backgroundJob.create({ data: { type: body.type, status: 'pending', payload: JSON.stringify(body.payload || {}) } });
    return NextResponse.json(job, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
