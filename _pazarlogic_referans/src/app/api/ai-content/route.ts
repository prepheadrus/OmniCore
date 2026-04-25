import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// ── Helper: call the LLM ────────────────────────────────────────────────
async function askAI(systemPrompt: string, userPrompt: string) {
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  return completion.choices?.[0]?.message?.content ?? '';
}

// ── Helper: derive a quality score from AI response ─────────────────────
function deriveScore(text: string, min = 65, max = 95): number {
  return Math.min(max, Math.max(min, Math.round(text.length / 10)));
}

// ── Helper: count words ─────────────────────────────────────────────────
function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// GET — List all AI content jobs, optional ?type= filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const jobs = await db.aiContentJob.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs, { next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch AI content jobs' },
      { status: 500 },
    );
  }
}

// POST — Create a new AI content job OR generate content with AI
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ─── AI Generation Actions ───────────────────────────────────────────

    if (action === 'generate') {
      const { type, productName, productId, tone, marketplace, category } = body as {
        type: string;
        productName?: string;
        productId?: string;
        tone?: string;
        marketplace?: string;
        category?: string;
      };

      if (!productName && !productId) {
        return NextResponse.json(
          { error: 'productName veya productId zorunludur' },
          { status: 400 },
        );
      }

      const name = productName || 'Bilinmeyen Ürün';
      const mp = marketplace || 'Trendyol';
      const cat = category || 'Genel';
      const ton = tone || 'professional';

      let content = '';
      const toneLabel = ton === 'professional' ? 'profesyonel'
        : ton === 'casual' ? 'samimi ve sıcak'
        : ton === 'luxury' ? 'lüks ve sofistike'
        : ton === 'technical' ? 'teknik ve detaylı'
        : 'profesyonel';

      if (type === 'description') {
        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir ürün içerik yazarısın.
Pazaryerleri (Trendyol, Hepsiburada, Amazon TR, n11 vb.) için SEO-optimizeli ürün açıklamaları yazıyorsun.
İçerikler Türkçe olmalı, satış odaklı ve okunabilir olmalıdır.`;

        const userPrompt = `"${name}" ürünü (${cat}) için ${mp} pazaryerine uygun, ${toneLabel} bir ürünk açıklaması yaz.

Aşağıdaki kurallara uymadığından emin ol:
1. Ürün adını başlık olarak kullan ve en önemli özellikleri vurgula
2. SEO uyumlu anahtar kelimeler doğal şekilde yerleştir
3. Satış odaklı, ikna edici bir dil kullan
4. ${mp} pazaryeri kurallarına uygun uzunlukta ol (en az 150 kelime)
5. Ürünün teknik özelliklerini ve faydalarını detaylandır
6. Müşteri sorularını öngörerek yanıtlarla destekle
7. Harekete geçirici kapanış cümlesi ekle`;

        content = await askAI(systemPrompt, userPrompt);

      } else if (type === 'title_bullets') {
        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir SEO içerik yazarısın.
Pazaryerleri için optimize edilmiş ürün başlıkları ve mermi (bullet) noktaları oluşturuyorsun.
Başlıklar SEO-optimizeli, tıklamaya teşvik edici ve pazaryeri kurallarına uygun olmalıdır.`;

        const userPrompt = `"${name}" ürünü (${cat}) için ${mp} pazaryerine uygun SEO başlığı ve mermi noktaları oluştur.

Aşağıdakileri sağla:
1. **Ana Başlık**: SEO-optimizeli, dikkat çekici ürün başlığı (60-150 karakter)
2. **Alternatif Başlıklar**: En az 3 farklı başlık varyantı (farklı odak noktaları ile)
3. **Mermi Noktaları**: En az 8 adet "• Özellik — Açıklama" formatında mermi noktası
4. Her mermi noktası ürünün bir avantajını veya özelliğini vurgulamalı
5. ${mp} pazaryeri için uygun karakter limitlerine uymadığından emin ol
6. Müşterinin ilgisini çekecek ve satın almaya teşvik edecek dil kullan`;

        content = await askAI(systemPrompt, userPrompt);

      } else {
        return NextResponse.json(
          { error: `Bilinmeyen generate türü: "${type}"` },
          { status: 400 },
        );
      }

      const qualityScore = deriveScore(content);
      const wc = wordCount(content);

      // Persist to DB
      try {
        await db.aiContentJob.create({
          data: {
            productId: productId ?? '',
            productName: name,
            type,
            tone: ton,
            targetMarketplace: mp,
            generatedText: content,
            wordCount: wc,
            qualityScore,
            status: 'completed',
            storeId: 'default',
          },
        });
      } catch {
        // DB save is non-critical; still return the generated content
      }

      return NextResponse.json({
        success: true,
        content,
        qualityScore,
        wordCount: wc,
      });
    }

    if (action === 'translate') {
      const { productName, productId, sourceLang, targetLang, marketplace, category } = body as {
        productName?: string;
        productId?: string;
        sourceLang?: string;
        targetLang?: string;
        marketplace?: string;
        category?: string;
      };

      if (!productName && !productId) {
        return NextResponse.json(
          { error: 'productName veya productId zorunludur' },
          { status: 400 },
        );
      }

      const name = productName || 'Bilinmeyen Ürün';
      const src = sourceLang || 'tr';
      const tgt = targetLang || 'en';
      const mp = marketplace || 'Trendyol';
      const cat = category || 'Genel';

      const langNames: Record<string, string> = {
        tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', ar: 'Arapça',
      };

      const systemPrompt = `Sen profesyonel bir e-ticaret çevirmen ve yerelleştirme uzmanısın.
Ürün içeriklerini hedef dile çevirirken, pazaryeri kurallarına ve yerel kültüre uygun hale getiriyorsun.
Çeviriler doğal, satış odaklı ve SEO dostu olmalıdır.`;

      const userPrompt = `"${name}" ürünü (${cat}) için bir ürün açıklaması oluştur ve ${langNames[src] || src}'den ${langNames[tgt] || tgt}'e çevir.

Aşağıdakileri sağla:
1. Önce ${langNames[src] || src} olarak ürün hakkında temel bilgileri oluştur (${name}, ${cat})
2. Sonra bunu ${langNames[tgt] || tgt} diline profesyonel şekilde çevir
3. Hedef dilin doğal ifadelerini ve ticaret terminolojisini kullan
4. ${mp} pazaryeri için uygun format ve uzunlukta ol
5. SEO uyumlu anahtar kelimeleri hedef dilde yerleştir
6. Ürün özelliklerini ve faydalarını mermi noktaları ile listele
7. Harekete geçirici bir kapanış ekle`;

      const content = await askAI(systemPrompt, userPrompt);
      const qualityScore = deriveScore(content, 70, 96);
      const wc = wordCount(content);

      // Persist to DB
      try {
        await db.aiContentJob.create({
          data: {
            productId: productId ?? '',
            productName: name,
            type: 'translation',
            sourceLanguage: src,
            targetLanguage: tgt,
            targetMarketplace: mp,
            generatedText: content,
            wordCount: wc,
            qualityScore,
            status: 'completed',
            storeId: 'default',
          },
        });
      } catch {
        // DB save is non-critical
      }

      return NextResponse.json({
        success: true,
        content,
        qualityScore,
        wordCount: wc,
      });
    }

    // ─── Legacy: plain DB create (no action) ─────────────────────────────
    const keywords =
      body.keywords !== undefined
        ? typeof body.keywords === 'string'
          ? body.keywords
          : JSON.stringify(body.keywords)
        : '[]';

    const job = await db.aiContentJob.create({
      data: {
        productId: body.productId ?? '',
        productName: body.productName ?? '',
        sku: body.sku ?? '',
        type: body.type ?? 'description',
        sourceLanguage: body.sourceLanguage ?? 'tr',
        targetLanguage: body.targetLanguage ?? '',
        targetMarketplace: body.targetMarketplace ?? '',
        inputText: body.inputText ?? '',
        generatedText: body.generatedText ?? '',
        keywords,
        tone: body.tone ?? 'professional',
        wordCount: body.wordCount ?? 0,
        qualityScore: body.qualityScore ?? 0,
        status: body.status ?? 'pending',
        error: body.error ?? '',
        applied: body.applied ?? false,
        storeId: body.storeId ?? 'default',
      },
    });

    return NextResponse.json(job, { status: 201, next: { revalidate: 0 } });
  } catch (error) {
    console.error('[AI-CONTENT] Error:', error);
    return NextResponse.json(
      {
        error: 'İçerik oluşturma sırasında bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 },
    );
  }
}

// PUT — Update an AI content job (mark completed, applied, etc.)
export async function PUT(req: Request) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();

    // Normalize array fields
    const updateData: Record<string, unknown> = { ...body };
    if (updateData.keywords !== undefined) {
      updateData.keywords =
        typeof updateData.keywords === 'string'
          ? updateData.keywords
          : JSON.stringify(updateData.keywords);
    }

    const job = await db.aiContentJob.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(job, { next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update AI content job' },
      { status: 500 },
    );
  }
}

// DELETE — Delete an AI content job
export async function DELETE(req: Request) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.aiContentJob.delete({ where: { id } });

    return NextResponse.json({ success: true }, { next: { revalidate: 0 } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete AI content job' },
      { status: 500 },
    );
  }
}
