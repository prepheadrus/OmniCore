# Modül Kılavuzu: Feed Optimizasyonu 🎯

Feed Optimizasyonu, ürün verilerinizin pazar yerlerinde daha iyi performans göstermesi için akıllı kurallar uygulandığı ve veri kalitesinin denetlendiği gelişmiş bir modüldür.

## 📋 Sayfa Yapısı ve Genel Bakış

Sayfanın üst kısmında optimizasyon sürecinizin genel sağlığını gösteren göstergeler yer alır:
- **Toplam Kural:** Sistemde tanımlı olan tüm optimizasyon kuralları.
- **Ort. Kalite Skoru:** Tüm envanterinizin pazar yeri standartlarına uyum yüzdesi.
- **Hata Oranı:** Ürünlerinizdeki kritik veri eksikliklerinin oranı.

## 📑 Sekmeler ve Detaylı Kullanım

### 1. İçerik Kuralları (Akıllı Otomasyon)
Bu sekme, ürün başlıklarını ve açıklamalarını toplu olarak dönüştürmenizi sağlar:
- **Yeni Kural Ekle:** Aşağıdaki kural tiplerinden birini seçerek başlayın:
    - `Başlık Şablonu`: Ürün isimlerini otomatik olarak düzenler (Örn: `{marka} {model} {renk}`).
    - `Açıklama Şablonu`: SEO uyumlu açıklama metinleri oluşturur.
    - `Görsel Kuralı`: Ürün fotoğrafları için kalite ve boyut kuralları.
    - `Alan Doğrulama`: Zorunlu alanların (Barkod, SKU) doluluğunu kontrol eder.
- **Değişken Kullanımı:** Şablon oluştururken `{name}`, `{brand}`, `{sku}` gibi değişkenleri kullanarak her ürün için özelleştirilmiş metinler üretebilirsiniz.
- **Uygula Butonu:** Kuralı oluşturduktan sonra "Uygula" dediğinizde, sistem arka planda tüm ürünleri tarayarak kuralı işletir.

### 2. 🛡️ Kalite Skorları (Kategori Bazlı Analiz)
Ürünlerinizin kalitesini kategori bazında dairesel grafiklerle sunar:
- **Puanlama:** %80 ve üzeri yeşil (İyi), %60-80 sarı (Orta), %60 altı kırmızı (Kritik) olarak işaretlenir.
- **Sorun Tespiti:** Her kategorinin altındaki "Sorunlar" listesinde, o kategoride en çok karşılaşılan eksiklikleri (Örn: "Eksik Görsel", "Kısa Açıklama") görebilirsiniz.

### 3. ☑️ Kanal Uyumluluk (Platform Denetimi)
Ürünlerinizin her bir pazar yerinin (Trendyol, Amazon vb.) katı kurallarına ne kadar uyduğunu ölçer:
- **Tüm Kanalları Kontrol Et:** Sistemi tetikleyerek anlık uyumluluk raporu üretir.
- **Eksik Alanlar:** Amazon veya Trendyol için kritik olan ama ürünlerinizde eksik kalan alanları (Örn: EAN, MPN, Materyal Bilgisi) liste halinde sunar.

## 🛠️ Operasyonel İpuçları

- **Öncelik Sırası:** Birden fazla kuralınız varsa, "Öncelik" numarasını kullanarak hangi kuralın önce çalışacağını belirleyin (Düşük numara = Yüksek öncelik).
- **Test ve Uygulama:** Bir kuralı tüm envantere uygulamadan önce "Taslak" olarak kaydedip sonuçları örnek bir ürün üzerinden kontrol edin.
- **BuyBox ve Optimizasyon:** Kalite skorunuzu %90'ın üzerine çıkarmak, pazar yeri aramalarında en üst sıralara çıkmanıza (SEO) yardımcı olur.

---
*Daha fazla bilgi için: [Feed Şablonları Rehberi](feed-templates.md)*
