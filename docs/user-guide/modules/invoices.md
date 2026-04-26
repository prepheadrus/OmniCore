# Modül Kılavuzu: Alım Faturaları 🧾

Alım Faturaları modülü, tedarikçilerinizden gelen faturaları sisteme işlediğiniz, maliyetlerinizi takip ettiğiniz ve ödemelerinizi planladığınız finansal takip merkezidir.

## 📋 Sayfa Yapısı ve Finansal Göstergeler

Sayfanın en üstünde, işletmenizin nakit akışını ve maliyet sağlığını gösteren dört kritik kart bulunur:

1.  **Aylık Toplam Alış:** Mevcut ay içinde sisteme girilen faturaların toplam bedeli.
2.  **Bekleyen Eşleştirmeler:** Henüz ürün kodlarıyla (SKU) bağdaştırılmamış fatura kalemleri.
3.  **Maliyet Değişim Trendi:** Ürün alış fiyatlarınızın son 30 gündeki ortalama değişim yüzdesi.
4.  **Gelecek Ödemeler:** Önümüzdeki 7 gün içinde vadesi dolacak olan ödeme yükümlülükleriniz.

## 🔍 Arama ve Durum Filtreleri

Aradığınız faturaya hızlıca ulaşmak için şu araçları kullanabilirsiniz:
- **Arama Çubuğu:** Fatura numarası veya tedarikçi ismiyle arama yapın.
- **Durum Butonları:**
    - `Tümü`: Tüm fatura geçmişi.
    - `Açık`: Henüz ödemesi yapılmamış veya taslak durumdaki faturalar.
    - `Ödendi`: Kapatılmış ve finansal süreci tamamlanmış kayıtlar.

## 📊 Fatura Listesi (Tablo) Detayları

Tabloda her bir alım faturasının ana verileri listelenir:
- **Fatura No:** Belgenin üzerinde yer alan resmi numara.
- **Tedarikçi:** Alımın yapıldığı iş ortağı.
- **Tarih:** Faturanın düzenlenme tarihi.
- **Toplam Tutar:** KDV dahil nihai bedel.
- **Durum:** Faturanın güncel finansal statüsü.

## 🛠️ Yeni Fatura Ekleme

Sağ üstteki **+ Yeni Fatura** butonuna tıkladığınızda açılan form üzerinden:
1.  Tedarikçiyi seçin.
2.  Fatura numarasını ve tarihini girin.
3.  Ürün kalemlerini ve adetlerini ekleyin.
4.  KDV ve varsa indirim oranlarını belirleyerek kaydedin.

---
*İpucu: Alım faturalarını düzenli işlemek, "Ürünler" sayfasındaki `Maliyet` verilerinin otomatik güncellenmesini ve karlılık analizlerinizin doğru çıkmasını sağlar.*
