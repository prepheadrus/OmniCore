import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── Channel compliance data generator ───
function getChannelCompliance() {
  return [
    {
      channel: 'Trendyol',
      channelKey: 'trendyol',
      compliance: 94,
      totalProducts: 312,
      requiredMet: 28,
      missingFields: ['kategori_bilgisi', 'marka_kodu', 'desen'],
      warnings: 5,
      errors: 3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      channel: 'Hepsiburada',
      channelKey: 'hepsiburada',
      compliance: 89,
      totalProducts: 267,
      requiredMet: 26,
      missingFields: ['gtin', ' garanti_suresi', 'uretim_yeri'],
      warnings: 8,
      errors: 6,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      channel: 'n11',
      channelKey: 'n11',
      compliance: 82,
      totalProducts: 198,
      requiredMet: 22,
      missingFields: ['kargo_sablonu', 'stok_kodu', 'vade_farki'],
      warnings: 12,
      errors: 9,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      channel: 'Amazon TR',
      channelKey: 'amazon',
      compliance: 76,
      totalProducts: 145,
      requiredMet: 24,
      missingFields: ['bullet_point_1', 'bullet_point_2', 'a_plus_content', 'ean'],
      warnings: 15,
      errors: 11,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
  ];
}

// ─── GET: List quality data ───
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const type = searchParams.get('type') || undefined;
    const section = searchParams.get('section') || 'all';

    const where: Record<string, unknown> = {};
    if (channel && channel !== 'all') where.channel = channel;
    if (severity && severity !== 'all') where.severity = severity;
    if (type && type !== 'all') where.type = type;

    const rules = await db.feedQualityRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const total = rules.length;
    const active = rules.filter((r) => r.isActive).length;
    const errorCount = rules.filter((r) => r.severity === 'error').length;
    const warningCount = rules.filter((r) => r.severity === 'warning').length;

    // Channel compliance
    const channelCompliance = getChannelCompliance();

    // Category quality scores
    const qualityScores = [
      { category: 'Elektronik', totalProducts: 156, score: 91, issues: ['eksik görsel', 'kısa başlık'] },
      { category: 'Giyim', totalProducts: 89, score: 85, issues: ['eksik GTIN', 'kısa açıklama'] },
      { category: 'Ev & Yaşam', totalProducts: 67, score: 93, issues: ['eksik görsel'] },
      { category: 'Spor', totalProducts: 45, score: 72, issues: ['eksik görsel', 'eksik GTIN', 'kısa başlık'] },
      { category: 'Kozmetik', totalProducts: 34, score: 88, issues: ['eksik barkod'] },
      { category: 'Oyuncak', totalProducts: 28, score: 95, issues: [] },
      { category: 'Kitap', totalProducts: 112, score: 97, issues: [] },
      { category: 'Oto Aksesuar', totalProducts: 41, score: 65, issues: ['eksik görsel', 'eksik GTIN', 'kısa başlık', 'eksik marka'] },
    ];

    // Error rate calculation
    const errorRate = total > 0 ? Math.round((errorCount / total) * 100) : 0;

    return NextResponse.json({
      rules,
      qualityScores,
      channelCompliance,
      summary: {
        total,
        active,
        errorCount,
        warningCount,
        errorRate,
        avgQualityScore: qualityScores.length > 0
          ? Math.round(qualityScores.reduce((s, q) => s + q.score, 0) / qualityScores.length)
          : 0,
      },
    });
  } catch (error) {
    console.error('Kalite verileri yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Kalite verileri yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ─── POST: Run quality check ───
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'run_check') {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const channels = ['trendyol', 'hepsiburada', 'n11', 'amazon'];
      const channelResults = channels.map((ch) => {
        const compliance = 70 + Math.floor(Math.random() * 28);
        return {
          channel: ch,
          compliance,
          totalChecked: 50 + Math.floor(Math.random() * 200),
          errors: Math.floor(Math.random() * 15),
          warnings: Math.floor(Math.random() * 20),
          checkedAt: new Date().toISOString(),
        };
      });

      return NextResponse.json({
        success: true,
        channelResults,
        summary: {
          totalChecked: channelResults.reduce((s, c) => s + c.totalChecked, 0),
          totalErrors: channelResults.reduce((s, c) => s + c.errors, 0),
          totalWarnings: channelResults.reduce((s, c) => s + c.warnings, 0),
          avgCompliance: Math.round(channelResults.reduce((s, c) => s + c.compliance, 0) / channelResults.length),
          checkedAt: new Date().toISOString(),
        },
      });
    }

    // Create quality rule
    const { name, type, field, condition, severity, channel, category } = body;

    if (!name || !type || !field || !condition || !severity || !channel) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar: name, type, field, condition, severity, channel' },
        { status: 400 }
      );
    }

    const rule = await db.feedQualityRule.create({
      data: {
        name,
        type,
        field,
        condition,
        severity,
        channel,
        category: category || '',
        isActive: true,
        errorCount: 0,
      },
    });

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (error) {
    console.error('Kalite kontrolü sırasında hata:', error);
    return NextResponse.json(
      { error: 'Kalite kontrolü sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ─── PUT ───
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Kural ID alanı zorunludur' }, { status: 400 });
    }

    const rule = await db.feedQualityRule.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, rule });
  } catch (error) {
    return NextResponse.json({ error: 'Kalite kuralı güncellenirken hata oluştu' }, { status: 500 });
  }
}

// ─── DELETE ───
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Kural ID alanı zorunludur' }, { status: 400 });
    }

    await db.feedQualityRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Kalite kuralı silinirken hata oluştu' }, { status: 500 });
  }
}
