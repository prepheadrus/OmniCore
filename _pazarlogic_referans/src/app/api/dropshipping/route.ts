import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dropshipping siparislerini listeleme + durum filtresi + kar ozeti
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const marketplace = searchParams.get('marketplace');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (marketplace) where.marketplace = marketplace;

    const orders = await db.dropshipOrder.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Her siparis icin ek bilgiler hesapla
    const enriched = orders.map((o) => {
      const profitMargin = o.sellPrice > 0 ? (o.profit / o.sellPrice) * 100 : 0;
      const roi = o.costPrice > 0 ? (o.profit / o.costPrice) * 100 : 0;

      const statusLabels: Record<string, string> = {
        pending: 'Beklemede',
        processing: 'Hazirlaniyor',
        shipped: 'Kargolandı',
        completed: 'Tamamlandi',
        cancelled: 'Iptal Edildi',
        returned: 'Iade Edildi',
      };

      const statusColors: Record<string, string> = {
        pending: 'sari',
        processing: 'mavi',
        shipped: 'turuncu',
        completed: 'yesil',
        cancelled: 'kirmizi',
        returned: 'mor',
      };

      return {
        ...o,
        profitMargin: Math.round(profitMargin * 100) / 100,
        roi: Math.round(roi * 100) / 100,
        statusLabel: statusLabels[o.status] || o.status,
        statusColor: statusColors[o.status] || 'gri',
        hasTracking: !!o.trackingNo,
      };
    });

    // Kar ozeti istatistikleri
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    const totalRevenue = orders
      .filter((o) => !['cancelled', 'returned'].includes(o.status))
      .reduce((s, o) => s + o.sellPrice, 0);
    const totalCost = orders
      .filter((o) => !['cancelled', 'returned'].includes(o.status))
      .reduce((s, o) => s + o.costPrice, 0);
    const totalProfit = orders
      .filter((o) => !['cancelled', 'returned'].includes(o.status))
      .reduce((s, o) => s + o.profit, 0);

    const avgProfit =
      completedOrders > 0
        ? orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.profit, 0) / completedOrders
        : 0;
    const avgMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Tedarikci bazinda kar
    const suppliers = [...new Set(orders.map((o) => o.supplierName).filter(Boolean))];
    const bySupplier = suppliers.map((sup) => {
      const supOrders = orders.filter(
        (o) => o.supplierName === sup && !['cancelled', 'returned'].includes(o.status)
      );
      const supRevenue = supOrders.reduce((s, o) => s + o.sellPrice, 0);
      const supCost = supOrders.reduce((s, o) => s + o.costPrice, 0);
      const supProfit = supOrders.reduce((s, o) => s + o.profit, 0);
      return {
        tedarikci: sup,
        siparisSayisi: supOrders.length,
        toplamGelir: Math.round(supRevenue * 100) / 100,
        toplamMaliyet: Math.round(supCost * 100) / 100,
        toplamKar: Math.round(supProfit * 100) / 100,
        karMarji: supRevenue > 0 ? Math.round((supProfit / supRevenue) * 10000) / 100 : 0,
      };
    }).sort((a, b) => b.toplamKar - a.toplamKar);

    // Pazaryeri bazinda kar
    const marketplaces = [...new Set(orders.map((o) => o.marketplace).filter(Boolean))];
    const byMarketplace = marketplaces.map((mp) => {
      const mpOrders = orders.filter(
        (o) => o.marketplace === mp && !['cancelled', 'returned'].includes(o.status)
      );
      const mpRevenue = mpOrders.reduce((s, o) => s + o.sellPrice, 0);
      const mpProfit = mpOrders.reduce((s, o) => s + o.profit, 0);
      return {
        pazaryeri: mp,
        siparisSayisi: mpOrders.length,
        toplamGelir: Math.round(mpRevenue * 100) / 100,
        toplamKar: Math.round(mpProfit * 100) / 100,
        karMarji: mpRevenue > 0 ? Math.round((mpProfit / mpRevenue) * 10000) / 100 : 0,
      };
    }).sort((a, b) => b.toplamKar - a.toplamKar);

    const summary = {
      toplamSiparis: totalOrders,
      bekleyenSiparis: pendingOrders,
      kargolananSiparis: shippedOrders,
      tamamlananSiparis: completedOrders,
      iptalEdilenSiparis: cancelledOrders,
      toplamGelir: Math.round(totalRevenue * 100) / 100,
      toplamMaliyet: Math.round(totalCost * 100) / 100,
      toplamKar: Math.round(totalProfit * 100) / 100,
      ortalamaKar: Math.round(avgProfit * 100) / 100,
      ortalamaKarMarji: Math.round(avgMargin * 100) / 100,
      tedarikciBazliKar: bySupplier,
      pazaryeriBazliKar: byMarketplace,
    };

    return NextResponse.json({ summary, orders: enriched });
  } catch {
    return NextResponse.json(
      { error: 'Dropshipping siparisleri yuklenemedi' },
      { status: 500 }
    );
  }
}

// Dropshipping siparis islemleri: create, update, ship, complete, cancel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Islem turu (action) belirtilmelidir' },
        { status: 400 }
      );
    }

    switch (action) {
      // ── Yeni dropshipping siparisi olustur ──
      case 'create': {
        const {
          supplierId,
          supplierName,
          productId,
          productName,
          customerName,
          customerAddr,
          costPrice,
          sellPrice,
          marketplace,
        } = body;

        if (!supplierName || !supplierName.trim()) {
          return NextResponse.json(
            { error: 'Tedarikci adi zorunludur' },
            { status: 400 }
          );
        }

        if (!productName || !productName.trim()) {
          return NextResponse.json(
            { error: 'Urun adi zorunludur' },
            { status: 400 }
          );
        }

        if (!customerName || !customerName.trim()) {
          return NextResponse.json(
            { error: 'Musteri adi zorunludur' },
            { status: 400 }
          );
        }

        if (costPrice === undefined || costPrice < 0) {
          return NextResponse.json(
            { error: 'Gecerli bir maliyet fiyati zorunludur' },
            { status: 400 }
          );
        }

        if (sellPrice === undefined || sellPrice < 0) {
          return NextResponse.json(
            { error: 'Gecerli bir satis fiyati zorunludur' },
            { status: 400 }
          );
        }

        const profit = Math.round((sellPrice - costPrice) * 100) / 100;

        // Benzersiz siparis numarasi olustur
        const count = await db.dropshipOrder.count();
        const orderNumber = `DS-${String(count + 1).padStart(6, '0')}`;

        const order = await db.dropshipOrder.create({
          data: {
            orderNumber,
            supplierId: supplierId || '',
            supplierName: supplierName.trim(),
            productId: productId || '',
            productName: productName.trim(),
            customerName: customerName.trim(),
            customerAddr: customerAddr || '',
            costPrice,
            sellPrice,
            profit,
            status: 'pending',
            marketplace: marketplace || '',
          },
        });

        return NextResponse.json(order, { status: 201 });
      }

      // ── Siparisi guncelle ──
      case 'update': {
        const { id, ...fields } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Siparis ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.dropshipOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Dropshipping siparisi bulunamadi' },
            { status: 404 }
          );
        }

        const updateData: Record<string, unknown> = {};
        const allowedFields = [
          'supplierId', 'supplierName', 'productId', 'productName',
          'customerName', 'customerAddr', 'costPrice', 'sellPrice',
          'marketplace',
        ];

        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            if (field === 'supplierName' || field === 'productName' || field === 'customerName') {
              updateData[field] = String(fields[field]).trim();
            } else {
              updateData[field] = fields[field];
            }
          }
        }

        // Fiyat guncellendiyse karı da guncelle
        if (updateData.costPrice !== undefined || updateData.sellPrice !== undefined) {
          const newCost = updateData.costPrice !== undefined ? updateData.costPrice : existing.costPrice;
          const newSell = updateData.sellPrice !== undefined ? updateData.sellPrice : existing.sellPrice;
          updateData.profit = Math.round(((newSell as number) - ((newCost as number) ?? 0)) * 100) / 100;
        }

        const updated = await db.dropshipOrder.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'Dropshipping siparisi basariyla guncellendi',
          order: updated,
        });
      }

      // ── Siparisi kargola ──
      case 'ship': {
        const { id, trackingNo } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Siparis ID zorunludur' },
            { status: 400 }
          );
        }

        if (!trackingNo || !trackingNo.trim()) {
          return NextResponse.json(
            { error: 'Kargo takip numarasi zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.dropshipOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Dropshipping siparisi bulunamadi' },
            { status: 404 }
          );
        }

        if (!['pending', 'processing'].includes(existing.status)) {
          return NextResponse.json(
            { error: `Sadece "beklemede" veya "hazırlaniyor" durumundaki siparisler kargolanabilir. Mevcut durum: ${existing.status}` },
            { status: 400 }
          );
        }

        const updated = await db.dropshipOrder.update({
          where: { id },
          data: {
            status: 'shipped',
            trackingNo: trackingNo.trim(),
          },
        });

        return NextResponse.json({
          message: `Siparis ${updated.orderNumber} basariyla kargolandı`,
          order: updated,
        });
      }

      // ── Siparisi tamamla ──
      case 'complete': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Siparis ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.dropshipOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Dropshipping siparisi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status !== 'shipped') {
          return NextResponse.json(
            { error: `Sadece "kargolandı" durumundaki siparisler tamamlanabilir. Mevcut durum: ${existing.status}` },
            { status: 400 }
          );
        }

        const updated = await db.dropshipOrder.update({
          where: { id },
          data: { status: 'completed' },
        });

        return NextResponse.json({
          message: `Siparis ${updated.orderNumber} basariyla tamamlandi. Kar: ${updated.profit} TL`,
          order: updated,
        });
      }

      // ── Siparisi iptal et ──
      case 'cancel': {
        const { id, reason } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Siparis ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.dropshipOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Dropshipping siparisi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status === 'completed') {
          return NextResponse.json(
            { error: 'Tamamlanmis siparisler iptal edilemez' },
            { status: 400 }
          );
        }

        if (existing.status === 'cancelled') {
          return NextResponse.json(
            { error: 'Siparis zaten iptal edilmis' },
            { status: 400 }
          );
        }

        const updated = await db.dropshipOrder.update({
          where: { id },
          data: { status: 'cancelled' },
        });

        const lostProfit = existing.status !== 'returned' ? existing.profit : 0;

        return NextResponse.json({
          message: `Siparis ${updated.orderNumber} basariyla iptal edildi${reason ? `. Neden: ${reason}` : ''}`,
          order: updated,
          kaybedilenKar: lostProfit,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, ship, complete, cancel` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dropshipping API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
