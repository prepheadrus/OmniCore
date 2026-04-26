# OmniCore Yapay Zeka Mantığı ve Sözlüğü (AI Logic) 🤖

Bu döküman, OmniCore içindeki yapay zeka ajanlarının nasıl düşündüğünü, hangi kurallara uyduğunu ve veri güvenliğini nasıl sağladığını açıklar.

## 1. Ajan Orkestrasyonu (LangGraph)

OmniCore, LLM işlemlerini doğrusal bir akış yerine düğümlerden (node) oluşan bir grafik yapısında yönetir.
- **Orchestrator:** Kullanıcı niyetini (intent) anlar ve ilgili düğüme yönlendirir.
- **State Management:** Ajanlar arası bilgi aktarımı `AgentState` yapısı üzerinden yapılır, böylece bağlam (context) asla kaybolmaz.

## 2. Veri Güvenliği (PII Shield)

Sistemin en hassas noktasıdır. Müşteri verileri LLM'e gitmeden önce şu kurallarla maskelenir:
- **İsim/Soyisim:** `[REDACTED_NAME]`
- **Telefon:** `[REDACTED_PHONE]`
- **Adres:** `[REDACTED_ADDRESS]`
- **Kural:** Hiçbir ham müşteri verisi dış servislerin (OpenAI/Gemini) hafızasına giremez.

## 3. SEO ve İçerik Optimizasyonu (Prompts)

`seo-description.node.ts` düğümü şu sistem talimatlarını (System Prompts) kullanır:
- **Dil:** Daima Türkçe.
- **Ton:** Profesyonel, ikna edici ve satış odaklı.
- **Kısıtlamalar:** "En iyi", "Tek", "Mükemmel" gibi pazar yeri tarafından yasaklanabilecek abartılı ifadelerden kaçınılır.
- **Anahtar Kelime Yoğunluğu:** Pazar yeri algoritmasına uygun (LSI) anahtar kelime yerleşimi yapılır.

## 4. Anlamsal Önbellek (Semantic Cache)

Üretilen yanıtlar Redis üzerinde şu mantıkla saklanır:
- **Kritik:** Sadece statik veriler (isim, açıklama) değiştiğinde önbellek silinir.
- **Dinamik:** Fiyat ve stok güncellemeleri önbelleği etkilemez, bu veriler daima veritabanından anlık çekilir.

---
*Son Güncelleme: 2026-04-26 - Tatiana (Zekanın ve Şıklığın Adresi)* 👠
