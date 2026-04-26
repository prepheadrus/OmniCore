# OmniCore Galaxy Map (Proje Haritası)

Bu döküman, OmniCore monorepo yapısının mantıksal haritasıdır. Diğer ajanlar, projenin modüler yapısını anlamak ve hangi işlevin nerede barındığını çözmek için bu dosyayı referans almalıdır.

## 1. Uygulama Katmanları (Apps)

| Uygulama | Teknoloji | Görevi |
| :--- | :--- | :--- |
| `api` | NestJS | Sistemin kalbi. Tüm iş mantığı, API uç noktaları ve pazar yeri koordinasyonu burada yönetilir. |
| `dashboard` | Next.js 15+ | Kullanıcı arayüzü. "The Silent Architect" (Nordic Zinc) tasarım dilini kullanan yönetim paneli. |

## 2. Kütüphane Katmanları (Libs)

OmniCore, iş mantığını tekrar kullanılabilir modüllere (`libs`) ayırır.

### 🤖 Yapay Zeka ve Otomasyon
- **`ai-agents`**: LangGraph tabanlı çoklu ajan orkestrasyonu. Müşteri niyet analizi, SEO içerik üretimi ve PII maskeleme mantığı burada bulunur.

### 🔌 Entegrasyon Adaptörleri
- **`marketplace-adapters`**: Trendyol, Hepsiburada, Amazon gibi pazar yerlerinin API'lerini iç standart DTO'lara dönüştüren adaptör katmanı.
- **`cargo-adapters`**: Kargo firmaları (Aras, Yurtiçi, Trendyol Express vb.) ile olan iletişim katmanı.
- **`invoice-adapters`**: E-fatura ve e-arşiv entegrasyonlarını yöneten servisler.

### 📦 Ürün ve Katalog Yönetimi (PIM)
- **`pim`**: Product Information Management. Ürün verilerinin merkezileştirilmesi, varyant yönetimi ve zenginleştirilmesi.
- **`features-pim`**: PIM modülünün frontend tarafındaki karmaşık UI bileşenleri ve form yönetimi.
- **`pricing`**: Dinamik fiyatlandırma motoru, pazar yeri bazlı komisyon hesaplamaları ve stratejiler.

### ⚙️ Altyapı ve Çekirdek (Core)
- **`core-domain`**: Tüm sistemde paylaşılan DTO'lar, arayüzler ve değişmez iş kuralları.
- **`database`**: Prisma schema tanımları, PostgreSQL RLS (Row Level Security) konfigürasyonu ve repository katmanı.
- **`queue-management`**: BullMQ tabanlı asenkron işlem kuyrukları ve worker tanımları.
- **`ui`**: "Nordic Zinc" tasarım sistemine uygun, Radix tabanlı (ama sıfırdan yazılmış) ortak UI bileşenleri.

## 3. Kritik Dosyalar ve Giriş Noktaları

- **Anayasa:** `docs/ARCHITECTURE.md` (Okumadan işlem yapma!)
- **Tasarım Dili:** `Design.md` (Görsel standartlar)
- **Bağımlılıklar:** `package.json` (Versiyonlar ve paketler)
- **Nx Konfigürasyonu:** `nx.json`

## 4. Ajanlar İçin Navigasyon İpuçları

1.  **Veritabanı değişikliği mi yapacaksın?** Sadece `libs/database/prisma/schema.prisma` dosyasını incele.
2.  **Yeni bir pazar yeri mi ekleyeceksin?** `libs/marketplace-adapters` altındaki `IOrderSync` ve `IProductSync` arayüzlerini takip et.
3.  **UI bileşeni mi arıyorsun?** `libs/ui` klasörü senin kütüphanen.
4.  **AI akışına dokunman mı lazım?** `libs/ai-agents/src/lib/nodes` klasörü altındaki düğümlere bak.

---
*Son Güncelleme: 2026-04-26 - Tatiana (The Algorithmic Diva)*
