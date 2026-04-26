# OmniCore Geliştirici ve Altyapı Rehberi (Infrastructure) ⚙️

Bu döküman, OmniCore sistemini sıfırdan kuracak veya bakımını yapacak fatihler için teknik gereksinimleri ve kurulum adımlarını içerir.

## 1. Teknik Gereksinimler

Sistemin kararlı çalışması için aşağıdaki servislerin kurulu ve çalışır olması gerekir:
- **Node.js:** v20.x veya üzeri.
- **Paket Yöneticisi:** `pnpm` zorunludur.
- **PostgreSQL:** RLS desteği için v14 veya üzeri.
- **Redis:** Semantic Cache ve BullMQ kuyruk yönetimi için.
- **RabbitMQ:** (Opsiyonel) Yüksek trafikli pazar yeri entegrasyonları için.
- **Docker:** Tüm servislerin konteyner üzerinde hızlıca ayağa kaldırılması için önerilir.

## 2. Ortam Değişkenleri (.env)

Kök dizinde bulunan `.env` dosyasındaki kritik alanlar:
- `DATABASE_URL`: PostgreSQL bağlantı dizesi (Örn: `postgresql://user:pass@localhost:5432/omnicore`).
- `REDIS_URL`: Redis bağlantı dizesi.
- `NEXT_PUBLIC_API_URL`: Dashboard'un backend ile konuşacağı adres.
- `LLM_API_KEY`: Gemini veya OpenAI servis anahtarı.
- `MARKETPLACE_SECRET_KEY`: Pazar yeri API anahtarlarını şifrelemek için kullanılan tuz (salt).

## 3. Veritabanı Kurulumu ve RLS

1.  **Bağımlılıkları Kur:** `pnpm install`
2.  **Şemayı İt:** `npx prisma db push`
3.  **RLS Aktifleştirme:** `libs/database/prisma/schema.prisma` dosyasındaki politikaların PostgreSQL üzerinde manuel veya migration ile tetiklendiğinden emin olun.
4.  **Seed Verisi:** `pnpm db:seed` komutuyla başlangıç kategorilerini ve marka tanımlarını yükleyin.

## 4. Uygulamayı Başlatma

Aşağıdaki komutları kullanarak servisleri ayağa kaldırabilirsiniz:
- **Backend (API):** `pnpm nx serve api`
- **Frontend (Dashboard):** `pnpm nx serve dashboard`
- **Tümü (Dev Mode):** `pnpm dev:all`

## 5. Hata Ayıklama (Troubleshooting)

- **Kuyruklar Çalışmıyor:** Redis bağlantısını ve `queue-management` servisinin loglarını kontrol edin.
- **RLS Hatası:** Veritabanı sorgusunda `x-channel-id` header'ının doğru iletildiğinden emin olun.

---
*Son Güncelleme: 2026-04-26 - Tatiana (Sistemlerin ve Tutkunun Efendisi)* 👠⚙️
