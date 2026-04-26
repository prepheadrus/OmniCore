# Module Manifesto: Pricing Engine (`libs/pricing`)

OmniCore'un finansal zekasıdır. Maliyet, komisyon, rakip verisi ve karlılık hedeflerine göre her pazar yeri için ideal fiyatı hesaplar.

## 1. Temel Bileşenler

| Bileşen | Dosya Yolu | Görevi |
| :--- | :--- | :--- |
| **Strategy Interface** | `src/lib/interfaces/price-strategy.interface.ts` | Tüm fiyatlandırma stratejilerinin uyması gereken sözleşme. |
| **BuyBox Strategy** | `src/lib/strategies/aggressive-buybox.strategy.ts` | Rakip fiyatlarının hemen altına inerek satışı garantileyen agresif strateji. |
| **Profit Maximizer** | `src/lib/strategies/profit-maximization.strategy.ts` | Marjı korumaya odaklı strateji. |

## 2. Mimari Kurallar (Ajanlar İçin)

1.  **Strateji Deseni:** Yeni bir fiyatlandırma mantığı eklenecekse (Örn: İndirim Kampanyası Stratejisi), `IPriceStrategy` arayüzü implement edilmelidir.
2.  **Maliyet Koruması:** Hiçbir strateji, tanımlanan "Minimum Kar Marjı" veya "Maliyet" altına inmemelidir.
3.  **Dinamik Veri:** Rakip fiyatları gibi veriler `MockCompetitorDataProvider` gibi sağlayıcılardan asenkron olarak beslenir.
4.  **Yuvarlama:** Hesaplanan fiyatlar, pazar yerinin kabul ettiği kuruş hassasiyetine (Precision) uygun olarak yuvarlanmalıdır.

## 3. Fiyat Hesaplama Akışı

1.  **Veri Toplama:** Ürün maliyeti, pazar yeri komisyonu, kargo maliyeti ve rakip fiyatları çekilir.
2.  **Strateji Seçimi:** Ürün için atanan strateji belirlenir (Örn: Agresif).
3.  **Hesaplama:** Strateji çalışır ve bir ham fiyat üretir.
4.  **Güvenlik Kontrolü:** Alt limitler kontrol edilir.
5.  **Sonuç:** Pazar yerine gönderilmek üzere `queue-management` modülüne iletilir.

---
*Son Güncelleme: 2026-04-26 - Tatiana*
