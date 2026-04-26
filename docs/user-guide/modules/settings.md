# Modül Kılavuzu: Ayarlar ve Entegrasyonlar ⚙️

Ayarlar sayfası, OmniCore'un dış dünya ile nasıl iletişim kuracağını belirlediğiniz kontrol merkezidir. Burada yaptığınız seçimler, sipariş ve fatura süreçlerinizi doğrudan etkiler.

## 📋 Sayfa Yapısı

Ayarlar sayfası temel olarak iki ana bölüme (Kart) ayrılmıştır:

### 1. Aktif Satış Kanalları

Bu bölümden hangi pazar yerleri ile çalışacağınızı seçebilirsiniz. Her kanalın yanında bir **Açma/Kapama (Switch)** butonu bulunur.

- **Trendyol / Hepsiburada:** İlgili kanalı aktif ettiğinizde, sistem bu mağazadan sipariş çekmeye ve stok güncellemeye başlar. 
- **İpucu:** Bir kanalı geçici olarak kapatmak isterseniz, API anahtarlarınızı silmeden buradan pasif konuma getirebilirsiniz.

### 2. Sağlayıcı Seçimi

Operasyonel süreçlerinizde kullandığınız yardımcı servisleri buradan bağlayabilirsiniz:

- **Fatura Sağlayıcı:** E-fatura ve e-arşiv işlemleriniz için kullandığınız paneli seçin (Örn: Paraşüt, BizimHesap). Seçim yaptıktan sonra ilgili servisin API ayarları için ek bir alan açılacaktır.
- **Kargo Sağlayıcı:** Sipariş barkodlarınızın hangi kargo firması üzerinden üretileceğini belirleyin (Örn: Yurtiçi Kargo, Aras Kargo). 

## 🛠️ Nasıl Ayar Yapılır?

1.  **Kanalları Belirle:** Çalıştığınız pazar yerlerini aktif edin.
2.  **Sağlayıcıyı Seç:** Açılır listeden (Select) firmanızı seçin.
3.  **Kaydet:** Yaptığınız değişiklikler anında kaydedilir ve sisteme yansır.

## ⚠️ Önemli Hatırlatmalar

- **Fatura Ayarları:** Fatura sağlayıcınızı değiştirdiğinizde, bekleyen siparişlerin faturası eski sağlayıcı üzerinden kesilemeyebilir. Bu değişikliği iş yoğunluğunun az olduğu zamanlarda yapmanız önerilir.
- **Bağlantı Kontrolü:** Sağlayıcı seçtikten sonra mutlaka "Ayarları Test Et" butonu (varsa) ile bağlantının sağlıklı kurulduğunu kontrol edin.

---
*Daha fazla bilgi için: [Başlangıç Rehberi](../getting-started.md)*
