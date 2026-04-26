# Module Manifesto: UI Components (`libs/ui`)

OmniCore'un görsel kimliğini taşıyan atomik bileşen kütüphanesidir. "The Silent Architect" ve "Nordic Zinc" felsefelerini somutlaştırır.

## 1. Temel Bileşenler

| Kategori | Görevi |
| :--- | :--- |
| **Atomic UI** | `button`, `input`, `badge`, `checkbox` gibi temel yapı taşları. |
| **Complex Layouts** | `table`, `sheet`, `dialog`, `tabs` gibi veri yoğunluklu bileşenler. |
| **Design Tokens** | Tailwind konfigürasyonu üzerinden yönetilen Zinc renk paleti ve 8pt grid sistemi. |

## 2. Tasarım Kuralları (Ajanlar İçin)

1.  **Border Yasağı:** Layout bölmek için 1px border kullanmak KESİNLİKLE YASAKTIR. Bunun yerine `surface-container` renk değişimlerini (Tonal Layering) kullan.
2.  **Renk Paleti:** Sadece `zinc` tonları ve projenin tanımlı birincil rengi (`primary: #5f5e61`) kullanılabilir. Canlı, doygun renklerden kaçın.
3.  **Hafiflik:** Dış kütüphane (Shadcn vb.) bağımlılığını azaltmak için bileşenler Tailwind ile sıfırdan veya Radix primitifleri üzerine inşa edilmiştir.
4.  **Glassmorphism:** Yüzen panellerde (Floating Action Bar, Tooltip) `backdrop-blur` ve %80-85 arası opaklık kullanılmalıdır.

## 3. Yeni Bileşen Ekleme

1.  Yeni bileşen `src/components/ui` altında oluşturulmalıdır.
2.  Tailwind sınıfları `clsx` ve `tailwind-merge` (`cn` helper) ile yönetilmelidir.
3.  Erişilebilirlik (ARIA) standartlarına uyum için Radix UI primitifleri tercih edilmelidir.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
