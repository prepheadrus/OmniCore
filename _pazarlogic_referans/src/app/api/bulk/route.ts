import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    if (action === 'update-prices') {
      const { percentage, productIds } = data;
      if (!Array.isArray(productIds) || typeof percentage !== 'number') {
        return NextResponse.json({ error: 'percentage (number) ve productIds (array) gerekli' }, { status: 400 });
      }
      let updated = 0;
      for (const id of productIds) {
        const product = await db.product.findFirst({ where: { id } });
        if (product) {
          await db.product.update({ where: { id }, data: { price: Math.round(product.price * (1 + percentage / 100)) } });
          updated++;
        }
      }
      return NextResponse.json({ success: true, updated });
    }

    if (action === 'update-status') {
      const { status, orderIds } = data;
      const result = await db.order.updateMany({ where: { id: { in: orderIds } }, data: { status } });
      return NextResponse.json({ success: true, updated: result.count });
    }

    if (action === 'update-stock') {
      const { stockData } = data;
      if (!Array.isArray(stockData)) {
        return NextResponse.json({ error: 'stockData (array) gerekli' }, { status: 400 });
      }
      let updated = 0;
      for (const item of stockData) {
        await db.product.update({ where: { id: item.id }, data: { stock: item.stock } });
        updated++;
      }
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: 'Gecersiz islem' }, { status: 400 });
  } catch { return NextResponse.json({ error: 'Islem basarisiz' }, { status: 500 }); }
}
