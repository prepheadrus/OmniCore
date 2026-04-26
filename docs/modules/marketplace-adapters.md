# Module Manifesto: Marketplace Adapters (`libs/marketplace-adapters`)

Bu modül, dış pazar yerleri (Trendyol, Hepsiburada, Amazon vb.) ile OmniCore arasındaki köprüdür. Her pazar yerinin farklı dillerini (API yapılarını) ortak bir dile (Standard DTOs) çevirir.

## 1. Temel Bileşenler

| Bileşen | Dosya Yolu | Görevi |
| :--- | :--- | :--- |
| **Interfaces** | `src/lib/interfaces/` | Tüm adaptörlerin uyması gereken `IOrderSync` ve `IProductSync` sözleşmeleri. |
| **Standard DTOs** | `src/lib/dtos/` | Sistemin iç dünyasında kullanılan `StandardOrderDto` ve `StandardProductDto` tanımları. |
| **Trendyol Adapter** | `src/lib/adapters/trendyol.adapter.ts` | Trendyol API'si için somut (concrete) implementasyon. |
| **Exceptions** | `src/lib/exceptions/` | Pazar yerine özgü doğrulama ve bağlantı hataları. |

## 2. Mimari Kurallar (Ajanlar İçin)

1.  **Doğrudan İstek Yasağı:** Domain servisleri asla pazar yeri API'lerine doğrudan istek atamaz. Mutlaka buradaki adaptörleri kullanmalıdır.
2.  **Adaptör Deseni:** Yeni bir pazar yeri eklenecekse, `IOrderSync` ve `IProductSync` interfacelerini implement eden yeni bir sınıf oluşturulmalıdır.
3.  **Veri Dönüşümü:** Adaptör içindeki tüm ham veriler (Raw JSON), sisteme geri dönmeden önce mutlaka `StandardOrderDto` veya `StandardProductDto` formatına map'lenmelidir.
4.  **Hız Sınırı (Rate Limit):** Adaptörler kendi içinde `Token Bucket` kontrolü yapmaz; bu kontrol `queue-management` seviyesinde yapılır ancak adaptörler `429 Too Many Requests` hatasını doğru fırlatmalıdır.

## 3. Yeni Bir Adaptör Ekleme Adımları

1.  `src/lib/interfaces/` altındaki arayüzleri incele.
2.  `src/lib/adapters/` altında yeni bir dosya oluştur (Örn: `amazon.adapter.ts`).
3.  Arayüzdeki tüm metodları implement et.
4.  Dış pazar yeri API modellerini iç DTO'lara dönüştüren mapper metodlarını yaz.
5.  Yeni adaptörü `MarketplaceAdaptersModule` içinde export et.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
