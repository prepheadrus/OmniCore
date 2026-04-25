import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/product-launches — List all launches with optional ?status= filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const launches = await db.productLaunch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(launches, { status: 200 });
  } catch (error) {
    console.error('Error fetching product launches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product launches' },
      { status: 500 }
    );
  }
}

// POST /api/product-launches — Create a new product launch
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const launch = await db.productLaunch.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        productIds: body.productIds ?? '[]',
        channels: body.channels ?? '[]',
        status: body.status ?? 'planning',
        priority: body.priority ?? 'normal',
        launchDate: body.launchDate ? new Date(body.launchDate) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        tasks: body.tasks ?? '[]',
        checklists: body.checklists ?? '{}',
        budget: body.budget ?? 0,
        spent: body.spent ?? 0,
        notes: body.notes ?? '',
        tags: body.tags ?? '[]',
        storeId: body.storeId ?? 'default',
      },
    });

    return NextResponse.json(launch, { status: 201 });
  } catch (error) {
    console.error('Error creating product launch:', error);
    return NextResponse.json(
      { error: 'Failed to create product launch' },
      { status: 500 }
    );
  }
}

// PUT /api/product-launches?id=xxx — Update a product launch
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.productIds !== undefined) data.productIds = body.productIds;
    if (body.channels !== undefined) data.channels = body.channels;
    if (body.status !== undefined) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.launchDate !== undefined)
      data.launchDate = body.launchDate ? new Date(body.launchDate) : null;
    if (body.startDate !== undefined)
      data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined)
      data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.tasks !== undefined) data.tasks = body.tasks;
    if (body.checklists !== undefined) data.checklists = body.checklists;
    if (body.budget !== undefined) data.budget = body.budget;
    if (body.spent !== undefined) data.spent = body.spent;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.storeId !== undefined) data.storeId = body.storeId;

    const launch = await db.productLaunch.update({
      where: { id },
      data,
    });

    return NextResponse.json(launch, { status: 200 });
  } catch (error) {
    console.error('Error updating product launch:', error);
    return NextResponse.json(
      { error: 'Failed to update product launch' },
      { status: 500 }
    );
  }
}

// DELETE /api/product-launches?id=xxx — Delete a product launch
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await db.productLaunch.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Product launch deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product launch:', error);
    return NextResponse.json(
      { error: 'Failed to delete product launch' },
      { status: 500 }
    );
  }
}
