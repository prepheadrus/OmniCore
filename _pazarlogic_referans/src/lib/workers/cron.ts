import cron from 'node-cron';
import { db } from '@/lib/db';
import { AdapterFactory } from '@/lib/integrations/AdapterFactory';

// Bu fonksiyon tüm bağlı entegrasyonlar için siparişleri çeker
export async function syncOrders() {
  console.log('[CRON] Sipariş senkronizasyonu başlatılıyor...');

  try {
    const integrations = await db.integration.findMany({
      where: { status: 'connected', type: 'marketplace' }
    });

    for (const integration of integrations) {
      console.log(`[CRON] ${integration.name} (${integration.platform}) için adaptör başlatılıyor...`);
      const adapter = await AdapterFactory.getAdapter(integration.id);

      if (!adapter) {
        console.log(`[CRON] ${integration.name} için adaptör bulunamadı veya pasif.`);
        continue;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1); // Son 1 günlük siparişler

      try {
        const orders = await adapter.getOrders(startDate, endDate);
        console.log(`[CRON] ${integration.name} üzerinden ${orders.length} sipariş çekildi.`);

        // Gerçek senaryoda bu siparişler db.order.create veya upsert ile kaydedilmeli.
      } catch (error) {
        console.error(`[CRON] ${integration.name} sipariş çekilirken hata:`, error);
      }
    }
  } catch (error) {
    console.error('[CRON] Sipariş senkronizasyonu genel hata:', error);
  }
}

// Next.js development veya production sunucusunda bu dosya import edildiğinde cron çalışmaya başlar
export function initCron() {
  // Global bir değişkene atayarak HMR (Hot Module Replacement) sırasında birden fazla cron oluşmasını engelliyoruz
  const globalAny: any = global;
  if (!globalAny.__CRON_INITIALIZED) {
    console.log('[CRON] Zamanlanmış görevler başlatıldı.');

    // Her 15 dakikada bir siparişleri kontrol et
    cron.schedule('*/15 * * * *', () => {
      syncOrders();
    });

    globalAny.__CRON_INITIALIZED = true;
  }
}
