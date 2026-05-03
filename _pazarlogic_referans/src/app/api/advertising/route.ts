import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Reklam kampanyalarini listeleme + filtreleme + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const marketplace = searchParams.get('marketplace');
    const type = searchParams.get('type');
    const storeId = searchParams.get('storeId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (marketplace) where.marketplace = marketplace;
    if (type) where.type = type;
    if (storeId) where.storeId = storeId;

    const campaigns = await db.adCampaign.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Her kampanya icin hesaplanan metrikleri ekle
    const enriched = campaigns.map((c) => {
      const remaining = Math.max(0, c.budget - c.spent);
      const spentPct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0;
      const convRate = c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0;
      const cpm = c.impressions > 0 ? (c.spent / c.impressions) * 1000 : 0;
      const performance =
        c.roas >= 4
          ? 'mukemmel'
          : c.roas >= 2
            ? 'iyi'
            : c.roas >= 1
              ? 'ortalama'
              : c.spent > 0
                ? 'zayif'
                : 'degerlendirilmedi';

      return {
        ...c,
        remainingBudget: Math.round(remaining * 100) / 100,
        spentPercentage: Math.round(spentPct * 100) / 100,
        conversionRate: Math.round(convRate * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        performance,
      };
    });

    // Toplam ozet istatistikler
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const activeCount = campaigns.filter((c) => c.status === 'active').length;
    const totalCampaigns = campaigns.length;

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgROAS = calcROAS(totalSpent, totalConversions);
    const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;

    const summary = {
      toplamKampanya: totalCampaigns,
      aktifKampanya: activeCount,
      toplamButce: Math.round(totalBudget * 100) / 100,
      toplamHarcama: Math.round(totalSpent * 100) / 100,
      kalanButce: Math.round(Math.max(0, totalBudget - totalSpent) * 100) / 100,
      toplamGoruntulenme: totalImpressions,
      toplamTiklama: totalClicks,
      toplamDonusum: totalConversions,
      ortalamaCTR: Math.round(avgCTR * 100) / 100,
      ortalamaROAS: Math.round(avgROAS * 100) / 100,
      ortalamaCPC: Math.round(avgCPC * 100) / 100,
    };

    return NextResponse.json({ summary, campaigns: enriched });
  } catch {
    return NextResponse.json(
      { error: 'Reklam kampanyalari yuklenemedi' },
      { status: 500 }
    );
  }
}

// ROAS hesaplama: donusum * ortalama siparis degeri / harcama
// Ortalama siparis degeri: 150 TL (pazar yeri ortalamasi)
function calcROAS(spent: number, conversions: number): number {
  const avgOrderValue = 150;
  return spent > 0 ? (conversions * avgOrderValue) / spent : 0;
}

// Reklam kampanya islemleri: create, update, delete, toggle-status, update-metrics
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
      // ── Yeni kampanya olustur ──
      case 'create': {
        const {
          name,
          marketplace,
          type,
          budget,
          dailyBudget,
          status,
          startDate,
          endDate,
          productIds,
          targeting,
          creative,
          storeId,
        } = body;

        if (!name || !name.trim()) {
          return NextResponse.json(
            { error: 'Kampanya adi zorunludur' },
            { status: 400 }
          );
        }

        const validTypes = ['sponsored', 'display', 'video', 'retargeting'];
        if (type && !validTypes.includes(type)) {
          return NextResponse.json(
            { error: `Gecersiz kampanya turu. Gecerli degerler: ${validTypes.join(', ')}` },
            { status: 400 }
          );
        }

        const validStatuses = ['draft', 'active', 'paused', 'completed'];
        if (status && !validStatuses.includes(status)) {
          return NextResponse.json(
            { error: `Gecersiz durum. Gecerli degerler: ${validStatuses.join(', ')}` },
            { status: 400 }
          );
        }

        const data: Record<string, unknown> = {
          name: name.trim(),
          marketplace: marketplace || '',
          type: type || 'sponsored',
          budget: budget ?? 0,
          dailyBudget: dailyBudget ?? 0,
          status: status || 'draft',
          productIds: productIds || '[]',
          targeting: targeting || '{}',
          creative: creative || '{}',
          storeId: storeId || 'default',
        };

        if (startDate) {
          const sd = new Date(startDate);
          if (!isNaN(sd.getTime())) data.startDate = sd;
        }
        if (endDate) {
          const ed = new Date(endDate);
          if (!isNaN(ed.getTime())) data.endDate = ed;
        }

        const campaign = await db.adCampaign.create({ data: data as any });
        return NextResponse.json(campaign, { status: 201 });
      }

      // ── Kampanya guncelle ──
      case 'update': {
        const { id, ...fields } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Kampanya ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.adCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Kampanya bulunamadi' },
            { status: 404 }
          );
        }

        const updateData: Record<string, unknown> = {};

        const allowedFields = [
          'name', 'marketplace', 'type', 'budget', 'dailyBudget',
          'status', 'startDate', 'endDate', 'productIds', 'targeting',
          'creative', 'storeId',
        ];

        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            if (field === 'name') {
              updateData[field] = String(fields[field]).trim();
            } else if (field === 'startDate' || field === 'endDate') {
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

        const updated = await db.adCampaign.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'Kampanya basariyla guncellendi',
          campaign: updated,
        });
      }

      // ── Kampanya sil ──
      case 'delete': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Kampanya ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.adCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Kampanya bulunamadi' },
            { status: 404 }
          );
        }

        await db.adCampaign.delete({ where: { id } });

        return NextResponse.json({
          message: 'Kampanya basariyla silindi',
          deletedId: id,
        });
      }

      // ── Kampanya durumu degistir (pause/resume) ──
      case 'toggle-status': {
        const { id, status: newStatus } = body;

        if (!id || !newStatus) {
          return NextResponse.json(
            { error: 'Kampanya ID ve yeni durum zorunludur' },
            { status: 400 }
          );
        }

        const validTransitions: Record<string, string[]> = {
          active: ['paused', 'completed'],
          paused: ['active'],
          draft: ['active'],
          completed: [],
        };

        const existing = await db.adCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Kampanya bulunamadi' },
            { status: 404 }
          );
        }

        const allowed = validTransitions[existing.status] || [];
        if (!allowed.includes(newStatus)) {
          return NextResponse.json(
            {
              error: `"${existing.status}" durumundan "${newStatus}" durumuna gecis yapilamaz. Izin verilen gecisler: ${allowed.length > 0 ? allowed.join(', ') : 'yok'}`,
            },
            { status: 400 }
          );
        }

        const updated = await db.adCampaign.update({
          where: { id },
          data: { status: newStatus },
        });

        const statusLabels: Record<string, string> = {
          active: 'aktif',
          paused: 'duraklatildi',
          draft: 'taslak',
          completed: 'tamamlandi',
        };

        return NextResponse.json({
          message: `Kampanya durumu "${statusLabels[newStatus]}" olarak guncellendi`,
          campaign: updated,
        });
      }

      // ── Kampanya metriklerini guncelle + otomatik hesaplama ──
      case 'update-metrics': {
        const {
          id,
          impressions: newImpressions,
          clicks: newClicks,
          conversions: newConversions,
          spent: newSpent,
        } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Kampanya ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.adCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Kampanya bulunamadi' },
            { status: 404 }
          );
        }

        // Metrikleri birikimli olarak guncelle
        const totalImpressions = (existing.impressions || 0) + (newImpressions || 0);
        const totalClicks = (existing.clicks || 0) + (newClicks || 0);
        const totalConversions = (existing.conversions || 0) + (newConversions || 0);
        const totalSpent = (existing.spent || 0) + (newSpent || 0);

        // Otomatik hesaplamalar
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;

        // ROAS: donusum * ortalama siparis degeri / harcama
        const roas = calcROAS(totalSpent, totalConversions);

        const updated = await db.adCampaign.update({
          where: { id },
          data: {
            impressions: totalImpressions,
            clicks: totalClicks,
            conversions: totalConversions,
            spent: Math.round(totalSpent * 100) / 100,
            ctr: Math.round(ctr * 100) / 100,
            cpc: Math.round(cpc * 100) / 100,
            roas: Math.round(roas * 100) / 100,
          },
        });

        // Otomatik bakiye kontrolu: butce asildiysa kampanyayi duraklat
        if (updated.budget > 0 && updated.spent >= updated.budget && updated.status === 'active') {
          const paused = await db.adCampaign.update({
            where: { id },
            data: { status: 'paused' },
          });
          return NextResponse.json({
            message: 'Metrikler guncellendi. Butce asildigi icin kampanya otomatik olarak duraklatildi',
            campaign: paused,
            metrics: {
              ctr: paused.ctr,
              cpc: paused.cpc,
              roas: paused.roas,
            },
          });
        }

        return NextResponse.json({
          message: 'Kampanya metrikleri basariyla guncellendi',
          campaign: updated,
          metrics: {
            ctr: updated.ctr,
            cpc: updated.cpc,
            roas: updated.roas,
          },
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, delete, toggle-status, update-metrics`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Advertising API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
