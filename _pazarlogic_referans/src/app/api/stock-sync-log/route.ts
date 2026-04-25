import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET: List sync logs with filters and pagination ───
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || undefined;
    const status = searchParams.get('status') || undefined;
    const triggeredBy = searchParams.get('triggeredBy') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (channel && channel !== 'all') where.channel = channel;
    if (status && status !== 'all') where.status = status;
    if (triggeredBy && triggeredBy !== 'all') where.triggeredBy = triggeredBy;

    const [logs, total] = await Promise.all([
      db.stockSyncLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.stockSyncLog.count({ where }),
    ]);

    // Summary calculations
    const allLogs = await db.stockSyncLog.findMany({
      select: { status: true, createdAt: true },
    });
    const totalSyncs = allLogs.length;
    const successCount = allLogs.filter((l) => l.status === 'success').length;
    const successRate = totalSyncs > 0 ? Math.round((successCount / totalSyncs) * 100) : 0;
    const lastSyncLog = allLogs.length > 0
      ? allLogs.reduce((latest, log) =>
          log.createdAt > latest.createdAt ? log : latest
        )
      : null;
    const lastSyncTime = lastSyncLog?.createdAt?.toISOString() || null;

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalSyncs,
        successRate,
        lastSyncTime,
      },
    });
  } catch (error) {
    console.error('Stok senkronizasyon kayıtları yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Stok senkronizasyon kayıtları yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
