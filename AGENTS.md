# 1. Proje Bağlamı ve Genel Mimari (Project Context)
* Bu proje, Trendyol, Hepsiburada ve Amazon gibi pazar yerlerini tek bir merkezden yöneten, tekil satıcıya özel (Single-Tenant) kurumsal bir e-ticaret SaaS platformudur.
* Sistem modüler monolit (Modular Monolith) yapısında olup, Nx (Turborepo DEĞİL) monorepo mimarisi ile yönetilmektedir.
* Arka uç (Backend) uygulamaları Node.js ve NestJS, ön uç (Frontend) uygulamaları Next.js ve React kullanılarak geliştirilir.
* Paket yöneticisi olarak yalnızca pnpm kullanılmalıdır.

# 2. Mimari Kurallar ve Kısıtlamalar (MANDATORY ARCHITECTURE RULES)

## 2.1 Veritabanı ve Güvenlik (PostgreSQL, Prisma, RLS)
* Tüm veritabanı işlemleri Prisma ORM ile yapılacaktır.
* Uygulama tek satıcıya hizmet etse de, farklı pazar yeri satış kanallarının verileri PostgreSQL Satır Düzeyinde Güvenlik (RLS - Row-Level Security) ile izole edilmelidir.
* KURAL: Hiçbir Prisma sorgusu bağlam (context) olmadan doğrudan çağrılamaz.
* Tüm veritabanı bağlantıları nestjs-cls ve Prisma Client Extensions ($extends) kullanılarak genişletilmelidir. Her sorgudan önce mutlaka etkileşimli işlem ($transaction) başlatılmalı ve SELECT set_config('app.tenant_id', id, TRUE) SQL komutu çalıştırılmalıdır.

## 2.2 Pazar Yeri Entegrasyonları ve Adapter Deseni
* Dış pazar yeri API'lerine doğrudan apps/api (Domain) içerisinden istek atılamaz.
* Tüm pazar yeri entegrasyonları libs/marketplace-adapters dizini altında izole edilmelidir.
* Her adaptör sınıfı ortak IOrderSync ve IProductSync arayüzlerini (interfaces) uygulamak (implement) zorundadır. Veriler daima iç standart Veri Transfer Objelerine (DTO) dönüştürülmelidir.

## 2.3 API İstekleri ve Hız Sınırı (Rate Limiting)
* Dış API çağrıları asla senkron olarak yapılmamalıdır. Talepler her zaman RabbitMQ veya BullMQ üzerinden kuyruklanmalıdır.
* Pazar yerlerinin hız sınırlarını (Örn. Trendyol 1000 req/min) aşmamak için Redis tabanlı 'Token Bucket' (Jeton Kovası) algoritması uygulanmalıdır.
* API'den HTTP 429 hatası dönerse, 'Üstel Geri Çekilme' (Exponential Backoff) kullanılarak mesajlar Dead Letter Queue üzerinden tekrar denenmelidir.

## 2.4 Yapay Zeka, LangGraph ve PII Koruması
* LLM tabanlı çoklu ajan (Multi-Agent) orkestrasyonu için sadece LangGraph kullanılacaktır.
* KURAL: Müşteri verileri içeren metinler LLM'e (Gemini/OpenAI) gönderilmeden önce MUTLAKA PII Maskeleme Ara Katmanından (PII Redaction Middleware) geçirilerek isim, telefon ve adres bilgileri `[REDACTED]` formatıyla değiştirilmelidir.

# 3. Komutlar ve Kurulum (Build & Setup Commands)
* Bağımlılıkların Kurulumu: pnpm install
* Arka Uç Geliştirme Sunucusu: pnpm nx serve api
* Ön Uç Geliştirme Sunucusu: pnpm nx serve dashboard
* Yeni Kütüphane Üretme (Nx Generator): pnpm nx g @nx/nest:lib <lib-name>
* Tüm Testleri Çalıştırma: pnpm nx run-many -t test

# 4. Kodlama Stilleri ve İnceleme (Code Style)
* Yalnızca katı kurallı TypeScript kullanılmalıdır. "any" tipinin kullanılması kesinlikle yasaktır.
* Yazılan her servis metodu için Jest kullanılarak kapsamlı birim (unit) testleri yazılmalıdır.
* GitHub Pull Request mesajları 'Conventional Commits' standardına uymalıdır.