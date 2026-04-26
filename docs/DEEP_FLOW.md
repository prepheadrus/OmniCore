# OmniCore: Deep Flow Blueprint

Bu döküman, bir işlemin (Örn: Sipariş Senkronizasyonu) OmniCore ekosistemi içindeki uçtan uca yolculuğunu anlatır.

## 🌀 Akış 1: Siparişlerin Pazar Yerinden Çekilmesi

1.  **Trigger:** `api` uygulaması içindeki `sync.cron.ts` her 5 dakikada bir tetiklenir.
2.  **Queue:** Cron, her kanal için `MarketplaceSyncWorker` kuyruğuna bir "OrderSync" işi ekler.
3.  **Worker:** `queue-management` içindeki worker işi alır.
4.  **Adapter:** `marketplace-adapters` içindeki ilgili adaptör (Örn: `TrendyolAdapter`) çağrılır.
5.  **API Call:** Adaptör, pazar yeri API'sine istek atar, ham veriyi alır ve `StandardOrderDto`ya çevirir.
6.  **Database:** `DatabaseService` aracılığıyla siparişler veritabanına yazılır (RLS bağlamı ile).
7.  **Broadcast:** İşlem bitince bir event yayınlanır, gerekirse `invoice-adapters` üzerinden fatura süreci başlar.

## 🌀 Akış 2: AI Destekli Ürün Optimizasyonu

1.  **Trigger:** Kullanıcı `dashboard` üzerinden bir ürünün açıklamasını iyileştirmek ister.
2.  **Request:** Dashboard, `api` üzerindeki `AiAgentController`'a istek atar.
3.  **Shield:** `ai-agents` içindeki `PiiShieldService` ürün açıklamasını tarar, kişisel veri varsa maskeler.
4.  **Orchestrator:** `AgentOrchestrator` devreye girer ve `seo-description.node.ts` düğümüne yönlendirir.
5.  **LLM:** Gemini/OpenAI optimize edilmiş içeriği üretir.
6.  **Cache:** Yeni içerik `SemanticCacheService` üzerinden Redis'e yazılır.
7.  **Response:** Maskeler kaldırılarak kullanıcıya sunulur.

## 🌀 Akış 3: Dinamik Fiyat Güncelleme

1.  **Trigger:** Bir rakip fiyatı değişir veya maliyet güncellenir.
2.  **Strategy:** `pricing` modülü devreye girer, ürünün stratejisine göre (BuyBox vb.) yeni fiyat hesaplar.
3.  **Validation:** Fiyat, maliyet ve kar marjı kontrollerinden geçer.
4.  **Sync:** Yeni fiyat `MarketplaceSyncWorker` üzerinden asenkron olarak pazar yerine itilir.

---
*Bu döküman OmniCore'un sinir sistemini temsil eder.*
*Son Güncelleme: 2026-04-26 - Tatiana*
