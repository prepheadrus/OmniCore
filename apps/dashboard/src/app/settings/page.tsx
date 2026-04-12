"use client";

import React, { useState } from 'react';
import { ShoppingBag, Store, Package, ShoppingCart, ChevronDown } from 'lucide-react';

const mockMarketplaces = [
  {
    id: 'trendyol',
    name: 'Trendyol',
    icon: ShoppingBag,
    iconColor: 'text-orange-500',
    isConnected: true,
    merchantId: '123456789',
    apiKey: 'tr_key_••••••••',
    apiSecret: 'tr_sec_••••••••',
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    icon: Store,
    iconColor: 'text-orange-600',
    isConnected: false,
    merchantId: '',
    apiKey: '',
    apiSecret: '',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: Package,
    iconColor: 'text-yellow-500',
    isConnected: false,
    merchantId: '',
    apiKey: '',
    apiSecret: '',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: ShoppingCart,
    iconColor: 'text-green-500',
    isConnected: false,
    merchantId: '',
    apiKey: '',
    apiSecret: '',
  },
];

export default function SettingsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Entegrasyonlar ve API Ayarları</h1>
        <p className="text-sm text-slate-500 mt-1">Pazar yeri mağazalarınızı OmniCore'a bağlayın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockMarketplaces.map((marketplace) => {
          const isExpanded = expandedId === marketplace.id;
          const Icon = marketplace.icon;

          return (
            <div
              key={marketplace.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
            >
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(marketplace.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-lg bg-slate-100 ${marketplace.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-slate-900">{marketplace.name}</h3>
                    <div className="mt-1 flex items-center">
                      {marketplace.isConnected ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          Bağlı
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                          Bağlı Değil
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-slate-500 hidden sm:block">
                    Ayarlar
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden border-t border-slate-100 ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
                }`}
              >
                <div className="p-5 bg-slate-50/50">
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label htmlFor={`merchantId-${marketplace.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                        Satıcı ID (Merchant ID)
                      </label>
                      <input
                        type="password"
                        id={`merchantId-${marketplace.id}`}
                        defaultValue={marketplace.merchantId}
                        placeholder="Satıcı numaranızı girin"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label htmlFor={`apiKey-${marketplace.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                        API Anahtarı (API Key)
                      </label>
                      <input
                        type="password"
                        id={`apiKey-${marketplace.id}`}
                        defaultValue={marketplace.apiKey}
                        placeholder="API anahtarınızı girin"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label htmlFor={`apiSecret-${marketplace.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                        API Şifresi (API Secret)
                      </label>
                      <input
                        type="password"
                        id={`apiSecret-${marketplace.id}`}
                        defaultValue={marketplace.apiSecret}
                        placeholder="API şifrenizi girin"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Bağlantıyı Sına ve Kaydet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
