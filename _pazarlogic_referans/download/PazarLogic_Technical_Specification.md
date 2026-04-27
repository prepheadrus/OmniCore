# PazarLogic - Tam Teknik Spesifikasyon & Gelisitirme Dokumani

> **Amac**: Bu dokuman, PazarLogic uygulamasinin tum ozelliklerini detayli olarak icerir. Baska bir yapay zekada ayni uygulamayi sifirdan yeniden gelistirmek icin yeterli teknik detayi saglar.

---

## 1. GENEL BAKIS

PazarLogic, Turk e-ticaret pazaryerleri (Trendyol, Hepsiburada, Amazon TR, PTT AVM vb.) icin cok kanalli entegrasyon ve yonetim panelidir. Channable benzeri bir mimari ile tasarlanmis olup, urun feed yonetimi, akilli fiyatlama, siparis yonetimi, yapay zeka destekli SEO/icerik uretimi ve detayli analitik ozellikleri icerir.

### 1.1 Teknoloji Stacki

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | Next.js (App Router) | 16.x |
| Dil | TypeScript | 5.x |
| Runtime | Bun | latest |
| UI Framework | React | 19.x |
| Stil | Tailwind CSS 4 + shadcn/ui | - |
| Veritabani | SQLite (Prisma ORM) | Prisma 6.x |
| State Management | Zustand | 5.x |
| Sunucu Caching | TanStack React Query | 5.x |
| Tablo | TanStack React Table | 8.x |
| Formlar | React Hook Form + Zod | 7.x / 4.x |
| Grafikler | Recharts | 2.x |
| Animasyonlar | Framer Motion | 12.x |
| Surukle-Birak | @dnd-kit | 6.x / 10.x |
| Ikonlar | Lucide React | latest |
| AI SDK | z-ai-web-dev-sdk | 0.0.17 |
| Markdown | react-markdown | 10.x |
| Editor | @mdxeditor/editor | 3.x |
| Gorsel Islem | Sharp | 0.34.x |
| Auth | next-auth | 4.x |
| i18n | next-intl | 4.x |

### 1.2 Proje Yapisi

```
src/
  app/
    layout.tsx           # Root layout (Inter font, lang="tr")
    page.tsx             # Ana sayfa (License guard + SPA router)
    globals.css          # Tailwind + custom CSS
    api/                 # 61 API route (her biri route.ts)
      dashboard/
      orders/
      products/
      feeds/
      feed-templates/[id]/
      smart-rules/
      price-rules/
      repricer/
      stock-sync/
      stock-sync-log/
      customers/
      campaigns/
      advertising/
      shipments/
      returns/
      invoices/
      warehouses/
      suppliers/
      purchase-orders/
      integrations/
      stores/
      webhooks/
      notifications/
      automation/[id]/
      reports/
      audit/
      jobs/
      auth/
      license/
      bulk/
      buy-box/
      bundles/
      b2b/
      barcode/
      content-rules/
      feed-quality/
      listing-quality/
      ab-testing/
      category-mappings/
      carrier-rates/
      email-campaigns/
      dropshipping/
      multi-currency/
      inventory-forecast/
      performance/
      roi/
      profit-simulator/
      price-history/
      tax-compliance/
      product-launches/
      smart-alerts/
      competitor-prices/
      social/
      live-chat/
      ai-seo/
      ai-content/
      brand-protection/
      fulfillment/
  components/            # 54 ozellik bileseni
    ui/                  # 14 shadcn/ui bilesen
  lib/
    db.ts                # Prisma singleton
    utils.ts             # Yardimci fonksiyonlar
  store/
    useAppStore.ts       # Sayfa navigasyon (SPA)
    useLicenseStore.ts   # Lisans durumu (persist)
prisma/
  schema.prisma          # 54 veritabani modeli
  dev.db                 # SQLite veritabani
  seed.ts                # Veri doldurma
```

### 1.3 Mimari Ozellikler

- **SPA Ici Navigasyon**: Next.js App Router uzerinde Zustand ile sayfa degisimi (hash routing yok, client-side component switch)
- **Multi-Tenant**: Her veri modelinde `storeId` ile magaza ayrimi
- **License Guard**: Uygulama baslamadan once lisans aktivasyonu zorunlu (useLicenseStore + LicenseActivation component)
- **Dynamic Imports**: Tum 54 bilesen `next/dynamic` ile lazy-loaded (SSR kapali)
- **Notification Bell**: Header'da bildirim zili + 30 saniyede bir poll
- **Koyu Tema Sidebar**: Gradient arka planli, daraltilabilir sidebar (w-64 / w-16)
- **Tum UI Turkce**: Navbar, butonlar, tablolar, form alanlari tamamen Turkce

---

## 2. VERITABANI MODELLERI (54 Model)

Tum modellerde `storeId` (default: "default") ve `createdAt/updatedAt` timestamp bulunur. ID'ler CUID formatinda olusturulur.

### Model 1: User (Auth & RBAC)
```
id: String (CUID, PK)
email: String (unique)
password: String
name: String
role: String (default: "viewer") // admin, editor, viewer
avatar: String
phone: String
isActive: Boolean (default: true)
twoFactor: Boolean (default: false)
twoFactorCode: String
lastLogin: DateTime?
storeId: String (default: "default")
```
**Rol sistemi**: admin (tam erisim), editor (urun/siparis duzenleme), viewer (sadece okuma)
**Ozellikler**: 2FA destegi, kullanici aktif/pasif durumu, son giris tarihi takibi

### Model 2: Store (Multi-Tenant)
```
id, name, code (unique), domain, logo, plan (basic/pro/enterprise),
isActive, ownerId, settings (JSON string), createdAt, updatedAt
```
**Plan seviyeleri**: basic, pro, enterprise - ozellik sinirlamasi icin

### Model 3: License
```
id, key (unique), status (inactive/active/expired),
licenseType (trial/basic/pro/enterprise), ownerName, ownerEmail,
company, activatedAt, expiresAt, machineId, features, storeId
```
**Lisans akisi**: Aktivasyon -> dogrulama -> session -> persist (localStorage)

### Model 4: Notification
```
id, userId, storeId, type (info/warning/error/success),
title, message, link, isRead, category (system/order/product/stock/price), createdAt
```

### Model 5: Product (Gelismis Urun Yonetimi)
```
id, name, sku (unique), barcode, price, stock, cost, category, subCategory,
brand, marketplace, storeId, description, shortDesc, images (JSON array),
variants (JSON array), attributes (JSON object), seoTitle, seoDesc,
supplierId, minStock, weight, dimensions (JSON), vatRate (default: 20),
cargoTemplate (default: "standart"), isActive, isListed, listings (JSON),
stockReserve, gtin, mpn, createdAt, updatedAt
```
**Ozellikler**: Coklu varyant, SEO alanlari, KDV orani, kargo sablonu, stok rezervasyon, GTIN/MPN, pazaryeri listeleme durumu, JSON tabanli esleme alanlari

### Model 6: Order (Gelismis Siparis)
```
id, orderNumber (unique), marketplace, marketplaceOrderNo,
customerName, customerEmail, customerPhone, status (pending/processing/
shipped/delivered/cancelled/returned), totalAmount, discount, taxAmount,
netAmount, commission, cargoCost, items, itemsJson (JSON array),
storeId, notes, shippingAddr, billingAddr, invoiceNo, trackingNo,
carrier, cancelReason, createdAt, updatedAt
```
**Ozellikler**: Coklu pazaryeri siparis numarasi eslemesi, komisyon takibi, kargo maliyeti, JSON siparis kalemleri, fatura/teslimat adresi

### Model 7: Return (Iade)
```
id, returnNumber (unique), orderNumber, customerName, reason,
status (pending/approved/rejected/refunded), totalAmount, refundAmount,
type (full/partial), items, storeId, resolvedAt
```

### Model 8: Customer (CRM)
```
id, name, email, phone, city, district, segment (new/active/vip/inactive),
loyaltyScore, totalOrders, totalSpent, avgOrderValue, lastOrderAt,
storeId, notes, tags (JSON array), taxNo, taxOffice
```
**CRM ozellikleri**: Musteri segmentasyonu, sadakat puani, vergi numarasi, etiket sistemi

### Model 9: Integration (Pazaryeri Baglantilari)
```
id, name, type (marketplace/erp/accounting/shipping),
platform (trendyol/hepsiburada/amazon_tr/ptt_avm/ciceksepeti/n11),
status (disconnected/connecting/connected/error),
apiKey, apiSecret, shopUrl, storeId, config (JSON), lastSync,
syncStats (JSON), errorCount, lastError
```
**Desteklenen Platformlar**: Trendyol, Hepsiburada, Amazon TR, PTT AVM, Ciceksepeti, N11

### Model 10: Invoice (E-Fatura)
```
id, invoiceNumber (unique), customerName, type (sales/purchase/credit_note),
amount, tax, status (draft/sent/paid/cancelled), date, storeId, xmlUrl
```

### Model 11: Shipment (Kargo)
```
id, trackingNumber, orderNumber, carrier, status (pending/picked_up/
in_transit/out_for_delivery/delivered/returned), customerName,
address, storeId, labelUrl, cargoCost, weight
```

### Model 12: Warehouse (Depo - WMS)
```
id, name, code, address, capacity, usedSpace, type (standard/cold/
hazardous/fulfillment), status (active/inactive/maintenance)
```

### Model 13: Supplier (Tedarikci)
```
id, name, contact, phone, email, address, rating (1-5), leadTime (gun),
storeId, totalOrders, totalSpent
```

### Model 14: Campaign (Kampanya)
```
id, name, type (discount/bogo/free_shipping/threshold),
marketplace, discount, startDate, endDate, status (draft/active/
paused/ended), productIds (JSON array)
```

### Model 15: AuditLog (Denetim Logu)
```
id, userId, userName, action (create/update/delete/login/export/import),
entity, entityId, details, storeId, createdAt
```

### Model 16: BackgroundJob (Arkaplan Isleri)
```
id, type, status (pending/running/completed/failed),
payload (JSON), result, progress (0-100), storeId, startedAt, endedAt
```

### Model 17: ProductFeed (Channable-tarzi Feed)
```
id, name, source (upload/url/api), sourceUrl, format (xml/csv/json/tsv),
status (active/paused/error), schedule (manual/hourly/daily/weekly),
lastImport, lastError, totalProducts, validProducts, errorProducts,
fieldMapping (JSON), storeId
```
**Feed ozellikleri**: Coklu format destegi (XML/CSV/JSON/TSV), zamanlanmis import, alan esleme, hata takibi

### Model 18: PriceRule (Akilli Fiyatlama)
```
id, name, description, type (markup/markdown/fix_price),
baseField (cost/price/competitor), value, valueType (percentage/fixed),
minMargin, maxPrice, roundTo, marketplace, categoryId,
isActive, priority, storeId
```
**Fiyatlama stratejileri**: Maliyet uzeri yuzde/fixed markup, maksimum fiyat siniri, yuvarlama, pazaryeri bazli, kategori bazli

### Model 19: CategoryMapping (Kategori Esleme)
```
id, source (magaza/pazaryeri), sourceCat, target, targetCat, storeId
```

### Model 20: ContentRule (Icerik Optimizasyonu)
```
id, name, type (title_template/description_template/bulk_replace/
keyword_inject), channel (all/trendyol/hepsiburada/...), category,
description, template (string sablon), variables (JSON), isActive,
priority, applyCount, lastApplied
```
**Sablon degiskenleri**: {urun_adi}, {marka}, {fiyat}, {kategori}, {ozellikler}

### Model 21: FeedTemplate (Sablon Kutuphanesi)
```
id, name, description, platform, format, category, fields (JSON array),
requirements (JSON), sampleUrl, isPopular, downloadCount, rating, storeId
```

### Model 22: StockSyncLog (Stok Senkronizasyon Logu)
```
id, productId, productName, sku, channel, oldStock, newStock,
status (success/error/partial), error, triggeredBy (manual/auto/scheduler)
```

### Model 23: FeedQualityRule (Feed Kalite Kontrolu)
```
id, name, type (required_field/max_length/min_images/price_range),
field, condition, severity (error/warning/info), channel, category,
isActive, errorCount, lastCheck
```

### Model 24: PriceHistory (Fiyat Gecmisi)
```
id, productId, productName, sku, oldPrice, newPrice, ruleApplied,
marketplace, changedBy (auto/manual), storeId, createdAt
```

### Model 25: WebhookEndpoint
```
id, name, url, secret, events (JSON array - ["order.created",
"product.updated","stock.low","price.changed"]), isActive,
successCount, failCount, lastTriggered
```

### Model 26: ChatConversation (Canli Chat)
```
id, customerName, customerEmail, subject, status (active/waiting/
closed/spam), assignedTo, priority (low/normal/high/urgent),
channel (widget/email/social/phone), tags (JSON array)
```
**Iliski**: ChatMessage[] ile bire-cok iliski (Cascade delete)

### Model 27: ChatMessage
```
id, conversationId (FK -> ChatConversation), sender (customer/agent/bot),
senderName, content, type (text/image/file/system), isRead
```

### Model 28: CompetitorPrice (Rakip Fiyat Analizi)
```
id, productId, productName, sku, competitor, marketplace,
price, ourPrice, priceDiff, priceDiffPct, stockStatus,
rating, reviewCount, url, lastChecked
```
**Analiz metrikleri**: Fark (TL + yuzde), stok durumu, puan, yorum sayisi

### Model 29: AdCampaign (Reklam)
```
id, name, marketplace, type (sponsored/display/video/retargeting),
budget, dailyBudget, spent, impressions, clicks, conversions,
ctr, roas, cpc, status (draft/active/paused/completed),
startDate, endDate, productIds (JSON), targeting (JSON), creative (JSON)
```
**Metrikler**: CTR, ROAS, CPC, gosterim, tiklama, donusum

### Model 30: SeoAnalysis (AI SEO)
```
id, type (keyword/content/competitor/technical), query, targetUrl,
result (JSON - AI analiz sonucu), score (0-100), status (pending/
processing/completed/failed)
```
**NOT**: Bu model POST-only API route kullanir (z-ai-web-dev-sdk gerektirir)

### Model 31: ExchangeRate (Coklu Doviz)
```
id, fromCurrency (default: TRY), toCurrency, rate, source (manual/
api/automatic), isActive
```

### Model 32: PurchaseOrder (Satinalma Siparisi)
```
id, poNumber (unique), supplierId, supplierName, status (pending/
approved/received/partial/cancelled), items (JSON), totalAmount,
currency, expectedDate, receivedDate, notes
```

### Model 33: InventoryForecast (Envanter Tahmin)
```
id, productId, productName, sku, currentStock, dailySales,
daysOfStock, reorderPoint, suggestedOrder, trend (stable/rising/
falling/seasonal/volatile), confidence (0-1), period (7d/30d/90d),
forecastData (JSON - tahmin grafik verisi)
```

### Model 34: ListingQualityScore (Listeleme Kalitesi)
```
id, productId, productName, sku, marketplace, overallScore (0-100),
titleScore, imageScore, descScore, priceScore, attributeScore,
seoScore, issues (JSON array), suggestions (JSON array), lastChecked
```
**Alt skorlar**: Baslik, gorsel, aciklama, fiyat, ozellik, SEO - her biri 0-100

### Model 35: CarrierRate (Kargo Fiyat Karsilastirma)
```
id, carrier (yurtici/aras/kargoist/ptt/surat/fedex/dhl/ups),
service (standart/hizli/express/same_day), zone, basePrice, perKg,
maxWeight, estimatedDays, isActive
```

### Model 36: EmailCampaign (E-posta Kampanyasi)
```
id, name, subject, body, segment (all/new/vip/inactive/custom),
status (draft/scheduled/sending/completed), sentCount, openCount,
clickCount, bounceCount, scheduledAt, sentAt
```

### Model 37: AbTest (A/B Testi)
```
id, name, description, type (feed/title/image/price/description),
marketplace, variantA (JSON), variantB (JSON), metric (conversion/
ctr/click_rate/add_to_cart), impressionsA, impressionsB, clicksA,
clicksB, conversionsA, conversionsB, winner (A/B/none), confidence,
status (draft/running/paused/completed), startDate, endDate
```

### Model 38: DropshipOrder (Dropshipping)
```
id, orderNumber (unique), supplierId, supplierName, productId,
productName, customerName, customerAddr, costPrice, sellPrice,
profit, status (pending/ordered/shipped/delivered/cancelled),
trackingNo, marketplace
```

### Model 39: ProductBundle (Paket/Combo)
```
id, name, sku (unique), description, bundleType (fixed/dynamic/customizable),
components (JSON - [{productId, quantity, costShare}]), totalCost,
sellingPrice, discount, stock, minComponentStock, marketplace,
isActive, isListed
```
**Paket turleri**: Sabit paket, dinamik paket, ozellestirilebilir combo

### Model 40: BuyBoxAnalysis (Buy Box Optimizasyonu)
```
id, productId, productName, sku, asin, marketplace (default: amazon),
ourPrice, buyBoxPrice, buyBoxSeller, isBuyBoxWinner, buyBoxWinRate,
competitors (JSON - [{seller, price, rating, fulfilledBy}]),
suggestedPrice, minPrice, maxPrice, fairPrice, ourRating,
ourFeedback, ourFbaEligible, notes
```

### Model 41: B2BCustomer (Toptan Musteri)
```
id, companyName, contactName, email, phone, taxNo, taxOffice,
address, city, country, creditLimit, usedCredit,
paymentTerms (cod/net15/net30/net60), priceTier (standard/silver/gold/platinum),
discountRate, minOrderAmount, totalOrders, totalVolume,
status (active/suspended/pending)
```

### Model 42: B2BOrder (Toptan Siparis)
```
id, orderNumber (unique), customerId, customerName, companyName,
status (pending/confirmed/processing/shipped/delivered), items (JSON),
totalAmount, discount, taxAmount, netAmount, paymentTerms,
dueDate, paidAt, notes, shippingAddr
```

### Model 43: RepricerRule (Dinamik Fiyatlandirma)
```
id, name, description, marketplace, strategy (match_lowest/beat_by/
below_avg/win_buybox/custom), targetPosition (1=lowest, 2=second...),
beatBy, beatByType (fixed/percentage), minPrice, maxPrice, costFloor,
minMargin, maxMargin, rounding (none/up_99/nearest_50/nearest_10),
schedule (always/business_hours/custom), productIds (JSON),
categoryIds (JSON), isActive, priority, lastRun, runCount, adjustmentsCount
```

### Model 44: RepricerLog (Fiyat Degisim Logu)
```
id, ruleId, ruleName, productId, productName, sku, marketplace,
oldPrice, newPrice, competitorAvg, buyBoxPrice, reason
```

### Model 45: SmartOrderRule (Akilli Siparis Kurali)
```
id, name, description, triggerType (order_created/payment_received/shipped/
delivered/cancelled/returned), conditions (JSON - [{field, operator, value}]),
actions (JSON - [{type, params}]), priority, isActive, matchCount,
lastMatched, channels (JSON array)
```

### Model 46: SellerPerformance (Satici Performans Skoru)
```
id, marketplace, period (daily/weekly/monthly), date, orderCount,
onTimeShipment (yuzde), cancellationRate (yuzde), returnRate (yuzde),
validTracking (yuzde), responseTime (saat), positiveRating (yuzde),
accountHealth (healthy/at_risk/critical), overallScore (0-100),
violations, warnings (JSON), recommendations (JSON)
```

### Model 47: BarcodeScan (Barkod Tarama)
```
id, barcode, productId, productName, sku, action (lookup/receive/
pick/pack/stocktake/transfer), warehouseId, binLocation, quantity,
oldStock, newStock, scannedBy, orderId, notes,
status (success/not_found/error/duplicate)
```

### Model 48: SocialListing (Sosyal Ticaret)
```
id, productId, productName, sku, platform (instagram/facebook/tiktok/
pinterest/whatsapp), platformType (shop/catalog/story/post/reels),
listingId, status (draft/active/paused/ended), title, description,
price, salePrice, currency, images (JSON), tags (JSON), category,
inventorySync, clicks, impressions, conversions, revenue, lastSync, lastError
```

### Model 49: AiContentJob (AI Icerik Stüdyosu)
```
id, productId, productName, sku, type (description/title/bullets/
translation/seo_meta), sourceLanguage (default: tr), targetLanguage,
targetMarketplace, inputText, generatedText, keywords (JSON),
tone (professional/casual/luxury/technical), wordCount, qualityScore,
status (pending/generating/completed/failed), error, applied
```

### Model 50: BrandProtectionAlert (Marka Koruma & MAP)
```
id, type (map_violation/unauthorized_seller/counterfeit/trademark_abuse),
productId, productName, sku, marketplace, seller, sellerUrl,
detectedPrice, mapPrice, ourPrice, violationAmount, evidence (JSON),
severity (low/medium/high/critical), status (detected/investigating/
reported/resolved/dismissed), actionTaken, reportedAt, resolvedAt, notes
```

### Model 51: SmartAlertRule (Akilli Bildirim Motoru)
```
id, name, description, category (stock/price/order/performance/competitor/
listing), metric, condition (below/above/equals/change_percent/contains),
threshold, thresholdText, channels (JSON - email/push/webhook/sms/in_app),
frequency (once/repeating/daily/weekly), cooldownMinutes, lastTriggered,
triggerCount, isActive, filters (JSON), assignedTo
```

### Model 52: ProductLaunch (Urun Lansman Takvimi)
```
id, name, description, productIds (JSON), channels (JSON - hedef pazaryerleri),
status (planning/prepared/launched/completed/cancelled),
priority (low/normal/high/critical), launchDate, startDate, endDate,
tasks (JSON - [{name, status, assignee, dueDate}]),
checklists (JSON - {images, descriptions, pricing, inventory}),
budget, spent, notes, tags (JSON)
```

### Model 53: TaxComplianceRule (Vergi & Gumruk)
```
id, name, country (default: TR), region, taxType (vat/customs/import_duty/
excise/sales_tax), rate, thresholdMin, thresholdMax, category, hsCode,
isActive, effectiveDate, expiryDate, notes
```

### Model 54: ProfitSimulation (Kar Marji Simulatörü)
```
id, name, description, productId, productName, sku, marketplace,
scenario (single/comparison/bulk), sellingPrice, costPrice, shippingCost,
marketplaceFee, paymentFee, taxRate, taxAmount, packagingCost, returnRate,
returnCost, advertisingCost, otherCosts, totalCost, netProfit,
profitMargin, roi, breakEvenUnits, monthlyUnits, monthlyProfit,
yearlyProfit, comparisonData (JSON), status (draft/saved)
```

---

## 3. Uygulama Bilesenleri (54 Bilesen)

Uygulama SPA (Single Page Application) mimarisinde calisir. `useAppStore` Zustand store'u ile sayfa gecisi yapilir. Tum bilesenler `next/dynamic` ile lazy-loaded olup SSR kapalidir.

### 3.1 Ana Menu

#### 3.1.1 Dashboard
- **Dosya**: `src/components/Dashboard.tsx`
- **API**: `GET /api/dashboard`
- **Ozellikler**:
  - Toplam siparis, gelir, urun sayisi, musteri sayisi kartlari
  - Son siparisler tablosu (son 10 siparis)
  - Satis grafigi (Recharts - Line/Area chart, 7 gunluk)
  - Pazaryeri dagilimi pie chart
  - Stok uyarilari listesi
  - Performans metrikleri (donusum orani, ortalama siparis degeri)

#### 3.1.2 Orders (Siparis Yonetimi - OMS)
- **Dosya**: `src/components/Orders.tsx`
- **API**: `GET/POST/PUT/DELETE /api/orders`
- **Ozellikler**:
  - Siparis listesi tablosu (filtreleme, siralama, arama)
  - Status filtreleri: pending, processing, shipped, delivered, cancelled, returned
  - Pazaryeri filtresi (Trendyol, Hepsiburada, vb.)
  - Siparis detay modal (kalemler, adres, tracking)
  - Toplu islem: durum guncelleme, etiket yazdirma
  - Excel export

#### 3.1.3 Products (Urun & Stok Yonetimi)
- **Dosya**: `src/components/Products.tsx`
- **API**: `GET/POST/PUT/DELETE /api/products`
- **Ozellikler**:
  - Urun listesi tablosu (arama, kategori, stok durumu filtreleri)
  - Urun ekleme/duzenleme form (tum alanlar: varyant, ozellik, SEO)
  - Toplu fiyat guncelleme
  - Toplu stok guncelleme
  - Stok durumu gostergesi (kirmizi: kritik, sari: dusuk, yesil: yeterli)
  - Gorsel yukleme (coklu)

### 3.2 Feed & Fiyat

#### 3.2.1 ProductFeeds (Urun Feed Yonetimi)
- **Dosya**: `src/components/ProductFeeds.tsx`
- **API**: `GET/POST/PUT/DELETE /api/feeds`
- **Ozellikler**:
  - Feed listesi (XML/CSV/JSON/TSV)
  - Feed olusturma: URL veya dosya yukleme
  - Zamanlanmis import (manual/hourly/daily/weekly)
  - Alan esleme (field mapping) arayuzu
  - Import istatistikleri (toplam/gecerli/hatali)
  - Son import tarihi ve hata mesaji

#### 3.2.2 FeedTemplates (Feed Sablonlari)
- **Dosya**: `src/components/FeedTemplates.tsx`
- **API**: `GET/POST/PUT/DELETE /api/feed-templates`, `GET/PUT/DELETE /api/feed-templates/[id]`
- **Ozellikler**:
  - Sablon kutuphanesi (Trendyol, Hepsiburada, Amazon, vb.)
  - Her sablon: alan listesi, zorunlu alanlar, ornek URL
  - Indirme sayisi ve puan sistemi
  - Populer sablonlar isaretleme

#### 3.2.3 FeedOptimizer (Feed Optimizasyonu)
- **Dosya**: `src/components/FeedOptimizer.tsx`
- **API**: `GET/POST /api/feed-quality`
- **Ozellikler**:
  - Feed kalite kurallari yonetimi
  - Zorunlu alan kontrolu
  - Uzunluk sinirlari, gorsel gereksinimleri
  - Hata seviyeleri (error/warning/info)
  - Toplu kalite kontrol calistirma

#### 3.2.4 SmartPricing (Akilli Fiyatlama)
- **Dosya**: `src/components/SmartPricing.tsx`
- **API**: `GET/POST/PUT/DELETE /api/price-rules`
- **Ozellikler**:
  - Fiyat kurali olusturma (markup/markdown/fix)
  - Maliyet uzeri yuzde veya sabit tutar ekleme
  - Minimum kar marji zorunlulugu
  - Maksimum fiyat siniri
  - Yuvarlama kurallari
  - Pazaryeri ve kategori bazli uygulanma
  - Oncelik siralamasi

#### 3.2.5 StockSync (Stok Senkronizasyonu)
- **Dosya**: `src/components/StockSync.tsx`
- **API**: `GET/POST /api/stock-sync`, `GET /api/stock-sync-log`
- **Ozellikler**:
  - Coklu kanal stok senkronizasyonu
  - Manuel ve otomatik senkronizasyon
  - Senkronizasyon loglari (basari/basarisiz)
  - Kanal bazli esleme

#### 3.2.6 ROIProfit (ROI & Kar Analizi)
- **Dosya**: `src/components/ROIProfit.tsx`
- **API**: `GET /api/roi`
- **Ozellikler**:
  - Pazaryeri bazli kar/zarar tablosu
  - ROI hesaplama
  - Komisyon, kargo, KDV maliyetleri
  - Donusum orani takibi

### 3.3 Islemler

#### 3.3.1 FulfillmentPipeline (Siparis Karsilama)
- **Dosya**: `src/components/FulfillmentPipeline.tsx`
- **API**: `GET/POST /api/fulfillment`
- **Ozellikler**:
  - Siparis karsilama boru hatti (pipeline)
  - Toplama, paketleme, sevk asamalari
  - Siparis durum dashboard'u (kanban gorunumu)

#### 3.3.2 Shipments (Kargo & Lojistik)
- **Dosya**: `src/components/Shipments.tsx`
- **API**: `GET/POST/PUT /api/shipments`
- **Ozellikler**:
  - Kargo gonderileri listesi
  - Takip numarasi girisi
  - Kargo firmasi secimi
  - Durum takibi (bekliyor/toplandi/hazir/gonderildi/teslim)
  - Kargo maliyeti ve agirlik bilgisi

#### 3.3.3 Returns (Iade Yonetimi)
- **Dosya**: `src/components/Returns.tsx`
- **API**: `GET/POST/PUT /api/returns`
- **Ozellikler**:
  - Iade talepleri listesi
  - Iade nedenleri
  - Iade durumu (bekliyor/onaylandi/reddedildi/iade edildi)
  - Tam ve kismi iade destegi
  - Iade tutari hesaplama

#### 3.3.4 WarehouseManagement (Depo - WMS)
- **Dosya**: `src/components/WarehouseManagement.tsx`
- **API**: `GET/POST/PUT /api/warehouses`
- **Ozellikler**:
  - Depo listesi (kapasite/kullanilan alan gosterimi)
  - Depo ekleme/duzenleme
  - Depo turleri: standart, soguk, tehlikeli, fulfillman
  - Kapasite yuzde gostergesi

#### 3.3.5 BarcodeScanner (Barkod Tarayici)
- **Dosya**: `src/components/BarcodeScanner.tsx`
- **API**: `GET/POST /api/barcode`
- **Ozellikler**:
  - Barkod tarama arayuzu (kamera/manuel giris)
  - Urun arama (lookup)
  - Stok guncelleme (receive)
  - Siparis toplama (pick)
  - Paketleme (pack)
  - Sayim (stocktake)
  - Transfer

### 3.4 Pazaryeri

#### 3.4.1 ContentRules (Icerik Optimizasyonu)
- **Dosya**: `src/components/ContentRules.tsx`
- **API**: `GET/POST/PUT/DELETE /api/content-rules`
- **Ozellikler**:
  - Baslik sablonu olusturma (ornegin: "{marka} {urun_adi} - {ozellik1}")
  - Aciklama sablonu
  - Toplu degisiklik (bulk replace)
  - Anahtar kelime ekleme
  - Kanal bazli uygulanma (tum/Trendyol/Hepsiburada/...)
  - Oncelik ve uygulama sayisi takibi

#### 3.4.2 DataAutomation (Veri Otomasyonu)
- **Dosya**: `src/components/DataAutomation.tsx`
- **API**: `GET/POST /api/smart-rules`
- **Ozellikler**:
  - Otomatik veri isleme kurallari
  - Tetikleyici + kosul + aksiyon mimarisi
  - Toplu veri guncelleme

#### 3.4.3 Automation (Otomasyonlar)
- **Dosya**: `src/components/Automation.tsx`
- **API**: `GET/POST/PUT/DELETE /api/automation`, `PUT/DELETE /api/automation/[id]`
- **Ozellikler**:
  - Otomasyon kurali olusturma (tetikleyici/kosul/aksiyon)
  - Kural listesi (aktif/pasif)
  - Calisma sayisi ve son calisma tarihi
  - Tek bir kurali calistirma
  - JSON tabanli kosul ve aksiyon yapisi

#### 3.4.4 Campaigns (Kampanyalar)
- **Dosya**: `src/components/Campaigns.tsx`
- **API**: `GET/POST/PUT/DELETE /api/campaigns`
- **Ozellikler**:
  - Kampanya olusturma (indirim/BYG/kargo bedava/esik)
  - Pazaryeri secimi
  - Baslangic/bitis tarihi
  - Urun secimi (coklu)
  - Durum yonetimi (taslak/aktif/durduruldu/bitti)

#### 3.4.5 Pricing (Fiyat Yonetimi)
- **Dosya**: `src/components/Pricing.tsx`
- **API**: `GET/POST /api/price-history`
- **Ozellikler**:
  - Fiyat gecmisi takibi
  - Urun bazli fiyat degisim grafigi
  - Kural bazli fiyat degisimleri

#### 3.4.6 ListingQuality (Listeleme Kalitesi)
- **Dosya**: `src/components/ListingQuality.tsx`
- **API**: `GET/POST /api/listing-quality`
- **Ozellikler**:
  - Urun listeleme kalite skoru (0-100)
  - Alt skorlar: baslik, gorsel, aciklama, fiyat, ozellik, SEO
  - Sorun tespiti ve onerileri
  - Pazaryeri bazli analiz

#### 3.4.7 AbTesting (A/B Testi)
- **Dosya**: `src/components/AbTesting.tsx`
- **API**: `GET/POST/PUT /api/ab-testing`
- **Ozellikler**:
  - A/B testi olusturma (baslik/gorsel/fiyat/aciklama)
  - Varyant A ve B konfigurasyonu (JSON)
  - Metrik secimi (donusum/CTR/tiklama/sepette)
  - Istatistik takibi (gosterim, tiklama, donusum)
  - Kazanan varyant tespiti (guven skoru ile)

#### 3.4.8 CarrierRates (Kargo Karsilastirma)
- **Dosya**: `src/components/CarrierRates.tsx`
- **API**: `GET/POST/PUT/DELETE /api/carrier-rates`
- **Ozellikler**:
  - Kargo firmasi fiyatlari karsilastirma tablosu
  - Bolge bazli fiyatlandirma
  - Kg bazli fiyat hesaplama
  - Tahmini teslim suresi
  - Aktif/pasif firmalar

#### 3.4.9 BuyBoxOptimizer (Buy Box Optimizasyonu)
- **Dosya**: `src/components/BuyBoxOptimizer.tsx`
- **API**: `GET/POST /api/buy-box`
- **Ozellikler**:
  - Buy Box kazanim durumu
  - Rekabetci fiyat analizi
  - Onerilen fiyat hesaplama
  - Min/Max/Adil fiyat araligi
  - FBA uygunluk kontrolu
  - Rekabetci listesi (satici, fiyat, puan)

#### 3.4.10 DynamicRepricer (Dinamik Repricer)
- **Dosya**: `src/components/DynamicRepricer.tsx`
- **API**: `GET/POST/PUT/DELETE /api/repricer`
- **Ozellikler**:
  - Repricer kurali olusturma
  - Strateji secimi: en dusuk/esle/altinda/buy box kazan
  - Hedef pozisyon (1=en dusuk, 2=ikinci, vb.)
  - Sabit veya yuzde fark belirleme
  - Maliyet tabani zorunlulugu
  - Yuvarlama secenekleri (99a yuvarla, 50ye, 10a)
  - Zamanlama (her zaman/is saatleri/ozel)
  - Ayarlama loglari

#### 3.4.11 SmartOrderRules (Akilli Siparis Kurallari)
- **Dosya**: `src/components/SmartOrderRules.tsx`
- **API**: `GET/POST/PUT/DELETE /api/orders` (smart rules endpoint)
- **Ozellikler**:
  - Tetikleyici: siparis olustu/odeme alindi/gonderildi
  - Kosul sistemi: alan + operator + deger
  - Aksiyon sistemi: durum degistir, bildirim gonder, etiket ekle
  - Kanal filtresi
  - Eslesme sayisi takibi

### 3.5 Yonetim

#### 3.5.1 Customers (Musteri CRM)
- **Dosya**: `src/components/Customers.tsx`
- **API**: `GET/POST/PUT/DELETE /api/customers`
- **Ozellikler**:
  - Musteri listesi (arama, segment, sehir filtreleri)
  - Segmentler: yeni/aktif/VIP/pasif
  - Sadakat puani
  - Siparis gecmisi ozeti
  - Vergi numarasi ve vergi dairesi

#### 3.5.2 Suppliers (Tedarikciler)
- **Dosya**: `src/components/Suppliers.tsx`
- **API**: `GET/POST/PUT/DELETE /api/suppliers`
- **Ozellikler**:
  - Tedarikci listesi
  - Iletisim bilgileri
  - Puanlama (1-5)
  - Teslim suresi (gun)
  - Toplam siparis ve harcama

#### 3.5.3 Invoices (E-Fatura)
- **Dosya**: `src/components/Invoices.tsx`
- **API**: `GET/POST/PUT /api/invoices`
- **Ozellikler**:
  - Fatura listesi
  - Fatura turu: satis/satin alma/iade
  - Durum: taslak/gonderildi/odendi/iptal
  - XML URL (efatura entegrasyonu)
  - Toplam ve KDV

#### 3.5.4 PurchaseOrders (Satinalma Siparisleri)
- **Dosya**: `src/components/PurchaseOrders.tsx`
- **API**: `GET/POST/PUT /api/purchase-orders`
- **Ozellikler**:
  - Satinalma siparisi olusturma
  - Tedarikci secimi
  - Siparis kalemleri (JSON)
  - Beklenen ve teslim tarihi
  - Para birimi (TRY/USD/EUR)

#### 3.5.5 Dropshipping (Dropshipping)
- **Dosya**: `src/components/Dropshipping.tsx`
- **API**: `GET/POST/PUT /api/dropshipping`
- **Ozellikler**:
  - Dropship siparis listesi
  - Tedarikciye otomatik siparis gonderimi
  - Maliyet/satis fiyati/kar takibi
  - Takip numarasi
  - Pazaryeri eslemesi

#### 3.5.6 MultiCurrency (Coklu Doviz)
- **Dosya**: `src/components/MultiCurrency.tsx`
- **API**: `GET/POST/PUT/DELETE /api/multi-currency`
- **Ozellikler**:
  - Doviz kurlari yonetimi
  - Kur kaynaklari: manuel/API/otomatik
  - TRY -> USD/EUR/GBP conversion
  - Aktif/pasif kur

#### 3.5.7 InventoryForecast (Envanter Tahmin)
- **Dosya**: `src/components/InventoryForecast.tsx`
- **API**: `GET/POST /api/inventory-forecast`
- **Ozellikler**:
  - Urun bazli stok tahmini
  - Gunluk satis hizina gore stok gunu hesaplama
  - Siparis noktasi onerisi
  - Trend analizi (stabil/artan/azalan/mevsimsel/dalgalı)
  - Guven skoru (0-1)
  - Tahmin periyodu (7g/30g/90g)
  - Tahmin grafik verisi (JSON)

#### 3.5.8 EmailCampaigns (E-posta Kampanyalari)
- **Dosya**: `src/components/EmailCampaigns.tsx`
- **API**: `GET/POST/PUT /api/email-campaigns`
- **Ozellikler**:
  - E-posta kampanyasi olusturma
  - Konu ve govde icerik
  - Musteri segmenti secimi
  - Zamanlama (aninda/zamanli)
  - Istatistikler: gonderilen/acilan/tiklanan/hatali

#### 3.5.9 MicroExport (Mikro Ihracat)
- **Dosya**: `src/components/MicroExport.tsx`
- **API**: `GET/POST /api/bulk`
- **Ozellikler**:
  - Toplu veri islemleri
  - Toplu fiyat/stok guncelleme
  - Excel import/export

#### 3.5.10 B2BManagement (B2B / Toptan)
- **Dosya**: `src/components/B2BManagement.tsx`
- **API**: `GET/POST/PUT /api/b2b`
- **Ozellikler**:
  - Toptan musteri yonetimi
  - Fiyat kademesi (standard/silver/gold/platinum)
  - Kredi limiti ve kullanilan kredi
  - Odeme vadeleri (COD/Net15/Net30/Net60)
  - Indirim orani
  - Minimum siparis tutari

#### 3.5.11 BundleManagement (Paket / Combo)
- **Dosya**: `src/components/BundleManagement.tsx`
- **API**: `GET/POST/PUT/DELETE /api/bundles`
- **Ozellikler**:
  - Paket olusturma (sabit/dinamik/ozellestirilebilir)
  - Bilesen ekleme (urun + miktar + maliyet payi)
  - Otomatik stok hesaplama (minimum bilesen stogu)
  - Indirim orani
  - Pazaryeri listeleme

### 3.6 Yapay Zeka

#### 3.6.1 AiSeo (AI SEO Motoru)
- **Dosya**: `src/components/AiSeo.tsx`
- **API**: `POST /api/ai-seo` (POST-ONLY, z-ai-web-dev-sdk gerektirir)
- **Ozellikler**:
  - Anahtar kelime analizi (AI ile)
  - Icerik optimizasyon onerileri
  - Rekabet analizi
  - SEO skoru (0-100)
  - Hedef URL girisi
  - Analiz sonucu JSON formatinda

#### 3.6.2 AiContentStudio (AI Icerik Stüdyosu)
- **Dosya**: `src/components/AiContentStudio.tsx`
- **API**: `POST /api/ai-content` (z-ai-web-dev-sdk)
- **Ozellikler**:
  - Urun aciklama uretimi (AI ile)
  - Baslik uretimi
  - Madde imleri uretimi
  - Ceviri (kaynak dil -> hedef dil)
  - SEO meta uretimi
  - Urun secimi (dropdown)
  - Ton secimi: profesyonel/gunluk/luks/teknik
  - Hedef pazaryeri secimi
  - Kalite skoru
  - Uretim gecmisi

#### 3.6.3 Advertising (Reklam Yonetimi)
- **Dosya**: `src/components/Advertising.tsx`
- **API**: `GET/POST/PUT/DELETE /api/advertising`
- **Ozellikler**:
  - Reklam kampanyasi olusturma
  - Tur: sponsored/display/video/retargeting
  - Butce ve gunluk butce
  - Pazaryeri secimi
  - Hedefleme (JSON)
  - Yaratici icerik (JSON)
  - Metrikler: gosterim, tiklama, donusum, CTR, ROAS, CPC

#### 3.6.4 CompetitorPrices (Rakip Fiyat Analizi)
- **Dosya**: `src/components/CompetitorPrices.tsx`
- **API**: `GET/POST/PUT /api/competitor-prices`
- **Ozellikler**:
  - Rakip fiyat listesi
  - Fark analizi (TL ve yuzde)
  - Stok durumu, puan, yorum sayisi
  - Rakip URL
  - Son kontrol tarihi
  - Pazaryeri bazli filtreleme

### 3.7 Destek

#### 3.7.1 LiveChat (Canli Destek Chat)
- **Dosya**: `src/components/LiveChat.tsx`
- **API**: `GET/POST /api/live-chat`
- **Ozellikler**:
  - Konusma listesi (solda)
  - Mesaj gorunumu (sagda)
  - Musteri bilgisi (isim, e-posta, konu)
  - Oncelik: dusuk/normal/yuksek/acil
  - Atama (operator atama)
  - Etiket sistemi
  - Mesaj gonderme (operator/musteri/bot)
  - Okundu/okunmadi durumu
  - Mesaj tipleri: metin/gorsel/dosya/sistem

#### 3.7.2 SmartAlerts (Akilli Bildirimler)
- **Dosya**: `src/components/SmartAlerts.tsx`
- **API**: `GET/POST/PUT/DELETE /api/smart-alerts`
- **Ozellikler**:
  - Bildirim kurali olusturma
  - Kategoriler: stok, fiyat, siparis, performans, rakip, listeleme
  - Kosullar: altinda/ustunda/esittir/yuzde degisim/icerir
  - Bildirim kanallari: e-posta/push/webhook/SMS/uygulama ici
  - Siklik: bir kere/tekrarlayan/gunluk/haftalik
  - Bekleme suresi (cooldown)
  - Atama (sorumlu kisi)
  - Tetikleme sayisi takibi

#### 3.7.3 BrandProtection (Marka Koruma & MAP)
- **Dosya**: `src/components/BrandProtection.tsx`
- **API**: `GET/POST/PUT /api/brand-protection`
- **Ozellikler**:
  - MAP ihlali tespiti
  - Yetkisiz satici tespiti
  - Sahte urun tespiti
  - Marka suistimali tespiti
  - Siddet seviyesi: dusuk/orta/yuksek/kritik
  - Durum: tespit edilen/aratiriliyor/suç duyurusu/cozuldu/reddedildi
  - Kanit (JSON dizi)
  - Ihlal tutari hesaplama

### 3.8 Sosyal Ticaret

#### 3.8.1 SocialCommerce (Sosyal Ticaret)
- **Dosya**: `src/components/SocialCommerce.tsx`
- **API**: `GET/POST/PUT /api/social`
- **Ozellikler**:
  - Platformlar: Instagram, Facebook, TikTok, Pinterest, WhatsApp
  - Listing turleri: shop, catalog, story, post, reels
  - Urun senkronizasyonu
  - Metrikler: tiklama, gosterim, donusum, gelir
  - Fiyat ve indirim yonetimi
  - Etiket ve kategori

#### 3.8.2 PerformanceScorecard (Performans Skoru)
- **Dosya**: `src/components/PerformanceScorecard.tsx`
- **API**: `GET/POST /api/performance`
- **Ozellikler**:
  - Satici performans skoru (0-100)
  - Zamanli sipari orani
  - Iptal orani
  - Iade orani
  - Gecerli takip orani
  - Yanit suresi
  - Olumlu degerlendirme orani
  - Hesap sagligi: saglikli/risk altinda/kritik
  - Ihlaller ve uyarilar
  - Oneri listesi

### 3.9 Planlama

#### 3.9.1 ProductLaunchCalendar (Lansman Takvimi)
- **Dosya**: `src/components/ProductLaunchCalendar.tsx`
- **API**: `GET/POST/PUT /api/product-launches`
- **Ozellikler**:
  - Urun lansman takvimi
  - Gorev listesi (isim, durum, sorumlu, tarih)
  - Kontrol listesi: gorseller, aciklamalar, fiyatlama, stok
  - Bütçe ve harcama takibi
  - Hedef kanallar (coklu pazaryeri)
  - Oncelik: dusuk/normal/yuksek/kritik
  - Durum: planlama/hazir/lansman/tamamlandi/iptal

#### 3.9.2 TaxCompliance (Vergi & Gumruk)
- **Dosya**: `src/components/TaxCompliance.tsx`
- **API**: `GET/POST/PUT/DELETE /api/tax-compliance`
- **Ozellikler**:
  - Vergi kurali yonetimi
  - Vergi turleri: KDV, gumruk, ithalat harci, ozel tuketim vergisi
  - Ulke ve bolge bazli
  - Esik degerler (min/max)
  - Kategori bazli uygulanma
  - HS kodu
  - Gecerlilik tarihi

#### 3.9.3 ProfitSimulator (Kar Simulatörü)
- **Dosya**: `src/components/ProfitSimulator.tsx`
- **API**: `GET/POST /api/profit-simulator`
- **Ozellikler**:
  - Kar marji simulasyonu
  - Maliyet kalemleri: satin alma, kargo, pazaryeri komisyonu, odeme fee, KDV, ambalaj, iade, reklam, diger
  - Net kar ve kar marji hesaplama
  - ROI hesaplama
  - Basa basma noktasi (birim)
  - Aylik ve yillik kar tahmini
  - Senaryo karsilastirmasi (tek/karsilastirma/toplu)

### 3.10 Sistem

#### 3.10.1 Reports (Raporlar)
- **Dosya**: `src/components/Reports.tsx`
- **API**: `GET /api/reports`
- **Ozellikler**:
  - Satis raporu
  - Stok raporu
  - Pazaryeri performans raporu
  - Musteri raporu
  - Grafikler (Recharts)

#### 3.10.2 AuditLog (Log & Izleme)
- **Dosya**: `src/components/AuditLog.tsx`
- **API**: `GET /api/audit`
- **Ozellikler**:
  - Tum sistem hareketlerinin loglanmasi
  - Kullanici, aksiyon, varlik, detay
  - Filtreleme ve arama

#### 3.10.3 Settings (Entegrasyonlar)
- **Dosya**: `src/components/Settings.tsx`
- **API**: `GET/POST/PUT/DELETE /api/integrations`, `GET/POST/PUT /api/stores`
- **Ozellikler**:
  - Pazaryeri entegrasyonlari (API key/secret girisi)
  - Platform: Trendyol, Hepsiburada, Amazon TR, PTT AVM, Ciceksepeti, N11
  - Baglanti durumu: bagli/baglaniyor/hata
  - Son senkronizasyon tarihi
  - Hata sayisi ve son hata
  - Magaza ayarlari

#### 3.10.4 Webhooks (API & Webhook)
- **Dosya**: `src/components/Webhooks.tsx`
- **API**: `GET/POST/PUT/DELETE /api/webhooks`
- **Ozellikler**:
  - Webhook endpoint olusturma
  - Event secimi (siparis olustu, urun guncellendi, stok dustu, fiyat degisti)
  - URL ve secret girisi
  - Basari/basarisiz sayisi
  - Son tetikleme tarihi

#### 3.10.5 NotificationCenter (Bildirim Merkezi)
- **Dosya**: `src/components/NotificationCenter.tsx`
- **API**: `GET /api/notifications`
- **Ozellikler**:
  - Bildirim paneli (header zili ile acilir)
  - Okunmamis bildirim sayisi (30 saniyede bir poll)
  - Bildirim turleri: bilgi/uyari/hata/basarı
  - Kategoriler: sistem/siparis/urun/stok/fiyat

#### 3.10.6 LicenseActivation (Lisans Aktivasyonu)
- **Dosya**: `src/components/LicenseActivation.tsx`
- **API**: `POST /api/license`
- **Ozellikler**:
  - Lisans anahtari girisi
  - Aktivasyon kontrolu
  - Lisans bilgisi gosterimi (tur, sahip, sirket, son kullanma)
  - Persist (localStorage)

#### 3.10.7 Auth (Giris)
- **Dosya**: `src/components/Auth.tsx`
- **API**: `POST /api/auth`
- **Ozellikler**:
  - Kullanici girisi
  - next-auth destegi
  - Rol bazli erisim

---

## 4. API ROTALARI (61 Endpoint)

### 4.1 Temel Endpointler

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/dashboard | GET | Dashboard istatistikleri |
| /api/auth | POST | Kullanici girisi |
| /api/license | POST | Lisans aktivasyonu |
| /api/notifications | GET | Bildirim listesi |

### 4.2 Urun Yonetimi

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/products | GET/POST/PUT/DELETE | Urun CRUD |
| /api/feeds | GET/POST | Feed yonetimi |
| /api/feed-templates | GET/POST/PUT/DELETE | Sablon yonetimi |
| /api/feed-templates/[id] | GET/PUT/DELETE | Tek sablon islem |
| /api/feed-quality | GET/POST | Feed kalite kurallari |
| /api/bulk | GET/POST | Toplu islemler |

### 4.3 Siparis & Lojistik

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/orders | GET/POST/PUT/DELETE | Siparis CRUD |
| /api/shipments | GET/POST/PUT | Kargo gonderileri |
| /api/returns | GET/POST/PUT | Iade yonetimi |
| /api/fulfillment | GET/POST | Siparis karsilama |
| /api/stock-sync | GET/POST | Stok senkronizasyonu |
| /api/stock-sync-log | GET | Senkronizasyon loglari |
| /api/barcode | GET/POST | Barkod islemleri |

### 4.4 Fiyatlandirma

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/price-rules | GET/POST/PUT/DELETE | Fiyat kurallari |
| /api/price-history | GET | Fiyat gecmisi |
| /api/repricer | GET/POST/PUT/DELETE | Dinamik repricer |
| /api/buy-box | GET/POST | Buy Box analizi |
| /api/smart-rules | GET/POST | Akilli kurallar |
| /api/competitor-prices | GET/POST/PUT | Rakip fiyatlar |
| /api/profit-simulator | GET/POST | Kar simulasyonu |
| /api/roi | GET | ROI analizi |

### 4.5 Pazaryeri

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/integrations | GET/POST/PUT/DELETE | Pazaryeri entegrasyonlari |
| /api/stores | GET/POST/PUT | Magaza yonetimi |
| /api/category-mappings | GET/POST/PUT | Kategori eslemeleri |
| /api/content-rules | GET/POST/PUT/DELETE | Icerik kurallari |
| /api/listing-quality | GET/POST | Listeleme kalitesi |
| /api/campaigns | GET/POST/PUT/DELETE | Kampanyalar |
| /api/advertising | GET/POST/PUT/DELETE | Reklamlar |
| /api/ab-testing | GET/POST/PUT | A/B testleri |
| /api/carrier-rates | GET/POST/PUT/DELETE | Kargo fiyatlar |
| /api/social | GET/POST/PUT | Sosyal ticaret |

### 4.6 Musteri & Tedarik

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/customers | GET/POST/PUT/DELETE | Musteri CRM |
| /api/suppliers | GET/POST/PUT/DELETE | Tedarikciler |
| /api/purchase-orders | GET/POST/PUT | Satinalma siparisleri |
| /api/invoices | GET/POST/PUT | E-fatura |
| /api/dropshipping | GET/POST/PUT | Dropshipping |
| /api/b2b | GET/POST/PUT | B2B toptan |
| /api/bundles | GET/POST/PUT/DELETE | Paket yonetimi |
| /api/email-campaigns | GET/POST/PUT | E-posta kampanyaları |

### 4.7 Depo & Envanter

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/warehouses | GET/POST/PUT | Depo yonetimi |
| /api/inventory-forecast | GET/POST | Envanter tahmin |
| /api/multi-currency | GET/POST/PUT/DELETE | Doviz kurlari |

### 4.8 Yapay Zeka

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/ai-seo | POST | AI SEO analizi (POST-ONLY) |
| /api/ai-content | POST | AI icerik uretimi |

### 4.9 Destek & Bildirim

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/live-chat | GET/POST | Canli destek |
| /api/smart-alerts | GET/POST/PUT/DELETE | Akilli bildirimler |
| /api/brand-protection | GET/POST/PUT | Marka koruma |
| /api/product-launches | GET/POST/PUT | Lansman takvimi |
| /api/tax-compliance | GET/POST/PUT/DELETE | Vergi uyumlulugu |

### 4.10 Sistem

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| /api/reports | GET | Raporlar |
| /api/audit | GET | Denetim logu |
| /api/jobs | GET | Arkaplan isleri |
| /api/webhooks | GET/POST/PUT/DELETE | Webhook endpoint |
| /api/automation | GET/POST/PUT/DELETE | Otomasyonlar |
| /api/automation/[id] | PUT/DELETE | Tek otomasyon islem |
| /api/performance | GET/POST | Performans skor |

---

## 5. NAVIGASYON YAPISI (Sidebar Menusu)

Sidebar'da 10 grup altinda toplam 52 sayfa gosterilir:

### Grup 1: ANA MENU (3 sayfa)
1. Dashboard - Genel bakis ve istatistikler
2. Siparişler (OMS) - Cok kanalli siparis yonetimi
3. Ürün & Stok - Urun ve stok yonetimi

### Grup 2: FEED & FIYAT (6 sayfa)
4. Ürün Feed Yönetimi - XML/CSV/JSON feed import
5. Feed Şablonları - Pazaryeri sablon kutuphanesi
6. Feed Optimizasyonu - Kalite kontrol kurallari
7. Akıllı Fiyatlandırma - Otomatik fiyat kurallari
8. Stok Senkronizasyonu - Coklu kanal stok esleme
9. ROI & Kar Analizi - Pazaryeri bazli kar analizi

### Grup 3: ISLEMLER (5 sayfa)
10. Sipariş Karşılama - Fulfillment pipeline
11. Kargo & Lojistik - Kargo gonderi takibi
12. İade Yönetimi - Iade talep ve islem
13. Depo (WMS) - Depo yonetimi
14. Barkod Tarayıcı - Barkod tabanli islemler

### Grup 4: PAZARYERI (11 sayfa)
15. İçerik Optimizasyonu - Baslik/aciklama sablonlari
16. Veri Otomasyonu - Otomatik veri isleme
17. Otomasyonlar - Tetikleyici/kosul/aksiyon kurallari
18. Kampanyalar - Indirim ve promosyonlar
19. Fiyat Yönetimi - Fiyat gecmisi takibi
20. Listeleme Kalitesi - Kalite skoru analizi
21. A/B Test - Varyant testi
22. Kargo Karşılaştırma - Kargo firmasi fiyat karsilastirma
23. Buy Box Optimizasyonu - Buy Box kazanim stratejisi
24. Dinamik Repricer - Otomatik fiyat ayarlama
25. Akıllı Siparis Kuralları - Siparis otomasyon kurallari

### Grup 5: YONETIM (11 sayfa)
26. Müşteriler (CRM) - Musteri segmentasyonu
27. Tedarikçiler - Tedarikci yonetimi
28. E-Fatura - Fatura yonetimi
29. Satınalma Siparişleri - PO yonetimi
30. Dropshipping - Dropship siparisleri
31. Çoklu Döviz - Kur yonetimi
32. Envanter Tahmin - AI stok tahmini
33. E-posta Kampanyaları - E-posta pazarlama
34. Mikro İhracat - Toplu veri islemleri
35. B2B / Toptan - Toptan satis yonetimi
36. Paket / Combo - Urun paketleme

### Grup 6: YAPAY ZEKA (4 sayfa)
37. AI SEO Motoru - AI destekli SEO analizi
38. AI İçerik Stüdyosu - AI icerik uretimi
39. Reklam Yönetimi - Reklam kampanyalari
40. Rakip Fiyat Analizi - Rekabet izleme

### Grup 7: DESTEK (3 sayfa)
41. Canlı Destek Chat - Gercek zamanli destek
42. Akıllı Bildirimler - Esik deger bildirimleri
43. Marka Koruma & MAP - Marka koruma

### Grup 8: SOSYAL TICARET (2 sayfa)
44. Sosyal Ticaret - Instagram/Facebook/TikTok
45. Performans Skoru - Satici performans metrikleri

### Grup 9: PLANLAMA (3 sayfa)
46. Lansman Takvimi - Urun lansman planlama
47. Vergi & Gümrük - Vergi uyumlulugu
48. Kar Simülatörü - Kar marji simulasyonu

### Grup 10: SISTEM (4 sayfa)
49. Raporlar - Detayli raporlar
50. Log & İzleme - Denetim loglari
51. Entegrasyonlar - Pazaryeri baglantilari
52. API & Webhook - Webhook yonetimi

---

## 6. STATE MANAGEMENT (Zustand Store'lar)

### 6.1 useAppStore - Sayfa Navigasyonu
```typescript
interface AppState {
  currentPage: PageKey;  // 52 sayfa anahtari
  sidebarOpen: boolean;  // Sidebar acik/kapali durumu
  setCurrentPage: (page: PageKey) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```
52 tane PageKey tipi tanimlidir (dashboard, orders, products, feeds, vb.)

### 6.2 useLicenseStore - Lisans Durumu
```typescript
interface LicenseState {
  isActivated: boolean;
  licenseKey: string;
  licenseType: string;
  ownerName: string;
  company: string;
  expiresAt: string;
  status: string;
  setLicense: (data) => void;
  clearLicense: () => void;
}
```
- `persist` middleware ile localStorage'a kaydedilir
- Key: 'pazarlogic-license'

---

## 7. UI BILESEN KUTUPHANESI (shadcn/ui)

14 adet shadcn/ui bileseni kullanilir (Radix UI tabanli):

1. **Button** - Buton bileseni (coklu varyant)
2. **Input** - Metin girisi
3. **Label** - Form etiketi
4. **Select** - Acilir liste
5. **Dialog** - Modal pencere
6. **Sheet** - Kenar panel
7. **Table** - Veri tablosu
8. **Tabs** - Sekme sistemi
9. **Card** - Kart konteyner
10. **Badge** - Durum etiketi
11. **Switch** - Acma/kapama
12. **Checkbox** - Isaret kutusu
13. **ScrollArea** - Ozel kaydirma alani
14. **Separator** - Ayirici cizgi
15. **Avatar** - Kullanici gorseli
16. **Tooltip** - Bilgi balonu
17. **Progress** - Ilerleme cubugu
18. **Dropdown Menu** - Acilir menu
19. **Textarea** - Cok satirli metin girisi

---

## 8. GORUNUM VE TASARIM

### 8.1 Renk Paleti
- **Ana renk**: Emerald (yesil tonlari - #10b981, #059669)
- **Arka plan**: Slate tonlari (#0f172a, #1e293b, #334155)
- **Sidebar**: Gradient (koyu slate -> orta slate -> koyu slate)
- **Aktif sayfa**: Emerald 500/20 arka plan + emerald 400 metin
- **Header**: Beyaz arka plan, slate border
- **Icerik**: Slate-100 arka plan

### 8.2 Sidebar Ozellikleri
- Sabit pozisyon (fixed left)
- Genislik: 64 (acik) / 16 (daraltilmis) - Tailwind unit
- Gradient arka plan: linear-gradient(180deg, #0f172a, #1e293b, #0f172a)
- Grup basliklari: 10px, bold, slate-500, uppercase, tracking-widest
- Aktif sayfa: emerald isareti (2px rounded-full)
- Daraltilmis halde tooltip destegi
- Alt kisimda daraltma butonu

### 8.3 Header
- Sabit pozisyon (fixed top)
- Sol kenar: sidebar genisligine uyumlu (left-64 / left-16)
- Sag tarafta: bildirim zili + kullanici avatar
- Bildirim zili uzerinde okunmamis sayi badge'i (kirmizi)

### 8.4 Genel UI Deseni
- Tum sayfalar icin `pt-16` (header yüksekligi)
- Kart tabanli layout
- Tablolarda arama, filtreleme, siralama
- Modal dialog'lar ile detay/duzenleme
- Renkli durum badge'leri
- Ikon destegi (Lucide React)

---

## 9. GUVENLIK VE ORTAM KONFIGURASYONU

### 9.1 Next.js Konfigürasyonu
- `next.config.ts` ile yapilandirma
- Output: standalone (production build)
- Static dosya kopyalama: .next/static -> standalone

### 9.2 Veritabani
- SQLite (Prisma ORM)
- Dosya konumu: `prisma/dev.db`
- Migration destegi: prisma migrate
- Seed: `prisma/seed.ts`

### 9.3 Auth
- next-auth entegrasyonu
- API route: POST /api/auth
- Rol tabanli erisim: admin/editor/viewer

### 9.4 Lisans Sistemi
- Aktivasyon zorunlu (uygulama baslangicinda)
- Lisans anahtari dogrulama
- Persist (localStorage)
- Tur: trial/basic/pro/enterprise
- Son kullanma tarihi kontrolu

---

## 10. UI DILI

Tum arayuz tamamen Turkce'dir. Bazi ornek terimler:

| Ingilizce | Turkce Karsiligi |
|-----------|-----------------|
| Dashboard | Dashboard |
| Orders | Siparişler |
| Products | Ürün & Stok |
| Product Feeds | Ürün Feed Yönetimi |
| Smart Pricing | Akıllı Fiyatlandırma |
| Stock Sync | Stok Senkronizasyonu |
| Customers | Müşteriler (CRM) |
| Suppliers | Tedarikçiler |
| Invoices | E-Fatura |
| Shipments | Kargo & Lojistik |
| Returns | İade Yönetimi |
| Warehouse | Depo (WMS) |
| Campaigns | Kampanyalar |
| Automation | Otomasyonlar |
| Smart Alerts | Akıllı Bildirimler |
| Live Chat | Canlı Destek Chat |
| AI SEO | AI SEO Motoru |
| AI Content | AI İçerik Stüdyosu |
| Competitor Prices | Rakip Fiyat Analizi |
| Brand Protection | Marka Koruma & MAP |
| Product Launches | Lansman Takvimi |
| Tax Compliance | Vergi & Gümrük |
| Profit Simulator | Kar Simülatörü |
| Bundle | Paket / Combo |
| Dropshipping | Dropshipping |
| B2B | B2B / Toptan |
| Buy Box | Buy Box Optimizasyonu |
| Dynamic Repricer | Dinamik Repricer |
| Performance Scorecard | Performans Skoru |
| Social Commerce | Sosyal Ticaret |
| Multi Currency | Çoklu Döviz |
| Purchase Orders | Satınalma Siparişleri |
| Inventory Forecast | Envanter Tahmin |
| Listing Quality | Listeleme Kalitesi |
| Carrier Rates | Kargo Karşılaştırma |
| Email Campaigns | E-posta Kampanyaları |
| A/B Testing | A/B Test |
| Barcode Scanner | Barkod Tarayıcı |
| Content Rules | İçerik Optimizasyonu |
| Data Automation | Veri Otomasyonu |
| Feed Optimizer | Feed Optimizasyonu |
| Fulfillment | Sipariş Karşılama |
| Micro Export | Mikro İhracat |
| Smart Order Rules | Akıllı Siparis Kuralları |
| Settings | Entegrasyonlar |
| Webhooks | API & Webhook |
| Reports | Raporlar |
| Audit Log | Log & İzleme |

---

## 11. OZET ISTATISTIKLER

| Metrik | Deger |
|--------|-------|
| Toplam Prisma Modeli | 54 |
| Toplam React Bileşeni | 54 |
| Toplam API Rotasi | 61 |
| Toplam Sayfa (PageKey) | 52 |
| Sidebar Grubu | 10 |
| shadcn/ui Bileşeni | 19 |
| Zustand Store | 2 |
| Desteklenen Pazaryeri | 6+ |
| AI Entegrasyonu | 2 (SEO + Icerik) |
| Veritabani | SQLite (Prisma) |
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript |
| UI Dili | Turkce |

---

> Bu dokuman PazarLogic uygulamasinin tam teknik spesifikasyonudur. Baska bir yapay zeka ortaminda ayni uygulamayi sifirdan gelistirmek icin yeterli detayi icerir.
