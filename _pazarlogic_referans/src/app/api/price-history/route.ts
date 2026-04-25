import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET: List price history with filters and pagination ───
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get('marketplace') || undefined;
    const changedBy = searchParams.get('changedBy') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (marketplace && marketplace !== 'all') where.marketplace = marketplace;
    if (changedBy && changedBy !== 'all') where.changedBy = changedBy;

    const [history, total] = await Promise.all([
      db.priceHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.priceHistory.count({ where }),
    ]);

    // Summary calculations
    const allHistory = await db.priceHistory.findMany({
      select: { oldPrice: true, newPrice: true, createdAt: true },
    });

    const totalChanges = allHistory.length;
    let avgChangePercent = 0;

    if (totalChanges > 0) {
      const totalPercent = allHistory.reduce((sum, h) => {
        if (h.oldPrice > 0) {
          return sum + Math.abs(((h.newPrice - h.oldPrice) / h.oldPrice) * 100);
        }
        return sum;
      }, 0);
      avgChangePercent = Math.round(totalPercent / totalChanges * 100) / 100;
    }

    const lastChangeLog = allHistory.length > 0
      ? allHistory.reduce((latest, log) =>
          log.createdAt > latest.createdAt ? log : latest
        )
      : null;
    const lastChangeTime = lastChangeLog?.createdAt?.toISOString() || null;

    return NextResponse.json({
      history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalChanges,
        avgChangePercent,
        lastChangeTime,
      },
    });
  } catch (error) {
    console.error('Fiyat geçmişi yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Fiyat geçmişi yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
