# Modül Kılavuzu: Ürün Feed Yönetimi 📡

Ürün Feed Yönetimi, harici kaynaklardan (XML, CSV veya JSON) gelen ürün verilerini OmniCore'a aktarmanızı ve bu verileri pazar yerlerine uyumlu hale getirmenizi sağlayan merkezi veri köprüsüdür.

## 📋 Sayfa Yapısı ve Genel Bakış

Sayfanın en üstünde envanterinizin genel akış sağlığını gösteren özet kartları yer alır:
- **Toplam Feed:** Sistemde tanımlı olan toplam veri kaynağı sayısı.
- **Aktif Feed:** Yayında olan ve düzenli veri çeken kaynak sayısı.
- **Son Başarılı Import:** En son yapılan başarılı veri çekme işleminin zamanı.

## 📑 Sekmeler ve Detaylı Kullanım

### 1. Feed'ler (Mevcut Kaynakların Yönetimi)
Bu sekmede tanımlı olan tüm feed'lerinizi kartlar halinde görebilirsiniz. Her kart şu bilgileri sunar:
- **Ürün Kalitesi:** Gelen verilerin doğruluğunu gösteren yüzde.
- **İstatistikler:** Toplam ürün sayısı, hatasız (geçerli) ürünler ve hatalı ürünlerin dökümü.
- **Durum Anahtarı (Switch):** Feed'i dilediğiniz zaman durdurabilir veya aktif edebilirsiniz.
- **Şimdi Senkronize Et:** Planlanmış zamanı beklemeden verileri anlık olarak çekmek için kullanılır.

### 2. + Yeni Feed Ekle (Veri Kaynağı Tanımlama)
Dışarıdan ürün çekmek için bu formu doldurmanız gerekir:
- **Feed Adı:** Kaynağı kolayca tanıyabilmeniz için bir isim (Örn: "Ana Depo XML").
- **Kaynak Türü:** Verinin nasıl yükleneceği (URL üzerinden veya dosya yükleme).
- **Format:** Kaynağın yapısı (XML, CSV veya JSON).
- **Çalışma Planı:** Verilerin ne sıklıkla otomatik güncelleneceği (Manuel, 30 Dakika, Saatlik, Günlük).
- **Alan Eşleştirme:** Sistemin ürün adını, fiyatını ve stoğunu kaynaktaki hangi alanlardan (tag) okuyacağını gösteren önizleme bölümüdür.

### 3. ⚙️ Kategori Eşleştirme (Mapping)
Dış kaynaktaki kategorilerin pazar yerindeki kategorilere "tercüme" edildiği bölümdür:
- **Neden Önemli?** Sizin listenizde "Elt > Tel" olarak geçen kategorinin Trendyol'da "Cep Telefonu" olarak eşleşmesi gerekir.
- **Nasıl Yapılır?** "Yeni Eşleştirme Ekle" bölümünden kaynak kategoriyi ve hedef pazar yerindeki karşılığını yazarak kaydedebilirsiniz.

## 🛠️ Operasyonel İpuçları

- **Kalite Kontrol:** "Hatalı" ürün sayısı yüksekse, feed detayına girerek eksik olan alanları (Örn: Barkod veya Fiyat eksikliği) kontrol edin.
- **Manuel Tetikleme:** Yeni ürünler eklediyseniz, planlanmış zamanı beklemeden "Şimdi Senkronize Et" butonunu kullanarak verileri anında güncelleyebilirsiniz.
- **Senkronizasyon:** Feed üzerindeki bir değişiklik, bağlı olan tüm pazar yerlerini zincirleme olarak etkileyebilir.

---
*Daha fazla bilgi için: [Ürün Bilgi Yönetimi (PIM) Rehberi](../product-management.md)*
