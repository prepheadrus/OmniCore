import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — List all smart alert rules, optional ?category= filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const rules = await db.smartAlertRule.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch smart alert rules' },
      { status: 500 },
    );
  }
}

// POST — Create a new smart alert rule
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize JSON fields if passed as objects
    const channels =
      body.channels !== undefined
        ? typeof body.channels === 'string'
          ? body.channels
          : JSON.stringify(body.channels)
        : '[]';

    const filters =
      body.filters !== undefined
        ? typeof body.filters === 'string'
          ? body.filters
          : JSON.stringify(body.filters)
        : '{}';

    const rule = await db.smartAlertRule.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        category: body.category ?? 'stock',
        metric: body.metric ?? '',
        condition: body.condition ?? 'below',
        threshold: body.threshold ?? 0,
        thresholdText: body.thresholdText ?? '',
        channels,
        frequency: body.frequency ?? 'once',
        cooldownMinutes: body.cooldownMinutes ?? 60,
        lastTriggered: body.lastTriggered
          ? new Date(body.lastTriggered)
          : null,
        triggerCount: body.triggerCount ?? 0,
        isActive: body.isActive ?? true,
        filters,
        assignedTo: body.assignedTo ?? '',
        storeId: body.storeId ?? 'default',
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create smart alert rule' },
      { status: 500 },
    );
  }
}

// PUT — Update a smart alert rule
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();

    // Normalize JSON fields and convert date strings
    const updateData: Record<string, unknown> = { ...body };
    if (updateData.channels !== undefined) {
      updateData.channels =
        typeof updateData.channels === 'string'
          ? updateData.channels
          : JSON.stringify(updateData.channels);
    }
    if (updateData.filters !== undefined) {
      updateData.filters =
        typeof updateData.filters === 'string'
          ? updateData.filters
          : JSON.stringify(updateData.filters);
    }
    if (updateData.lastTriggered !== undefined && updateData.lastTriggered) {
      updateData.lastTriggered = new Date(updateData.lastTriggered as string);
    }

    const rule = await db.smartAlertRule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(rule);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update smart alert rule' },
      { status: 500 },
    );
  }
}

// DELETE — Delete a smart alert rule
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.smartAlertRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete smart alert rule' },
      { status: 500 },
    );
  }
}
