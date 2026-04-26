# Modül Kılavuzu: Akıllı Fiyatlandırma 💰

Akıllı Fiyatlandırma modülü, pazar yerlerindeki rekabet gücünüzü artırmak ve karlılığınızı korumak için fiyatlarınızı otomatik kurallarla yönetmenizi sağlayan finansal yönetim merkezidir.

## 📋 Sayfa Yapısı ve Temel Göstergeler

Ekranın üst kısmında fiyatlandırma stratejinizin genel verimliliğini izleyebilirsiniz:
- **Toplam Kural:** Sistemde kayıtlı olan tüm fiyatlandırma mantıkları.
- **Aktif Kurallar:** Şu anda canlıda olan ve fiyatları güncelleyen kurallar.
- **Ortalama Marj:** Tüm ürünlerinizin maliyet üzerindeki ortalama kar yüzdesi.
- **Güncellenen Ürün:** Kurallar tarafından otomatik olarak fiyatı revize edilen ürün sayısı.

## 📑 Sekmeler ve Detaylı Kullanım

### 1. Fiyat Kuralları (Otomasyon)
Bu sekme, "EĞER... İSE..." mantığıyla çalışan kurallar oluşturmanızı sağlar:
- **Yeni Kural Ekle:** Fiyatın nasıl değişeceğini belirleyin:
    - `Markup`: Maliyetin üzerine kâr ekler (Örn: Maliyet + %20).
    - `İndirim`: Mevcut fiyattan düşüş yapar (Örn: Fiyat - 50 TL).
    - `Eşleştirme (Rekabet)`: Rakip fiyatına göre konumlanmanızı sağlar (Örn: Rakip Fiyatı - %1).
- **Öncelik Sırası:** Birden fazla kural bir ürünü etkiliyorsa, `#1` olan kural en önce uygulanır. Ok simgeleriyle sırayı değiştirebilirsiniz.
- **Güvenlik (Min Marj):** Kural ne olursa olsun, kârınız belirlediğiniz bu yüzdenin altına düşerse sistem fiyatı güncellemez.

### 2. Kâr Analizi (Envanter Sağlığı)
Tüm ürünlerinizin karlılık durumunu görselleştirir:
- **Yüksek Marj (>%30):** En kârlı ürünleriniz.
- **Düşük Marj (%5-%15):** Rekabetin yoğun olduğu, dikkat edilmesi gereken ürünler.
- **Zarar (<%5):** Acilen fiyat revizesi gereken veya maliyeti kurtarmayan ürünler.

### 3. Rekabet Analizi (Canlı Takip)
Ürünlerinizin Trendyol, Hepsiburada ve n11 gibi platformlardaki en ucuz rakip fiyatlarıyla karşılaştırıldığı bölümdür:
- **En Ucuz:** Pazar yerindeki en düşük fiyat sizde ise yeşil işaretlenir.
- **Pahalı:** Rakiplerin fiyatı sizden düşükse kırmızı vurgulanır; "Eşleştirme" kuralı ile bu durumu düzeltebilirsiniz.

## 🛠️ Operasyonel İpuçları

- **Kademeli Geçiş:** Yeni bir kuralı önce "Pasif" olarak kaydedin, ardından "Fiyat Kuralları" listesinden sadece bir üründe test ederek aktif edin.
- **Maliyet Güncelliği:** Akıllı fiyatlandırmanın doğru çalışması için "Ürünler" sayfasındaki `Maliyet` alanının güncel olduğundan emin olun.
- **BuyBox Kazanma:** Rekabet analizinde "Pahalı" görünen ürünleriniz için %1-2'lik "Eşleştirme" kuralları tanımlayarak satış hızınızı artırabilirsiniz.

---
*Daha fazla bilgi için: [Fiyatlandırma Stratejileri Rehberi](../pricing-strategy.md)*
