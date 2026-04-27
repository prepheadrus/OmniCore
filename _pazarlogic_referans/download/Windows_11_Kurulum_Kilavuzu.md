# PazarLogic - Windows 11 Kurulum Kilavuzu

## On Gereksinimler

Aşağıdaki programların bilgisayarınızda yüklü olması gerekir:

| Program | Minimum Sürüm | İndirme Linki |
|---------|--------------|---------------|
| **Node.js** | 18.x veya üzeri | https://nodejs.org (LTS sürümünü indirin) |
| **Bun** | 1.x | `npm install -g bun` komutu ile yükle |
| **Git** | 2.x | https://git-scm.com/download/win |
| **VS Code** (Önerilen) | Latest | https://code.visualstudio.com |

---

## ADIM 1: Dosyaları Hazırlama

### 1.1 ZIP Dosyasını Çıkartma

1. **PazarLogic_Project.zip** dosyasını bilgisayarınıza indirin
2. ZIP dosyasına sağ tıklayın → **"Tümünü ayıkla..."**
3. Çıkartma konumu önerisi: `C:\Projects\PazarLogic`

Klasör yapısı şu şekilde görünmelidir:
```
C:\Projects\PazarLogic\
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── store/
├── prisma/
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
└── eslint.config.mjs
```

---

## ADIM 2: Terminali Açma

1. **Windows Tuşu + R** basın
2. `cmd` yazın → Enter basın (veya PowerShell kullanın)
3. Proje klasörüne gidin:
```cmd
cd C:\Projects\PazarLogic
```

> **Not**: VS Code kullanıyorsanız, proje klasörünü VS Code ile açın ve terminal bölümünü kullanabilirsiniz.

---

## ADIM 3: Bağımlılıkları Yükleme

### 3.1 Package.json Doğrulama

Proje kök dizininde `package.json` dosyasının olduğunu doğrulayın.

### 3.2 Bağımlılıkları Kurun

Terminalde şu komutu çalıştırın:

```cmd
bun install
```

Bu işlem 1-3 dakika sürebilir. Tüm npm paketleri `node_modules` klasörüne kurulacaktır.

> **Alternatif**: `npm install` komutunu da kullanabilirsiniz, ancak `bun install` çok daha hızlıdır.

---

## ADIM 4: Prisma Veritabanını Ayarlama

### 4.1 Prisma Client'i Oluşturun

```cmd
bunx prisma generate
```

Bu komut, Prisma ORM'un veritabanı ile iletişim kuracak TypeScript tiplerini oluşturur.

### 4.2 Veritabanı Migrasyonunu Çalıştırın

```cmd
bunx prisma migrate dev --name init
```

Bu komut:
- `prisma/dev.db` SQLite veritabanı dosyasını oluşturur
- Gerekli tüm tabloları (54 tablo) oluşturur

### 4.3 Örnek Verileri Yükleyin (Opsiyonel)

Uygulamayı örnek verilerle doldurmak için:

```cmd
bunx prisma db seed
```

Bu komut şunları ekler:
- 5 kullanıcı (admin, operasyon, muhasebe, depo, viewer)
- 3 mağaza
- 1 lisans anahtarı: `PL-TRIAL-2024-DEMO-KEY`
- 8 bildirim
- 6 otomasyon kuralı
- 25+ entegrasyon (Trendyol, Hepsiburada, n11, Amazon TR, kargo firmaları, ERP'ler)
- 15 ürün (iPhone, Samsung, MacBook, Sony, Nike vb.)
- 50 sipariş
- 30 fatura
- 40 kargo gönderisi
- 6 depo
- 6 iade
- 8 müşteri
- 7 tedarikçi
- 5 kampanya
- 4 ürün feed'i
- 6 fiyat kuralı
- 10 kategori eşlemesi
- Ve daha fazlası...

---

## ADIM 5: Uygulamayı Başlatma

### 5.1 Geliştirme Modu (Development)

```cmd
bun run dev
```

Uygulama **http://localhost:3000** adresinde çalışacaktır.

Tarayıcınızda açın ve kullanmaya başlayın!

### 5.2 Üretim Modu (Production)

Üretim modunda çalıştırmak için önce build alın:

```cmd
bun run build
```

Sonra sunucuyu başlatın:

```cmd
bun run start
```

---

## ADIM 6: Lisans Aktivasyonu

Uygulamayı ilk açtığınızda lisans aktivasyon ekranı görünecektir:

1. Lisans anahtarı alanına şu anahtarı girin:
   ```
   PL-TRIAL-2024-DEMO-KEY
   ```
2. **"Aktifleştir"** butonuna tıklayın
3. Dashboard'a yönlendirileceksiniz

> **Not**: Bu deneme lisansı 1 yıllıktır. Kendi lisans sisteminizi oluşturmak için `/api/license` API endpoint'ini düzenleyebilirsiniz.

---

## Kullanıcı Giriş Bilgileri

Örnek veriler yüklendiyse şu kullanıcılar mevcuttur:

| E-posta | Şifre | Rol | Açıklama |
|---------|-------|-----|----------|
| admin@pazarlogic.com | admin123 | admin | Tam erişim |
| operator@pazarlogic.com | oper123 | operation | Operasyon yöneticisi |
| accountant@pazarlogic.com | muh123 | accounting | Muhasebe uzmanı |
| warehouse@pazarlogic.com | dep123 | warehouse | Depo sorumlusu |
| viewer@pazarlogic.com | view123 | viewer | Sadece okuma |

---

## Yaygın Sorunlar ve Çözümleri

### Sorun 1: "Bun tanınmıyor"
```cmd
npm install -g bun
```
Sonra bilgisayarı yeniden başlatın.

### Sorun 2: "Prisma komutu bulunamadı"
```cmd
npx prisma generate
npx prisma migrate dev --name init
```

### Sorun 3: "Port 3000 zaten kullanımda"
Farklı bir port kullanın:
```cmd
bun run dev -- -p 3001
```
Sonra http://localhost:3001 adresine gidin.

### Sorun 4: "Windows'da native derleme hatası"
Aşağıdaki paketleri yükleyin:
```cmd
npm install --global windows-build-tools
npm install --global node-gyp
```

### Sorun 5: "Sharp modül hatası"
Sharp modülü Windows'da bazen sorun çıkarabilir:
```cmd
npm rebuild sharp
```

### Sorun 6: "sqlite3 hatası"
```cmd
bunx prisma generate --no-engine
bunx prisma db push
```

---

## Proje Komutları Özeti

| Komut | Açıklama |
|-------|----------|
| `bun install` | Bağımlılıkları yükle |
| `bunx prisma generate` | Prisma client oluştur |
| `bunx prisma migrate dev` | Veritabanını oluştur |
| `bunx prisma db seed` | Örnek verileri yükle |
| `bun run dev` | Geliştirme sunucusunu başlat |
| `bun run build` | Üretim derlemesi yap |
| `bun run start` | Üretim sunucusunu başlat |
| `bun run lint` | Kod kalitesi kontrolü |

---

## Uygulama Özellikleri (52 Sayfa)

Uygulamada toplam 52 sayfa bulunmaktadır. Lisans aktivasyonundan sonra sol menüden erişebilirsiniz:

**Ana Menü**: Dashboard, Siparişler, Ürün & Stok
**Feed & Fiyat**: Feed Yönetimi, Şablonlar, Optimizasyon, Akıllı Fiyatlandırma, Stok Senk., ROI
**İşlemler**: Sipariş Karşılama, Kargo, İade, Depo, Barkod
**Pazaryeri**: İçerik, Veri Otomasyon, Otomasyonlar, Kampanyalar, Fiyat, Listeleme, A/B Test, Kargo Karşılaştırma, Buy Box, Repricer, Akıllı Sipariş
**Yönetim**: Müşteriler, Tedarikçiler, E-Fatura, Satınalma, Dropshipping, Döviz, Envanter, E-posta, İhracat, B2B, Paket
**Yapay Zeka**: AI SEO, AI İçerik Stüdyosu, Reklam, Rakip Analizi
**Destek**: Canlı Destek, Bildirimler, Marka Koruma
**Sosyal**: Sosyal Ticaret, Performans Skoru
**Planlama**: Lansman, Vergi, Kar Simülatörü
**Sistem**: Raporlar, Log, Entegrasyonlar, Webhook

Detaylı teknik bilgi için **PazarLogic_Technical_Specification.md** dosyasına bakın.
