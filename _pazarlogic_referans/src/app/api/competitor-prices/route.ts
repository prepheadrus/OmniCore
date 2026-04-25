import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ───────────────────────────────────────────────
// GET – List competitor prices with filters & summary
// ───────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const marketplace = searchParams.get('marketplace') || undefined;
    const competitor = searchParams.get('competitor') || undefined;
    const sku = searchParams.get('sku') || undefined;
    const sortBy = searchParams.get('sortBy') || 'lastChecked';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const validSortFields = [
      'price', 'ourPrice', 'priceDiff', 'priceDiffPct',
      'rating', 'reviewCount', 'lastChecked', 'createdAt', 'competitor', 'marketplace',
    ] as const;

    const orderField: Record<string, string> = {};
    if (validSortFields.includes(sortBy as (typeof validSortFields)[number])) {
      (orderField as Record<string, string>)[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderField.lastChecked = 'desc';
    }

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (marketplace) where.marketplace = marketplace;
    if (competitor) where.competitor = competitor;
    if (sku) where.sku = sku;

    const [competitorPrices, totalCount, aggregates] = await Promise.all([
      db.competitorPrice.findMany({
        where,
        orderBy: orderField,
      }),
      db.competitorPrice.count({ where }),
      db.competitorPrice.aggregate({
        where,
        _avg: { price: true, ourPrice: true, priceDiff: true, priceDiffPct: true, rating: true },
        _min: { price: true, priceDiff: true, priceDiffPct: true },
        _max: { price: true, priceDiff: true, priceDiffPct: true },
      }),
    ]);

    const cheapestEntry = competitorPrices.length
      ? competitorPrices.reduce((a, b) => (a.price < b.price ? a : b))
      : null;

    const mostExpensiveEntry = competitorPrices.length
      ? competitorPrices.reduce((a, b) => (a.price > b.price ? a : b))
      : null;

    const avgOurPrice = aggregates._avg.ourPrice ?? 0;
    const avgCompetitorPrice = aggregates._avg.price ?? 0;

    // Our position in market
    let marketPosition = 'bilinmiyor';
    if (competitorPrices.length > 0 && avgOurPrice > 0) {
      const cheaperCount = competitorPrices.filter((c) => c.price < avgOurPrice).length;
      const ratio = cheaperCount / competitorPrices.length;
      if (ratio === 0) marketPosition = 'en_ucuz';
      else if (ratio <= 0.25) marketPosition = 'ucuz_segment';
      else if (ratio <= 0.5) marketPosition = 'orta_alt';
      else if (ratio <= 0.75) marketPosition = 'orta_ust';
      else if (ratio < 1) marketPosition = 'pahali_segment';
      else marketPosition = 'en_pahali';
    }

    return NextResponse.json({
      data: competitorPrices,
      total: totalCount,
      summary: {
        avgCompetitorPrice: Math.round((avgCompetitorPrice + Number.EPSILON) * 100) / 100,
        avgOurPrice: Math.round((avgOurPrice + Number.EPSILON) * 100) / 100,
        avgPriceDiff: Math.round(((aggregates._avg.priceDiff ?? 0) + Number.EPSILON) * 100) / 100,
        avgPriceDiffPct: Math.round(((aggregates._avg.priceDiffPct ?? 0) + Number.EPSILON) * 100) / 100,
        minPrice: aggregates._min.price ?? 0,
        maxPrice: aggregates._max.price ?? 0,
        cheapest: cheapestEntry
          ? { id: cheapestEntry.id, competitor: cheapestEntry.competitor, price: cheapestEntry.price }
          : null,
        mostExpensive: mostExpensiveEntry
          ? { id: mostExpensiveEntry.id, competitor: mostExpensiveEntry.competitor, price: mostExpensiveEntry.price }
          : null,
        marketPosition,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Rakip fiyatları yüklenemedi' }, { status: 500 });
  }
}

// ───────────────────────────────────────────────
// POST – Actions: add | update | delete | bulk-add | analysis | simulate-pricing
// ───────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ── 1. ADD ──
    if (action === 'add') {
      const {
        productId, productName, sku, competitor, marketplace,
        price, ourPrice, stockStatus, rating, reviewCount, url,
      } = body;

      if (!competitor || price == null || ourPrice == null) {
        return NextResponse.json(
          { error: 'competitor, price ve ourPrice alanları zorunludur' },
          { status: 400 },
        );
      }

      const priceDiff = price - ourPrice;
      const priceDiffPct = ourPrice !== 0 ? ((price - ourPrice) / ourPrice) * 100 : 0;

      const entry = await db.competitorPrice.create({
        data: {
          productId: productId || '',
          productName: productName || '',
          sku: sku || '',
          competitor,
          marketplace: marketplace || '',
          price,
          ourPrice,
          priceDiff: Math.round((priceDiff + Number.EPSILON) * 100) / 100,
          priceDiffPct: Math.round((priceDiffPct + Number.EPSILON) * 100) / 100,
          stockStatus: stockStatus || '',
          rating: rating || 0,
          reviewCount: reviewCount || 0,
          url: url || '',
          lastChecked: new Date(),
        },
      });

      return NextResponse.json({ success: true, data: entry });
    }

    // ── 2. UPDATE ──
    if (action === 'update') {
      const { id, ...fields } = body;
      if (!id) {
        return NextResponse.json({ error: 'id alanı zorunludur' }, { status: 400 });
      }

      // If price or ourPrice changed, recalculate diff fields
      if (fields.price != null || fields.ourPrice != null) {
        const existing = await db.competitorPrice.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
        }
        const newPrice = fields.price ?? existing.price;
        const newOurPrice = fields.ourPrice ?? existing.ourPrice;
        fields.priceDiff = Math.round(((newPrice - newOurPrice) + Number.EPSILON) * 100) / 100;
        fields.priceDiffPct = newOurPrice !== 0
          ? Math.round((((newPrice - newOurPrice) / newOurPrice) * 100 + Number.EPSILON) * 100) / 100
          : 0;
      }

      // Clean fields
      const updateData: Record<string, unknown> = { ...fields };
      delete updateData.id;
      delete updateData.action;
      updateData.lastChecked = new Date();

      const updated = await db.competitorPrice.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // ── 3. DELETE ──
    if (action === 'delete') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'id alanı zorunludur' }, { status: 400 });
      }

      await db.competitorPrice.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    // ── 4. BULK-ADD ──
    if (action === 'bulk-add') {
      const { items } = body;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'items (dizi) zorunludur ve boş olamaz' }, { status: 400 });
      }

      const created: unknown[] = [];
      for (const item of items) {
        if (item.price == null || item.ourPrice == null || !item.competitor) continue;

        const priceDiff = item.price - item.ourPrice;
        const priceDiffPct = item.ourPrice !== 0 ? ((item.price - item.ourPrice) / item.ourPrice) * 100 : 0;

        const entry = await db.competitorPrice.create({
          data: {
            productId: item.productId || '',
            productName: item.productName || '',
            sku: item.sku || '',
            competitor: item.competitor,
            marketplace: item.marketplace || '',
            price: item.price,
            ourPrice: item.ourPrice,
            priceDiff: Math.round((priceDiff + Number.EPSILON) * 100) / 100,
            priceDiffPct: Math.round((priceDiffPct + Number.EPSILON) * 100) / 100,
            stockStatus: item.stockStatus || '',
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            url: item.url || '',
            lastChecked: new Date(),
          },
        });
        created.push(entry);
      }

      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    // ── 5. ANALYSIS ──
    if (action === 'analysis') {
      const { productId, sku } = body;
      if (!productId && !sku) {
        return NextResponse.json({ error: 'productId veya sku zorunludur' }, { status: 400 });
      }

      const where: Record<string, unknown> = {};
      if (productId) where.productId = productId;
      if (sku) where.sku = sku;

      const entries = await db.competitorPrice.findMany({
        where,
        orderBy: { price: 'asc' },
      });

      if (entries.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Bu ürün için rakip fiyat kaydı bulunamadı',
          data: null,
        });
      }

      const ourPrice = entries[0]?.ourPrice ?? 0;
      const prices = entries.map((e) => e.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const medianPrice = prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

      // Price comparison chart data
      const chartData = entries.map((e) => ({
        competitor: e.competitor,
        marketplace: e.marketplace,
        price: e.price,
        ourPrice: e.ourPrice,
        priceDiff: e.priceDiff,
        priceDiffPct: e.priceDiffPct,
        rating: e.rating,
        reviewCount: e.reviewCount,
        stockStatus: e.stockStatus,
      }));

      // Distribution buckets
      const buckets: { range: string; count: number; competitors: string[] }[] = [];
      const bucketRanges = [
        { label: '%20+ pahalı', min: avgPrice * 1.2 },
        { label: '%5-20 pahalı', min: avgPrice * 1.05, max: avgPrice * 1.2 },
        { label: '%5 arası', min: avgPrice * 0.95, max: avgPrice * 1.05 },
        { label: '%5-20 ucuz', min: avgPrice * 0.8, max: avgPrice * 0.95 },
        { label: '%20+ ucuz', max: avgPrice * 0.8 },
      ];

      for (const bucket of bucketRanges) {
        const inBucket = entries.filter((e) => {
          if (bucket.min !== undefined && bucket.max !== undefined) return e.price >= bucket.min && e.price < bucket.max;
          if (bucket.min !== undefined) return e.price >= bucket.min;
          if (bucket.max !== undefined) return e.price < bucket.max;
          return false;
        });
        buckets.push({
          range: bucket.label,
          count: inBucket.length,
          competitors: inBucket.map((e) => e.competitor),
        });
      }

      // Our position
      const cheaperThan = entries.filter((e) => e.price > ourPrice).length;
      const positionRatio = ourPrice > 0 ? cheaperThan / entries.length : 0;

      // Recommendations
      const recommendations: string[] = [];
      if (ourPrice > maxPrice) {
        recommendations.push('Fiyatınız pazarın en yükseğinde. Satış kaybı yaşama ihtimaliniz var, indirim düşünün.');
      } else if (ourPrice >= avgPrice * 1.1) {
        recommendations.push('Fiyatınız ortalamanın üstünde. Rekabet avantajı için küçük bir indirim etkili olabilir.');
      } else if (ourPrice <= avgPrice * 0.9 && ourPrice < minPrice) {
        recommendations.push('Fiyatınız pazarın en düşüğünde. Kar marjınızı kontrol edin.');
      } else if (ourPrice >= minPrice && ourPrice <= avgPrice * 0.95) {
        recommendations.push('Fiyatınız rekabetçi bir seviyede. İyi bir konumdasınız.');
      } else {
        recommendations.push('Fiyatınız piyasa ortalamasına yakın. Dikkatli optimizasyon ile daha iyi konum elde edebilirsiniz.');
      }

      if (entries.filter((e) => e.stockStatus === 'out_of_stock').length > entries.length * 0.5) {
        recommendations.push('Rakiplerinizin büyük çoğunluğu stok dışı. Bu fırsatı değerlendirerek fiyat artırımı yapabilirsiniz.');
      }

      const topRated = entries.filter((e) => e.rating > 0).sort((a, b) => b.rating - a.rating)[0];
      if (topRated && topRated.rating > 4.0 && topRated.price < ourPrice) {
        recommendations.push(`${topRated.competitor} yüksek puanlı ve ucuz rakip olarak öne çıkıyor. Dikkat edin.`);
      }

      return NextResponse.json({
        success: true,
        data: {
          productName: entries[0]?.productName || '',
          sku: entries[0]?.sku || '',
          productId: entries[0]?.productId || '',
          ourPrice,
          avgCompetitorPrice: Math.round((avgPrice + Number.EPSILON) * 100) / 100,
          minPrice,
          maxPrice,
          medianPrice: Math.round((medianPrice + Number.EPSILON) * 100) / 100,
          totalCompetitors: entries.length,
          cheaperThanUs: entries.filter((e) => e.price < ourPrice).length,
          moreExpensiveThanUs: entries.filter((e) => e.price > ourPrice).length,
          samePriceRange: entries.filter((e) => Math.abs(e.price - ourPrice) / ourPrice < 0.05).length,
          marketPosition: positionRatio >= 0.75 ? 'ucuz_segment'
            : positionRatio >= 0.5 ? 'orta_alt'
            : positionRatio >= 0.25 ? 'orta_ust'
            : 'pahali_segment',
          priceDistribution: buckets,
          chartData,
          recommendations,
          topRated: topRated ? { competitor: topRated.competitor, rating: topRated.rating, price: topRated.price } : null,
          cheapest: entries[0] ? { competitor: entries[0].competitor, price: entries[0].price, marketplace: entries[0].marketplace } : null,
          mostExpensive: entries[entries.length - 1] ? {
            competitor: entries[entries.length - 1].competitor,
            price: entries[entries.length - 1].price,
            marketplace: entries[entries.length - 1].marketplace,
          } : null,
        },
      });
    }

    // ── 6. SIMULATE-PRICING ──
    if (action === 'simulate-pricing') {
      const { productId, newPrice, competitorPrices: providedCompetitors } = body;

      if (newPrice == null || newPrice <= 0) {
        return NextResponse.json({ error: 'newPrice pozitif bir sayı olmalıdır' }, { status: 400 });
      }

      let competitors = providedCompetitors;
      if (!competitors || competitors.length === 0) {
        if (!productId) {
          return NextResponse.json({ error: 'productId veya competitorPrices sağlanmalıdır' }, { status: 400 });
        }
        const dbEntries = await db.competitorPrice.findMany({ where: { productId } });
        competitors = dbEntries.map((e) => e.price);
      }

      if (!competitors || competitors.length === 0) {
        return NextResponse.json({ error: 'Rakip fiyat verisi bulunamadı' }, { status: 400 });
      }

      const compPrices: number[] = Array.isArray(competitors) && typeof competitors[0] === 'number'
        ? (competitors as number[])
        : (competitors as { price: number }[]).map((c) => c.price);

      const avgCompPrice = compPrices.reduce((a, b) => a + b, 0) / compPrices.length;
      const minCompPrice = Math.min(...compPrices);
      const maxCompPrice = Math.max(...compPrices);

      // Current position (if ourPrice available)
      let ourPrice = 0;
      if (productId) {
        const ourEntry = await db.competitorPrice.findFirst({ where: { productId } });
        ourPrice = ourEntry?.ourPrice ?? 0;
      }

      // Simulated position with new price
      const cheaperThan = compPrices.filter((p) => newPrice < p).length;
      const simulatedRatio = cheaperThan / compPrices.length;
      const simulatedPosition = simulatedRatio >= 0.75 ? 'ucuz_segment'
        : simulatedRatio >= 0.5 ? 'orta_alt'
        : simulatedRatio >= 0.25 ? 'orta_ust'
        : 'pahali_segment';

      // Old position
      const oldCheaperThan = ourPrice > 0 ? compPrices.filter((p) => ourPrice < p).length : 0;
      const oldRatio = ourPrice > 0 ? oldCheaperThan / compPrices.length : 0;
      const oldPosition = ourPrice > 0
        ? (oldRatio >= 0.75 ? 'ucuz_segment'
          : oldRatio >= 0.5 ? 'orta_alt'
          : oldRatio >= 0.25 ? 'orta_ust'
          : 'pahali_segment')
        : 'bilinmiyor';

      const positionChange = simulatedRatio - oldRatio;

      // Estimated sales impact (heuristic: lower price → higher demand)
      const priceChangePct = ourPrice > 0 ? ((newPrice - ourPrice) / ourPrice) * 100 : 0;
      const estimatedSalesChange = ourPrice > 0
        ? Math.round(-priceChangePct * 1.5) // price elasticity approx
        : null;

      // Profit margin analysis
      const diffFromAvg = newPrice - avgCompPrice;
      const diffFromMin = newPrice - minCompPrice;

      // Recommendations based on simulation
      const simRecommendations: string[] = [];
      if (newPrice < minCompPrice) {
        simRecommendations.push(`Yeni fiyatınız (${newPrice} ₺) pazarın en düşüğünün altında. Kar marjınızı kontrol edin.`);
      } else if (newPrice <= avgCompPrice * 0.95) {
        simRecommendations.push('Yeni fiyatınız ortalamanın altında. Rekabetçi konum, potansiyel satış artışı bekleniyor.');
      } else if (newPrice > maxCompPrice) {
        simRecommendations.push('Yeni fiyatınız pazarın en yükseğinde. Satış düşüşü yaşama ihtimaliniz var.');
      } else {
        simRecommendations.push('Yeni fiyatınız piyasa ortalamasına yakın kabul edilebilir bir seviyede.');
      }

      if (estimatedSalesChange !== null && estimatedSalesChange > 10) {
        simRecommendations.push(`Tahmini satış artışı: ~%${estimatedSalesChange}. Stok planlamanızı güncelleyin.`);
      } else if (estimatedSalesChange !== null && estimatedSalesChange < -10) {
        simRecommendations.push(`Tahmini satış düşüşü: ~%${Math.abs(estimatedSalesChange)}. Fiyat stratejinizi gözden geçirin.`);
      }

      return NextResponse.json({
        success: true,
        data: {
          currentPrice: ourPrice || null,
          newPrice,
          avgCompetitorPrice: Math.round((avgCompPrice + Number.EPSILON) * 100) / 100,
          minCompetitorPrice: minCompPrice,
          maxCompetitorPrice: maxCompPrice,
          competitorCount: compPrices.length,
          priceChange: ourPrice > 0 ? Math.round((priceChangePct + Number.EPSILON) * 100) / 100 : null,
          estimatedSalesChange,
          diffFromAvg: Math.round((diffFromAvg + Number.EPSILON) * 100) / 100,
          diffFromMin: Math.round((diffFromMin + Number.EPSILON) * 100) / 100,
          position: {
            current: oldPosition,
            simulated: simulatedPosition,
            change: ourPrice > 0 ? Math.round((positionChange * 100 + Number.EPSILON) * 100) / 100 : null,
            cheaperThanCount: cheaperThan,
            outOfTotal: compPrices.length,
          },
          recommendations: simRecommendations,
          ranking: compPrices
            .concat(newPrice)
            .sort((a, b) => a - b)
            .indexOf(newPrice) + 1,
        },
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem. Geçerli işlemler: add, update, delete, bulk-add, analysis, simulate-pricing' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
