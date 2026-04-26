# App Manifesto: API (Backend)

OmniCore'un ana sunucu uygulamasıdır. NestJS mimarisi üzerine kurulu olup, tüm kütüphaneleri (`libs`) bir araya getirerek dış dünyaya (Dashboard ve Pazar Yerleri) servis eder.

## 1. Mimari Katmanlar

| Klasör | Görevi |
| :--- | :--- |
| `controllers/` | REST API uç noktaları. Dashboard buradan beslenir. |
| `middleware/` | `channel.middleware.ts` gibi RLS bağlamını (channelId) her istekte yakalayan yapılar. |
| `cron/` | Otomatik stok/fiyat senkronizasyonu gibi zamanlanmış görevler. |
| `feed-optimization/` | Ürün beslemelerinin (XML/JSON) kalitesini ve A/B testlerini yöneten servisler. |
| `procurement/` | Tedarikçi, Satın Alma Siparişi ve Fatura yönetimi (ERP özellikleri). |

## 2. İstek Yaşam Döngüsü (Request Lifecycle)

1.  **Middleware:** Gelen her istek `ChannelMiddleware` tarafından taranır. Header içindeki `x-channel-id` yakalanır ve `nestjs-cls` içine atılır.
2.  **Controller:** İlgili controller isteği karşılar (Örn: `ProductController`).
3.  **Library Access:** Controller, iş mantığı için ilgili kütüphane servisini çağırır (Örn: `PimService`).
4.  **Database Extension:** Kütüphane veritabanına giderken Prisma Extension devreye girer ve RLS kısıtlamasını uygular.
5.  **Response:** Sonuç geri döndürülür. Eğer asenkron bir işlemse (Stok Sync), `QueueService` üzerinden iş BullMQ'ya atılır.

## 3. Geliştirme Kuralları (Ajanlar İçin)

1.  **DTO Kullanımı:** Her uç nokta (endpoint) için mutlaka `class-validator` ile doğrulanmış bir DTO tanımlanmalıdır.
2.  **Exception Filters:** Hatalar `AllExceptionsFilter` üzerinden geçirilerek standart bir formatta döndürülmelidir.
3.  **Swagger:** Her uç nokta `@ApiTags` ve `@ApiOperation` ile dökümante edilmelidir.
4.  **Injections:** Servisler arası bağımlılıklar daima constructor injection ile yönetilmeli, kütüphane modülleri `AppModule` içinde import edilmelidir.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
