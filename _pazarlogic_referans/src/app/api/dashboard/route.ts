import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ---------- Parallel queries ----------
    const [
      orderCounts,
      revenueStats,
      productStats,
      ordersByMarketplace,
      revenueByMarketplace,
      shipmentStats,
      integrationStats,
      feedStats,
      priceRuleStats,
      unreadNotifications,
      recentActivity,
    ] = await Promise.all([
      // Order counts by status
      Promise.all([
        db.order.count(),
        db.order.count({ where: { status: 'pending' } }),
        db.order.count({ where: { status: 'processing' } }),
        db.order.count({ where: { status: 'shipped' } }),
        db.order.count({ where: { status: 'delivered' } }),
        db.order.count({ where: { status: 'cancelled' } }),
        db.order.count({ where: { createdAt: { gte: startOfToday } } }),
      ]),

      // Revenue stats
      Promise.all([
        db.order.aggregate({
          where: { status: { in: ['delivered', 'shipped', 'processing'] } },
          _sum: { totalAmount: true },
        }),
        db.order.aggregate({
          where: { createdAt: { gte: startOfToday }, status: { in: ['delivered', 'shipped', 'processing'] } },
          _sum: { totalAmount: true },
        }),
        db.order.aggregate({
          where: { status: { in: ['delivered', 'shipped', 'processing'] } },
          _avg: { totalAmount: true },
        }),
        db.order.findMany({
          where: { createdAt: { gte: thirtyDaysAgo }, status: { in: ['delivered', 'shipped', 'processing'] } },
          select: { createdAt: true, totalAmount: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]),

      // Product stats
      Promise.all([
        db.product.count(),
        db.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
        db.product.count({ where: { stock: { lte: 0 } } }),
        db.product.groupBy({ by: ['category'], _count: { id: true } }),
      ]),

      // Orders per marketplace
      db.order.groupBy({
        by: ['marketplace'],
        _count: { id: true },
        _sum: { totalAmount: true },
      }),

      // Revenue per marketplace
      db.order.groupBy({
        by: ['marketplace'],
        where: { status: { in: ['delivered', 'shipped', 'processing'] } },
        _sum: { totalAmount: true },
      }),

      // Shipment stats
      Promise.all([
        db.shipment.count(),
        db.shipment.count({ where: { status: 'in_transit' } }),
        db.shipment.count({ where: { status: 'delivered', updatedAt: { gte: startOfToday } } }),
      ]),

      // Integration stats
      Promise.all([
        db.integration.count({ where: { status: 'connected' } }),
        db.integration.count({ where: { status: 'disconnected' } }),
      ]),

      // Feed stats
      Promise.all([
        db.productFeed.count(),
        db.productFeed.count({ where: { status: 'active' } }),
        db.productFeed.findFirst({
          where: { status: 'active' },
          orderBy: { lastImport: 'desc' },
          select: { lastImport: true },
        }),
      ]),

      // Price rule stats
      Promise.all([
        db.priceRule.count(),
        db.priceRule.count({ where: { isActive: true } }),
      ]),

      // Unread notifications
      db.notification.count({ where: { isRead: false } }),

      // Recent activity (last 5 audit logs)
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // ---------- Build monthly revenue trend ----------
    const monthlyMap = new Map<string, number>();
    for (const order of revenueStats[3]) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + order.totalAmount);
    }
    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));

    // ---------- Unique category count ----------
    const uniqueCategories = productStats[3].length;

    return NextResponse.json({
      // Order stats
      orders: {
        total: orderCounts[0],
        pending: orderCounts[1],
        processing: orderCounts[2],
        shipped: orderCounts[3],
        delivered: orderCounts[4],
        cancelled: orderCounts[5],
        today: orderCounts[6],
      },

      // Revenue stats
      revenue: {
        total: revenueStats[0]._sum.totalAmount ?? 0,
        today: revenueStats[1]._sum.totalAmount ?? 0,
        averageOrderValue: revenueStats[2]._avg.totalAmount ?? 0,
        monthlyTrend,
      },

      // Product stats
      products: {
        total: productStats[0],
        lowStock: productStats[1],
        outOfStock: productStats[2],
        totalCategories: uniqueCategories,
        categoriesBreakdown: productStats[3],
      },

      // Marketplace stats
      marketplace: {
        ordersPerMarketplace: ordersByMarketplace.map((m) => ({
          marketplace: m.marketplace || 'Direct',
          orders: m._count.id,
          revenue: m._sum.totalAmount ?? 0,
        })),
        revenuePerMarketplace: revenueByMarketplace.map((m) => ({
          marketplace: m.marketplace || 'Direct',
          revenue: m._sum.totalAmount ?? 0,
        })),
      },

      // Shipment stats
      shipments: {
        total: shipmentStats[0],
        inTransit: shipmentStats[1],
        deliveredToday: shipmentStats[2],
      },

      // Integration stats
      integrations: {
        connected: integrationStats[0],
        disconnected: integrationStats[1],
      },

      // Feed stats
      feeds: {
        total: feedStats[0],
        active: feedStats[1],
        lastImport: feedStats[2]?.lastImport ?? null,
      },

      // Price rule stats
      priceRules: {
        total: priceRuleStats[0],
        active: priceRuleStats[1],
      },

      // Notification stats
      notifications: {
        unread: unreadNotifications,
      },

      // Recent activity
      recentActivity,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
