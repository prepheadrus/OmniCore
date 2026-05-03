import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Satinalma siparislerini listeleme + durum filtresi + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const currency = searchParams.get('currency');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (currency) where.currency = currency;

    const orders = await db.purchaseOrder.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Her siparis icin hesaplanan bilgileri ekle
    const enriched = orders.map((o) => {
      const items = JSON.parse(o.items || '[]');
      const totalItems = items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity || 0), 0);
      const daysDiff = o.expectedDate
        ? Math.ceil((new Date(o.expectedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      const isOverdue = daysDiff !== null && daysDiff < 0 && o.status !== 'received' && o.status !== 'cancelled';

      const statusLabels: Record<string, string> = {
        pending: 'Beklemede',
        approved: 'Onaylandi',
        received: 'Teslim Alindi',
        cancelled: 'Iptal Edildi',
      };

      return {
        ...o,
        itemsParsed: items,
        totalItems,
        daysUntilExpected: daysDiff,
        isOverdue,
        statusLabel: statusLabels[o.status] || o.status,
      };
    });

    // Ozet istatistikler
    const totalOrders = orders.length;
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const approvedCount = orders.filter((o) => o.status === 'approved').length;
    const receivedCount = orders.filter((o) => o.status === 'received').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
    const totalAmount = orders.reduce((s, o) => s + o.totalAmount, 0);
    const pendingAmount = orders
      .filter((o) => o.status === 'pending' || o.status === 'approved')
      .reduce((s, o) => s + o.totalAmount, 0);
    const overdueCount = enriched.filter((o) => o.isOverdue).length;

    const summary = {
      toplamSiparis: totalOrders,
      bekleyenSiparis: pendingCount,
      onaylananSiparis: approvedCount,
      teslimAlinan: receivedCount,
      iptalEdilen: cancelledCount,
      gecikenSiparis: overdueCount,
      toplamTutar: Math.round(totalAmount * 100) / 100,
      bekleyenTutar: Math.round(pendingAmount * 100) / 100,
    };

    return NextResponse.json({ summary, orders: enriched });
  } catch {
    return NextResponse.json(
      { error: 'Satinalma siparisleri yuklenemedi' },
      { status: 500 }
    );
  }
}

// Satinalma siparisi islemleri: create, update, approve, receive, cancel
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
      // ── Yeni satinalma siparisi olustur ──
      case 'create': {
        const {
          supplierId,
          supplierName,
          items,
          totalAmount,
          currency,
          expectedDate,
          notes,
        } = body;

        if (!supplierName) {
          return NextResponse.json(
            { error: 'Tedarikci adi zorunludur' },
            { status: 400 }
          );
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
          return NextResponse.json(
            { error: 'En az bir urun eklenmelidir' },
            { status: 400 }
          );
        }

        if (!totalAmount || totalAmount <= 0) {
          return NextResponse.json(
            { error: 'Gecerli bir toplam tutar zorunludur' },
            { status: 400 }
          );
        }

        const validCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'CNY'];
        const usedCurrency = currency || 'TRY';
        if (!validCurrencies.includes(usedCurrency)) {
          return NextResponse.json(
            { error: `Gecersiz para birimi. Gecerli degerler: ${validCurrencies.join(', ')}` },
            { status: 400 }
          );
        }

        // Benzersiz siparis numarasi olustur
        const count = await db.purchaseOrder.count();
        const poNumber = `PO-${String(count + 1).padStart(5, '0')}`;

        const data: Record<string, unknown> = {
          poNumber,
          supplierId: supplierId || '',
          supplierName: supplierName.trim(),
          status: 'pending',
          items: JSON.stringify(items),
          totalAmount,
          currency: usedCurrency,
          notes: notes || '',
        };

        if (expectedDate) {
          const ed = new Date(expectedDate);
          if (!isNaN(ed.getTime())) data.expectedDate = ed;
        }

        const order = await db.purchaseOrder.create({ data: data as any });
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

        const existing = await db.purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Satinalma siparisi bulunamadi' },
            { status: 404 }
          );
        }

        const updateData: Record<string, unknown> = {};
        const allowedFields = [
          'supplierId', 'supplierName', 'items', 'totalAmount',
          'currency', 'expectedDate', 'receivedDate', 'notes',
        ];

        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            if (field === 'items') {
              updateData[field] = JSON.stringify(fields[field]);
            } else if (field === 'supplierName') {
              updateData[field] = String(fields[field]).trim();
            } else if (field === 'expectedDate' || field === 'receivedDate') {
              if (fields[field] === null) {
                updateData[field] = null;
              } else {
                const d = new Date(fields[field]);
                if (!isNaN(d.getTime())) updateData[field] = d;
              }
            } else {
              updateData[field] = fields[field];
            }
          }
        }

        const updated = await db.purchaseOrder.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'Satinalma siparisi basariyla guncellendi',
          order: updated,
        });
      }

      // ── Siparisi onayla ──
      case 'approve': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Siparis ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Satinalma siparisi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status !== 'pending') {
          return NextResponse.json(
            { error: `Sadece "beklemede" durumundaki siparisler onaylanabilir. Mevcut durum: ${existing.status}` },
            { status: 400 }
          );
        }

        const updated = await db.purchaseOrder.update({
          where: { id },
          data: { status: 'approved' },
        });

        return NextResponse.json({
          message: `Satinalma siparisi ${updated.poNumber} basariyla onaylandi`,
          order: updated,
        });
      }

      // ── Siparisi teslim al ──
      case 'receive': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Siparis ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Satinalma siparisi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status !== 'approved') {
          return NextResponse.json(
            { error: `Sadece "onaylandi" durumundaki siparisler teslim alinabilir. Mevcut durum: ${existing.status}` },
            { status: 400 }
          );
        }

        const updated = await db.purchaseOrder.update({
          where: { id },
          data: { status: 'received', receivedDate: new Date() },
        });

        return NextResponse.json({
          message: `Satinalma siparisi ${updated.poNumber} basariyla teslim alindi`,
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

        const existing = await db.purchaseOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Satinalma siparisi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status === 'received') {
          return NextResponse.json(
            { error: 'Teslim alinan siparisler iptal edilemez' },
            { status: 400 }
          );
        }

        if (existing.status === 'cancelled') {
          return NextResponse.json(
            { error: 'Siparis zaten iptal edilmis' },
            { status: 400 }
          );
        }

        const updated = await db.purchaseOrder.update({
          where: { id },
          data: {
            status: 'cancelled',
            notes: reason
              ? `${existing.notes ? existing.notes + ' | ' : ''}Iptal nedeni: ${reason}`
              : existing.notes,
          },
        });

        return NextResponse.json({
          message: `Satinalma siparisi ${updated.poNumber} basariyla iptal edildi`,
          order: updated,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, approve, receive, cancel` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Satinalma siparisi API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
