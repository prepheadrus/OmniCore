# Module Manifesto: PIM - Product Information Management (`libs/pim`)

Bu modül OmniCore'un katalog ve envanter yönetimi merkezidir. Ürünlerin pazar yerlerine gönderilmeden önceki son halleri burada şekillenir.

## 1. Temel Bileşenler

| Bileşen | Dosya Yolu | Görevi |
| :--- | :--- | :--- |
| **Product Service** | `src/lib/services/product.service.ts` | Ürün oluşturma, güncelleme ve varyant yönetimi. |
| **BOM Resolver** | `src/lib/services/bom-resolver.service.ts` | Ürün reçetelerini (Bill of Materials) çözerek bileşen bazlı stok kontrolü yapar. |
| **Category/Brand** | `src/lib/services/category.service.ts` | Kategori ve marka hiyerarşilerini yönetir. |

## 2. Mimari Kurallar (Ajanlar İçin)

1.  **Varyant Bütünlüğü:** Ürün varyantları (beden, renk vb.) oluşturulurken ana ürün (Master) ile olan bağ asla koparılmamalıdır.
2.  **BOM Mantığı:** Eğer bir ürün başka ürünlerin birleşimi ise (Set Ürün), stok hesaplaması `BomResolverService` üzerinden yapılmalıdır.
3.  **Anlamsal Bütünlük:** Ürün adı ve açıklaması güncellenirken AI önbelleğinin (Semantic Cache) temizleneceğini unutma (Bkz: Database Module).
4.  **Kategori Eşleştirme:** Her pazar yerinin kategori ağacı farklıdır; bu modül pazar yeri bağımsız (agnostic) bir kategori ağacı sunar.

## 3. Ürün Akışı

1.  **Giriş:** Manuel giriş, toplu Excel veya pazar yerinden çekme.
2.  **Zenginleştirme:** AI ajanları (SEO Node) açıklamaları optimize eder.
3.  **Eşleştirme:** Ürün, hedef pazar yeri kategorileriyle eşleştirilir.
4.  **Hazırlık:** Pricing modülünden gelen fiyatlarla birlikte pazar yerine gönderilmeye hazır hale getirilir.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
