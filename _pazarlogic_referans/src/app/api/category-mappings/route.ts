import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    const target = searchParams.get('target');

    const where: Record<string, string> = {};
    if (source) where.source = source;
    if (target) where.target = target;

    const mappings = await db.categoryMapping.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mappings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch category mappings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.source || !body.sourceCat || !body.target || !body.targetCat) {
      return NextResponse.json(
        { error: 'source, sourceCat, target, and targetCat are required' },
        { status: 400 },
      );
    }

    const mapping = await db.categoryMapping.create({
      data: {
        source: body.source,
        sourceCat: body.sourceCat,
        target: body.target,
        targetCat: body.targetCat,
        storeId: body.storeId || 'default',
      },
    });

    return NextResponse.json(mapping, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category mapping' }, { status: 500 });
  }
}
