# Modül Kılavuzu: Feed Şablonları 📋

Feed Şablonları modülü, pazar yerlerinin talep ettiği farklı veri yapılarını (XML/CSV/JSON) standartlaştıran ve bu verilerin kalitesini denetleyen gelişmiş bir araç setidir.

## 📋 Sayfa Yapısı ve Genel Bakış

Sayfanın üst kısmında şablon ekosisteminizin genel durumunu gösteren özet kartları bulunur:
- **Toplam Şablon:** Sistemde kayıtlı olan toplam şablon sayısı.
- **Platform Sayısı:** Desteklenen pazar yeri ve platform sayısı (Trendyol, Amazon, Shopify vb. toplam 12+ platform).
- **İndirme Sayısı:** Şablonların kullanım ve indirme sıklığı.

## 📑 Sekmeler ve Detaylı Kullanım

### 1. Şablon Kütüphanesi (Gözat ve Kullan)
Bu sekme, OmniCore tarafından sunulan hazır şablonların listelendiği bölümdür:
- **Filtreleme:** Şablonları platforma, kategoriye veya formata (XML, CSV, JSON) göre süzebilirsiniz.
- **Popüler Şablonlar:** Yanında alev simgesi (🔥) olan şablonlar, topluluk tarafından en çok tercih edilenlerdir.
- **İndir / Kullan:** Beğendiğiniz bir şablonu bilgisayarınıza indirebilir veya "Kullan" diyerek doğrudan yeni bir feed oluşturma sürecini başlatabilirsiniz.

### 2. + Feed Oluşturucu (Sihirbaz)
Adım adım kendi veri akışınızı oluşturmanızı sağlar:
- **Adım 1 - Platform Seçimi:** Verinin hangi pazar yerine (Örn: Amazon TR) gideceğini seçin.
- **Adım 2 - Şablon Seçimi:** Hazır bir şablonla başlayın veya "Boş Şablon"u seçerek sıfırdan kurun.
- **Adım 3 - Alan Eşleştirme:** Kendi ürün verilerinizdeki alanları (id, title, price), pazar yerinin beklediği alanlarla (product_id, name, price) eşleştirin.
- **Adım 4 - Zamanlama & Test:** Feed'in ne sıklıkla güncelleneceğini (Manuel, Saatlik, Günlük) belirleyin ve "Testi Çalıştır" diyerek verilerin doğruluğunu kontrol edin.

### 3. ⚙️ Feed Kalite Kuralları (Denetim)
Verilerinizin pazar yeri standartlarına uygunluğunu otomatik olarak denetler:
- **Kalite Kontrolünü Çalıştır:** Tüm feed'lerinizi tarar ve eksik/hatalı verileri raporlar.
- **Hata Seviyeleri:**
    - `Hata (Error)`: Ürünün listelenmesini engelleyen kritik eksiklikler.
    - `Uyarı (Warning)`: Ürün listelenir ancak performansını düşüren eksiklikler.
    - `Bilgi (Info)`: Geliştirme önerileri.
- **Kural Listesi:** "Fiyat 0 olamaz", "Görsel URL zorunludur" gibi aktif kuralları buradan görebilirsiniz.

## 🛠️ Operasyonel İpuçları

- **Test Etmeden Kaydetme:** Yeni bir feed oluştururken "Testi Çalıştır" butonunu mutlaka kullanın. Bu, hatalı verilerin pazar yerine gitmesini engeller.
- **Kalite Puanı:** Şablon kütüphanesindeki yıldız puanlarını takip ederek en stabil çalışan şablonları tercih edin.
- **Kural Yönetimi:** Sık karşılaştığınız veri hataları için yeni kalite kuralları tanımlayarak sistemi otomatize edebilirsiniz.

---
*Daha fazla bilgi için: [Ürün Feed Yönetimi Rehberi](feeds.md)*
