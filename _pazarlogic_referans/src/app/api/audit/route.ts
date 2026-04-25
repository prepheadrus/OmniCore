import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: 'Loglar yuklenemedi' }, { status: 500 });
  }
}
