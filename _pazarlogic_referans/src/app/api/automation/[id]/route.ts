import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — Tek bir otomasyon kuralını getir
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rule = await db.automationRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return NextResponse.json(
        { error: 'Otomasyon kuralı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, rule });
  } catch {
    return NextResponse.json(
      { error: 'Kural detayları yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// PUT — Otomasyon kuralını güncelle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Kuralın mevcut olup olmadığını kontrol et
    const existing = await db.automationRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Güncellenecek kural bulunamadı.' },
        { status: 404 }
      );
    }

    // condition ve actionData alanlarını JSON string'e dönüştür
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.trigger !== undefined) updateData.trigger = String(body.trigger).trim();
    if (body.action !== undefined) updateData.action = String(body.action).trim();
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    if (body.condition !== undefined) {
      const conditionStr =
        typeof body.condition === 'string'
          ? body.condition
          : JSON.stringify(body.condition);

      try {
        JSON.parse(conditionStr);
        updateData.condition = conditionStr;
      } catch {
        return NextResponse.json(
          { error: 'Condition (koşul) geçerli bir JSON formatında olmalıdır.' },
          { status: 400 }
        );
      }
    }

    if (body.actionData !== undefined) {
      const actionDataStr =
        typeof body.actionData === 'string'
          ? body.actionData
          : JSON.stringify(body.actionData);

      try {
        JSON.parse(actionDataStr);
        updateData.actionData = actionDataStr;
      } catch {
        return NextResponse.json(
          { error: 'ActionData (aksiyon verisi) geçerli bir JSON formatında olmalıdır.' },
          { status: 400 }
        );
      }
    }

    const rule = await db.automationRule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Otomasyon kuralı başarıyla güncellendi.',
      rule,
    });
  } catch {
    return NextResponse.json(
      { error: 'Kural güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// DELETE — Otomasyon kuralını sil
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kuralın mevcut olup olmadığını kontrol et
    const existing = await db.automationRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Silinecek kural bulunamadı.' },
        { status: 404 }
      );
    }

    await db.automationRule.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `"${existing.name}" kuralı başarıyla silindi.`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Kural silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST — Özel aksiyonlar: toggle (aktif/pasif) veya run (çalıştır simülasyonu)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kuralın mevcut olup olmadığını kontrol et
    const existing = await db.automationRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Otomasyon kuralı bulunamadı.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // ---- TOGGLE: Aktif/Pasif durumu değiştir ----
    if (action === 'toggle') {
      const newStatus = !existing.isActive;

      const rule = await db.automationRule.update({
        where: { id },
        data: { isActive: newStatus },
      });

      return NextResponse.json({
        success: true,
        message: newStatus
          ? `"${existing.name}" kuralı aktif edildi.`
          : `"${existing.name}" kuralı pasif edildi.`,
        rule,
      });
    }

    // ---- RUN: Kuralı simüle et ----
    if (action === 'run') {
      if (!existing.isActive) {
        return NextResponse.json(
          { error: `"${existing.name}" kuralı şu anda pasif olduğu için çalıştırılamaz. Önce aktif edin.` },
          { status: 400 }
        );
      }

      const now = new Date();

      // Basit simülasyon: trigger ve action bilgilerini logla
      const simulateResult = {
        ruleId: existing.id,
        ruleName: existing.name,
        trigger: existing.trigger,
        action: existing.action,
        condition: existing.condition,
        actionData: existing.actionData,
        executedAt: now.toISOString(),
        status: 'simulated_success',
      };

      const rule = await db.automationRule.update({
        where: { id },
        data: {
          runCount: { increment: 1 },
          lastRun: now,
        },
      });

      return NextResponse.json({
        success: true,
        message: `"${existing.name}" kuralı başarıyla simüle edildi. Çalıştırma sayısı: ${rule.runCount}`,
        result: simulateResult,
        rule,
      });
    }

    // Bilinmeyen aksiyon
    return NextResponse.json(
      {
        error: 'Geçersiz aksiyon. Desteklenen aksiyonlar: "toggle" veya "run".',
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
