'use client';

import React, { useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';

// Mock Data
const initialProducts = [
  {
    id: 1,
    sku: 'PKG-SH-001',
    name: 'PROFESYONEL Cilalı Oto Şampuanı (1 lt)',
    stock: 240,
    cost: 122.5,
    price: 245.0,
    status: 'Aktif',
  },
  {
    id: 2,
    sku: 'PKG-LP-050',
    name: "Lastik Parlatıcı (400 ml) 50'li Paket",
    stock: 50,
    cost: 95.0,
    price: 190.0,
    status: 'Aktif',
  },
  {
    id: 3,
    sku: 'PKG-DS-020',
    name: 'Demir Tozu Sökücü (20 lt)',
    stock: 12,
    cost: 4830.0,
    price: 9660.0,
    status: 'Pasif',
  },
  {
    id: 4,
    sku: 'PKG-OK-005',
    name: "Oto Sprey Koku (Tüm Aromalar) 5'li Set",
    stock: 120,
    cost: 90.0,
    price: 180.0,
    status: 'Aktif',
  },
  {
    id: 5,
    sku: 'PKG-FS-005',
    name: "5'li Fırça Seti",
    stock: 0,
    cost: 83.0,
    price: 166.0,
    status: 'Pasif',
  },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products] = useState(initialProducts);

  // Filtering Logic
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ürün Envanteri
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Katalogunuzdaki ürünleri yönetin, arayın ve filtreleyin.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
          <Plus size={18} />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {/* Toolbar Area (Search & Filters) */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Ürün adı veya SKU ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
          {filteredProducts.length} ürün bulundu
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="py-3 px-4 w-16">Görsel</th>
                <th className="py-3 px-4">SKU/Barkod</th>
                <th className="py-3 px-4">Ürün Adı</th>
                <th className="py-3 px-4 text-right">Stok</th>
                <th className="py-3 px-4 text-right">Maliyet</th>
                <th className="py-3 px-4 text-right">Satış Fiyatı</th>
                <th className="py-3 px-4">Durum</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 text-slate-400 group-hover:bg-white group-hover:border-slate-300 transition-colors">
                        <Package size={20} />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {product.stock}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {product.cost.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {product.price.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Arama kriterlerinize uygun ürün bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Gösterilen <span className="font-medium">1</span> -{' '}
                <span className="font-medium">
                  {filteredProducts.length > 5 ? 5 : filteredProducts.length}
                </span>{' '}
                / <span className="font-medium">{products.length}</span> sonuç
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <span className="sr-only">Önceki</span>
                  Önceki
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-indigo-100 z-10">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                  <span className="sr-only">Sonraki</span>
                  Sonraki
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
