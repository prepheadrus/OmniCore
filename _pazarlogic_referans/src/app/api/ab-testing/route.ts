import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// A/B testlerini listeleme + durum filtresi + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const marketplace = searchParams.get('marketplace');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (marketplace) where.marketplace = marketplace;

    const tests = await db.abTest.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Her test icin hesaplanan bilgileri ekle
    const enriched = tests.map((t) => {
      const variantAParsed = JSON.parse(t.variantA || '{}');
      const variantBParsed = JSON.parse(t.variantB || '{}');

      const convRateA = t.impressionsA > 0 ? (t.conversionsA / t.impressionsA) * 100 : 0;
      const convRateB = t.impressionsB > 0 ? (t.conversionsB / t.impressionsB) * 100 : 0;
      const ctrA = t.impressionsA > 0 ? (t.clicksA / t.impressionsA) * 100 : 0;
      const ctrB = t.impressionsB > 0 ? (t.clicksB / t.impressionsB) * 100 : 0;

      const totalImpressions = t.impressionsA + t.impressionsB;
      const totalClicks = t.clicksA + t.clicksB;
      const totalConversions = t.conversionsA + t.conversionsB;

      const isRunning = t.status === 'running';
      const duration = t.startDate
        ? Math.ceil((Date.now() - new Date(t.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const statusLabels: Record<string, string> = {
        draft: 'Taslak',
        running: 'Devam Ediyor',
        paused: 'Duraklatildi',
        completed: 'Tamamlandi',
        stopped: 'Durduruldu',
      };

      return {
        ...t,
        variantAParsed,
        variantBParsed,
        convRateA: Math.round(convRateA * 100) / 100,
        convRateB: Math.round(convRateB * 100) / 100,
        ctrA: Math.round(ctrA * 100) / 100,
        ctrB: Math.round(ctrB * 100) / 100,
        totalImpressions,
        totalClicks,
        totalConversions,
        isRunning,
        durationDays: duration,
        statusLabel: statusLabels[t.status] || t.status,
      };
    });

    // Ozet istatistikler
    const totalTests = tests.length;
    const runningTests = tests.filter((t) => t.status === 'running').length;
    const completedTests = tests.filter((t) => ['completed', 'stopped'].includes(t.status)).length;
    const totalImpressions = tests.reduce((s, t) => s + t.impressionsA + t.impressionsB, 0);
    const totalClicks = tests.reduce((s, t) => s + t.clicksA + t.clicksB, 0);
    const totalConversions = tests.reduce((s, t) => s + t.conversionsA + t.conversionsB, 0);
    const testsWithWinner = tests.filter((t) => t.winner).length;

    const summary = {
      toplamTest: totalTests,
      devamEden: runningTests,
      tamamlanan: completedTests,
      toplamGoruntulenme: totalImpressions,
      toplamTiklama: totalClicks,
      toplamDonusum: totalConversions,
      kazananBelirlenen: testsWithWinner,
    };

    return NextResponse.json({ summary, tests: enriched });
  } catch {
    return NextResponse.json(
      { error: 'A/B testleri yuklenemedi' },
      { status: 500 }
    );
  }
}

// A/B test islemleri: create, update, record-result, calculate-winner, stop
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
      // ── Yeni A/B testi olustur ──
      case 'create': {
        const {
          name,
          description,
          type,
          marketplace,
          variantA,
          variantB,
          metric,
        } = body;

        if (!name || !name.trim()) {
          return NextResponse.json(
            { error: 'Test adi zorunludur' },
            { status: 400 }
          );
        }

        if (!variantA || !variantB) {
          return NextResponse.json(
            { error: 'Hem A hem B varyantlari zorunludur' },
            { status: 400 }
          );
        }

        const validTypes = ['feed', 'price', 'title', 'image', 'description', 'shipping'];
        const usedType = type || 'feed';
        if (!validTypes.includes(usedType)) {
          return NextResponse.json(
            { error: `Gecersiz test turu. Gecerli degerler: ${validTypes.join(', ')}` },
            { status: 400 }
          );
        }

        const validMetrics = ['conversion', 'click', 'revenue', 'engagement'];
        const usedMetric = metric || 'conversion';
        if (!validMetrics.includes(usedMetric)) {
          return NextResponse.json(
            { error: `Gecersiz metrik. Gecerli degerler: ${validMetrics.join(', ')}` },
            { status: 400 }
          );
        }

        const test = await db.abTest.create({
          data: {
            name: name.trim(),
            description: description || '',
            type: usedType,
            marketplace: marketplace || '',
            variantA: JSON.stringify(variantA),
            variantB: JSON.stringify(variantB),
            metric: usedMetric,
            status: 'running',
            startDate: new Date(),
          },
        });

        return NextResponse.json(test, { status: 201 });
      }

      // ── Test guncelle ──
      case 'update': {
        const { id, ...fields } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Test ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.abTest.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'A/B testi bulunamadi' },
            { status: 404 }
          );
        }

        if (['completed', 'stopped'].includes(existing.status)) {
          return NextResponse.json(
            { error: 'Tamamlanmis veya durdurulmus testler guncellenemez' },
            { status: 400 }
          );
        }

        const updateData: Record<string, unknown> = {};
        const allowedFields = ['name', 'description', 'type', 'marketplace', 'variantA', 'variantB', 'metric'];

        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            if (field === 'name') {
              updateData[field] = String(fields[field]).trim();
            } else if (field === 'variantA' || field === 'variantB') {
              updateData[field] = JSON.stringify(fields[field]);
            } else {
              updateData[field] = fields[field];
            }
          }
        }

        const updated = await db.abTest.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'A/B testi basariyla guncellendi',
          test: updated,
        });
      }

      // ── Test sonucu kaydet ──
      case 'record-result': {
        const { id, variant, type: resultType, value } = body;

        if (!id || !variant || !resultType) {
          return NextResponse.json(
            { error: 'Test ID, varyant (A/B) ve sonuc turu zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.abTest.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'A/B testi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status !== 'running') {
          return NextResponse.json(
            { error: 'Sadece devam eden testlere sonuc kaydedilebilir' },
            { status: 400 }
          );
        }

        if (!['A', 'B'].includes(variant)) {
          return NextResponse.json(
            { error: 'Varyant "A" veya "B" olmalidir' },
            { status: 400 }
          );
        }

        const updateData: Record<string, unknown> = {};

        if (resultType === 'impression') {
          if (variant === 'A') updateData.impressionsA = existing.impressionsA + (value || 1);
          else updateData.impressionsB = existing.impressionsB + (value || 1);
        } else if (resultType === 'click') {
          if (variant === 'A') {
            updateData.impressionsA = existing.impressionsA + (value || 1);
            updateData.clicksA = existing.clicksA + 1;
          } else {
            updateData.impressionsB = existing.impressionsB + (value || 1);
            updateData.clicksB = existing.clicksB + 1;
          }
        } else if (resultType === 'conversion') {
          if (variant === 'A') {
            updateData.impressionsA = existing.impressionsA + (value || 1);
            updateData.clicksA = existing.clicksA + 1;
            updateData.conversionsA = existing.conversionsA + 1;
          } else {
            updateData.impressionsB = existing.impressionsB + (value || 1);
            updateData.clicksB = existing.clicksB + 1;
            updateData.conversionsB = existing.conversionsB + 1;
          }
        } else {
          return NextResponse.json(
            { error: `Gecersiz sonuc turu: "${resultType}". Gecerli degerler: impression, click, conversion` },
            { status: 400 }
          );
        }

        const updated = await db.abTest.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: `Varyant ${variant} icin sonuc kaydedildi`,
          test: updated,
        });
      }

      // ── Kazanan hesapla (istatistiksel anlamlilik) ──
      case 'calculate-winner': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Test ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.abTest.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'A/B testi bulunamadi' },
            { status: 404 }
          );
        }

        // Minimum veri kontrolu
        if (existing.impressionsA < 30 || existing.impressionsB < 30) {
          return NextResponse.json(
            { error: 'Yeterli veri yok. Her varyant icin en az 30 goruntulenme gerekli' },
            { status: 400 }
          );
        }

        const convRateA = existing.conversionsA / existing.impressionsA;
        const convRateB = existing.conversionsB / existing.impressionsB;

        // Basit Z-skoru hesaplama (iki oranti karsilastirmasi)
        const pooledRate =
          (existing.conversionsA + existing.conversionsB) /
          (existing.impressionsA + existing.impressionsB);
        const se = Math.sqrt(
          pooledRate * (1 - pooledRate) *
          (1 / existing.impressionsA + 1 / existing.impressionsB)
        );
        const zScore = se > 0 ? Math.abs(convRateB - convRateA) / se : 0;

        // Guven araligi (yaklasik Z-tablosu)
        let confidence = 0;
        if (zScore >= 2.576) confidence = 99;
        else if (zScore >= 2.326) confidence = 98;
        else if (zScore >= 1.96) confidence = 95;
        else if (zScore >= 1.645) confidence = 90;
        else if (zScore >= 1.282) confidence = 80;
        else confidence = Math.round(Math.min(79, zScore / 1.96 * 95));

        const winner =
          confidence >= 90
            ? convRateB > convRateA
              ? 'B'
              : convRateA > convRateB
                ? 'A'
                : ''
            : '';

        const isSignificant = confidence >= 95;

        const updated = await db.abTest.update({
          where: { id },
          data: {
            winner,
            confidence,
          },
        });

        return NextResponse.json({
          message: isSignificant
            ? `Istatistiksel olarak anlamlı bir sonuc bulundu: Kazanan = Varyant ${winner}`
            : 'Istatistiksel anlamlilik icin yeterli veri yok, teste devam edin',
          test: updated,
          analiz: {
            donusumOraniA: Math.round(convRateA * 10000) / 100,
            donusumOraniB: Math.round(convRateB * 10000) / 100,
            zSkoru: Math.round(zScore * 100) / 100,
            guvenAraligi: confidence,
            anlamlimi: isSignificant,
            kazanan: winner || 'Belirsiz',
            varyantAFark: convRateA > convRateB
              ? `Varyant A %${Math.round(Math.abs(convRateA - convRateB) * 10000) / 100} daha iyi`
              : '',
            varyantBFark: convRateB > convRateA
              ? `Varyant B %${Math.round(Math.abs(convRateB - convRateA) * 10000) / 100} daha iyi`
              : '',
          },
        });
      }

      // ── Testi durdur ──
      case 'stop': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Test ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.abTest.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'A/B testi bulunamadi' },
            { status: 404 }
          );
        }

        if (existing.status !== 'running') {
          return NextResponse.json(
            { error: 'Sadece devam eden testler durdurulabilir' },
            { status: 400 }
          );
        }

        const updated = await db.abTest.update({
          where: { id },
          data: { status: 'stopped', endDate: new Date() },
        });

        return NextResponse.json({
          message: `A/B testi "${updated.name}" basariyla durduruldu`,
          test: updated,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, record-result, calculate-winner, stop` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('A/B test API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
