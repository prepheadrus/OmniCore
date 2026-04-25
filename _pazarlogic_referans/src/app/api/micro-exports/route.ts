import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mikro ihracat listesi
export async function GET() {
  try {
    const exports = await db.microExport.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const statusLabels: Record<string, string> = {
      pending: 'Hazirlaniyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'Iptal Edildi',
    };

    const enriched = exports.map((e) => ({
      ...e,
      statusLabel: statusLabels[e.status] || e.status,
    }));

    return NextResponse.json({ exports: enriched });
  } catch {
    return NextResponse.json({ error: 'Mikro ihracatlar yuklenemedi' }, { status: 500 });
  }
}

// Yeni mikro ihracat olustur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country, carrier, totalValue, productName } = body;

    if (!country || !country.trim()) {
      return NextResponse.json({ error: 'Hedef ulke zorunludur' }, { status: 400 });
    }

    if (!carrier || !carrier.trim()) {
      return NextResponse.json({ error: 'Kargo firmasi zorunludur' }, { status: 400 });
    }

    const value = parseFloat(totalValue) || 0;
    if (value <= 0) {
      return NextResponse.json({ error: 'Gecerli bir toplam deger giriniz' }, { status: 400 });
    }

    if (value > 300) {
      return NextResponse.json(
        { error: 'Mikro ihracat icin toplam deger $300 altinda olmalidir' },
        { status: 400 }
      );
    }

    const count = await db.microExport.count();
    const exportNumber = `ME-${String(count + 1).padStart(6, '0')}`;

    const microExport = await db.microExport.create({
      data: {
        exportNumber,
        country: country.trim(),
        carrier: carrier.trim(),
        totalValue: value,
        productName: productName || '',
        status: 'pending',
      },
    });

    return NextResponse.json(microExport, { status: 201 });
  } catch (error) {
    console.error('Mikro ihracat API hatasi:', error);
    return NextResponse.json({ error: 'Bir hata olustu, lutfen tekrar deneyin' }, { status: 500 });
  }
}
