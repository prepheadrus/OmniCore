import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const priceRules = await db.priceRule.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(priceRules);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch price rules' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const priceRule = await db.priceRule.create({
      data: {
        name: body.name,
        description: body.description || '',
        type: body.type || 'markup',
        baseField: body.baseField || 'cost',
        value: body.value ?? 0,
        valueType: body.valueType || 'percentage',
        minMargin: body.minMargin ?? 0,
        maxPrice: body.maxPrice ?? 0,
        roundTo: body.roundTo ?? 0,
        marketplace: body.marketplace || '',
        categoryId: body.categoryId || '',
        isActive: body.isActive ?? true,
        priority: body.priority ?? 0,
        storeId: body.storeId || 'default',
      },
    });

    return NextResponse.json(priceRule, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create price rule' }, { status: 500 });
  }
}
