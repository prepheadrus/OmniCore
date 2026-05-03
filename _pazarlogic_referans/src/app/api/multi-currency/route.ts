import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Doviz kurlarini listeleme + capraz kur hesaplama + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCurrency = searchParams.get('fromCurrency');
    const toCurrency = searchParams.get('toCurrency');

    const where: Record<string, unknown> = {};
    if (fromCurrency) where.fromCurrency = fromCurrency.toUpperCase();
    if (toCurrency) where.toCurrency = toCurrency.toUpperCase();

    const rates = await db.exchangeRate.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { updatedAt: 'desc' },
    });

    // Aktif kurlarla capraz kur matrisi olustur
    const activeRates = rates.filter((r) => r.isActive);
    const currencies = [...new Set(activeRates.flatMap((r) => [r.fromCurrency, r.toCurrency]))];
    const crossRates: Record<string, number> = {};
    const baseCurrency = 'TRY';

    // TRY bazli tum kurlari hesapla
    for (const cur of currencies) {
      if (cur === baseCurrency) {
        crossRates[`${baseCurrency}_${cur}`] = 1;
        continue;
      }
      const directRate = activeRates.find(
        (r) => r.fromCurrency === baseCurrency && r.toCurrency === cur
      );
      const reverseRate = activeRates.find(
        (r) => r.fromCurrency === cur && r.toCurrency === baseCurrency
      );
      if (directRate) {
        crossRates[`${baseCurrency}_${cur}`] = directRate.rate;
      } else if (reverseRate) {
        crossRates[`${baseCurrency}_${cur}`] = reverseRate.rate > 0 ? 1 / reverseRate.rate : 0;
      }
    }

    // Capraz kurlari hesapla (ornegin USD -> EUR)
    for (const from of currencies) {
      for (const to of currencies) {
        if (from === to) continue;
        const key = `${from}_${to}`;
        if (!crossRates[key]) {
          const fromToTry = crossRates[`${baseCurrency}_${from}`];
          const toToTry = crossRates[`${baseCurrency}_${to}`];
          if (fromToTry && toToTry && toToTry > 0) {
            crossRates[key] = Math.round((fromToTry / toToTry) * 10000) / 10000;
          }
        }
      }
    }

    // Ozet istatistikler
    const totalRates = rates.length;
    const activeCount = activeRates.length;
    const currencyPairs = currencies.length;
    const crossRateCount = Object.keys(crossRates).length;

    const summary = {
      toplamKur: totalRates,
      aktifKur: activeCount,
      paraBirimiSayisi: currencyPairs,
      caprazKurSayisi: crossRateCount,
      desteklenenParaBirimleri: currencies,
      sonGuncelleme: activeRates.length > 0 ? activeRates[0].updatedAt : null,
    };

    return NextResponse.json({ summary, rates, crossRates });
  } catch {
    return NextResponse.json(
      { error: 'Doviz kurlari yuklenemedi' },
      { status: 500 }
    );
  }
}

// Doviz kuru islemleri: create, update, convert, bulk-update
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
      // ── Yeni kur ekle ──
      case 'create': {
        const { fromCurrency, toCurrency, rate, source } = body;

        if (!fromCurrency || !toCurrency) {
          return NextResponse.json(
            { error: 'Kaynak ve hedef para birimi zorunludur' },
            { status: 400 }
          );
        }

        if (rate === undefined || rate === null || rate <= 0) {
          return NextResponse.json(
            { error: 'Gecerli bir kur degeri zorunludur' },
            { status: 400 }
          );
        }

        if (fromCurrency === toCurrency) {
          return NextResponse.json(
            { error: 'Kaynak ve hedef para birimi ayni olamaz' },
            { status: 400 }
          );
        }

        const existing = await db.exchangeRate.findFirst({
          where: {
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: 'Bu para birimi cifti zaten mevcut, guncelleme yapiniz' },
            { status: 409 }
          );
        }

        const exchangeRate = await db.exchangeRate.create({
          data: {
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
            rate: Math.round(rate * 10000) / 10000,
            source: source || 'manual',
          },
        });

        return NextResponse.json(exchangeRate, { status: 201 });
      }

      // ── Kur guncelle ──
      case 'update': {
        const { id, rate, source, isActive } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Kur ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.exchangeRate.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Doviz kuru bulunamadi' },
            { status: 404 }
          );
        }

        const updateData: Record<string, unknown> = {};
        if (rate !== undefined && rate > 0) {
          updateData.rate = Math.round(rate * 10000) / 10000;
        }
        if (source !== undefined) updateData.source = source;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updated = await db.exchangeRate.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'Doviz kuru basariyla guncellendi',
          exchangeRate: updated,
        });
      }

      // ── Doviz donusumu ──
      case 'convert': {
        const { from, to, amount } = body;

        if (!from || !to || amount === undefined || amount <= 0) {
          return NextResponse.json(
            { error: 'Gecerli kaynak, hedef para birimi ve miktar zorunludur' },
            { status: 400 }
          );
        }

        const fromUp = from.toUpperCase();
        const toUp = to.toUpperCase();

        if (fromUp === toUp) {
          return NextResponse.json({
            from: fromUp,
            to: toUp,
            amount,
            converted: amount,
            rate: 1,
            message: 'Ayni para birimi, donusum gerekmiyor',
          });
        }

        // Dogrudan kur ara
        const directRate = await db.exchangeRate.findFirst({
          where: {
            fromCurrency: fromUp,
            toCurrency: toUp,
            isActive: true,
          },
        });

        if (directRate) {
          const converted = Math.round(amount * directRate.rate * 100) / 100;
          return NextResponse.json({
            from: fromUp,
            to: toUp,
            amount,
            converted,
            rate: directRate.rate,
            source: directRate.source,
          });
        }

        // Capraz kur hesapla (ornegin USD -> EUR = USD -> TRY / EUR -> TRY)
        const fromToTry = await db.exchangeRate.findFirst({
          where: { fromCurrency: 'TRY', toCurrency: fromUp, isActive: true },
        });
        const toToTry = await db.exchangeRate.findFirst({
          where: { fromCurrency: 'TRY', toCurrency: toUp, isActive: true },
        });

        if (fromToTry && toToTry && toToTry.rate > 0) {
          const crossRate = fromToTry.rate / toToTry.rate;
          const converted = Math.round(amount * crossRate * 100) / 100;
          return NextResponse.json({
            from: fromUp,
            to: toUp,
            amount,
            converted,
            rate: Math.round(crossRate * 10000) / 10000,
            source: 'capraz_kur',
          });
        }

        return NextResponse.json(
          { error: `"${fromUp}" -> "${toUp}" icin kur bulunamadi` },
          { status: 404 }
        );
      }

      // ── Toplu kur guncelleme ──
      case 'bulk-update': {
        const { rates: ratesList } = body;

        if (!Array.isArray(ratesList) || ratesList.length === 0) {
          return NextResponse.json(
            { error: 'Guncellenecek kurlar dizisi zorunludur' },
            { status: 400 }
          );
        }

        const results: any[] = [];
        let updatedCount = 0;
        let createdCount = 0;
        let errorCount = 0;

        for (const rateItem of ratesList) {
          try {
            if (!rateItem.fromCurrency || !rateItem.toCurrency || !rateItem.rate) {
              errorCount++;
              results.push({ ...rateItem, hata: 'Eksik alanlar' });
              continue;
            }

            const existing = await db.exchangeRate.findFirst({
              where: {
                fromCurrency: rateItem.fromCurrency.toUpperCase(),
                toCurrency: rateItem.toCurrency.toUpperCase(),
              },
            });

            if (existing) {
              await db.exchangeRate.update({
                where: { id: existing.id },
                data: {
                  rate: Math.round(rateItem.rate * 10000) / 10000,
                  source: rateItem.source || existing.source,
                },
              });
              updatedCount++;
              results.push({ ...rateItem, durum: 'guncellendi' });
            } else {
              await db.exchangeRate.create({
                data: {
                  fromCurrency: rateItem.fromCurrency.toUpperCase(),
                  toCurrency: rateItem.toCurrency.toUpperCase(),
                  rate: Math.round(rateItem.rate * 10000) / 10000,
                  source: rateItem.source || 'manual',
                },
              });
              createdCount++;
              results.push({ ...rateItem, durum: 'olusturuldu' });
            }
          } catch {
            errorCount++;
            results.push({ ...rateItem, hata: 'Islem hatasi' });
          }
        }

        return NextResponse.json({
          message: `Toplu guncelleme tamamlandi`,
          ozet: {
            guncellenen: updatedCount,
            olusturulan: createdCount,
            hatali: errorCount,
          },
          sonuclar: results,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, convert, bulk-update` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Doviz kuru API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
