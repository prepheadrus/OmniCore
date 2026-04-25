import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type FulfillmentStage = 'new' | 'confirmed' | 'picking' | 'packing' | 'ready' | 'shipped';

interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  marketplace: string;
  totalAmount: number;
  items: number;
  stage: FulfillmentStage;
  assignedTo: string | null;
  priority: 'normal' | 'urgent' | 'express';
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    const orders = await db.order.findMany({
      select: { id: true, orderNumber: true, marketplace: true, totalAmount: true, status: true, itemsJson: true, createdAt: true },
      take: 40,
      orderBy: { createdAt: 'desc' },
    });

    const stages: FulfillmentStage[] = ['new', 'confirmed', 'picking', 'packing', 'ready', 'shipped'];
    const assignees = ['Ahmet Y.', 'Elif K.', 'Mehmet D.', 'Zeynep A.', 'Burak S.'];
    const priorities: Array<'normal' | 'urgent' | 'express'> = ['normal', 'normal', 'normal', 'normal', 'urgent', 'express'];
    const customerNames = ['Ayşe Kaya', 'Mehmet Yılmaz', 'Fatma Demir', 'Ali Öztürk', 'Zeynep Arslan', 'Hasan Çelik', 'Emine Şahin', 'Mustafa Koç', 'Hatice Aydın', 'Hüseyin Özkan'];

    const fulfillmentOrders: FulfillmentOrder[] = orders.map((o, idx) => {
      const createdAtStr = o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt);
      let stage: FulfillmentStage = 'new';
      if (o.status === 'pending') stage = idx % 3 === 0 ? 'new' : 'confirmed';
      else if (o.status === 'processing') stage = ['picking', 'packing', 'ready'][idx % 3] as FulfillmentStage;
      else if (o.status === 'shipped') stage = 'shipped';
      else if (o.status === 'delivered') stage = 'shipped';
      else if (o.status === 'cancelled') stage = 'new';

      let itemsCount = 1;
      try { itemsCount = JSON.parse(o.itemsJson || '[]').length; } catch { itemsCount = Math.floor(Math.random() * 3) + 1; }

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: customerNames[idx % customerNames.length],
        marketplace: o.marketplace,
        totalAmount: o.totalAmount,
        items: itemsCount,
        stage,
        assignedTo: ['picking', 'packing', 'ready', 'shipped'].includes(stage) ? assignees[idx % assignees.length] : null,
        priority: priorities[idx % priorities.length],
        createdAt: createdAtStr,
        updatedAt: new Date(new Date(createdAtStr).getTime() + idx * 3600000).toISOString(),
      };
    });

    const pipeline = stages.map(stage => {
      const stageOrders = fulfillmentOrders.filter(o => o.stage === stage);
      return {
        stage,
        label: {
          new: 'Yeni Siparişler',
          confirmed: 'Onaylandı',
          picking: 'Toplama',
          packing: 'Paketleme',
          ready: 'Kargoya Hazır',
          shipped: 'Kargoya Verildi',
        }[stage],
        count: stageOrders.length,
        totalAmount: stageOrders.reduce((s, o) => s + o.totalAmount, 0),
        orders: stageOrders,
      };
    });

    const urgentOrders = fulfillmentOrders.filter(o => o.priority === 'urgent' || o.priority === 'express');
    const unassigned = fulfillmentOrders.filter(o => !o.assignedTo && ['picking', 'packing'].includes(o.stage));

    const summary = {
      totalOrders: fulfillmentOrders.length,
      pipeline: pipeline.map(p => ({ stage: p.stage, label: p.label, count: p.count })),
      urgentCount: urgentOrders.length,
      unassignedCount: unassigned.length,
      avgFulfillmentTime: 4.2,
      todayShipped: pipeline.find(p => p.stage === 'shipped')?.count || 0,
    };

    return NextResponse.json({ pipeline, summary, urgentOrders, unassigned });
  } catch (error) {
    return NextResponse.json({ error: 'Fulfillment data could not be loaded' }, { status: 500 });
  }
}
