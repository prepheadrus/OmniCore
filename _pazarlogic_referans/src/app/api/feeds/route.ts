import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const feeds = await db.productFeed.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feeds);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const feed = await db.productFeed.create({
      data: {
        name: body.name,
        source: body.source || 'upload',
        sourceUrl: body.sourceUrl || '',
        format: body.format || 'xml',
        status: body.status || 'active',
        schedule: body.schedule || 'manual',
        fieldMapping: body.fieldMapping ? JSON.stringify(body.fieldMapping) : '{}',
        storeId: body.storeId || 'default',
      },
    });

    return NextResponse.json(feed, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create feed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Feed ID is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.schedule !== undefined) data.schedule = updateData.schedule;
    if (updateData.source !== undefined) data.source = updateData.source;
    if (updateData.sourceUrl !== undefined) data.sourceUrl = updateData.sourceUrl;
    if (updateData.format !== undefined) data.format = updateData.format;
    if (updateData.fieldMapping !== undefined)
      data.fieldMapping = typeof updateData.fieldMapping === 'string'
        ? updateData.fieldMapping
        : JSON.stringify(updateData.fieldMapping);
    if (updateData.lastImport !== undefined) data.lastImport = updateData.lastImport ? new Date(updateData.lastImport) : null;
    if (updateData.lastError !== undefined) data.lastError = updateData.lastError;
    if (updateData.totalProducts !== undefined) data.totalProducts = updateData.totalProducts;
    if (updateData.validProducts !== undefined) data.validProducts = updateData.validProducts;
    if (updateData.errorProducts !== undefined) data.errorProducts = updateData.errorProducts;

    const feed = await db.productFeed.update({
      where: { id },
      data,
    });

    return NextResponse.json(feed);
  } catch {
    return NextResponse.json({ error: 'Failed to update feed' }, { status: 500 });
  }
}
