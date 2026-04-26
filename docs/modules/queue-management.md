# Module Manifesto: Queue Management (`libs/queue-management`)

Bu modül, OmniCore'un "asenkron motoru"dur. Pazar yeri API'leri, kargo bildirimleri ve fatura süreçleri gibi zaman alan veya hız sınırı (rate-limit) olan tüm işlemleri BullMQ kullanarak kuyruğa alır ve yönetir.

## 1. Temel Bileşenler

| Bileşen | Dosya Yolu | Görevi |
| :--- | :--- | :--- |
| **Core Queue Service** | `src/lib/services/core-queue.service.ts` | İşleri (jobs) kuyruğa ekleyen merkezi servis. |
| **Marketplace Worker** | `src/lib/workers/marketplace-sync.worker.ts` | Pazar yeri sipariş ve stok senkronizasyon işlerini tüketen işçi. |
| **Cargo Worker** | `src/lib/workers/cargo.worker.ts` | Kargo takip ve etiket oluşturma işlemlerini yapan işçi. |
| **Invoice Worker** | `src/lib/workers/invoice.worker.ts` | E-fatura ve e-arşiv süreçlerini yöneten işçi. |

## 2. Mimari Kurallar (Ajanlar İçin)

1.  **Dış API İstekleri Kuyruğa!** Pazar yeri API'lerine atılacak her türlü istek (özellikle yazma işlemleri) asenkron olmalı ve bir kuyruk üzerinden geçmelidir.
2.  **Üstel Geri Çekilme (Exponential Backoff):** Hız sınırı (429) hataları durumunda BullMQ'nun `backoff` stratejisi kullanılmalıdır.
3.  **Kuyruk İsimleri:** Yeni bir kuyruk eklenecekse `src/lib/constants/queue.constants.ts` dosyasına kaydedilmelidir.
4.  **Hata Yönetimi:** Worker'lar içinde yakalanmayan hatalar BullMQ tarafından "failed" olarak işaretlenir. Kritik hatalar için mutlaka `onFailed` listener'ları tanımlanmalıdır.

## 3. Kuyruk Akışı

1.  **Job Tanımlanır:** API veya bir servis bir işlem yapmak ister (Örn: "Stok Güncelle").
2.  **Add to Queue:** `CoreQueueService` aracılığıyla işlem Redis üzerindeki BullMQ kuyruğuna eklenir.
3.  **Processing:** Boştaki bir Worker işi alır ve Marketplace Adapter üzerinden API isteğini atar.
4.  **Completion/Retry:** İşlem başarılıysa tamamlanır, başarısızsa (ve hata uygunsa) belirli aralıklarla tekrar denenir.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
