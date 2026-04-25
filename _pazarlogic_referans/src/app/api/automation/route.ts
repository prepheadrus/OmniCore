import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — Tüm otomasyon kurallarını listele
export async function GET() {
  try {
    const rules = await db.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const total = rules.length;
    const active = rules.filter((r) => r.isActive).length;
    const totalRuns = rules.reduce((sum, r) => sum + r.runCount, 0);

    return NextResponse.json({
      rules,
      summary: { total, active, totalRuns },
    });
  } catch {
    return NextResponse.json(
      { error: 'Otomasyon kuralları yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST — Yeni otomasyon kuralı oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, trigger, action, description, condition, actionData, isActive } = body;

    // Zorunlu alan doğrulaması
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Kural adı zorunludur ve boş olamaz.' },
        { status: 400 }
      );
    }

    if (!trigger || typeof trigger !== 'string' || trigger.trim() === '') {
      return NextResponse.json(
        { error: 'Tetikleyici (trigger) zorunludur ve boş olamaz.' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string' || action.trim() === '') {
      return NextResponse.json(
        { error: 'Aksiyon (action) zorunludur ve boş olamaz.' },
        { status: 400 }
      );
    }

    // condition: gelen değer zaten bir JSON string ise doğrudan kullan, obje ise stringify yap
    let parsedCondition = '{}';
    if (condition !== undefined && condition !== null) {
      parsedCondition =
        typeof condition === 'string' ? condition : JSON.stringify(condition);
    }

    // actionData: gelen değer zaten bir JSON string ise doğrudan kullan, obje ise stringify yap
    let parsedActionData = '{}';
    if (actionData !== undefined && actionData !== null) {
      parsedActionData =
        typeof actionData === 'string' ? actionData : JSON.stringify(actionData);
    }

    // JSON geçerlilik kontrolü
    try {
      JSON.parse(parsedCondition);
    } catch {
      return NextResponse.json(
        { error: 'Condition (koşul) geçerli bir JSON formatında olmalıdır.' },
        { status: 400 }
      );
    }

    try {
      JSON.parse(parsedActionData);
    } catch {
      return NextResponse.json(
        { error: 'ActionData (aksiyon verisi) geçerli bir JSON formatında olmalıdır.' },
        { status: 400 }
      );
    }

    const rule = await db.automationRule.create({
      data: {
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        trigger: trigger.trim(),
        condition: parsedCondition,
        action: action.trim(),
        actionData: parsedActionData,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Otomasyon kuralı oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
