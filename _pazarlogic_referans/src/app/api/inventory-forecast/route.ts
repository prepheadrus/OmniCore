import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Envanter tahminlerini listeleme + kritik stok sirasi + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trend = searchParams.get('trend');
    const period = searchParams.get('period');

    const where: Record<string, unknown> = {};
    if (trend) where.trend = trend;
    if (period) where.period = period;

    const forecasts = await db.inventoryForecast.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { daysOfStock: 'asc' },
    });

    // Her tahmin icin ek bilgiler hesapla
    const enriched = forecasts.map((f) => {
      const stockLevel =
        f.daysOfStock <= 7
          ? 'kritik'
          : f.daysOfStock <= 14
            ? 'dusuk'
            : f.daysOfStock <= 30
              ? 'normal'
              : 'iyi';

      const needsReorder = f.currentStock <= f.reorderPoint;

      const trendLabels: Record<string, string> = {
        rising: 'Yukseliyor',
        falling: ' Dusuyor',
        stable: 'Kararli',
        seasonal: 'Mevsimsel',
      };

      return {
        ...f,
        forecastDataParsed: JSON.parse(f.forecastData || '[]'),
        stockLevel,
        needsReorder,
        trendLabel: trendLabels[f.trend] || f.trend,
        weeklySales: Math.round(f.dailySales * 7 * 100) / 100,
        monthlySales: Math.round(f.dailySales * 30 * 100) / 100,
      };
    });

    // Ozet istatistikler
    const totalProducts = forecasts.length;
    const criticalStock = forecasts.filter((f) => f.daysOfStock <= 7).length;
    const lowStock = forecasts.filter((f) => f.daysOfStock <= 14).length;
    const totalSuggestedOrder = forecasts.reduce((s, f) => s + f.suggestedOrder, 0);
    const avgDailySales =
      totalProducts > 0
        ? forecasts.reduce((s, f) => s + f.dailySales, 0) / totalProducts
        : 0;
    const avgConfidence =
      totalProducts > 0
        ? forecasts.reduce((s, f) => s + f.confidence, 0) / totalProducts
        : 0;
    const risingTrend = forecasts.filter((f) => f.trend === 'rising').length;
    const fallingTrend = forecasts.filter((f) => f.trend === 'falling').length;

    const summary = {
      toplamUrun: totalProducts,
      kritikStok: criticalStock,
      dusukStok: lowStock,
      toplamOnerilenSiparis: totalSuggestedOrder,
      ortalamaGunlukSatis: Math.round(avgDailySales * 100) / 100,
      ortalamaGuvendirme: Math.round(avgConfidence * 100) / 100,
      yukselisEgilimi: risingTrend,
      dususEgilimi: fallingTrend,
    };

    return NextResponse.json({ summary, forecasts: enriched });
  } catch {
    return NextResponse.json(
      { error: 'Envanter tahminleri yuklenemedi' },
      { status: 500 }
    );
  }
}

// Envanter tahmin islemleri: create, generate, bulk-generate
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
      // ── Yeni tahmin olustur ──
      case 'create': {
        const {
          productId,
          productName,
          sku,
          currentStock,
          dailySales,
          daysOfStock,
          reorderPoint,
          suggestedOrder,
          trend,
          confidence,
          period,
          forecastData,
        } = body;

        if (!productId || !productName) {
          return NextResponse.json(
            { error: 'Urun ID ve urun adi zorunludur' },
            { status: 400 }
          );
        }

        const validTrends = ['rising', 'falling', 'stable', 'seasonal'];
        const usedTrend = trend || 'stable';
        if (!validTrends.includes(usedTrend)) {
          return NextResponse.json(
            { error: `Gecersiz egilim. Gecerli degerler: ${validTrends.join(', ')}` },
            { status: 400 }
          );
        }

        const forecast = await db.inventoryForecast.create({
          data: {
            productId,
            productName: productName.trim(),
            sku: sku || '',
            currentStock: currentStock || 0,
            dailySales: dailySales || 0,
            daysOfStock: daysOfStock || 0,
            reorderPoint: reorderPoint || 0,
            suggestedOrder: suggestedOrder || 0,
            trend: usedTrend,
            confidence: confidence ?? 0,
            period: period || '30d',
            forecastData: forecastData ? JSON.stringify(forecastData) : '[]',
          },
        });

        return NextResponse.json(forecast, { status: 201 });
      }

      // ── Tek bir urun icin tahmin olustur (simule edilmis satis verisi) ──
      case 'generate': {
        const { productId } = body;

        if (!productId) {
          return NextResponse.json(
            { error: 'Urun ID zorunludur' },
            { status: 400 }
          );
        }

        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) {
          return NextResponse.json(
            { error: 'Urun bulunamadi' },
            { status: 404 }
          );
        }

        // Simule edilmis satis verisi ile tahmin olustur
        const currentStock = product.stock;
        const baseDailySales = Math.max(0.5, Math.round(Math.random() * 10 * 10) / 10);
        const trendFactor = 1 + (Math.random() - 0.4) * 0.3;
        const dailySales = Math.round(baseDailySales * trendFactor * 100) / 100;
        const daysOfStock = dailySales > 0 ? Math.floor(currentStock / dailySales) : 999;
        const reorderPoint = Math.ceil(dailySales * 14);
        const suggestedOrder = Math.max(0, reorderPoint * 2 - currentStock);

        const trendOptions = ['rising', 'falling', 'stable', 'seasonal'];
        const trendWeights = [0.25, 0.2, 0.4, 0.15];
        const rand = Math.random();
        let cumulative = 0;
        let trend = 'stable';
        for (let i = 0; i < trendOptions.length; i++) {
          cumulative += trendWeights[i];
          if (rand <= cumulative) {
            trend = trendOptions[i];
            break;
          }
        }

        const confidence = Math.round((50 + Math.random() * 45) * 100) / 100;

        // 30 gunluk tahmin verisi olustur
        const forecastData: { gun: number; tarih: string; tahminiSatis: number; tahminiStok: number }[] = [];
        for (let day = 1; day <= 30; day++) {
          let projectedSales = dailySales;
          if (trend === 'rising') projectedSales *= 1 + (day / 30) * 0.3;
          else if (trend === 'falling') projectedSales *= 1 - (day / 30) * 0.2;
          else if (trend === 'seasonal') projectedSales *= 1 + Math.sin(day / 5) * 0.4;

          forecastData.push({
            gun: day,
            tarih: new Date(Date.now() + day * 86400000).toISOString().split('T')[0],
            tahminiSatis: Math.round(Math.max(0, projectedSales) * 100) / 100,
            tahminiStok: Math.round(Math.max(0, currentStock - projectedSales * day) * 100) / 100,
          });
        }

        const existing = await db.inventoryForecast.findFirst({
          where: { productId },
        });

        if (existing) {
          const updated = await db.inventoryForecast.update({
            where: { id: existing.id },
            data: {
              productName: product.name,
              sku: product.sku,
              currentStock,
              dailySales,
              daysOfStock,
              reorderPoint,
              suggestedOrder,
              trend,
              confidence,
              forecastData: JSON.stringify(forecastData),
            },
          });

          return NextResponse.json({
            message: 'Envanter tahmini basariyla guncellendi',
            forecast: updated,
          });
        }

        const forecast = await db.inventoryForecast.create({
          data: {
            productId,
            productName: product.name,
            sku: product.sku,
            currentStock,
            dailySales,
            daysOfStock,
            reorderPoint,
            suggestedOrder,
            trend,
            confidence,
            period: '30d',
            forecastData: JSON.stringify(forecastData),
          },
        });

        return NextResponse.json({
          message: 'Envanter tahmini basariyla olusturuldu',
          forecast,
        });
      }

      // ── Tum urunler icin tahmin olustur ──
      case 'bulk-generate': {
        const products = await db.product.findMany({
          where: { isActive: true },
        });

        if (products.length === 0) {
          return NextResponse.json(
            { error: 'Aktif urun bulunamadi' },
            { status: 404 }
          );
        }

        const results: { productId: string; productName: string; durum: string; gunlukSatis?: number; stokGun?: number }[] = [];
        let createdCount = 0;
        let updatedCount = 0;

        for (const product of products) {
          try {
            const currentStock = product.stock;
            const baseDailySales = Math.max(0.5, Math.round(Math.random() * 10 * 10) / 10);
            const trendFactor = 1 + (Math.random() - 0.4) * 0.3;
            const dailySales = Math.round(baseDailySales * trendFactor * 100) / 100;
            const daysOfStock = dailySales > 0 ? Math.floor(currentStock / dailySales) : 999;
            const reorderPoint = Math.ceil(dailySales * 14);
            const suggestedOrder = Math.max(0, reorderPoint * 2 - currentStock);

            const trendOptions = ['rising', 'falling', 'stable', 'seasonal'];
            const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
            const confidence = Math.round((50 + Math.random() * 45) * 100) / 100;

            const forecastData: { gun: number; tahminiSatis: number }[] = [];
            for (let day = 1; day <= 30; day++) {
              let projectedSales = dailySales;
              if (trend === 'rising') projectedSales *= 1 + (day / 30) * 0.3;
              else if (trend === 'falling') projectedSales *= 1 - (day / 30) * 0.2;
              forecastData.push({
                gun: day,
                tahminiSatis: Math.round(Math.max(0, projectedSales) * 100) / 100,
              });
            }

            const existing = await db.inventoryForecast.findFirst({
              where: { productId: product.id },
            });

            if (existing) {
              await db.inventoryForecast.update({
                where: { id: existing.id },
                data: {
                  productName: product.name,
                  sku: product.sku,
                  currentStock,
                  dailySales,
                  daysOfStock,
                  reorderPoint,
                  suggestedOrder,
                  trend,
                  confidence,
                  forecastData: JSON.stringify(forecastData),
                },
              });
              updatedCount++;
            } else {
              await db.inventoryForecast.create({
                data: {
                  productId: product.id,
                  productName: product.name,
                  sku: product.sku,
                  currentStock,
                  dailySales,
                  daysOfStock,
                  reorderPoint,
                  suggestedOrder,
                  trend,
                  confidence,
                  period: '30d',
                  forecastData: JSON.stringify(forecastData),
                },
              });
              createdCount++;
            }

            results.push({
              productId: product.id,
              productName: product.name,
              durum: existing ? 'guncellendi' : 'olusturuldu',
              gunlukSatis: dailySales,
              stokGun: daysOfStock,
            });
          } catch {
            results.push({
              productId: product.id,
              productName: product.name,
              durum: 'hata',
            });
          }
        }

        return NextResponse.json({
          message: `Toplu envanter tahmini tamamlandi`,
          ozet: {
            toplamUrun: products.length,
            olusturulan: createdCount,
            guncellenen: updatedCount,
          },
          sonuclar: results,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, generate, bulk-generate` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Envanter tahmin API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
