import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clean all
  const tables = ['auditLog','backgroundJob','campaign','supplier','customer','return','automationRule','notification','store','user','warehouse','shipment','invoice','order','product','integration','license','productFeed','priceRule','categoryMapping','webhookEndpoint','contentRule','feedTemplate','stockSyncLog','feedQualityRule','priceHistory'];
  for (const t of tables) {
    try { await (prisma as any)[t].deleteMany(); } catch(e) {}
  }

  // 1. Users
  await prisma.user.createMany({ data: [
    { email: 'admin@pazarlogic.com', password: 'admin123', name: 'Admin Kullanici', role: 'admin', phone: '0532 111 2233', isActive: true, lastLogin: new Date() },
    { email: 'operator@pazarlogic.com', password: 'oper123', name: 'Operasyon Yoneticisi', role: 'operation', phone: '0533 222 3344', isActive: true },
    { email: 'accountant@pazarlogic.com', password: 'muh123', name: 'Muhasebe Uzmani', role: 'accounting', phone: '0534 333 4455', isActive: true },
    { email: 'warehouse@pazarlogic.com', password: 'dep123', name: 'Depo Sorumlusu', role: 'warehouse', phone: '0535 444 5566', isActive: true },
    { email: 'viewer@pazarlogic.com', password: 'view123', name: 'Sadece Okuma', role: 'viewer', phone: '', isActive: true },
  ] });

  // 2. Stores
  await prisma.store.createMany({ data: [
    { name: 'Ana Magaza', code: 'STORE-001', plan: 'enterprise', isActive: true, ownerId: 'admin@pazarlogic.com', settings: '{"currency":"TRY","language":"tr","timezone":"Europe/Istanbul"}' },
    { name: 'Ikinci Magaza', code: 'STORE-002', plan: 'pro', isActive: true, ownerId: 'admin@pazarlogic.com' },
    { name: 'Test Magazasi', code: 'STORE-TEST', plan: 'basic', isActive: false },
  ] });

  // License
  await prisma.license.create({ data: { key: 'PL-TRIAL-2024-DEMO-KEY', status: 'active', licenseType: 'trial', ownerName: 'Demo Kullanici', ownerEmail: 'demo@pazarlogic.com', company: 'PazarLogic Demo', activatedAt: new Date(), expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } });

  // Notifications
  await prisma.notification.createMany({ data: [
    { title: 'Yeni siparis geldi!', message: 'Trendyol uzerinden #ORD-100001 siparisi geldi', type: 'order', category: 'order', isRead: false },
    { title: 'Stok uyarisi', message: 'iPhone 15 Pro Max stoku 10 altina dustu', type: 'warning', category: 'stock', isRead: false },
    { title: 'Kargo teslim edildi', message: 'TRK300000000 kargosu musteriye teslim edildi', type: 'success', category: 'shipment', isRead: true },
    { title: 'Fatura olusturuldu', message: 'INV-200000 faturasi basariyla kesildi', type: 'info', category: 'invoice', isRead: true },
    { title: 'Entegrasyon hatasi', message: 'Hepsiburada API baglantisi kesildi', type: 'error', category: 'system', isRead: false },
    { title: 'Feed import tamamlandi', message: '123 urun basariyla import edildi', type: 'success', category: 'feed', isRead: false },
    { title: 'Fiyat guncellemesi', message: '15 urun icin fiyat otomatik guncellendi', type: 'info', category: 'pricing', isRead: true },
    { title: 'Iade talebi', message: 'RET-00002 iade talebi olusturuldu', type: 'warning', category: 'return', isRead: false },
  ] });

  // Automation Rules (Channable-tarzı If-Then)
  await prisma.automationRule.createMany({ data: [
    { name: 'Otomatik kargo atama', description: 'Siparis hazirlaniyor durumuna gecince Aras Kargo ata', trigger: 'order.status_changed', condition: '{"from":"processing","to":"shipped"}', action: 'assign_carrier', actionData: '{"carrier":"Aras Kargo"}', isActive: true, runCount: 145 },
    { name: 'Dusuk stok uyarisi', description: 'Stok 10 altina dustugunde bildirim gonder', trigger: 'product.stock_low', condition: '{"threshold":10}', action: 'send_notification', actionData: '{"type":"warning","channel":"email"}', isActive: true, runCount: 42 },
    { name: 'Otomatik fatura kes', description: 'Siparis teslim edildiginde e-fatura olustur', trigger: 'order.delivered', condition: '{}', action: 'create_invoice', actionData: '{"type":"sales","autoSend":true}', isActive: true, runCount: 87 },
    { name: 'Yarismaci fiyat takibi', description: 'Ayni urunun diger pazaryerlerindeki fiyatlarini kontrol et', trigger: 'daily_schedule', condition: '{"time":"09:00"}', action: 'competitor_price_check', actionData: '{"autoAdjust":false,"notifyOnly":true}', isActive: true, runCount: 30 },
    { name: 'Stok senkronizasyonu', description: 'Stok degisikligini tum bagli pazaryerlerine aktar', trigger: 'product.stock_changed', condition: '{}', action: 'sync_all_channels', actionData: '{"excludeChannels":[]}', isActive: true, runCount: 230 },
    { name: 'Toplu fiyat guncelleme', description: 'Kampanya basladiginda ilgili urunlerin fiyatini guncelle', trigger: 'campaign.started', condition: '{}', action: 'update_prices', actionData: '{"strategy":"discount","roundTo":0.99}', isActive: false, runCount: 5 },
  ] });

  // Integrations (TR pazar odaklı)
  await prisma.integration.createMany({ data: [
    { name: 'Trendyol', type: 'marketplace', platform: 'trendyol', status: 'connected', lastSync: new Date(), syncStats: '{"orders":156,"products":89,"errors":2}' },
    { name: 'Hepsiburada', type: 'marketplace', platform: 'hepsiburada', status: 'connected', lastSync: new Date(), syncStats: '{"orders":98,"products":76,"errors":0}' },
    { name: 'Amazon TR', type: 'marketplace', platform: 'amazon_tr', status: 'disconnected', syncStats: '{"orders":0,"products":0,"errors":0}' },
    { name: 'n11', type: 'marketplace', platform: 'n11', status: 'connected', lastSync: new Date(), syncStats: '{"orders":67,"products":54,"errors":1}' },
    { name: 'Morhipo', type: 'marketplace', platform: 'morhipo', status: 'disconnected' },
    { name: 'Ciceksepeti', type: 'marketplace', platform: 'ciceksepeti', status: 'disconnected' },
    { name: 'PTT AVM', type: 'marketplace', platform: 'ptt_avm', status: 'disconnected' },
    { name: 'Shopify', type: 'ecommerce', platform: 'shopify', status: 'connected', lastSync: new Date() },
    { name: 'WooCommerce', type: 'ecommerce', platform: 'woocommerce', status: 'disconnected' },
    { name: 'IdeaSoft', type: 'ecommerce', platform: 'ideasoft', status: 'disconnected' },
    { name: 'Ticimax', type: 'ecommerce', platform: 'ticimax', status: 'disconnected' },
    { name: 'Logo ERP', type: 'erp', platform: 'logo', status: 'connected', lastSync: new Date() },
    { name: 'Mikro ERP', type: 'erp', platform: 'mikro', status: 'disconnected' },
    { name: 'ParaSun', type: 'erp', platform: 'parasut', status: 'connected', lastSync: new Date() },
    { name: 'Sovos e-Fatura', type: 'einvoce', platform: 'sovos', status: 'connected', lastSync: new Date() },
    { name: 'ICE Fatura', type: 'einvoce', platform: 'ice', status: 'disconnected' },
    { name: 'Aras Kargo', type: 'cargo', platform: 'aras', status: 'connected', lastSync: new Date() },
    { name: 'Yurtici Kargo', type: 'cargo', platform: 'yurtici', status: 'connected', lastSync: new Date() },
    { name: 'Surat Kargo', type: 'cargo', platform: 'surat', status: 'disconnected' },
    { name: 'Trendyol Express', type: 'cargo', platform: 'trendyol_express', status: 'connected', lastSync: new Date() },
    { name: 'HepsiExpress', type: 'cargo', platform: 'hepsiexpress', status: 'disconnected' },
    { name: 'Oplog Depo', type: 'warehouse', platform: 'oplog', status: 'connected', lastSync: new Date() },
    { name: 'Amazon FBA', type: 'warehouse', platform: 'fba', status: 'disconnected' },
    { name: 'DHL Express TR', type: 'cargo', platform: 'dhl', status: 'disconnected' },
  ] });

  // Products
  await prisma.product.createMany({ data: [
    { name: 'iPhone 15 Pro Max 256GB', sku: 'IPH-15PM-256', barcode: '0194252991111', price: 64999, stock: 45, cost: 58000, category: 'Elektronik', subCategory: 'Akıllı Telefon', brand: 'Apple', marketplace: 'Trendyol', description: 'Apple iPhone 15 Pro Max 256GB Doğal Titanyum', shortDesc: 'iPhone 15 Pro Max 256GB', minStock: 10, weight: 0.22, vatRate: 20, isListed: true, listings: '{"trendyol":{"listed":true,"price":64999,"url":"..."},"hepsiburada":{"listed":true,"price":65499,"url":"..."},"n11":{"listed":true,"price":63999,"url":"..."}}', gtin: '0194252991111', mpn: 'A3101' },
    { name: 'Samsung Galaxy S24 Ultra 256GB', sku: 'SAM-S24U-256', barcode: '8806094703621', price: 54999, stock: 32, cost: 48000, category: 'Elektronik', subCategory: 'Akıllı Telefon', brand: 'Samsung', marketplace: 'Hepsiburada', minStock: 8, weight: 0.23, vatRate: 20, isListed: true, listings: '{"hepsiburada":{"listed":true,"price":54999},"trendyol":{"listed":true,"price":55499}}' },
    { name: 'MacBook Air M3 256GB', sku: 'MAC-AIR-M3', barcode: '0194253091111', price: 49999, stock: 18, cost: 42000, category: 'Bilgisayar', subCategory: 'Laptop', brand: 'Apple', marketplace: 'Trendyol', minStock: 5, weight: 1.24, vatRate: 20, isListed: true, listings: '{"trendyol":{"listed":true,"price":49999},"hepsiburada":{"listed":true,"price":50499}}' },
    { name: 'Sony WH-1000XM5 Kulaklik', sku: 'SNY-WH1K-XM5', barcode: '4548736148321', price: 9999, stock: 67, cost: 7500, category: 'Elektronik', subCategory: 'Kulaklik', brand: 'Sony', marketplace: 'n11', minStock: 15, vatRate: 20, isListed: true, listings: '{"n11":{"listed":true,"price":9999},"trendyol":{"listed":true,"price":10299}}' },
    { name: 'iPad Air M2 256GB', sku: 'IPD-AIR-M2', barcode: '0194253991111', price: 24999, stock: 23, cost: 21000, category: 'Elektronik', subCategory: 'Tablet', brand: 'Apple', marketplace: 'Trendyol', minStock: 8, vatRate: 20, isListed: true },
    { name: 'Apple Watch Ultra 2', sku: 'APW-ULT-2', barcode: '0194254991111', price: 29999, stock: 12, cost: 25000, category: 'Elektronik', subCategory: 'Akıllı Saat', brand: 'Apple', marketplace: 'Hepsiburada', minStock: 5, vatRate: 20, isListed: true },
    { name: 'Dyson V15 Detect Supurge', sku: 'DYS-V15-DTC', barcode: '4548736148322', price: 19999, stock: 8, cost: 15500, category: 'Ev Aletleri', subCategory: 'Supurge', brand: 'Dyson', marketplace: 'n11', minStock: 5, vatRate: 20, isListed: true },
    { name: 'Nike Air Max 270', sku: 'NK-AMX-270', barcode: '0194875123456', price: 4299, stock: 120, cost: 2800, category: 'Ayakkabı', subCategory: 'Spor Ayakkabı', brand: 'Nike', marketplace: 'Trendyol', minStock: 20, vatRate: 20, isListed: true, listings: '{"trendyol":{"listed":true,"price":4299},"hepsiburada":{"listed":true,"price":4399},"n11":{"listed":true,"price":4199}}' },
    { name: 'Xiaomi Robot Supurge X10+', sku: 'XMI-RBT-SUP', barcode: '6970557510123', price: 7999, stock: 34, cost: 5500, category: 'Ev Aletleri', subCategory: 'Robot Supurge', brand: 'Xiaomi', marketplace: 'Hepsiburada', minStock: 10, vatRate: 20, isListed: true },
    { name: 'Logitech MX Master 3S', sku: 'LG-MXM-3S', barcode: '0978551254321', price: 2499, stock: 89, cost: 1800, category: 'Aksesuar', subCategory: 'Mouse', brand: 'Logitech', marketplace: 'n11', minStock: 15, vatRate: 20, isListed: true },
    { name: 'Philips Airfryer XXL HD9867', sku: 'PHL-AFR-XXL', barcode: '8710103856789', price: 6499, stock: 56, cost: 4200, category: 'Ev Aletleri', subCategory: 'Mutfak', brand: 'Philips', marketplace: 'Trendyol', minStock: 10, vatRate: 20, isListed: true },
    { name: 'Bose QC Ultra Kulaklik', sku: 'BSE-QC-ULT', barcode: '0178176329871', price: 12999, stock: 15, cost: 9800, category: 'Elektronik', subCategory: 'Kulaklik', brand: 'Bose', marketplace: 'Hepsiburada', minStock: 8, vatRate: 20, isListed: true },
    { name: 'Arzum Okka Turkish Coffee', sku: 'ARZ-OKK-001', barcode: '8690947456321', price: 3299, stock: 75, cost: 2100, category: 'Ev Aletleri', subCategory: 'Kahve Makinesi', brand: 'Arzum', marketplace: 'Hepsiburada', minStock: 15, vatRate: 20, isListed: true },
    { name: 'Vestel 50 4K UHD Smart TV', sku: 'VST-50UHD', barcode: '8690392023456', price: 14999, stock: 20, cost: 11500, category: 'Elektronik', subCategory: 'Televizyon', brand: 'Vestel', marketplace: 'Trendyol', minStock: 5, vatRate: 20, isListed: true },
    { name: 'Arcelik Bulaşık Makinesi', sku: 'ARC-BLM-6020', barcode: '8690947654321', price: 18999, stock: 14, cost: 14200, category: 'Beyaz Eşya', subCategory: 'Bulaşık Makinesi', brand: 'Arçelik', marketplace: 'Hepsiburada', minStock: 5, vatRate: 20, isListed: true },
  ] });

  // Orders
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const marketplaces = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'n11'];
  const customers = [
    { name: 'Ahmet Yilmaz', email: 'ahmet@email.com', phone: '0532 111 0001' },
    { name: 'Elif Kaya', email: 'elif@email.com', phone: '0533 222 0002' },
    { name: 'Mehmet Demir', email: 'mehmet@email.com', phone: '0534 333 0003' },
    { name: 'Ayse Celik', email: 'ayse@email.com', phone: '0535 444 0004' },
    { name: 'Mustafa Ozturk', email: 'mustafa@email.com', phone: '0536 555 0005' },
    { name: 'Zeynep Arslan', email: 'zeynep@email.com', phone: '0537 666 0006' },
    { name: 'Ali Koc', email: 'ali@email.com', phone: '0538 777 0007' },
    { name: 'Fatma Sahin', email: 'fatma@email.com', phone: '0539 888 0008' },
  ];

  for (let i = 0; i < 50; i++) {
    const c = customers[i % customers.length];
    const total = Math.floor(Math.random() * 50000) + 500;
    const tax = Math.round(total * 0.2);
    const commission = Math.round(total * (marketplaces[i % marketplaces.length] === 'Trendyol' ? 0.08 : marketplaces[i % marketplaces.length] === 'Hepsiburada' ? 0.1 : 0.05));
    await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(10000 + i).padStart(6, '0')}`,
        marketplaceOrderNo: `MP${String(9000000 + i)}`,
        customerName: c.name, customerEmail: c.email, customerPhone: c.phone,
        status: statuses[i % statuses.length],
        totalAmount: total, taxAmount: tax, netAmount: total - tax, commission: commission,
        marketplace: marketplaces[i % marketplaces.length],
        items: Math.floor(Math.random() * 5) + 1,
        shippingAddr: `${i % 10 + 1}. Mahallesi ${i % 50 + 1}. Sokak No:${i % 100 + 1} Kadikoy/Istanbul`,
        billingAddr: `${i % 10 + 1}. Mahallesi ${i % 50 + 1}. Sokak No:${i % 100 + 1} Kadikoy/Istanbul`,
        createdAt: new Date(Date.now() - i * 86400000 * Math.random() * 30),
      }
    });
  }

  // Invoices
  const invTypes = ['sales', 'purchase', 'return'];
  const invStatuses = ['draft', 'sent', 'approved', 'cancelled'];
  for (let i = 0; i < 30; i++) {
    const c = customers[i % customers.length];
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(20000 + i).padStart(6, '0')}`,
        customerName: c.name,
        type: invTypes[i % invTypes.length],
        amount: Math.floor(Math.random() * 30000) + 1000,
        tax: Math.round((Math.floor(Math.random() * 30000) + 1000) * 0.2),
        status: invStatuses[i % invStatuses.length]
      }
    });
  }

  // Shipments
  const carriers = ['Aras Kargo', 'Yurtici Kargo', 'Surat Kargo', 'Trendyol Express', 'HepsiExpress'];
  const shipStatuses = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  for (let i = 0; i < 40; i++) {
    const c = customers[i % customers.length];
    await prisma.shipment.create({
      data: {
        trackingNumber: `TRK${String(300000000 + i)}`,
        orderNumber: `ORD-${String(10000 + i).padStart(6, '0')}`,
        carrier: carriers[i % carriers.length],
        status: shipStatuses[i % shipStatuses.length],
        customerName: c.name,
        address: `${i % 10 + 1}. Cadde No:${i % 100 + 1} Kadikoy/Istanbul`,
        cargoCost: Math.floor(Math.random() * 30) + 15,
      }
    });
  }

  // Warehouses
  await prisma.warehouse.createMany({ data: [
    { name: 'Ana Depo - Istanbul', code: 'WH-001', address: 'Ataturk OSB Mah. 5. Cadde No:12 Esensehir/Istanbul', capacity: 10000, usedSpace: 6750, type: 'standard', status: 'active' },
    { name: 'Anadolu Depo', code: 'WH-002', address: 'Kurtkoy Yanyol Cad. No:34 Pendik/Istanbul', capacity: 5000, usedSpace: 3200, type: 'standard', status: 'active' },
    { name: 'Ankara Bolge Depo', code: 'WH-003', address: 'Sogutozu Mah. 2150. Cadde No:5 Cankaya/Ankara', capacity: 3000, usedSpace: 1800, type: 'standard', status: 'active' },
    { name: 'Izmir Depo', code: 'WH-004', address: 'Gaziemir Sanayi Sitesi B Blok No:8 Izmir', capacity: 4000, usedSpace: 2100, type: 'standard', status: 'active' },
    { name: 'Oplog 3PL Depo', code: 'WH-005', address: 'Oplog Lojistik Merkezi Hadimkoy/Istanbul', capacity: 8000, usedSpace: 5600, type: '3pl', status: 'active' },
    { name: 'Amazon FBA Istanbul', code: 'WH-006', address: 'Amazon FBA Istanbul Depo', capacity: 15000, usedSpace: 8900, type: 'fba', status: 'active' },
  ] });

  // Returns
  await prisma.return.createMany({ data: [
    { returnNumber: 'RET-00001', orderNumber: 'ORD-010005', customerName: 'Ahmet Yilmaz', reason: 'Urun kusurlu cikti', status: 'approved', totalAmount: 4299, refundAmount: 4299, type: 'full', resolvedAt: new Date() },
    { returnNumber: 'RET-00002', orderNumber: 'ORD-010012', customerName: 'Elif Kaya', reason: 'Yanlis urun gonderildi', status: 'pending', totalAmount: 9999, type: 'full' },
    { returnNumber: 'RET-00003', orderNumber: 'ORD-010020', customerName: 'Mehmet Demir', reason: 'Musteri terk - adres bulunamadi', status: 'rejected', totalAmount: 24999, type: 'partial', refundAmount: 0 },
    { returnNumber: 'RET-00004', orderNumber: 'ORD-010028', customerName: 'Ayse Celik', reason: 'Beklentiyi karsilamadi', status: 'processing', totalAmount: 6499, type: 'full' },
    { returnNumber: 'RET-00005', orderNumber: 'ORD-010035', customerName: 'Mustafa Ozturk', reason: 'Kargoda hasar olusmus', status: 'pending', totalAmount: 19999, type: 'full' },
    { returnNumber: 'RET-00006', orderNumber: 'ORD-010041', customerName: 'Zeynep Arslan', reason: 'Iade sureci baslatildi', status: 'approved', totalAmount: 7999, refundAmount: 7999, type: 'full', resolvedAt: new Date() },
  ] });

  // Customers
  await prisma.customer.createMany({ data: [
    { name: 'Ahmet Yilmaz', email: 'ahmet@email.com', phone: '0532 111 0001', city: 'Istanbul', segment: 'vip', loyaltyScore: 950, totalOrders: 28, totalSpent: 245000, avgOrderValue: 8750, lastOrderAt: new Date() },
    { name: 'Elif Kaya', email: 'elif@email.com', phone: '0533 222 0002', city: 'Ankara', segment: 'regular', loyaltyScore: 420, totalOrders: 12, totalSpent: 89000, avgOrderValue: 7416, lastOrderAt: new Date(Date.now() - 86400000 * 5) },
    { name: 'Mehmet Demir', email: 'mehmet@email.com', phone: '0534 333 0003', city: 'Izmir', segment: 'new', loyaltyScore: 80, totalOrders: 2, totalSpent: 12000, avgOrderValue: 6000, lastOrderAt: new Date(Date.now() - 86400000 * 30) },
    { name: 'Ayse Celik', email: 'ayse@email.com', phone: '0535 444 0004', city: 'Istanbul', segment: 'vip', loyaltyScore: 880, totalOrders: 22, totalSpent: 198000, avgOrderValue: 9000, lastOrderAt: new Date() },
    { name: 'Mustafa Ozturk', email: 'mustafa@email.com', phone: '0536 555 0005', city: 'Bursa', segment: 'risky', loyaltyScore: 150, totalOrders: 5, totalSpent: 32000, avgOrderValue: 6400, lastOrderAt: new Date(Date.now() - 86400000 * 15) },
    { name: 'Zeynep Arslan', email: 'zeynep@email.com', phone: '0537 666 0006', city: 'Antalya', segment: 'regular', loyaltyScore: 560, totalOrders: 15, totalSpent: 120000, avgOrderValue: 8000, lastOrderAt: new Date(Date.now() - 86400000 * 2) },
    { name: 'Ali Koc', email: 'ali@email.com', phone: '0538 777 0007', city: 'Istanbul', segment: 'vip', loyaltyScore: 990, totalOrders: 35, totalSpent: 450000, avgOrderValue: 12857, lastOrderAt: new Date() },
    { name: 'Fatma Sahin', email: 'fatma@email.com', phone: '0539 888 0008', city: 'Adana', segment: 'new', loyaltyScore: 50, totalOrders: 1, totalSpent: 4299, avgOrderValue: 4299, lastOrderAt: new Date(Date.now() - 86400000 * 45) },
  ] });

  // Suppliers
  await prisma.supplier.createMany({ data: [
    { name: 'Apple Turkiye', contact: 'Mevlut Dinc', phone: '0212 555 0100', email: 'b2b@apple.com.tr', address: 'Maslak, Istanbul', rating: 5, leadTime: 3, totalOrders: 45, totalSpent: 2850000 },
    { name: 'Samsung Turkiye', contact: 'Can Yilmaz', phone: '0212 555 0200', email: 'b2b@samsung.com.tr', address: 'Atasehir, Istanbul', rating: 4, leadTime: 5, totalOrders: 32, totalSpent: 1560000 },
    { name: 'Nike Turkey', contact: 'Deniz Aksoy', phone: '0216 555 0300', email: 'wholesale@nike.com.tr', address: 'Kurtkoy, Istanbul', rating: 4, leadTime: 7, totalOrders: 18, totalSpent: 420000 },
    { name: 'Sony Turkey', contact: 'Emre Ozkan', phone: '0212 555 0400', email: 'b2b@sony.com.tr', address: 'Sisli, Istanbul', rating: 5, leadTime: 4, totalOrders: 25, totalSpent: 890000 },
    { name: 'Xiaomi Turkey', contact: 'Baris Celik', phone: '0216 555 0500', email: 'b2b@xiaomi.com.tr', address: 'Pendik, Istanbul', rating: 3, leadTime: 10, totalOrders: 12, totalSpent: 320000 },
    { name: 'Vestel Turkiye', contact: 'Hakan Aydin', phone: '0262 555 0600', email: 'b2b@vestel.com.tr', address: 'Manisa', rating: 4, leadTime: 5, totalOrders: 20, totalSpent: 680000 },
    { name: 'Arçelik Turkiye', contact: 'Selin Yildiz', phone: '0212 555 0700', email: 'b2b@arcelik.com.tr', address: 'Kartal, Istanbul', rating: 5, leadTime: 4, totalOrders: 28, totalSpent: 980000 },
  ] });

  // Campaigns
  await prisma.campaign.createMany({ data: [
    { name: 'Yaz Indirimi - Tumu', type: 'discount', marketplace: 'Trendyol', discount: 15, startDate: new Date('2024-06-01'), endDate: new Date('2024-08-31'), status: 'active' },
    { name: 'Back to School', type: 'discount', marketplace: 'Hepsiburada', discount: 20, startDate: new Date('2024-08-15'), endDate: new Date('2024-09-30'), status: 'active' },
    { name: 'Black Friday 2024', type: 'discount', marketplace: '', discount: 30, startDate: new Date('2024-11-22'), endDate: new Date('2024-11-29'), status: 'draft' },
    { name: 'Cyber Monday', type: 'discount', marketplace: 'n11', discount: 25, startDate: new Date('2024-12-02'), endDate: new Date('2024-12-02'), status: 'draft' },
    { name: 'Yeni Yil Kampanyasi', type: 'discount', marketplace: 'Hepsiburada', discount: 10, startDate: new Date('2024-12-25'), endDate: new Date('2025-01-05'), status: 'draft' },
  ] });

  // Audit Logs
  await prisma.auditLog.createMany({ data: [
    { userName: 'Admin Kullanici', action: 'login', entity: 'user', details: 'Giris yapildi - Istanbul' },
    { userName: 'Admin Kullanici', action: 'create', entity: 'product', details: 'iPhone 15 Pro Max 256GB eklendi' },
    { userName: 'Operasyon Yoneticisi', action: 'update', entity: 'order', details: 'ORD-010003 durumu shipped olarak guncellendi' },
    { userName: 'Admin Kullanici', action: 'create', entity: 'automation', details: 'Otomatik kargo atama kurali olusturuldu' },
    { userName: 'Muhasebe Uzmani', action: 'create', entity: 'invoice', details: 'INV-200000 faturasi kesildi' },
    { userName: 'Admin Kullanici', action: 'sync', entity: 'integration', details: 'Trendyol senkronizasyonu tamamlandi - 5 yeni siparis' },
    { userName: 'Depo Sorumlusu', action: 'update', entity: 'product', details: 'Nike Air Max 270 stok 120 olarak guncellendi' },
    { userName: 'Admin Kullanici', action: 'create', entity: 'priceRule', details: 'Elektronik %15 markup kurali olusturuldu' },
  ] });

  // Background Jobs
  await prisma.backgroundJob.createMany({ data: [
    { type: 'sync_inventory', status: 'completed', result: '15 urun senkronize edildi - 3 kanal', progress: 100, startedAt: new Date(Date.now() - 3600000), endedAt: new Date() },
    { type: 'sync_orders', status: 'completed', result: '5 yeni siparis cekildi - Trendyol(3), HB(2)', progress: 100, startedAt: new Date(Date.now() - 7200000), endedAt: new Date(Date.now() - 3600000) },
    { type: 'export_report', status: 'running', result: 'Excel raporu olusturuluyor...', progress: 45, startedAt: new Date() },
    { type: 'price_update', status: 'completed', result: '23 urun fiyati guncellendi', progress: 100, startedAt: new Date(Date.now() - 10800000), endedAt: new Date(Date.now() - 7200000) },
    { type: 'feed_import', status: 'failed', result: 'XML parse hatasi - satir 452', progress: 67, startedAt: new Date(Date.now() - 14400000), endedAt: new Date(Date.now() - 10800000) },
  ] });

  // Product Feeds (Channable-tarzı)
  await prisma.productFeed.createMany({ data: [
    { name: 'Ana Magaza XML Feed', source: 'url', sourceUrl: 'https://magaza.com/feed.xml', format: 'xml', status: 'active', schedule: 'hourly', lastImport: new Date(), totalProducts: 450, validProducts: 432, errorProducts: 18, fieldMapping: '{"title":"name","price":"sale_price","category":"product_type","image":"image_url","sku":"sku","stock":"quantity","brand":"brand"}' },
    { name: 'CSV Stok Feedi', source: 'url', sourceUrl: 'https://magaza.com/stock.csv', format: 'csv', status: 'active', schedule: '30min', lastImport: new Date(), totalProducts: 200, validProducts: 198, errorProducts: 2, fieldMapping: '{"sku":"SKU","stock":"STOK","price":"FIYAT"}' },
    { name: 'Tedarikci Feed - Apple', source: 'upload', format: 'xml', status: 'paused', schedule: 'manual', totalProducts: 85, validProducts: 85, errorProducts: 0 },
    { name: 'WooCommerce Feed', source: 'url', sourceUrl: 'https://shop.com/wp-json/wc/v3/products', format: 'json', status: 'inactive', schedule: 'manual', totalProducts: 320, validProducts: 310, errorProducts: 10 },
  ] });

  // Price Rules (Akıllı Fiyatlandırma)
  await prisma.priceRule.createMany({ data: [
    { name: 'Elektronik %15 Markup', description: 'Elektronik kategorisindeki tum urunlere maliyet uzerine %15 ekle', type: 'markup', baseField: 'cost', value: 15, valueType: 'percentage', minMargin: 10, roundTo: 0.99, marketplace: '', categoryId: 'Elektronik', isActive: true, priority: 1 },
    { name: 'Ayakkabi Sabit 500 TL Markup', description: 'Ayakkabi kategorisine sabit 500 TL ekle', type: 'markup', baseField: 'cost', value: 500, valueType: 'fixed', minMargin: 15, marketplace: '', categoryId: 'Ayakkabı', isActive: true, priority: 2 },
    { name: 'Trendyol Komisyon Ayari', description: 'Trendyol komisyonunu fiyata ekle (%8)', type: 'markup', baseField: 'price', value: 8, valueType: 'percentage', marketplace: 'Trendyol', isActive: true, priority: 3 },
    { name: 'HB Fiyat Esitleme', description: 'Hepsiburada fiyatlarini Trendyol ile esitle', type: 'match', baseField: 'price', value: 0, marketplace: 'Hepsiburada', isActive: true, priority: 4 },
    { name: 'Maks Fiyat Sınırı', description: 'Hicbir urun 100.000 TL uzerine cikmasin', type: 'max_price', baseField: 'price', value: 100000, valueType: 'fixed', isActive: true, priority: 10 },
    { name: 'n11 %5 Indirimli', description: 'n11 de %5 daha dusuk fiyat listele', type: 'discount', baseField: 'price', value: 5, valueType: 'percentage', marketplace: 'n11', isActive: true, priority: 5 },
  ] });

  // Category Mappings
  await prisma.categoryMapping.createMany({ data: [
    { source: 'magaza', sourceCat: 'Akıllı Telefon', target: 'trendyol', targetCat: 'Cep Telefonu' },
    { source: 'magaza', sourceCat: 'Akıllı Telefon', target: 'hepsiburada', targetCat: 'Telefon' },
    { source: 'magaza', sourceCat: 'Akıllı Telefon', target: 'n11', targetCat: 'Cep Telefonu ve Aksesuar > Cep Telefonu' },
    { source: 'magaza', sourceCat: 'Laptop', target: 'trendyol', targetCat: 'Bilgisayar > Laptop' },
    { source: 'magaza', sourceCat: 'Laptop', target: 'hepsiburada', targetCat: 'Bilgisayar ve Tablet > Laptop' },
    { source: 'magaza', sourceCat: 'Kulaklik', target: 'trendyol', targetCat: 'Kulaklik' },
    { source: 'magaza', sourceCat: 'Kulaklik', target: 'hepsiburada', targetCat: 'Ses ve Görüntü > Kulaklik' },
    { source: 'magaza', sourceCat: 'Spor Ayakkabı', target: 'trendyol', targetCat: 'Ayakkabi > Spor' },
    { source: 'magaza', sourceCat: 'Supurge', target: 'trendyol', targetCat: 'Ev > Temizlik > Supurge' },
    { source: 'magaza', sourceCat: 'Mutfak', target: 'hepsiburada', targetCat: 'Mutfak > Mutfak Aletleri' },
  ] });

  // Webhook Endpoints
  await prisma.webhookEndpoint.createMany({ data: [
    { name: 'ERP Sync Webhook', url: 'https://erp.example.com/api/webhook', secret: 'whsec_abc123def456', events: '["order.created","order.updated","product.stock_changed"]', isActive: true, successCount: 245, failCount: 3, lastTriggered: new Date() },
    { name: 'Slack Bildirim', url: 'https://hooks.slack.com/services/T00/B00/xxx', events: '["order.created","return.created","stock.low"]', isActive: true, successCount: 120, failCount: 15, lastTriggered: new Date() },
    { name: 'Firma CRM Webhook', url: 'https://crm.firma.com/webhooks/pazarlogic', events: '["customer.created","customer.updated"]', isActive: false, successCount: 45, failCount: 0 },
  ] });

  // ========== NEW: Content Rules ==========
  await prisma.contentRule.createMany({ data: [
    { name: 'Baslik Şablonu - Trendyol', type: 'title_template', channel: 'Trendyol', description: 'Trendyol için optimize başlık: [Marka] [Model] [Özellik]', template: '{brand} {name} - {subCategory} {attributes.renk}', variables: '{"brand":"Marka","name":"Ürün Adı","subCategory":"Alt Kategori","attributes.renk":"Renk"}', isActive: true, priority: 1, applyCount: 432, lastApplied: new Date() },
    { name: 'Aciklama Sablonu - Hepsiburada', type: 'description_template', channel: 'Hepsiburada', description: 'HB için zengin açıklama şablonu', template: '<h2>{name}</h2><p>{description}</p><ul><li>Marka: {brand}</li><li>SKU: {sku}</li><li>GTIN: {gtin}</li></ul>', variables: '{"name":"Ürün Adı","description":"Açıklama","brand":"Marka","sku":"SKU","gtin":"GTIN"}', isActive: true, priority: 2, applyCount: 310, lastApplied: new Date() },
    { name: 'Gorsel Kontrol Kurali', type: 'image_rule', channel: 'all', description: 'En az 3 görsel, min 800x800 px, beyaz arka plan', template: '', variables: '{"minImages":3,"minWidth":800,"minHeight":800,"bgRequired":"white"}', isActive: true, priority: 3, applyCount: 156 },
    { name: 'GTIN Zorunluluk Kontrolu', type: 'field_validation', channel: 'Trendyol', description: 'Trendyol GTIN zorunlu - 13 haneli EAN barcode', template: '', variables: '{"field":"gtin","minLength":13,"maxLength":13,"pattern":"^[0-9]{13}$"}', isActive: true, priority: 1, applyCount: 89 },
    { name: 'Fiyat Aralik Kontrolu', type: 'price_validation', channel: 'all', description: 'Fiyat 10 TL - 500.000 TL araliginda olmali', template: '', variables: '{"minPrice":10,"maxPrice":500000} ', isActive: true, priority: 5, applyCount: 45 },
    { name: 'n11 Baslik Optimizasyonu', type: 'title_template', channel: 'n11', description: 'n11 SEO dostu başlık şablonu', template: '{name} {brand} En Uygun Fiyat - {category}', variables: '{"name":"Ürün Adı","brand":"Marka","category":"Kategori"}', isActive: true, priority: 2, applyCount: 198 },
    { name: 'Stok Bilgisi Kontrolu', type: 'field_validation', channel: 'all', description: 'Stok bilgisi eksik veya negatif olmamali', template: '', variables: '{"field":"stock","minValue":0} ', isActive: true, priority: 4, applyCount: 67 },
    { name: 'Amazon TR Açiklama Şablonu', type: 'description_template', channel: 'Amazon TR', description: 'Amazon için detaylı ürün açıklaması', template: '<b>{name}</b><br/>{shortDesc}<br/><br/>{description}<br/><br/><b>Marka:</b> {brand} | <b>Model:</b> {mpn}', variables: '{}', isActive: false, priority: 3, applyCount: 12 },
  ] });

  // ========== NEW: Feed Templates ==========
  const feedPlatforms = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'n11', 'Morhipo', 'Ciceksepeti', 'PTT AVM', 'Shopify', 'WooCommerce', 'Google Shopping', 'Facebook Catalog', 'Instagram Shopping'];
  const feedCategories = ['Elektronik', 'Moda', 'Ev & Yaşam', 'Spor', 'Kozmetik', 'Oto Aksesuar', 'Kitap', 'Müzik', 'Ofis', 'Gıda'];
  const templateTypes = [
    { name: 'Temel Ürün Feed', desc: 'Standart ürün bilgileri: başlık, fiyat, stok, görsel, kategori' },
    { name: 'Gelişmiş Ürün Feed', desc: 'Detaylı ürün bilgileri + varyantlar + SEO alanları' },
    { name: 'Stok & Fiyat Feed', desc: 'Sadece stok ve fiyat bilgileri güncelleme feedi' },
    { name: 'Kategori Haritalama Feed', desc: 'Kategori eşleştirme ve dönüşüm tablosu' },
    { name: 'Varyant Ürün Feed', desc: 'Beden, renk, beden gibi varyant bilgileri' },
    { name: 'Promosyon Feed', desc: 'İndirim, kampanya ve promosyon bilgileri' },
    { name: 'SEO Feed', desc: 'SEO başlık, açıklama ve keyword alanları' },
    { name: 'Görsel Feed', desc: 'Ürün görselleri, video linkleri, 360° görüntüler' },
  ];
  let feedTemplates = [];
  let tId = 0;
  for (const platform of feedPlatforms) {
    for (const cat of feedCategories) {
      const tType = templateTypes[tId % templateTypes.length];
      feedTemplates.push({
        name: `${platform} - ${cat} ${tType.name}`,
        description: tType.desc,
        platform,
        format: ['xml', 'csv', 'json'][tId % 3],
        category: cat,
        fields: JSON.stringify(['id', 'title', 'price', 'stock', 'image_url', 'category', 'brand', 'sku', 'barcode', 'description']),
        requirements: JSON.stringify({ minFields: 5, requiredFields: ['title', 'price', 'stock', 'image_url'], maxTitleLength: platform === 'Trendyol' ? 150 : 200 }),
        isPopular: tId % 5 === 0,
        downloadCount: Math.floor(Math.random() * 2500) + 10,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      });
      tId++;
    }
  }
  await prisma.feedTemplate.createMany({ data: feedTemplates });

  // ========== NEW: Stock Sync Logs ==========
  const syncChannels = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'n11'];
  const syncStatuses = ['success', 'success', 'success', 'success', 'error', 'success'];
  const products = ['iPhone 15 Pro Max 256GB', 'Samsung Galaxy S24 Ultra', 'MacBook Air M3', 'Sony WH-1000XM5', 'iPad Air M2', 'Nike Air Max 270'];
  const skus = ['IPH-15PM-256', 'SAM-S24U-256', 'MAC-AIR-M3', 'SNY-WH1K-XM5', 'IPD-AIR-M2', 'NK-AMX-270'];
  let syncLogs = [];
  for (let i = 0; i < 50; i++) {
    const oldS = Math.floor(Math.random() * 100);
    const newS = Math.max(0, oldS + Math.floor(Math.random() * 40) - 20);
    syncLogs.push({
      productName: products[i % products.length],
      sku: skus[i % skus.length],
      channel: syncChannels[i % syncChannels.length],
      oldStock: oldS,
      newStock: newS,
      status: syncStatuses[i % syncStatuses.length],
      error: syncStatuses[i % syncStatuses.length] === 'error' ? 'API timeout - yeniden denenecek' : '',
      triggeredBy: i % 3 === 0 ? 'auto' : 'manual',
      createdAt: new Date(Date.now() - i * 1800000 * Math.random()),
    });
  }
  await prisma.stockSyncLog.createMany({ data: syncLogs });

  // ========== NEW: Feed Quality Rules ==========
  await prisma.feedQualityRule.createMany({ data: [
    { name: 'Baslik Uzunluk Kontrolu', type: 'length_check', field: 'title', condition: 'min:10,max:150', severity: 'error', channel: 'Trendyol', errorCount: 23, lastCheck: new Date() },
    { name: 'Fiyat Pozitif Kontrol', type: 'value_check', field: 'price', condition: 'min:0.01', severity: 'error', channel: 'all', errorCount: 5, lastCheck: new Date() },
    { name: 'Gorsel URL Kontrol', type: 'url_check', field: 'image', condition: 'format:jpg|png|webp', severity: 'warning', channel: 'all', errorCount: 45, lastCheck: new Date() },
    { name: 'Aciklama Min Uzunluk', type: 'length_check', field: 'description', condition: 'min:50', severity: 'warning', channel: 'Hepsiburada', errorCount: 67, lastCheck: new Date() },
    { name: 'Kategori Zorunlu', type: 'required_field', field: 'category', condition: 'notEmpty', severity: 'error', channel: 'all', errorCount: 3, lastCheck: new Date() },
    { name: 'Marka Zorunlu', type: 'required_field', field: 'brand', condition: 'notEmpty', severity: 'error', channel: 'Trendyol', errorCount: 8, lastCheck: new Date() },
    { name: 'Barcode Formati', type: 'format_check', field: 'barcode', condition: 'pattern:^[0-9]{8,14}$', severity: 'warning', channel: 'all', errorCount: 12, lastCheck: new Date() },
    { name: 'Stok >= 0 Kontrolu', type: 'value_check', field: 'stock', condition: 'min:0', severity: 'error', channel: 'all', errorCount: 2, lastCheck: new Date() },
    { name: 'URL Encoding Kontrol', type: 'format_check', field: 'link', condition: 'validUrl', severity: 'warning', channel: 'Google Shopping', errorCount: 15, lastCheck: new Date() },
    { name: 'Duplicate SKU', type: 'uniqueness_check', field: 'sku', condition: 'unique', severity: 'error', channel: 'all', errorCount: 1, lastCheck: new Date() },
  ] });

  // ========== NEW: Price History ==========
  let priceHistories = [];
  const priceRules = ['Elektronik %15 Markup', 'Trendyol Komisyon Ayari', 'n11 %5 Indirimli', 'HB Fiyat Esitleme'];
  for (let i = 0; i < 40; i++) {
    const oldP = Math.floor(Math.random() * 50000) + 1000;
    const change = Math.floor(oldP * (Math.random() * 0.2 - 0.05));
    priceHistories.push({
      productName: products[i % products.length],
      sku: skus[i % skus.length],
      oldPrice: oldP,
      newPrice: oldP + change,
      ruleApplied: priceRules[i % priceRules.length],
      marketplace: syncChannels[i % syncChannels.length],
      changedBy: i % 4 === 0 ? 'manual' : 'auto',
      createdAt: new Date(Date.now() - i * 3600000 * Math.random() * 24),
    });
  }
  await prisma.priceHistory.createMany({ data: priceHistories });

  // ========== NEW: SEO Analysis Samples ==========
  await prisma.seoAnalysis.createMany({ data: [
    {
      type: 'keyword-analysis',
      query: 'kablosuz kulaklik',
      result: JSON.stringify({
        keyword: 'kablosuz kulaklik',
        marketplace: 'Trendyol',
        searchVolume: '67.000 / ay',
        competition: 'Yuksek',
        difficultyScore: 72,
        longTailKeywords: ['kablosuz kulaklik bluetooth', 'kablosuz kulaklik noise cancelling', 'kablosuz kulaklik spor', 'kablosuz kulaklik ses yalıtım', 'kablosuz kulaklik mikrofonlu', 'kablosuz kulaklik uzun batarya', 'kablosuz kulaklik oyun icin', 'kablosuz kulaklik kulak ici', 'kablosuz kulaklik boynuzlu', 'kablosuz kulaklik akg'],
        searchIntent: { bilgi: '25%', islem: '60%', navigasyon: '15%' },
        trend: 'Yukseliyor',
      }),
      score: 82,
    },
    {
      type: 'content-optimization',
      query: 'iPhone 15 Pro Max 256GB - Apple iPhone 15 Pro Max 256GB',
      result: JSON.stringify({
        originalTitle: 'iPhone 15 Pro Max 256GB',
        optimizedTitle: 'Apple iPhone 15 Pro Max 256GB Titanyum Mavi - Orijinal Türkiye Garantili',
        optimizedDescription: 'Apple iPhone 15 Pro Max 256GB, A17 Pro çip, 48MP kamera sistemi, titanyum tasarım ile üstün performans. Türkiye\'de en uygun fiyat, hızlı kargo, orijinal garanti.',
        readabilityScore: 78,
        keywordDensity: '%2.1',
      }),
      score: 75,
    },
    {
      type: 'meta-generator',
      query: 'Sony WH-1000XM5',
      result: JSON.stringify({
        productName: 'Sony WH-1000XM5',
        metaTitle: 'Sony WH-1000XM5 Kablosuz Kulaklık - En İyi Fiyat | Trendyol',
        metaDescription: 'Sony WH-1000XM5 kablosuz gürültü önleyici kulaklık. 30 saat batarya, LDAC desteği. Türkiye\'de en uygun fiyat, hızlı kargo!',
        ogTitle: 'Sony WH-1000XM5 - Premium Kablosuz Kulaklık',
        ogDescription: 'Dünyanın en iyi gürültü önleyici kulaklığı. Sınıfının en uzun batarya süresi.',
      }),
      score: 88,
    },
    {
      type: 'seo-audit',
      query: 'Dyson V15 Detect Supurge - Ev Aletleri',
      result: JSON.stringify({
        title: 'Dyson V15 Detect Supurge',
        category: 'Ev Aletleri',
        overallScore: 58,
        titleScore: 62,
        descriptionScore: 45,
        categoryScore: 70,
        issues: ['Baslik 60 karakter altinda', 'Aciklama too short', 'Teknik ozellikler eksik', 'Gorsel alt tag eksik'],
        improvements: ['Basliga model numarasi ekle', 'Aciklamayi 300+ karakter yap', 'Teknik spec tablosu ekle'],
      }),
      score: 58,
    },
    {
      type: 'content-strategy',
      query: 'Elektronik - Trendyol',
      result: JSON.stringify({
        category: 'Elektronik',
        marketplace: 'Trendyol',
        targetAudience: '18-45 yas teknoloji meraklilari',
        contentPlan: '12 blog yazisi, 6 video icerik, 4 sosyal medya kampanyasi',
        primaryKeywords: ['elektronik', 'teknoloji', 'akilli telefon', 'laptop', 'kulaklik'],
        budget: 'Aylik 15.000 TL icerik bütçesi önerisi',
      }),
      score: 71,
    },
    {
      type: 'competitor-analysis',
      query: 'Teknosa - Trendyol',
      result: JSON.stringify({
        competitor: 'Teknosa',
        marketplace: 'Trendyol',
        strengths: ['Genis urun yelpazesi', 'Guclu marka bilinirligi', 'Hizli kargo'],
        weaknesses: ['Yuksek fiyatlandirma', 'Sınırlı stok', 'Dusuk yorum oran'],
        opportunities: ['Long-tail keyword firsatları', 'Icerik pazarlama acigi', 'Lokal SEO'],
        threats: ['Amazon TR girisi', 'Hepsiburada Buyutec', 'Pazarama yükselisi'],
      }),
      score: 67,
    },
    {
      type: 'keyword-analysis',
      query: 'robot supurge',
      result: JSON.stringify({
        keyword: 'robot supurge',
        marketplace: 'Hepsiburada',
        searchVolume: '34.000 / ay',
        competition: 'Orta',
        difficultyScore: 45,
        longTailKeywords: ['robot supurge xiaomi', 'robot supurge lazer navigasyon', 'robot supurge paspas', 'robot supurge evcil hayvan', 'robot supurge otomatik bosaltma'],
        searchIntent: { bilgi: '40%', islem: '50%', navigasyon: '10%' },
        trend: 'Stabil',
      }),
      score: 79,
    },
    {
      type: 'seo-audit',
      query: 'Nike Air Max 270 - Ayakkabi',
      result: JSON.stringify({
        title: 'Nike Air Max 270',
        category: 'Ayakkabi',
        overallScore: 72,
        titleScore: 80,
        descriptionScore: 65,
        categoryScore: 75,
        issues: ['Renk varyantlari belirtilmemis', 'Beden bilgisi eksik', 'Marka etiketi optimize edilmemis'],
        improvements: ['Renk seçeneklerini basliga ekle', 'Tablo formatinda beden bilgisi ekle', 'Nike marka etiketini daha one cikar'],
      }),
      score: 72,
    },
  ] });

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
