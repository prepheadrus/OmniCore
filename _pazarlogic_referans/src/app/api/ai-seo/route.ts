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

// ── Helper: persist analysis to DB ──────────────────────────────────────
async function saveAnalysis(
  type: string,
  query: string,
  result: Record<string, unknown>,
  score: number,
) {
  return db.seoAnalysis.create({
    data: {
      type,
      query,
      result: JSON.stringify(result),
      score,
      storeId: 'default',
    },
  });
}

// ── POST handler ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      // ─── 1. Keyword Analysis ─────────────────────────────────────────
      case 'keyword-analysis': {
        const { keyword, marketplace } = body as {
          keyword: string;
          marketplace?: string;
        };

        if (!keyword) {
          return NextResponse.json(
            { error: 'keyword parametresi zorunludur' },
            { status: 400 },
          );
        }

        const mp = marketplace ?? 'Trendyol';

        const systemPrompt = `Sen Türkiye pazarı için uzman bir SEO analisti ve e-ticaret danışmanısın.
Kullanıcılara Türkçe, kapsamlı ve eyleme geçirilebilir SEO analizleri sunuyorsun.
Markdown formatını kullanarak yanıt ver. Rakamlar ve tahminler Türkiye pazarı gerçeklerine dayanmalıdır.`;

        const userPrompt = `"${keyword}" anahtar kelimesi için ${mp} pazaryerinde kapsamlı bir SEO anahtar kelime analizi yap.

Aşağıdaki başlıklarda detaylı analiz sun:
1. **Anahtar Kelime Hacmi ve Trend**: Aylık arama hacmi tahmini, mevsimsel trendler, büyüme yönü
2. **Rekabet Seviyesi**: Düşük/Orta/Yüksek rekabet analizi, zorluk puanı (1-100)
3. **İlgili Uzun Kuyruk Anahtar Kelimeler**: En az 10 tane ilgili long-tail keyword öner
4. **Arama Niyeti Analizi**: Bilgi, navigasyon, işlem niyeti dağılımı
5. **${mp} SEO Stratejisi**: Bu pazaryeri için optimize edilmiş başlık, açıklama ve etiket önerileri
6. **Tahmini Tıklama Maliyeti ve Dönüşüm Oranı**: PPC maliyet tahmini ve organik dönüşüm beklentisi
7. **İçerik Önerileri**: Bu keyword etrafında oluşturulabilecek içerik fikirleri (blog, ürün açıklaması vb.)
8. **Risk ve Fırsat Analizi**: Bu keyword'ün potansiyel riskleri ve fırsatları`;

        const aiResponse = await askAI(systemPrompt, userPrompt);

        const result = {
          keyword,
          marketplace: mp,
          analysis: aiResponse,
          analyzedAt: new Date().toISOString(),
        };

        // Derive a simple score from AI response length (heuristic for completeness)
        const score = Math.min(
          100,
          Math.max(20, Math.round(aiResponse.length / 15)),
        );

        await saveAnalysis('keyword-analysis', keyword, result, score);

        return NextResponse.json({ success: true, data: result, score });
      }

      // ─── 2. Content Optimization ─────────────────────────────────────
      case 'content-optimization': {
        const { title, description, keywords } = body as {
          title: string;
          description: string;
          keywords?: string;
        };

        if (!title || !description) {
          return NextResponse.json(
            { error: 'title ve description parametreleri zorunludur' },
            { status: 400 },
          );
        }

        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir ürün içerik optimizasyon uzmanısın.
Ürün başlıklarını, açıklamalarını ve SEO metriklerini optimize ediyorsun.
Markdown formatını kullan. Tüm öneriler Türkçe olmalıdır.`;

        const userPrompt = `Aşağıdaki ürün içeriğini SEO açısından optimize et:

**Mevcut Başlık**: ${title}
**Mevcut Açıklama**: ${description}
**Hedef Anahtar Kelimeler**: ${keywords ?? 'Otomatik analiz'}

Aşağıdakileri sağla:
1. **Başlık Optimizasyonu**: En az 3 farklı optimize edilmiş başlık önerisi (60-150 karakter arası)
2. **Açıklama Optimizasyonu**: SEO dostu, satış odaklı yeni ürün açıklaması (HTML etiketleri ile)
3. **Mevcut İçerik Skoru**: 100 üzerinden mevcut SEO kalite puanı ve detaylı açıklama
4. **Anahtar Kelime Yoğunluğu**: Anahtar kelime kullanım sıklığı ve öneriler
5. **Okunabilirlik Analizi**: Cümle uzunluğu, paragraf yapısı ve okunabilirlik puanı
6. **Eksik Ögeler**: Ürün içeriğinde eksik olan SEO elementleri
7. **Satış Artırıcı İpuçları**: Dönüşüm oranı artırmak için içerik önerileri
8. **A/B Test Önerileri**: Farklı başlık ve açıklama kombinasyonları`;

        const aiResponse = await askAI(systemPrompt, userPrompt);

        const result = {
          originalTitle: title,
          originalDescription: description,
          keywords: keywords ?? '',
          optimizedContent: aiResponse,
          optimizedAt: new Date().toISOString(),
        };

        const score = Math.min(
          100,
          Math.max(20, Math.round(aiResponse.length / 15)),
        );

        await saveAnalysis(
          'content-optimization',
          `${title} - ${description.substring(0, 80)}`,
          result,
          score,
        );

        return NextResponse.json({ success: true, data: result, score });
      }

      // ─── 3. Meta Tag Generator ──────────────────────────────────────
      case 'meta-generator': {
        const { productName, category, features } = body as {
          productName: string;
          category?: string;
          features?: string;
        };

        if (!productName) {
          return NextResponse.json(
            { error: 'productName parametresi zorunludur' },
            { status: 400 },
          );
        }

        const cat = category ?? 'Genel';
        const feat = features ?? '';

        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir meta etiketi ve SEO meta verisi oluşturucusun.
Ürünler için SEO-optimizeli meta başlıkları, açıklamaları ve yapılandırılmış veriler üretiyorsun.
Markdown formatını kullan. Tüm içerik Türkçe olmalıdır.`;

        const userPrompt = `Aşağıdaki ürün için kapsamlı SEO meta etiketleri oluştur:

**Ürün Adı**: ${productName}
**Kategori**: ${cat}
**Özellikler**: ${feat}

Aşağıdaki meta etiketlerini üret:
1. **Meta Title**: En az 5 farklı SEO-optimizeli başlık (60-70 karakter arası, pazaryer kurallarına uygun)
2. **Meta Description**: En az 3 farklı meta açıklama (150-160 karakter arası)
3. **Open Graph Etiketleri**: og:title, og:description, og:type, og:image önerileri
4. **Twitter Card Etiketleri**: twitter:card, twitter:title, twitter:description
5. **Canonical URL Önerisi**: URL yapısı önerisi
6. **Schema.org Yapılandırılmış Verisi**: JSON-LD formatında Product schema
7. **H1-H3 Başlık Hiyerarşisi**: İçerik için başlık yapısı önerisi
8. **Alt Text Önerileri**: Ürün görselleri için alternatif metin önerileri
9. **Keywords Meta**: Virgülle ayrılmış anahtar kelime listesi
10. **Robots Meta**: İndeksleme ve takip önerileri`;

        const aiResponse = await askAI(systemPrompt, userPrompt);

        const result = {
          productName,
          category: cat,
          features: feat,
          metaTags: aiResponse,
          generatedAt: new Date().toISOString(),
        };

        const score = Math.min(
          100,
          Math.max(20, Math.round(aiResponse.length / 12)),
        );

        await saveAnalysis(
          'meta-generator',
          productName,
          result,
          score,
        );

        return NextResponse.json({ success: true, data: result, score });
      }

      // ─── 4. SEO Audit ───────────────────────────────────────────────
      case 'seo-audit': {
        const { title, description, category, price } = body as {
          title: string;
          description: string;
          category?: string;
          price?: number;
        };

        if (!title || !description) {
          return NextResponse.json(
            { error: 'title ve description parametreleri zorunludur' },
            { status: 400 },
          );
        }

        const cat = category ?? 'Belirtilmedi';
        const prc = price ?? 0;

        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir SEO denetçisisin.
Ürün listelemelerinin SEO uyumluluğunu detaylı şekilde analiz ediyorsun.
Markdown formatını kullan. Tüm analiz Türkçe olmalı ve somut öneriler içermelidir.`;

        const userPrompt = `Aşağıdaki ürün listelemesini kapsamlı bir SEO denetiminden geçir:

**Ürün Başlığı**: ${title}
**Ürün Açıklaması**: ${description}
**Kategori**: ${cat}
**Fiyat**: ${prc > 0 ? `${prc} TL` : 'Belirtilmedi'}

Aşağıdaki kriterleri 100 puanlık ölçekte değerlendir:
1. **Genel SEO Puanı**: Toplam puan ve ağırlıklı ortalama
2. **Başlık Analizi** (0-100):
   - Karakter uzunluğu optimizasyonu
   - Anahtar kelime yerleşimi
   - Marka/özellik kullanımı
   - Pazaryeri kurallarına uygunluk
3. **Açıklama Analizi** (0-100):
   - Uzunluk ve zenginlik
   - Anahtar kelime yoğunluğu
   - Satış odaklı dil
   - Teknik özellik içeriği
4. **Kategori ve Etiket Uyumu** (0-100):
   - Doğru kategori yerleşimi
   - Etiket optimizasyonu
5. **Fiyat ve Değer Algısı** (0-100):
   - Fiyat transparanlığı
   - Değer önerisi
6. **Eksik Elementler**: Tamamlanması gereken SEO öğeleri listesi
7. **Acil İyileştirme Önerileri**: Öncelik sırasına göre düzeltilecek maddeler (Kırmızı/Sarı/Yeşil)
8. **Rekabet Avantajı**: Bu ürüne özel SEO avantajları
9. **Pazaryeri Uyumluluğu**: Trendyol, Hepsiburada, n11 kurallarına uygunluk
10. **Detaylı Rapor**: Her kriter için puan ve açıklama`;

        const aiResponse = await askAI(systemPrompt, userPrompt);

        // Extract overall score from AI response
        let extractedScore = 65;
        const scoreMatch = aiResponse.match(/(?:genel\s*seo\s*puan[ıi]|toplam\s*puan)[^\d]*(\d{1,3})/i);
        if (scoreMatch) {
          extractedScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
        }

        const result = {
          title,
          description,
          category: cat,
          price: prc,
          audit: aiResponse,
          auditedAt: new Date().toISOString(),
        };

        await saveAnalysis(
          'seo-audit',
          `${title} - ${cat}`,
          result,
          extractedScore,
        );

        return NextResponse.json({
          success: true,
          data: result,
          score: extractedScore,
        });
      }

      // ─── 5. Content Strategy ────────────────────────────────────────
      case 'content-strategy': {
        const { category, marketplace, targetAudience } = body as {
          category: string;
          marketplace?: string;
          targetAudience?: string;
        };

        if (!category) {
          return NextResponse.json(
            { error: 'category parametresi zorunludur' },
            { status: 400 },
          );
        }

        const mp = marketplace ?? 'Genel';
        const audience = targetAudience ?? 'Genel Tüketici';

        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir SEO içerik stratejistisin.
Kategoriler ve pazaryerleri için kapsamlı içerik stratejileri oluşturuyorsun.
Markdown formatını kullan. Tüm içerik Türkçe olmalı ve eyleme geçirilebilir olmalıdır.`;

        const userPrompt = `"${category}" kategorisi için ${mp} pazaryerinde, "${audience}" hedef kitleye yönelik kapsamlı bir SEO içerik stratejisi oluştur.

Aşağıdaki başlıklarda strateji sun:
1. **Pazar Analizi**: ${category} kategorisinde Türkiye pazarı büyüklüğü, trendler ve fırsatlar
2. **Hedef Kitle Profili**: Demografik özellikler, satın alma davranışları, arama alışkanlıkları
3. **Anahtar Kelime Stratejisi**: 
   - Birincil anahtar kelimeler (en yüksek hacim)
   - İkincil anahtar kelimeler
   - Long-tail fırsatlar
   - Mevsimsel keyword'ler
4. **İçerik Takvimi**: 3 aylık içerik yayınlama planı (haftalık bazda)
5. **Ürün İçerik Şablonları**: 
   - Optimize ürün başlığı şablonu
   - Ürün açıklama şablonu
   - Özellik tablosu formatı
6. **Blog / İçerik Pazarlama Fikirleri**: En az 10 blog başlığı ve kısa açıklamaları
7. **${mp} Özel Strateji**: Bu pazaryerinin algoritmasına uygun optimizasyon önerileri
8. **Performans Metrikleri**: Takip edilmesi gereken KPI'lar ve hedef değerler
9. **Rakip İçerik Analizi**: Rakiplerin içerik stratejileri ve önerilen farklılaşma yolları
10. **Bütçe ve Kaynak Planlaması**: İçerik üretimi için önerilen bütçe dağılımı`;

        const aiResponse = await askAI(systemPrompt, userPrompt);

        const result = {
          category,
          marketplace: mp,
          targetAudience: audience,
          strategy: aiResponse,
          createdAt: new Date().toISOString(),
        };

        const score = Math.min(
          100,
          Math.max(20, Math.round(aiResponse.length / 18)),
        );

        await saveAnalysis(
          'content-strategy',
          `${category} - ${mp}`,
          result,
          score,
        );

        return NextResponse.json({ success: true, data: result, score });
      }

      // ─── 6. Competitor Analysis ─────────────────────────────────────
      case 'competitor-analysis': {
        const { competitor, keyword, marketplace } = body as {
          competitor: string;
          keyword?: string;
          marketplace?: string;
        };

        if (!competitor) {
          return NextResponse.json(
            { error: 'competitor parametresi zorunludur' },
            { status: 400 },
          );
        }

        const kw = keyword ?? '';
        const mp = marketplace ?? 'Genel';

        const systemPrompt = `Sen Türkiye e-ticaret pazarında uzman bir rekabet analisti ve SEO danışmanısın.
Rakip satıcıların ve markaların SEO stratejilerini analiz ediyorsun.
Markdown formatını kullan. Tüm analiz Türkçe olmalıdır.`;

        const userPrompt = `"${competitor}" rakip analizini gerçekleştir${kw ? ` - Odak anahtar kelime: "${kw}"` : ''}. ${mp} pazaryeri bağlamında analiz yap.

Aşağıdaki başlıklarda detaylı rekabet analizi sun:
1. **Rakip Genel Profili**: ${competitor} hakkında pazar konumu, güçlü yönler, zayıf yönler
2. **SEO Strateji Analizi**: Rakibin SEO yaklaşımı, anahtar kelime hedefleri, içerik stratejisi
3. **Ürün Listeleme Analizi**:
   - Başlık ve açıklama kalitesi
   - Görsel kullanım stratejisi
   - Fiyatlandırma yaklaşımı
4. **Anahtar Kelime Rekabeti**${kw ? ` - Özellikle "${kw}" için` : ''}:
   - Rakibin kullandığı anahtar kelimeler
   - Organik sıralama tahmini
   - Rekabet avantajları
5. **İçerik ve Blog Stratejisi**: Rakibin içerik pazarlama yaklaşımı
6. **Backlink ve Otorite Analizi**: Web sitesi otoritesi ve link profili tahmini
7. **Müşteri Yorumları ve Sosyal Kanıt**: Rakibin müşteri yorumlarından çıkarılacak dersler
8. **Fırsat Pencereleri**: Rakibin zayıf olduğu alanlar ve sizin avantaj sağlayabileceğiniz noktalar
9. **Önerilen Aksiyon Planı**: Rakibe karşı üstünlük kurmak için adım adım strateji
10. **SWOT Analizi**: ${competitor} için detaylı SWOT tablosu`;

        const aiResponse = await askAI(systemPrompt, userPrompt);

        const result = {
          competitor,
          keyword: kw,
          marketplace: mp,
          analysis: aiResponse,
          analyzedAt: new Date().toISOString(),
        };

        const score = Math.min(
          100,
          Math.max(20, Math.round(aiResponse.length / 15)),
        );

        await saveAnalysis(
          'competitor-analysis',
          `${competitor} - ${kw || mp}`,
          result,
          score,
        );

        return NextResponse.json({ success: true, data: result, score });
      }

      // ─── Unknown action ─────────────────────────────────────────────
      default: {
        return NextResponse.json(
          {
            error: `Bilinmeyen aksiyon: "${action ?? 'tanımsız'}"`,
            availableActions: [
              'keyword-analysis',
              'content-optimization',
              'meta-generator',
              'seo-audit',
              'content-strategy',
              'competitor-analysis',
            ],
          },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error('[AI-SEO] Error:', error);
    return NextResponse.json(
      {
        error: 'SEO analizi sırasında bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 },
    );
  }
}
