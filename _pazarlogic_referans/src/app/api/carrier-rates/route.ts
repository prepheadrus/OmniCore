import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Kargo fiyatlarini listeleme + filtreleme + ozet istatistikler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const carrier = searchParams.get('carrier');
    const service = searchParams.get('service');
    const zone = searchParams.get('zone');

    const where: Record<string, unknown> = {};
    if (carrier) where.carrier = carrier;
    if (service) where.service = service;
    if (zone) where.zone = zone;

    const rates = await db.carrierRate.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Her fiyat icin ek bilgiler hesapla
    const enriched = rates.map((r) => {
      const samplePrices = [1, 3, 5, 10, 20];
      const calculatedPrices = samplePrices.map((w) => ({
        agirlik: w,
        fiyat: r.maxWeight > 0 && w > r.maxWeight
          ? null
          : Math.round((r.basePrice + r.perKg * w) * 100) / 100,
      }));

      return {
        ...r,
        isActiveLabel: r.isActive ? 'Aktif' : 'Pasif',
        hesaplananFiyatlar: calculatedPrices,
      };
    });

    // Ozet istatistikler
    const activeRates = rates.filter((r) => r.isActive);
    const carriers = [...new Set(rates.map((r) => r.carrier))];
    const zones = [...new Set(rates.map((r) => r.zone))];
    const avgBasePrice =
      activeRates.length > 0
        ? activeRates.reduce((s, r) => s + r.basePrice, 0) / activeRates.length
        : 0;
    const minBasePrice = activeRates.length > 0 ? Math.min(...activeRates.map((r) => r.basePrice)) : 0;
    const maxBasePrice = activeRates.length > 0 ? Math.max(...activeRates.map((r) => r.basePrice)) : 0;

    const byCarrier = carriers.map((c) => {
      const carrierRates = activeRates.filter((r) => r.carrier === c);
      return {
        kargoFirmasi: c,
        fiyatSayisi: carrierRates.length,
        ortalamaBazFiyat:
          carrierRates.length > 0
            ? Math.round(carrierRates.reduce((s, r) => s + r.basePrice, 0) / carrierRates.length * 100) / 100
            : 0,
        minBazFiyat: carrierRates.length > 0 ? Math.min(...carrierRates.map((r) => r.basePrice)) : 0,
      };
    });

    const summary = {
      toplamFiyat: rates.length,
      aktifFiyat: activeRates.length,
      kargoFirmalari: carriers,
      bolgeSayisi: zones.length,
      ortalamaBazFiyat: Math.round(avgBasePrice * 100) / 100,
      enDusukBazFiyat: minBasePrice,
      enYuksekBazFiyat: maxBasePrice,
      kargoFirmasiOzeti: byCarrier,
    };

    return NextResponse.json({ summary, rates: enriched });
  } catch {
    return NextResponse.json(
      { error: 'Kargo fiyatlari yuklenemedi' },
      { status: 500 }
    );
  }
}

// Kargo fiyati islemleri: create, update, compare, delete
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
      // ── Yeni kargo fiyati ekle ──
      case 'create': {
        const {
          carrier,
          service,
          zone,
          basePrice,
          perKg,
          maxWeight,
          estimatedDays,
        } = body;

        if (!carrier || !carrier.trim()) {
          return NextResponse.json(
            { error: 'Kargo firmasi adi zorunludur' },
            { status: 400 }
          );
        }

        if (!zone || !zone.trim()) {
          return NextResponse.json(
            { error: 'Bolge zorunludur' },
            { status: 400 }
          );
        }

        if (basePrice === undefined || basePrice < 0) {
          return NextResponse.json(
            { error: 'Gecerli bir baz fiyat zorunludur' },
            { status: 400 }
          );
        }

        const rate = await db.carrierRate.create({
          data: {
            carrier: carrier.trim(),
            service: service || 'standart',
            zone: zone.trim(),
            basePrice: basePrice || 0,
            perKg: perKg || 0,
            maxWeight: maxWeight || 0,
            estimatedDays: estimatedDays || 0,
          },
        });

        return NextResponse.json(rate, { status: 201 });
      }

      // ── Kargo fiyati guncelle ──
      case 'update': {
        const { id, ...fields } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Fiyat ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.carrierRate.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Kargo fiyati bulunamadi' },
            { status: 404 }
          );
        }

        const updateData: Record<string, unknown> = {};
        const allowedFields = ['carrier', 'service', 'zone', 'basePrice', 'perKg', 'maxWeight', 'estimatedDays', 'isActive'];

        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            if (field === 'carrier' || field === 'zone') {
              updateData[field] = String(fields[field]).trim();
            } else {
              updateData[field] = fields[field];
            }
          }
        }

        const updated = await db.carrierRate.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          message: 'Kargo fiyati basariyla guncellendi',
          rate: updated,
        });
      }

      // ── Kargo fiyati karsilastirma ──
      case 'compare': {
        const { weight, zone: compareZone } = body;

        if (!weight || weight <= 0) {
          return NextResponse.json(
            { error: 'Gecerli bir agirlik degeri zorunludur' },
            { status: 400 }
          );
        }

        if (!compareZone) {
          return NextResponse.json(
            { error: 'Bolge zorunludur' },
            { status: 400 }
          );
        }

        const activeRates = await db.carrierRate.findMany({
          where: {
            zone: compareZone,
            isActive: true,
          },
        });

        if (activeRates.length === 0) {
          return NextResponse.json(
            { error: `"${compareZone}" bolgesi icin aktif kargo fiyati bulunamadi` },
            { status: 404 }
          );
        }

        // Her kargo firmasi icin fiyat hesapla
        const comparisons = activeRates
          .map((r) => {
            if (r.maxWeight > 0 && weight > r.maxWeight) {
              return null;
            }
            const total = r.basePrice + r.perKg * weight;
            return {
              id: r.id,
              kargoFirmasi: r.carrier,
              hizmet: r.service,
              bolge: r.zone,
              bazFiyat: r.basePrice,
              kiloBasi: r.perKg,
              toplamFiyat: Math.round(total * 100) / 100,
              tahminiGun: r.estimatedDays,
              maxAgirlik: r.maxWeight || 'Sinzir',
            };
          })
          .filter(Boolean) as Array<{
            id: string;
            kargoFirmasi: string;
            hizmet: string;
            bolge: string;
            bazFiyat: number;
            kiloBasi: number;
            toplamFiyat: number;
            tahminiGun: number;
            maxAgirlik: number | string;
          }>;

        comparisons.sort((a, b) => a.toplamFiyat - b.toplamFiyat);

        const cheapest = comparisons[0];
        const fastest = [...comparisons].sort((a, b) => a.tahminiGun - b.tahminiGun)[0];

        return NextResponse.json({
          agirlik: weight,
          bolge: compareZone,
          karsilastirma: comparisons,
          enUcuz: cheapest
            ? { firma: cheapest.kargoFirmasi, fiyat: cheapest.toplamFiyat, hizmet: cheapest.hizmet }
            : null,
          enHizli: fastest
            ? { firma: fastest.kargoFirmasi, gun: fastest.tahminiGun, fiyat: fastest.toplamFiyat }
            : null,
        });
      }

      // ── Kargo fiyati sil ──
      case 'delete': {
        const { id } = body;

        if (!id) {
          return NextResponse.json(
            { error: 'Fiyat ID zorunludur' },
            { status: 400 }
          );
        }

        const existing = await db.carrierRate.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json(
            { error: 'Kargo fiyati bulunamadi' },
            { status: 404 }
          );
        }

        await db.carrierRate.delete({ where: { id } });

        return NextResponse.json({
          message: 'Kargo fiyati basariyla silindi',
          deletedId: id,
        });
      }

      default:
        return NextResponse.json(
          { error: `Gecersiz islem: "${action}". Gecerli islemler: create, update, compare, delete` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Kargo fiyatlari API hatasi:', error);
    return NextResponse.json(
      { error: 'Bir hata olustu, lutfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
