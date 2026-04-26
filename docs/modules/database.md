# Module Manifesto: Database (`libs/database`)

Bu modül OmniCore'un veri katmanıdır. Sadece veri saklamakla kalmaz, aynı zamanda pazar yerleri arasındaki veri izolasyonunu (RLS) ve AI önbellek tutarlılığını da sağlar.

## 1. Temel Bileşenler

| Bileşen | Dosya Yolu | Görevi |
| :--- | :--- | :--- |
| **Prisma Schema** | `prisma/schema.prisma` | Veritabanı şeması ve ilişkilerin tanımı. |
| **Database Service** | `src/lib/database.service.ts` | Prisma Client'ı genişleten (extension) ve RLS kontrolü yapan ana servis. |
| **Seeding** | `src/lib/seed.ts` | Geliştirme ortamı için başlangıç verilerinin oluşturulması. |

## 2. Mimari Kurallar (Ajanlar İçin)

1.  **RLS (Row Level Security) Zorunluluğu:** `GLOBAL_MODELS` (Tedarikçi, Kategori, Marka vb.) haricindeki tüm modellere erişirken `channel_id` bağlamı (context) zorunludur. Bağlam yoksa sistem `UnauthorizedException` fırlatır.
2.  **Context-Free Erişim Yasağı:** Veritabanına doğrudan (servis dışı) erişim denemeleri mimari bir hatadır. Daima `DatabaseService.client` kullanılmalıdır.
3.  **Otomatik Önbellek Temizleme:** `Product` tablosunda yapılan isim, açıklama veya özellik güncellemeleri otomatik olarak `product.cache.invalidate` olayını tetikler. Bu, AI önbelleğinin (Semantic Cache) taze kalmasını sağlar.
4.  **Global Modeller:** Aşağıdaki modeller kanal bağımsızdır ve her yerden erişilebilir:
    *   `Supplier`, `Brand`, `Category`, `StockMovement` vb.

## 3. Sorgu Akışı

1.  **İstek Gelir:** API katmanında `nestjs-cls` üzerinden `channel_id` set edilir.
2.  **Sorgu Çalışır:** Prisma Client Extension devreye girer.
3.  **Güvenlik Kontrolü:** Model global değilse `channel_id` varlığı kontrol edilir.
4.  **İşlem Tamamlanır:** Eğer bir ürünün anlamını değiştiren bir güncelleme yapıldıysa asenkron olarak önbellek temizleme mesajı yayınlanır.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
