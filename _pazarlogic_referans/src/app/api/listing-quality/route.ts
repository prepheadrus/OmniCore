import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Urun listeleme kalite skorlarini listeleme + pazaryeri filtresi + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace');
    const minScore = searchParams.get('minScore');
    const sortBy = searchParams.get('sortBy') || 'overallScore';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const where: Record<string, unknown> = {};
    if (marketplace) where.marketplace = marketplace;
    if (minScore) {
      const score = parseInt(minScore, 10);
      if (!isNaN(score)) where.overallScore = { gte: score };
    }

    const validSortFields = ['overallScore', 'titleScore', 'imageScore', 'descScore', 'priceScore', 'attributeScore', 'seoScore'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'overallScore';
    const sortDir = sortOrder === 'desc' ? 'desc' : 'asc';

    const scores = await db.listingQualityScore.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { [sortField]: sortDir },
    });

    // Her skor icin detayli bilgi ekle
    const enriched = scores.map((s) => {
      const issues = JSON.parse(s.issues || '[]');
      const suggestions = JSON.parse(s.suggestions || '[]');

      const grade =
        s.overallScore >= 90
          ? 'A'
          : s.overallScore >= 80
            ? 'B'
            : s.overallScore >= 70
              ? 'C'
              : s.overallScore >= 60
                ? 'D'
                : 'F';

      const quality =
        s.overallScore >= 80
          ? 'mukemmel'
          : s.overallScore >= 60
            ? 'iyi'
            : s.overallScore >= 40
              ? 'ortalama'
              : 'zayif';

      const categoryScores = [
        { kategori: 'Baslik', skor: s.titleScore },
        { kategori: 'Gorsel', skor: s.imageScore },
        { kategori: 'Aciklama', skor: s.descScore },
        { kategori: 'Fiyat', skor: s.priceScore },
        { kategori: 'Ozellikler', skor: s.attributeScore },
        { kategori: 'SEO', skor: s.seoScore },
      ];

      const lowestCategory = categoryScores.reduce(
        (min, c) => (c.skor < min.skor ? c : min),
        categoryScores[0]
      );

      return {
        ...s,
        issuesParsed: issues,
        suggestionsParsed: suggestions,
        grade,
        quality,
        totalIssues: issues.length,
        totalSuggestions: suggestions.length,
        weakestCategory: lowestCategory,
        categoryScores,
      };
    });

    // Ozet istatistikler
    const totalProducts = scores.length;
    const avgScore =
      totalProducts > 0
        ? scores.reduce((s, sc) => s + sc.overallScore, 0) / totalProducts
        : 0;
    const excellentCount = scores.filter((s) => s.overallScore >= 80).length;
    const weakCount = scores.filter((s) => s.overallScore < 40).length;
    const totalIssues = scores.reduce((s, sc) => s + (JSON.parse(sc.issues || '[]') as unknown[]).length, 0);

    const avgByCategory = {
      baslik: totalProducts > 0 ? Math.round(scores.reduce((s, sc) => s + sc.titleScore, 0) / totalProducts * 100) / 100 : 0,
      gorsel: totalProducts > 0 ? Math.round(scores.reduce((s, sc) => s + sc.imageScore, 0) / totalProducts * 100) / 100 : 0,
      aciklama: totalProducts > 0 ? Math.round(scores.reduce((s, sc) => s + sc.descScore, 0) / totalProducts * 100) / 100 : 0,
      fiyat: totalProducts > 0 ? Math.round(scores.reduce((s, sc) => s + sc.priceScore, 0) / totalProducts * 100) / 100 : 0,
      ozellikler: totalProducts > 0 ? Math.round(scores.reduce((s, sc) => s + sc.attributeScore, 0) / totalProducts * 100) / 100 : 0,
      seo: totalProducts > 0 ? Math.round(scores.reduce((s, sc) => s + sc.seoScore, 0) / totalProducts * 100) / 100 : 0,
    };

    const summary = {
      toplamUrun: totalProducts,
      ortalamaSkor: Math.round(avgScore * 100) / 100,
      mukemmelSayisi: excellentCount,
      zayifSayisi: weakCount,
      toplamSorun: totalIssues,
      ortalamaKategoriSkoru: avgByCategory,
    };

    return NextResponse.json({ summary, scores: enriched });
  } catch {
    return NextResponse.json(
      { error: 'Listeleme kalite skorlari yuklenemedi' },
      { status: 500 }
    );
  }
}

// Listeleme kalite islemleri: create, evaluate, bulk-evaluate
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
      // ── Yeni kalite skoru olustur ──
      case 'create': {
        const {
          productId,
          productName,
          sku,
          marketplace,
          overallScore,
          titleScore,
          imageScore,
          descScore,
          priceScore,
          attributeScore,
          seoScore,
          issues,
          suggestions,
        } = body;

        if (!productId || !productName) {
          return NextResponse.json(
            { error: 'Urun ID ve urun adi zorunludur' },
            { status: 400 }
          );
        }

        const score = await db.listingQualityScore.create({
          data: {
            productId,
            productName: productName.trim(),
            sku: sku || '',
            marketplace: marketplace || '',
            overallScore: overallScore || 0,
            titleScore: titleScore || 0,
            imageScore: imageScore || 0,
            descScore: descScore || 0,
            priceScore: priceScore || 0,
            attributeScore: attributeScore || 0,
            seoScore: seoScore || 0,
            issues: issues ? JSON.stringify(issues) : '[]',
            suggestions: suggestions ? JSON.stringify(suggestions) : '[]',
          },
        });

        return NextResponse.json(score, { status: 201 });
      }

      // ── Urun listesini otomatik puanla ──
      case 'evaluate': {
        const { productId, marketplace: mp } = body;

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

        const issues: string[] = [];
        const suggestions: string[] = [];
        const usedMarketplace = mp || product.marketplace || 'trendyol';

        // Baslik puanlama (0-100)
        const titleWords = product.name.split(/\s+/).length;
        let titleScore = Math.min(100, titleWords * 10);
        if (titleWords < 3) {
          issues.push('Urun basligi cok kisa, en az 3 kelime olmali');
          titleScore = 20;
        }
        if (!product.brand) {
          issues.push('Baslikta marka bilgisi eksik');
          titleScore -= 15;
        }
        titleScore = Math.max(0, Math.min(100, titleScore));

        // Gorsel puanlama (0-100)
        const images = JSON.parse(product.images || '[]') as string[];
        let imageScore = Math.min(100, images.length * 25);
        if (images.length === 0) {
          issues.push('Hic gorsel eklenmemis');
          imageScore = 0;
        } else if (images.length < 4) {
          suggestions.push('En az 4 gorsel ekleyerek gorunurlugu arttirabilirsiniz');
          imageScore -= 10;
        }
        imageScore = Math.max(0, Math.min(100, imageScore));

        // Aciklama puanlama (0-100)
        const descLength = product.description.length;
        let descScore = Math.min(100, Math.floor(descLength / 5));
        if (descLength < 100) {
          issues.push('Urun aciklamasi cok kisa, en az 100 karakter olmali');
          descScore = 20;
        } else if (descLength < 300) {
          suggestions.push('Daha detayli urun aciklamasi ekleyin');
        }
        descScore = Math.max(0, Math.min(100, descScore));

        // Fiyat puanlama (0-100)
        let priceScore = 70;
        if (product.price <= 0) {
          issues.push('Gecerli bir fiyat belirlenmemis');
          priceScore = 0;
        } else if (product.cost > 0) {
          const margin = ((product.price - product.cost) / product.price) * 100;
          if (margin < 10) {
            suggestions.push('Kar marji cok dusuk, fiyatlandirmayi gozden gecirin');
            priceScore = 40;
          } else if (margin >= 30) {
            priceScore = 90;
          }
        }
        priceScore = Math.max(0, Math.min(100, priceScore));

        // Ozellikler puanlama (0-100)
        const attributes = JSON.parse(product.attributes || '{}');
        const attrCount = Object.keys(attributes).length;
        let attributeScore = Math.min(100, attrCount * 15);
        if (attrCount < 3) {
          issues.push('Urun ozellikleri yetersiz, en az 3 ozellik ekleyin');
          attributeScore = 30;
        }
        if (!product.barcode && !product.gtin) {
          suggestions.push('Barkod/GTIN bilgisi ekleyin');
        }
        attributeScore = Math.max(0, Math.min(100, attributeScore));

        // SEO puanlama (0-100)
        let seoScore = 50;
        if (product.seoTitle && product.seoTitle.length > 10) seoScore += 15;
        else suggestions.push('SEO basligi ekleyin');
        if (product.seoDesc && product.seoDesc.length > 20) seoScore += 15;
        else suggestions.push('SEO aciklamasi ekleyin');
        if (product.category) seoScore += 10;
        if (product.subCategory) seoScore += 10;
        seoScore = Math.max(0, Math.min(100, seoScore));

        const overallScore = Math.round(
          (titleScore * 0.2 + imageScore * 0.2 + descScore * 0.15 +
            priceScore * 0.15 + attributeScore * 0.15 + seoScore * 0.15)
        );

        const existing = await db.listingQualityScore.findFirst({
          where: { productId, marketplace: usedMarketplace },
        });

        const scoreData = {
          productName: product.name,
          sku: product.sku,
          marketplace: usedMarketplace,
          overallScore,
          titleScore,
          imageScore,
          descScore,
          priceScore,
          attributeScore,
          seoScore,
          issues: JSON.stringify(issues),
          suggestions: JSON.stringify(suggestions),
        };

        if (existing) {
          const updated = await db.listingQualityScore.update({
            where: { id: existing.id },
            data: scoreData,
          });
          return NextResponse.json({
            message: 'Listeleme kalite skoru guncellendi',
            score: updated,
          });
        }

        const score = await db.listingQualityScore.create({
          data: { productId, ...scoreData },
        });

        return NextResponse.json({
          message: 'Listeleme kalite skoru olusturuldu',
          score,
        });
      }

      // ── Tum urunleri toplu degerlendir ──
      case 'bulk-evaluate': {
        const { marketplace: mp } = body;
        const products = await db.product.findMany({
          where: { isActive: true },
        });

        if (products.length === 0) {
          return NextResponse.json(
            { error: 'Aktif urun bulunamadi' },
            { status: 404 }
          );
        }

        const results = [];
        let createdCount = 0;
        let updatedCount = 0;

        for (const product of products) {
          try {
            const usedMarketplace = mp || product.marketplace || 'trendyol';
            const issues: string[] = [];
            const suggestions: string[] = [];

            const titleWords = product.name.split(/\s+/).length;
            const titleScore = Math.min(100, titleWords * 10);
            if (titleWords < 3) issues.push('Baslik cok kisa');

            const images = JSON.parse(product.images || '[]') as string[];
            const imageScore = Math.min(100, images.length * 25);
            if (images.length === 0) issues.push('Gorsel yok');

            const descScore = Math.min(100, Math.floor(product.description.length / 5));
            if (product.description.length < 100) issues.push('Aciklama cok kisa');

            const priceScore = product.price > 0 ? 70 : 0;
            if (product.price <= 0) issues.push('Fiyat yok');

            const attributes = JSON.parse(product.attributes || '{}');
            const attributeScore = Math.min(100, Object.keys(attributes).length * 15);

            let seoScore = 50;
            if (product.seoTitle) seoScore += 15;
            if (product.seoDesc) seoScore += 15;

            const overallScore = Math.round(
              (titleScore * 0.2 + imageScore * 0.2 + descScore * 0.15 +
                priceScore * 0.15 + attributeScore * 0.15 + seoScore * 0.15)
            );

            const existing = await db.listingQualityScore.findFirst({
              where: { productId: product.id, marketplace: usedMarketplace },
            });

            if (existing) {
              await db.listingQualityScore.update({
                where: { id: existing.id },
                data: {
                  productName: product.name,
                  sku: product.sku,
                  marketplace: usedMarketplace,
                  overallScore,
                  titleScore,
                  imageScore,
                  descScore,
                  priceScore,
                  attributeScore,
                  seoScore,
                  issues: JSON.stringify(issues),
                  suggestions: JSON.stringify(suggestions),
                },
              });
              updatedCount++;
            } else {
              await db.listingQualityScore.create({
                data: {
                  productId: product.id,
                  productName: product.name,
                  sku: product.sku,
                  marketplace: usedMarketplace,
                  overallScore,
                  titleScore,
                  imageScore,
                  descScore,
                  priceScore,
                  attributeScore,
                  seoScore,
                  issues: JSON.stringify(issues),
                  suggestions: JSON.stringify(suggestions),
                },
              });
              createdCount++;
            }

            results.push({
              productId: product.id,
              productName: product.name,
              skor: overallScore,
              durum: existing ? 'guncellendi' : 'olusturuldu',
            });
          } catch {
            results.push({ productId: product.id, durum: 'hata' });
          }
        }

        return NextResponse.json({
          message: 'Toplu listeleme kalite degerlendirmesi tamamlandi',
          ozet: { toplamUrun: products.length, olusturulan: createdCount, guncellenen: updatedCount },
          sonuclar: results,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, evaluate, bulk-evaluate` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Listeleme kalite API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
