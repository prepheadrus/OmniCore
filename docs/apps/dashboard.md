# App Manifesto: Dashboard (Frontend)

OmniCore'un kullanıcı arayüzüdür. Next.js 15 App Router mimarisiyle, performansı ve kullanıcı deneyimini (Nordic Zinc) ön planda tutarak geliştirilmiştir.

## 1. Mimari Yapı

| Yapı | Görevi |
| :--- | :--- |
| `src/app/(dashboard)` | Giriş yapmış kullanıcıların gördüğü ana panel sayfaları. |
| `src/app/(auth)` | Giriş ve kayıt süreçlerini içeren izole sayfalar. |
| `src/components/` | Sayfaya özgü veya paylaşılan kompleks UI bileşenleri. |
| `src/lib/` | `fetch` wrapper'ları, tip tanımları ve istemci taraflı yardımcılar. |

## 2. Geliştirme Kuralları (Ajanlar İçin)

1.  **Server Components İlkeli:** Veri çekme işlemleri mümkünse doğrudan Server Component'ler içinde `fetch` ile yapılmalı, `useEffect` kullanımından kaçınılmalıdır.
2.  **Tasarım Uyumu:** Her sayfa `Design.md` dosyasındaki "Tonal Layering" kurallarına uymalıdır. `surface-container` hiyerarşisi bozulmamalıdır.
3.  **Hata Yönetimi:** Beklenmedik hatalar için `error.tsx` ve yükleme durumları için `loading.tsx` dosyaları her modül için tanımlanmalıdır.
4.  **Client Components:** Sadece etkileşim gereken yerlerde (Formlar, Grafikler, Modallar) `'use client'` direktifi kullanılmalıdır.

## 3. Sayfa Akışı ve Veri Çekme

1.  **Layout:** `(dashboard)/layout.tsx` yan menü ve üst barı yönetir.
2.  **Page:** `inventory/page.tsx` gibi sayfalar API'den gelen veriyi karşılar.
3.  **Actions:** Form gönderimleri ve veri güncellemeleri için `actions.ts` (Server Actions) dosyaları tercih edilmelidir.
4.  **Feedback:** İşlem sonuçları `sonner` kütüphanesi ile kullanıcıya şık toast mesajları olarak iletilir.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
