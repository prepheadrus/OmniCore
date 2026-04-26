AI YÖNERGESİ: TATIANA, YENİ BİR GÖREVE BAŞLAMADAN VEYA BİR PR OLUŞTURMADAN ÖNCE HER ZAMAN BU DOKÜMANI OKU VE KURALLARA UY.

# Omnicore Proje Anayasası ve Mimari Standartlar

Bu doküman, Omnicore e-ticaret entegrasyon ve yönetim platformunun tek kaynağı (Single Source of Truth) ve "Anayasası" niteliğindedir. Alınan tüm mimari kararlar, teknoloji yığınları ve tasarım ilkeleri burada belgelenmiştir. Geliştirme süreçlerinde bu kurallara istisnasız uyulması zorunludur.

## 1. Monorepo Yapısı ve Organizasyon
- **Çatı Teknolojisi:** Proje, **Nx** kullanılarak yönetilen modüler monolit (Modular Monolith) yapısında bir monorepo'dur.
- **Klasör Yapısı:**
  - `apps/`: Sadece ayağa kaldırılabilir uygulama kabuklarını barındırır (Örn. Next.js arayüzü `dashboard`, NestJS sunucusu `api`).
  - `libs/`: Uygulamanın tüm iş mantığı (Core Domain, Veritabanı, Pazar Yeri Adaptörleri, AI) ve yeniden kullanılabilir bileşenler yalıtılmış kütüphaneler olarak burada yer alır.
- **Paket Yöneticisi:** Yalnızca **pnpm** kullanılacaktır.

## 2. Frontend UI Mimarisi (Next.js & React)
- **Temel Teknolojiler:** Ön uç uygulamaları **Next.js** (App Router) ve **React** kullanılarak geliştirilir.
- **Bileşen Geliştirme (Sıfır Bağımlılık Prensibi):** Sadece standart JSX/HTML ve **Tailwind CSS** kullanılacaktır. Projeyi hafif tutmak ve dış bağımlılığı sıfıra indirmek adına Shadcn, Radix, Material UI gibi harici UI bileşen kütüphaneleri **KESİNLİKLE KURULMAYACAKTIR**. Kartlar, Butonlar, Modallar vb. tüm UI bileşenleri Tailwind sınıfları ve React elementleri kullanılarak sıfırdan oluşturulacaktır. `useState` ve `useEffect` gibi yerel React hook'ları kullanılabilir.
- **Stil Yönetimi:** Renk ve boşluk standartları (8pt Grid Sistemi) Tailwind sınıfları ile katı bir şekilde uygulanacaktır. Tasarım dili için `Design.md` rehber alınmalıdır.

## 3. API İstekleri (Frontend - Backend İletişimi)
- **Teknoloji:** Dış bağımlılığı azaltmak için Axios veya benzeri HTTP istemci paketleri **kullanılmayacaktır**.
- **Standart:** Tüm dış ve iç veri istekleri, modern tarayıcıların sunduğu native `fetch` API'si üzerinden gerçekleştirilecektir.

## 4. Backend ve Altyapı Mimarisi (NestJS)
Sistem arka ucu, yüksek trafik ve eşzamanlı işlem gücü gözetilerek aşağıdaki altın kurallar çerçevesinde inşa edilmiştir:
- **Çatı (Framework):** **NestJS** kullanılacaktır. Tüm servisler Single Responsibility (Tek Sorumluluk) ve Dependency Injection (Bağımlılık Enjeksiyonu) ilkelerine göre yazılır.
- **Veritabanı Motoru:** **PostgreSQL**.
- **ORM:** Tüm veritabanı işlemleri **Prisma** ile gerçekleştirilir.
- **Veri Güvenliği (İzolasyon):** Uygulama Single-Tenant olsa da, PostgreSQL seviyesinde **RLS (Row-Level Security)** kullanılır. Prisma sorguları `nestjs-cls` üzerinden iletilen `channelId` bağlamı ile doğrudan veritabanı düzeyinde filtrelenir.
- **Olay Güdümlü (Event-Driven) Asenkron İşlemler:** Pazar yeri API'leri gibi dışarıya atılan istekler asla senkron yapılmaz. Gelen talepler **BullMQ** üzerinden mesaj kuyruğuna alınarak eritilir.
- **Hız Sınırlandırıcı (Rate Limiting):** Pazar yerlerinin katı hız limitlerini aşmamak için **Redis** kullanılarak matematiksel "Token Bucket" algoritması uygulanır.

## 5. Yapay Zeka (AI) Mimarisi
- **Orkestrasyon:** Otonom müşteri hizmetleri ve SEO süreçleri **LangGraph** ile yönetilir.
- **Ajan Modülerliği:** LangGraph düğümleri kesinlikle **Single Responsibility Prensibine** göre ayrılacaktır.
- **Veri Gizliliği (PII):** Müşteri verileri LLM servisine gönderilmeden önce **PII Redaction Middleware** ile anonimleştirilecektir.

## 6. Dil ve Yerelleştirme Politikası
- **Evrensel Dil:** Uygulamanın tüm arayüz metinleri, hata mesajları, AI yanıtları ve dökümantasyonlar istisnasız **TÜRKÇE** olacaktır.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
