# Modül Kılavuzu: Ürünler ve Envanter Yönetimi 📦

Ürünler sayfası, OmniCore ekosistemindeki tüm envanterinizin merkezi yönetim alanıdır. Bu sayfadan ürünlerinizi listeleyebilir, durumlarını izleyebilir ve pazar yerlerine olan bağlantılarını yönetebilirsiniz.

## 📋 Sayfa Yapısı ve Hızlı Erişim

Ekranın üst bölümünde ürünlerinizi yönetmek için şu araçlar yer alır:
- **Durum Sekmeleri:** Ürünleri satış aşamalarına göre filtreler:
    - **Tümü:** Tüm envanter listesi.
    - **Satışta:** Pazar yerlerinde aktif olarak satılan ürünler.
    - **Tükendi:** Stoğu bitmiş ürünler.
    - **Taslak:** Henüz yayına alınmamış, hazırlık aşamasındaki ürünler.
- **Yeni Ürün Butonu (+):** Sağ üstte yer alan siyah butondur. Sisteme manuel olarak yeni bir ürün kartı eklemek için kullanılır.

## 🔍 Arama ve Filtreleme

Listeyi daraltmak için tablo üzerindeki filtreleri kullanabilirsiniz:
- **Arama Çubuğu:** Ürün adı veya stok kodu (SKU) ile anında arama yapın.
- **Kategori Seçimi:** Sadece belirli bir kategoriye (Örn: Elektronik, Moda) ait ürünleri listelemek için kullanılır.

## 📊 Ürün Listesi (Tablo) Detayları

Tablodaki her sütun, ürünün pazar yerindeki performansını ve operasyonel verilerini sunar:

- **Seçim (Checkbox):** Toplu fiyat güncelleme veya toplu silme gibi işlemler için kullanılır.
- **Görsel:** Ürünün kapak fotoğrafı. Eğer fotoğraf yoksa standart bir ikon görünür.
- **Ürün / SKU:** Ürünün pazar yerindeki adı ve benzersiz stok kodu.
- **Kategori:** Ürünün sistem içindeki kategorisi.
- **Stok:** Mevcut stok adedi. 
- **Satış Fiyatı:** Ürünün müşteriye sunulan güncel fiyatı (₺).
- **Maliyet:** Ürünün alış veya üretim maliyeti.
- **Durum (Badge):**
    - `Satışta` (Yeşil): Aktif.
    - `Tükendi` (Kırmızı): Stok bittiği için satış durdu.
    - `Taslak` (Gri): Yayına hazır değil.
- **Kâr Marjı:** Maliyet ve Satış Fiyatı arasındaki karlılık oranı (Örn: +%100).
- **Pazar Yeri:** Ürünün hangi kanallarda (Trendyol, Amazon vb.) bağlı olduğunu gösteren ikonlar. Eğer boş ise ürün henüz bir pazar yerine bağlanmamıştır.

## 🛠️ Operasyonel İpuçları

- **Hızlı Düzenleme:** Tablodaki verilerin (fiyat, stok) üzerine tıklayarak sayfadan ayrılmadan hızlıca güncelleyebilirsiniz.
- **Eksik Bilgiler:** Eğer bir ürünün durumunda "null" veya fiyatında "0.00" görüyorsanız, ürün detayına girerek bu bilgileri tamamlamanız gerekir.

---
*Daha fazla bilgi için: [Ürün Bilgi Yönetimi (PIM) Rehberi](../product-management.md)*
