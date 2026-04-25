import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalOrders, totalProducts, totalRevenue, totalShipments] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.order.aggregate({ where: { status: 'delivered' }, _sum: { totalAmount: true } }),
      db.shipment.count(),
    ]);
    const ordersByMarketplace = await db.order.groupBy({ by: ['marketplace'], _count: { id: true } });
    const ordersByStatus = await db.order.groupBy({ by: ['status'], _count: { id: true } });
    const lowStockProducts = await db.product.findMany({ where: { stock: { lte: 20 } }, orderBy: { stock: 'asc' }, take: 10 });

    return NextResponse.json({
      totalOrders, totalProducts,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalShipments, ordersByMarketplace, ordersByStatus, lowStockProducts,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
