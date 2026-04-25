import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      select: { id: true, name: true, sku: true, barcode: true, stock: true, price: true, marketplace: true, category: true },
      take: 30,
    });

    const integrations = await db.integration.findMany({
      where: { type: 'marketplace', status: 'connected' },
      select: { id: true, name: true, platform: true },
    });

    const channels = integrations.length > 0
      ? integrations.map((i: { id: string; name: string; platform: string }) => ({ id: i.id, name: i.name, platform: i.platform }))
      : [
          { id: 'ch1', name: 'Trendyol', platform: 'trendyol' },
          { id: 'ch2', name: 'Hepsiburada', platform: 'hepsiburada' },
          { id: 'ch3', name: 'Amazon TR', platform: 'amazon' },
          { id: 'ch4', name: 'n11', platform: 'n11' },
          { id: 'ch5', name: 'Web Sitesi', platform: 'website' },
        ];

    const statuses = ['synced', 'syncing', 'error', 'pending'] as const;
    const stockSync = products.map((p: { id: string; name: string; sku: string; barcode: string; stock: number; price: number; marketplace: string; category: string }) => {
      const seed = p.id.charCodeAt(0) + p.id.charCodeAt(1);
      const channelStocks = channels.map((ch: { id: string; name: string; platform: string }) => {
        const variance = ((seed * 3 + ch.id.charCodeAt(0) * 7) % 20) - 10;
        const channelStock = Math.max(0, p.stock + variance);
        const statusIdx = ((seed + ch.id.charCodeAt(0)) % 10);
        const status = statusIdx < 5 ? 'synced' as const : statusIdx < 7 ? 'syncing' as const : statusIdx < 9 ? 'pending' as const : 'error' as const;
        const lastSync = new Date(Date.now() - ((seed * 13 + ch.id.charCodeAt(0) * 31) % 3600000));
        return {
          channelId: ch.id,
          channelName: ch.name,
          channelPlatform: ch.platform,
          stock: channelStock,
          status,
          lastSync: lastSync.toISOString(),
          diff: channelStock - p.stock,
        };
      });
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        baseStock: p.stock,
        price: p.price,
        category: p.category,
        channels: channelStocks,
        overallStatus: channelStocks.some((c: { status: string }) => c.status === 'error') ? 'error' : channelStocks.some((c: { status: string }) => c.status === 'syncing') ? 'syncing' : channelStocks.some((c: { status: string }) => c.status === 'pending') ? 'pending' : 'synced',
      };
    });

    const summary = {
      totalProducts: products.length,
      synced: stockSync.filter((s: { overallStatus: string }) => s.overallStatus === 'synced').length,
      syncing: stockSync.filter((s: { overallStatus: string }) => s.overallStatus === 'syncing').length,
      error: stockSync.filter((s: { overallStatus: string }) => s.overallStatus === 'error').length,
      pending: stockSync.filter((s: { overallStatus: string }) => s.overallStatus === 'pending').length,
      totalChannels: channels.length,
      lastFullSync: new Date(Date.now() - 1800000).toISOString(),
    };

    return NextResponse.json({ products: stockSync, channels, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Stock sync data could not be loaded' }, { status: 500 });
  }
}
