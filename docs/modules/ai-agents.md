# Module Manifesto: AI Agents (`libs/ai-agents`)

Bu modül, OmniCore'un "beyni"dir. LangGraph kullanarak LLM (Gemini/OpenAI) işlemlerini güvenli, ölçeklenebilir ve akıllı bir şekilde yönetir.

## 1. Temel Bileşenler

| Bileşen | Dosya Yolu | Görevi |
| :--- | :--- | :--- |
| **Orchestrator** | `src/lib/agents/agent-orchestrator.ts` | LangGraph akışını tanımlayan, düğümleri birbirine bağlayan ana beyin. |
| **PII Shield** | `src/lib/services/pii-shield.service.ts` | Müşteri verilerini LLM'e göndermeden önce maskeleyen güvenlik katmanı. |
| **Semantic Cache** | `src/lib/services/semantic-cache.service.ts` | RAG yanıtlarını ürün bazlı olarak süresiz saklayan akıllı önbellek. |
| **SEO Node** | `src/lib/nodes/seo-description.node.ts` | Ürün açıklamalarını optimize eden spesifik bir LangGraph düğümü. |
| **Cache Subscriber** | `src/lib/subscribers/product-cache.subscriber.ts` | Ürün değiştiğinde önbelleği temizleyen olay dinleyici. |

## 2. Mimari Kurallar (Ajanlar İçin)

1.  **Tek Düğüm, Tek Görev:** Her yeni AI yeteneği `src/lib/nodes` altında yeni bir düğüm (node) olarak eklenmelidir. Mevcut düğümleri şişirme!
2.  **PII Maskeleme:** Herhangi bir kullanıcı metnini LLM'e göndermeden önce `PiiShieldService.mask()` metodundan geçirmek **ZORUNLUDUR**.
3.  **Durum Yönetimi:** Akışlar arasındaki veri transferi `src/lib/state/agent.state.ts` dosyasındaki tanımlı state yapısına uygun olmalıdır.
4.  **Araç Kullanımı (Tooling):** Fiyat veya stok gibi dinamik veriler asla LLM'in hafızasından veya önbellekten okunmaz. Daima bir `TOOL` düğümü üzerinden veritabanından çekilmelidir.

## 3. Akış Mantığı (Flow)

Sistem şu sırayla çalışır:
1.  **Giriş:** Kullanıcı talebi veya sistem tetikleyicisi.
2.  **Maskeleme:** PII Shield devreye girer.
3.  **Yönlendirme:** Orchestrator, niyet analizine göre ilgili düğüme (SEO, Destek, Analiz vb.) yönlendirir.
4.  **Önbellek:** Eğer talep ürün bilgisiyle ilgiliyse Semantic Cache kontrol edilir.
5.  **Sonuç:** Yanıt üretilir ve unmasking (maske kaldırma) gerekirse yapılır.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
