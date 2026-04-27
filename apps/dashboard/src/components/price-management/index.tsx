'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Target, Percent, TrendingUp, Search, Tag, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface Product { 
  id: string; 
  name: string; 
  sku: string; 
  price: number; 
  cost: number; 
  stock: number; 
  category: string; 
  marketplace: string; 
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Kablosuz Kulak İçi Kulaklık Pro', sku: 'ELK-KUL-PRO', price: 1499.00, cost: 850.00, stock: 145, category: 'Elektronik', marketplace: 'Trendyol' },
  { id: '2', name: 'Erkek Pamuklu Tişört - Beyaz M', sku: 'TS-BEY-M-001', price: 299.90, cost: 120.00, stock: 450, category: 'Giyim', marketplace: 'Hepsiburada' },
  { id: '3', name: 'Spor Ayakkabı Koşu Serisi', sku: 'AYK-KOS-SYH-42', price: 899.50, cost: 650.00, stock: 12, category: 'Spor', marketplace: 'Amazon TR' },
  { id: '4', name: 'Akıllı Saat Series 8', sku: 'WCH-S8-001', price: 8999.00, cost: 7200.00, stock: 5, category: 'Elektronik', marketplace: 'Trendyol' },
  { id: '5', name: 'Kahve Makinesi 15 Bar', sku: 'KAH-MAK-15', price: 3499.00, cost: 3100.00, stock: 32, category: 'Ev Aletleri', marketplace: 'N11' },
  { id: '6', name: 'Oyun Konsolu Kolu V2', sku: 'GAM-CON-V2', price: 1899.00, cost: 1950.00, stock: 85, category: 'Elektronik', marketplace: 'Trendyol' },
];

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const marginColor = (m: number) => m > 30 ? 'text-emerald-600' : m > 15 ? 'text-blue-600' : m > 5 ? 'text-amber-600' : 'text-red-600';
const marginBadge = (m: number) => m > 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : m > 15 ? 'bg-blue-50 text-blue-700 border-blue-200' : m > 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200';

export default function PriceManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = products.filter((p) => search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) : true);
  const avgPrice = filtered.length > 0 ? filtered.reduce((a, b) => a + b.price, 0) / filtered.length : 0;
  const avgMargin = filtered.length > 0 ? filtered.reduce((a, b) => a + ((b.price - b.cost) / b.price) * 100, 0) / filtered.length : 0;
  const maxPrice = filtered.length > 0 ? Math.max(...filtered.map((p) => p.price)) : 0;

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="h-96 rounded-md bg-slate-200 mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            Fiyat Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kâr marjı analizi ve fiyat optimizasyonu</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Ürün</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{filtered.length}</p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <Target className="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ortalama Fiyat</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{fmt(avgPrice)}</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ort. Kar Marjı</p>
            <p className={`text-3xl font-bold mt-2 ${marginColor(avgMargin)}`}>{avgMargin.toFixed(1)}%</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Yüksek Fiyat</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{fmt(maxPrice)}</p>
          </div>
          <div className="p-2.5 rounded-md bg-violet-50 border border-violet-100">
            <TrendingUp className="h-5 w-5 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Ürün adı veya SKU ara..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Ürün</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Kategori/Pazaryeri</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Satış Fiyatı</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Maliyet</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Kar Marjı</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Kar (TL)</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Tag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    Kriterlere uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const margin = ((p.price - p.cost) / p.price) * 100;
                  const profit = p.price - p.cost;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 line-clamp-1" title={p.name}>{p.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{p.sku}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="inline-flex items-center gap-1 text-slate-600"><Layers className="h-3 w-3 text-slate-400"/>{p.category}</span>
                          <span className="inline-flex items-center gap-1 text-slate-600"><Tag className="h-3 w-3 text-slate-400"/>{p.marketplace}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{fmt(p.price)}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-500">{fmt(p.cost)}</td>
                      <td className={`py-3 px-4 text-right font-bold ${marginColor(margin)}`}>{margin.toFixed(1)}%</td>
                      <td className={`py-3 px-4 text-right font-bold flex items-center justify-end gap-1 ${profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {profit > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {fmt(profit)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${marginBadge(margin)}`}>
                          {margin > 30 ? 'Yüksek' : margin > 15 ? 'Orta' : margin > 5 ? 'Düşük' : 'Zarar'}
                        </span>
                        {margin < 0 && (
                          <div className="flex justify-center mt-1 text-red-500" title="Acil fiyat güncellemesi gerekli!">
                            <AlertTriangle className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {filtered.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
            {filtered.length} ürün listeleniyor
          </div>
        )}
      </div>
    </div>
  );
}
