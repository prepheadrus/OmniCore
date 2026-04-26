# Modül Kılavuzu: Tedarikçi Yönetimi 🚚

Tedarikçi Yönetimi modülü, ürün tedarik ettiğiniz firmaların iletişim bilgilerini, vergi detaylarını ve finansal anlaşmalarını merkezi bir noktada tutmanızı sağlar.

## 📋 Sayfa Yapısı ve Liste Görünümü

Tedarikçiler sayfası, tüm iş ortaklarınızın özet bir listesini sunar. Tablodaki her sütun şu bilgileri içerir:

- **Tedarikçi Adı:** Firmanın ticari veya tanınan adı.
- **Vergi No:** Faturalama ve yasal süreçler için gerekli vergi numarası.
- **E-Posta & Telefon:** Doğrudan iletişim kurabileceğiniz iletişim kanalları.
- **Grup:** Tedarikçileri kategorize etmek için kullanılan alan (Örn: Yerli Üretici, İthalatçı).
- **Durum (Badge):** 
    - `Aktif`: Ticari ilişkinin devam ettiği firmalar.
    - `Pasif`: Geçici olarak çalışılmayan veya kaydı dondurulan firmalar.
- **Kayıt Tarihi:** Tedarikçinin OmniCore sistemine eklendiği tarih.

## 🛠️ Tedarikçi İşlemleri

Her satırın sonunda bulunan üç nokta (...) menüsü üzerinden şu işlemleri yapabilirsiniz:

### 1. Düzenle
Tedarikçinin tüm detaylarını (Banka bilgileri, IBAN, adres, teslimat süreleri) güncelleyebileceğiniz bir yan panel (Sheet) açar.
- **Püf Noktası:** Tedarikçinin "Ortalama Teslimat Süresi" (Lead Time) bilgisini girerseniz, stok planlaması yaparken sistem sizi uyarabilir.

### 2. Sil
Tedarikçi kaydını sistemden tamamen kaldırır. 
- **Dikkat:** Üzerinde aktif alım faturası veya bekleyen siparişi olan tedarikçileri silmeden önce bu kayıtları kontrol etmeniz önerilir.

## ⚙️ Yeni Tedarikçi Ekleme

Sayfanın üst kısmındaki (varsa) "+ Yeni Tedarikçi" butonuyla yeni bir kart oluşturabilirsiniz. Kayıt sırasında vergi numarası ve iletişim bilgilerinin doğru girilmesi, ileride kesilecek "Alım Faturaları"nın doğruluğu için kritiktir.

---
*Daha fazla bilgi için: [Alım Faturaları Rehberi](invoices.md)*
