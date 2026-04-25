import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      select: { id: true, orderNumber: true, marketplace: true, totalAmount: true, discount: true, taxAmount: true, netAmount: true, commission: true, cargoCost: true, status: true, itemsJson: true, createdAt: true },
      take: 60,
    });

    const products = await db.product.findMany({
      select: { id: true, name: true, sku: true, price: true, cost: true, marketplace: true, category: true },
      take: 30,
    });

    const marketplaceMap: Record<string, { commissionRate: number; name: string }> = {
      trendyol: { commissionRate: 0.12, name: 'Trendyol' },
      hepsiburada: { commissionRate: 0.10, name: 'Hepsiburada' },
      'amazon tr': { commissionRate: 0.08, name: 'Amazon TR' },
      n11: { commissionRate: 0.11, name: 'n11' },
    };

    const completedOrders = orders.filter((o: { status: string }) => ['delivered', 'shipped'].includes(o.status));

    const channelROI = Object.entries(
      completedOrders.reduce((acc: Record<string, { revenue: number; commission: number; cargo: number; tax: number; discount: number; orders: number; cost: number }>, o: { marketplace: string; totalAmount: number; commission: number; cargoCost: number; taxAmount: number; discount: number }) => {
        const mp = o.marketplace.toLowerCase();
        if (!acc[mp]) acc[mp] = { revenue: 0, commission: 0, cargo: 0, tax: 0, discount: 0, orders: 0, cost: 0 };
        acc[mp].revenue += o.totalAmount;
        acc[mp].commission += o.commission;
        acc[mp].cargo += o.cargoCost;
        acc[mp].tax += o.taxAmount;
        acc[mp].discount += o.discount;
        acc[mp].orders += 1;
        acc[mp].cost += (o.totalAmount * 0.55);
        return acc;
      }, {})
    ).map(([key, val]) => {
      const netProfit = val.revenue - val.commission - val.cargo - val.cost;
      const roi = val.cost > 0 ? ((netProfit / val.cost) * 100) : 0;
      const margin = val.revenue > 0 ? ((netProfit / val.revenue) * 100) : 0;
      return {
        channel: key,
        channelName: marketplaceMap[key]?.name || key,
        ...val,
        netProfit,
        roi: +roi.toFixed(2),
        margin: +margin.toFixed(2),
        avgOrderValue: val.orders > 0 ? +(val.revenue / val.orders).toFixed(2) : 0,
        costPerOrder: val.orders > 0 ? +(val.cost / val.orders).toFixed(2) : 0,
        commissionRate: marketplaceMap[key]?.commissionRate || 0.10,
      };
    });

    const productROI = products.map((p: { id: string; name: string; sku: string; price: number; cost: number; marketplace: string; category: string }) => {
      const revenue = p.price;
      const cost = p.cost;
      const mp = p.marketplace.toLowerCase();
      const commissionRate = marketplaceMap[mp]?.commissionRate || 0.10;
      const commission = revenue * commissionRate;
      const cargoCost = 35;
      const netProfit = revenue - cost - commission - cargoCost;
      const roi = cost > 0 ? ((netProfit / cost) * 100) : 0;
      const margin = revenue > 0 ? ((netProfit / revenue) * 100) : 0;
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        channel: mp,
        channelName: marketplaceMap[mp]?.name || mp,
        category: p.category,
        revenue,
        cost,
        commission: +commission.toFixed(2),
        cargoCost,
        netProfit: +netProfit.toFixed(2),
        roi: +roi.toFixed(2),
        margin: +margin.toFixed(2),
      };
    });

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const month = d.toLocaleDateString('tr-TR', { month: 'long', year: '2-digit' });
      const seed = i * 1000 + 5000;
      return {
        month,
        revenue: seed * (1.1 + i * 0.08),
        cost: seed * 0.58,
        commission: seed * 0.10,
        cargo: seed * 0.02,
        netProfit: seed * (0.28 + i * 0.03),
        orders: 40 + i * 8,
      };
    });

    const totalRevenue = completedOrders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0);
    const totalCost = completedOrders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount * 0.55, 0);
    const totalCommission = completedOrders.reduce((s: number, o: { commission: number }) => s + o.commission, 0);
    const totalCargo = completedOrders.reduce((s: number, o: { cargoCost: number }) => s + o.cargoCost, 0);
    const totalNetProfit = totalRevenue - totalCost - totalCommission - totalCargo;
    const totalROI = totalCost > 0 ? ((totalNetProfit / totalCost) * 100) : 0;

    const summary = {
      totalRevenue: +totalRevenue.toFixed(2),
      totalCost: +totalCost.toFixed(2),
      totalCommission: +totalCommission.toFixed(2),
      totalCargo: +totalCargo.toFixed(2),
      totalNetProfit: +totalNetProfit.toFixed(2),
      totalROI: +totalROI.toFixed(2),
      totalOrders: completedOrders.length,
      avgOrderValue: completedOrders.length > 0 ? +(totalRevenue / completedOrders.length).toFixed(2) : 0,
      bestChannel: channelROI.length > 0 ? channelROI.reduce((best: typeof channelROI[0], c: typeof channelROI[0]) => c.roi > best.roi ? c : best) : null,
      worstChannel: channelROI.length > 0 ? channelROI.reduce((worst: typeof channelROI[0], c: typeof channelROI[0]) => c.roi < worst.roi ? c : worst) : null,
    };

    return NextResponse.json({ summary, channelROI, productROI, monthlyData });
  } catch (error) {
    return NextResponse.json({ error: 'ROI data could not be loaded' }, { status: 500 });
  }
}
