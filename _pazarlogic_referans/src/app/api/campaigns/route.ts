import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(campaigns);
  } catch {
    return NextResponse.json({ error: 'Kampanyalar yuklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Gecerli startDate ve endDate gerekli' }, { status: 400 });
    }
    const campaign = await db.campaign.create({ data: { name: body.name, type: body.type || 'discount', marketplace: body.marketplace || '', discount: body.discount || 0, startDate, endDate } });
    return NextResponse.json(campaign, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
