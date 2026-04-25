import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const webhooks = await db.webhookEndpoint.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(webhooks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.url) {
      return NextResponse.json(
        { error: 'name and url are required' },
        { status: 400 },
      );
    }

    const webhook = await db.webhookEndpoint.create({
      data: {
        name: body.name,
        url: body.url,
        secret: body.secret || '',
        events: body.events ? JSON.stringify(body.events) : '[]',
        isActive: body.isActive ?? true,
        storeId: body.storeId || 'default',
      },
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    await db.webhookEndpoint.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}
