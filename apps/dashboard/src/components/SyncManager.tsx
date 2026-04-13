"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Package, ShoppingCart } from "lucide-react";

export default function SyncManager() {
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);

  const handleSyncProducts = async () => {
    setIsSyncingProducts(true);
    const channelId = "trendyol-mock";
    try {
      const response = await fetch("/api/sync/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId: "tenant-123", channelId }),
      });

      if (response.status === 202) {
        const data = await response.json();
        toast.success(`Ürün senkronizasyonu kuyruğa eklendi (Job ID: ${data.jobId})`);
      } else {
        toast.error("Ürün senkronizasyonu başlatılamadı.");
      }
    } catch (error) {
      toast.error("API hatası oluştu.");
    } finally {
      setIsSyncingProducts(false);
    }
  };

  const handleSyncOrders = async () => {
    setIsSyncingOrders(true);
    const channelId = "trendyol-mock";
    try {
      const response = await fetch("/api/sync/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId: "tenant-123", channelId }),
      });

      if (response.status === 202) {
        const data = await response.json();
        toast.success(`Sipariş senkronizasyonu kuyruğa eklendi (Job ID: ${data.jobId})`);
      } else {
        toast.error("Sipariş senkronizasyonu başlatılamadı.");
      }
    } catch (error) {
      toast.error("API hatası oluştu.");
    } finally {
      setIsSyncingOrders(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <RefreshCw size={24} className="text-blue-600" />
        Senkronizasyon Yöneticisi
      </h2>
      <p className="text-gray-600 mb-8">
        Ürün ve sipariş verilerinizi pazar yerleri ile manuel olarak senkronize edebilirsiniz. Bu işlemler arka planda asenkron olarak gerçekleştirilir.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-5 flex flex-col items-center text-center">
          <Package size={48} className="text-indigo-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Ürünleri Senkronize Et</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Tüm satış kanallarındaki ürün fiyat, stok ve açıklamalarını günceller.
          </p>
          <button
            onClick={handleSyncProducts}
            disabled={isSyncingProducts}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSyncingProducts && <RefreshCw size={16} className="animate-spin" />}
            Senkronizasyonu Başlat
          </button>
        </div>

        <div className="border rounded-lg p-5 flex flex-col items-center text-center">
          <ShoppingCart size={48} className="text-emerald-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Siparişleri Senkronize Et</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Yeni siparişleri çeker ve durum güncellemelerini pazar yerlerine iletir.
          </p>
          <button
            onClick={handleSyncOrders}
            disabled={isSyncingOrders}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSyncingOrders && <RefreshCw size={16} className="animate-spin" />}
            Senkronizasyonu Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
