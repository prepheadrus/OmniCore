import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const integrations = await db.integration.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(integrations);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
