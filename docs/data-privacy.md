# OmniCore Veri Gizliliği ve KVKK Uyumluluk Rehberi 🛡️

OmniCore, e-ticaret operasyonlarında işlenen müşteri verilerinin güvenliğini ve yasal uyumluluğunu (KVKK/GDPR) en üst düzeyde tutar.

## 1. Veri Maskeleme (PII Shield)
Sisteme düşen her siparişteki kişisel veriler (Ad, Telefon, Adres), yapay zeka ajanlarına gönderilmeden önce otomatik olarak taranır:
- **İşlem:** Hassas veriler geri döndürülemez şekilde `[MASKELENMİŞ]` etiketleriyle değiştirilir.
- **Amacı:** LLM servislerinin (OpenAI, Gemini vb.) kullanıcı verilerini eğitim setlerine dahil etmesini engellemek.

## 2. Satır Düzeyinde Güvenlik (RLS)
PostgreSQL düzeyinde uygulanan RLS mimarisi sayesinde:
- Her kanalın verisi diğerinden izoledir.
- Bir admin kullanıcısı sadece yetkili olduğu `channel_id` bağlamındaki verilere erişebilir.
- Veritabanı sızıntısı durumunda bile veriler mantıksal olarak birbirinden ayrı kalır.

## 3. Erişim Kayıtları (Audit Logs)
Sistem üzerindeki tüm kritik işlemler (Fiyat değişimi, Stok güncelleme, Fatura iptali) kullanıcı bazlı olarak kayıt altına alınır:
- **Kim:** İşlemi yapan yetkili.
- **Ne Zaman:** İşlem saati ve tarihi.
- **Ne:** Değiştirilen verinin eski ve yeni hali.

## 4. Veri Saklama ve İmha
Tamamlanmış siparişlerin verileri, yasal saklama süreleri dolduğunda sistemden otomatik olarak anonimleştirilir veya silinir.

---
*Son Güncelleme: 2026-04-26 - 
