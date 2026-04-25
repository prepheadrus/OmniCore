import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── Quality scores helper ───
function getQualityScores() {
  return [
    { category: 'Elektronik', totalProducts: 156, score: 91, issues: 14 },
    { category: 'Giyim', totalProducts: 89, score: 88, issues: 11 },
    { category: 'Ev & Yaşam', totalProducts: 67, score: 91, issues: 6 },
    { category: 'Spor', totalProducts: 45, score: 84, issues: 7 },
    { category: 'Kozmetik', totalProducts: 34, score: 88, issues: 4 },
    { category: 'Oyuncak', totalProducts: 28, score: 93, issues: 2 },
    { category: 'Kitap', totalProducts: 112, score: 96, issues: 4 },
  ];
}

// ─── GET: List content rules with filters and quality scores ───
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const channel = searchParams.get('channel') || undefined;
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (type && type !== 'all') where.type = type;
    if (channel && channel !== 'all') where.channel = channel;
    if (isActive !== null && isActive !== undefined && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    const rules = await db.contentRule.findMany({
      where,
      orderBy: { priority: 'asc' },
    });

    const qualityScores = getQualityScores();

    const total = rules.length;
    const active = rules.filter((r) => r.isActive).length;
    const totalApplied = rules.reduce((sum, r) => sum + r.applyCount, 0);
    const avgQualityScore =
      qualityScores.length > 0
        ? Math.round(qualityScores.reduce((s, q) => s + q.score, 0) / qualityScores.length)
        : 0;

    return NextResponse.json({
      rules,
      qualityScores,
      summary: {
        total,
        active,
        avgQualityScore,
        totalApplied,
      },
    });
  } catch (error) {
    console.error('İçerik kuralları yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'İçerik kuralları yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ─── POST: Create rule OR apply rule ───
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Apply rule to products (simulation)
    if (body.action === 'apply' && body.ruleId) {
      const rule = await db.contentRule.findUnique({
        where: { id: body.ruleId },
      });

      if (!rule) {
        return NextResponse.json(
          { error: 'İçerik kuralı bulunamadı' },
          { status: 404 }
        );
      }

      // Simulate affected products count based on category and channel
      const channelMultiplier: Record<string, number> = {
        trendyol: 156,
        hepsiburada: 134,
        n11: 98,
        amazon: 67,
        all: 245,
      };
      const baseCount = channelMultiplier[rule.channel] || 100;
      const affectedProducts = Math.floor(baseCount * (0.3 + Math.random() * 0.5));

      // Update rule stats
      await db.contentRule.update({
        where: { id: body.ruleId },
        data: {
          applyCount: rule.applyCount + affectedProducts,
          lastApplied: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        affectedProducts,
        ruleName: rule.name,
        appliedAt: new Date().toISOString(),
      });
    }

    // Create new content rule
    const { name, type, channel, category, description, template, variables, priority } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Kural adı zorunludur' },
        { status: 400 }
      );
    }

    const rule = await db.contentRule.create({
      data: {
        name,
        type: type || 'field_validation',
        channel: channel || 'all',
        category: category || '',
        description: description || '',
        template: template || '',
        variables: variables ? JSON.stringify(variables) : '{}',
        priority: priority || 0,
        isActive: true,
        applyCount: 0,
      },
    });

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (error) {
    console.error('İçerik kuralı oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'İçerik kuralı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ─── PUT: Update rule by id ───
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Kural ID alanı zorunludur' },
        { status: 400 }
      );
    }

    // Convert variables to string if it's an object
    const data: Record<string, unknown> = { ...updateData };
    if (data.variables && typeof data.variables === 'object') {
      data.variables = JSON.stringify(data.variables);
    }

    const rule = await db.contentRule.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error('İçerik kuralı güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'İçerik kuralı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete rule by id ───
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Kural ID alanı zorunludur' },
        { status: 400 }
      );
    }

    await db.contentRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('İçerik kuralı silinirken hata:', error);
    return NextResponse.json(
      { error: 'İçerik kuralı silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
