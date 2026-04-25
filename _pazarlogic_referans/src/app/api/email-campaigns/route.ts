import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// E-posta kampanyalarini listeleme + durum filtresi + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const segment = searchParams.get('segment');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (segment) where.segment = segment;

    const campaigns = await db.emailCampaign.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Her kampanya icin hesaplanan bilgileri ekle
    const enriched = campaigns.map((c) => {
      const openRate = c.sentCount > 0 ? (c.openCount / c.sentCount) * 100 : 0;
      const clickRate = c.sentCount > 0 ? (c.clickCount / c.sentCount) * 100 : 0;
      const clickToOpenRate = c.openCount > 0 ? (c.clickCount / c.openCount) * 100 : 0;
      const bounceRate = c.sentCount > 0 ? (c.bounceCount / c.sentCount) * 100 : 0;
      const deliveredCount = Math.max(0, c.sentCount - c.bounceCount);

      const performance =
        openRate >= 25
          ? 'mukemmel'
          : openRate >= 15
            ? 'iyi'
            : openRate >= 5
              ? 'ortalama'
              : c.sentCount > 0
                ? 'zayif'
                : 'gonderilmedi';

      const statusLabels: Record<string, string> = {
        draft: 'Taslak',
        scheduled: 'Planlanmis',
        sending: 'Gonderiliyor',
        sent: 'Gonderildi',
        completed: 'Tamamlandi',
        cancelled: 'Iptal Edildi',
      };

      return {
        ...c,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        clickToOpenRate: Math.round(clickToOpenRate * 100) / 100,
        bounceRate: Math.round(bounceRate * 100) / 100,
        deliveredCount,
        performance,
        statusLabel: statusLabels[c.status] || c.status,
      };
    });

    // Ozet istatistikler
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter((c) => ['sent', 'completed'].includes(c.status));
    const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
    const totalOpens = campaigns.reduce((s, c) => s + c.openCount, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clickCount, 0);
    const totalBounces = campaigns.reduce((s, c) => s + c.bounceCount, 0);
    const draftCount = campaigns.filter((c) => c.status === 'draft').length;
    const scheduledCount = campaigns.filter((c) => c.status === 'scheduled').length;

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
    const avgBounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;

    const summary = {
      toplamKampanya: totalCampaigns,
      taslakSayisi: draftCount,
      planlanmisSayisi: scheduledCount,
      gonderilenSayisi: sentCampaigns.length,
      toplamGonderim: totalSent,
      toplamAcilma: totalOpens,
      toplamTiklama: totalClicks,
      toplamSıkmama: totalBounces,
      ortalamaAcilmaOrani: Math.round(avgOpenRate * 100) / 100,
      ortalamaTiklamaOrani: Math.round(avgClickRate * 100) / 100,
      ortalamaSikmamaOrani: Math.round(avgBounceRate * 100) / 100,
    };

    return NextResponse.json({ summary, campaigns: enriched });
  } catch {
    return NextResponse.json(
      { error: 'E-posta kampanyalari yuklenemedi' },
      { status: 500 }
    );
  }
}

// E-posta kampanya islemleri: create, update, send, schedule, delete
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
        const { name, subject, body: campaignBody, segment } = body;

        if (!name || !name.trim()) {
          return NextResponse.json(
            { error: 'Kampanya adi zorunludur' },
            { status: 400 }
          );
        }

        if (!subject || !subject.trim()) {
          return NextResponse.json(
            { error: 'E-posta konusu zorunludur' },
            { status: 400 }
          );
        }

        const validSegments = ['all', 'new', 'returning', 'vip', 'inactive', 'custom'];
        const usedSegment = segment || 'all';
        if (!validSegments.includes(usedSegment)) {
          return NextResponse.json(
            { error: `Gecersiz segment. Gecerli degerler: ${validSegments.join(', ')}` },
            { status: 400 }
          );
        }

        const campaign = await db.emailCampaign.create({
          data: {
            name: name.trim(),
            subject: subject.trim(),
            body: campaignBody || '',
            segment: usedSegment,
            status: 'draft',
          },
        });

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

        const existing = await db.emailCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'E-posta kampanyasi bulunamadi' },
            { status: 404 }
          );
        }

        if (['sent', 'sending', 'completed'].includes(existing.status)) {
          return NextResponse.json(
            { error: 'Gonderilmis veya tamamlanmis kampanyalar guncellenemez' },
            { status: 400 }
          );
        }

        const updateData: Record<string, unknown> = {};
        const allowedFields = ['name', 'subject', 'body', 'segment', 'status'];

        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            if (field === 'name' || field === 'subject') {
              updateData[field] = String(fields[field]).trim();
            } else {
              updateData[field] = fields[field];
            }
          }
        }

        const updated = await db.emailCampaign.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'E-posta kampanyasi basariyla guncellendi',
          campaign: updated,
        });
      }

      // ── Kampanyayi gonder ──
      case 'send': {
        const { id, sentCount, openCount, clickCount, bounceCount } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Kampanya ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.emailCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'E-posta kampanyasi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status === 'completed') {
          return NextResponse.json(
            { error: 'Kampanya zaten tamamlanmis' },
            { status: 400 }
          );
        }

        const updated = await db.emailCampaign.update({
          where: { id },
          data: {
            status: 'sent',
            sentCount: sentCount || existing.sentCount,
            openCount: openCount || existing.openCount,
            clickCount: clickCount || existing.clickCount,
            bounceCount: bounceCount || existing.bounceCount,
            sentAt: new Date(),
          },
        });

        const openRate = updated.sentCount > 0 ? (updated.openCount / updated.sentCount) * 100 : 0;
        const clickRate = updated.sentCount > 0 ? (updated.clickCount / updated.sentCount) * 100 : 0;

        return NextResponse.json({
          message: `E-posta kampanyasi "${updated.name}" basariyla gonderildi`,
          campaign: updated,
          metrikler: {
            acilmaOrani: Math.round(openRate * 100) / 100,
            tiklamaOrani: Math.round(clickRate * 100) / 100,
          },
        });
      }

      // ── Kampanya planla ──
      case 'schedule': {
        const { id, scheduledAt } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Kampanya ID zorunludur' },
            { status: 400 }
          );
        }

        if (!scheduledAt) {
          return NextResponse.json(
            { error: 'Planlanan gonderim tarihi zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.emailCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'E-posta kampanyasi bulunamadi' },
            { status: 404 }
          );
        }

        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
          return NextResponse.json(
            { error: 'Gecerli bir tarih/zaman formati giriniz' },
            { status: 400 }
          );
        }

        if (scheduledDate <= new Date()) {
          return NextResponse.json(
            { error: 'Planlanan tarih gelecekte bir tarih olmali' },
            { status: 400 }
          );
        }

        const updated = await db.emailCampaign.update({
          where: { id },
          data: { status: 'scheduled', scheduledAt: scheduledDate },
        });

        return NextResponse.json({
          message: `E-posta kampanyasi "${updated.name}" planlandi`,
          campaign: updated,
          planlananTarih: scheduledDate.toISOString(),
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

        const existing = await db.emailCampaign.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'E-posta kampanyasi bulunamadi' },
            { status: 404 }
          );
        }

        if (['sent', 'sending'].includes(existing.status)) {
          return NextResponse.json(
            { error: 'Gonderilmekte olan kampanya silinemez' },
            { status: 400 }
          );
        }

        await db.emailCampaign.delete({ where: { id } });

        return NextResponse.json({
          message: 'E-posta kampanyasi basariyla silindi',
          deletedId: id,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, send, schedule, delete` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('E-posta kampanya API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
