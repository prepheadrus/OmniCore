import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const notifications = await db.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notification = await db.notification.create({ data: { title: body.title, message: body.message, type: body.type || 'info', category: body.category || 'system', link: body.link || '', userId: body.userId || 'default' } });
    return NextResponse.json(notification, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();
    await db.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
