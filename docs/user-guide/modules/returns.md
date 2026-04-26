# Modül Kılavuzu: İade Yönetimi (Reverse Logistics) 🔄

İade Yönetimi sayfası, müşterilerinizden gelen iade taleplerini, bu ürünlerin kargo süreçlerini ve depo giriş kontrollerini takip ettiğiniz "tersine lojistik" merkezidir.

## 📋 Sayfa Yapısı ve Hızlı Arama

İade süreçlerini yönetmek için ekranın üst kısmındaki araçları kullanabilirsiniz:
- **Arama Çubuğu:** Müşteri adı, pazar yeri sipariş numarası veya sisteme özel **İade Kodu (RMA)** ile anında arama yapabilirsiniz.
- **Durum Filtresi:** İadeleri aşamalarına göre (Örn: Sadece incelenenler veya reddedilenler) daraltmak için sağ üstteki açılır menüyü kullanın.

## 📊 İade Listesi (Tablo) Detayları

Tablodaki her satır bir iade dosyasını temsil eder:

- **İade Kodu (RMA):** Sistemin her iade talebi için oluşturduğu benzersiz takip numarası (Örn: RMA-10046).
- **Sipariş No:** İadeye konu olan orijinal satışın numarası.
- **Müşteri:** İade talebini oluşturan alıcının adı.
- **İade Nedeni:** Müşterinin iade gerekçesi (Örn: Kusurlu Ürün, Eksik Parça, Geciken Kargo). Bu bilgi, ürün kalitenizi analiz etmek için kritiktir.
- **Kanal:** İadenin geldiği satış platformu (Hepsiburada, Trendyol vb.).
- **Durum (Badge):**
    - `Kargoda`: Müşteri ürünü kargoya vermiş, size gelmesini bekliyorsunuz.
    - `İnceleniyor`: Ürün deponuza ulaşmış, kalite kontrol ekibi tarafından kontrol ediliyor.
    - `Reddedildi`: İade talebi (kullanıcı hatası vb. nedenlerle) kabul edilmemiş.
- **Tutar:** İade edilecek olan toplam bedel.
- **İşlemler (...):** Satır sonundaki üç nokta simgesine tıklayarak iadeyi onaylayabilir, reddedebilir veya detaylı inceleme raporuna gidebilirsiniz.

## 🛠️ Operasyonel İpuçları

- **Depo Girişi:** Bir ürün deponuza ulaştığında durumunu mutlaka `İnceleniyor` olarak güncelleyin.
- **Pazar Yeri Senkronizasyonu:** OmniCore üzerinden onayladığınız bir iade, pazar yerine de otomatik olarak iletilir.
- **Analiz:** İade nedenlerini düzenli inceleyerek hangi ürünlerin veya hangi kargo firmalarının sorun yarattığını tespit edebilirsiniz.

---
*Daha fazla bilgi için: [Sipariş ve Gönderim Rehberi](../order-management.md)*
