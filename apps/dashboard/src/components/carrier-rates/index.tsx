'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, DollarSign, Clock, Zap, Plus, Edit2, ArrowRightLeft,
  BarChart3, Package, Search, ChevronDown, X, Save
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

interface CarrierRate {
  id: string;
  company: string;
  service: string;
  zone: string;
  basePrice: number;
  perKg: number;
  maxWeight: number;
  estimatedDays: number;
  active: boolean;
}

const MOCK_RATES: CarrierRate[] = [
  { id: '1', company: 'Aras Kargo', service: 'Standart', zone: 'Yurtiçi', basePrice: 35, perKg: 2.5, maxWeight: 30, estimatedDays: 2, active: true },
  { id: '2', company: 'Aras Kargo', service: 'Hızlı', zone: 'Yurtiçi', basePrice: 55, perKg: 4, maxWeight: 30, estimatedDays: 1, active: true },
  { id: '3', company: 'Yurtiçi Kargo', service: 'Ekonomik', zone: 'Yurtiçi', basePrice: 30, perKg: 2, maxWeight: 25, estimatedDays: 3, active: true },
  { id: '4', company: 'Trendyol Express', service: 'Standart', zone: 'Yurtiçi', basePrice: 28, perKg: 2, maxWeight: 20, estimatedDays: 2, active: true },
  { id: '5', company: 'HepsiJet', service: 'Standart', zone: 'Yurtiçi', basePrice: 32, perKg: 2.2, maxWeight: 25, estimatedDays: 2, active: true },
  { id: '6', company: 'PTT Kargo', service: 'Ekonomik', zone: 'Yurtiçi', basePrice: 25, perKg: 1.8, maxWeight: 30, estimatedDays: 4, active: true },
  { id: '7', company: 'FedEx', service: 'International', zone: 'Avrupa', basePrice: 250, perKg: 15, maxWeight: 70, estimatedDays: 3, active: true },
  { id: '8', company: 'DHL', service: 'Express', zone: 'Dünya Geneli', basePrice: 300, perKg: 18, maxWeight: 70, estimatedDays: 2, active: true },
  { id: '9', company: 'UPS', service: 'Standard', zone: 'Avrupa', basePrice: 220, perKg: 14, maxWeight: 70, estimatedDays: 4, active: true },
  { id: '10', company: 'Trendyol Express', service: 'Aynı Gün', zone: 'Yurtiçi', basePrice: 45, perKg: 3, maxWeight: 10, estimatedDays: 0, active: false },
];

const zones = ['Yurtiçi', 'Avrupa', 'Dünya Geneli', 'Kuzey Amerika', 'Asya'];

export default function CarrierRates() {
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CarrierRate | null>(null);
  
  const [formCompany, setFormCompany] = useState('');
  const [formService, setFormService] = useState('');
  const [formZone, setFormZone] = useState('Yurtiçi');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [formPerKg, setFormPerKg] = useState('');
  const [formMaxWeight, setFormMaxWeight] = useState('');
  const [formEstimatedDays, setFormEstimatedDays] = useState('');
  const [formActive, setFormActive] = useState(true);
  
  const [compareWeight, setCompareWeight] = useState('5');
  const [compareZone, setCompareZone] = useState('Yurtiçi');
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRates(MOCK_RATES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (!formCompany.trim() || !formService.trim()) return;

    const payload: CarrierRate = {
      id: editingRate?.id || Date.now().toString(),
      company: formCompany,
      service: formService,
      zone: formZone,
      basePrice: parseFloat(formBasePrice) || 0,
      perKg: parseFloat(formPerKg) || 0,
      maxWeight: parseFloat(formMaxWeight) || 0,
      estimatedDays: parseInt(formEstimatedDays) || 0,
      active: formActive,
    };

    if (editingRate) {
      setRates(prev => prev.map(r => r.id === payload.id ? payload : r));
    } else {
      setRates(prev => [...prev, payload]);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingRate(null);
    setFormCompany('');
    setFormService('');
    setFormZone('Yurtiçi');
    setFormBasePrice('');
    setFormPerKg('');
    setFormMaxWeight('');
    setFormEstimatedDays('');
    setFormActive(true);
  };

  const openEdit = (rate: CarrierRate) => {
    setEditingRate(rate);
    setFormCompany(rate.company);
    setFormService(rate.service);
    setFormZone(rate.zone);
    setFormBasePrice(rate.basePrice.toString());
    setFormPerKg(rate.perKg.toString());
    setFormMaxWeight(rate.maxWeight.toString());
    setFormEstimatedDays(rate.estimatedDays.toString());
    setFormActive(rate.active);
    setDialogOpen(true);
  };

  const activeRates = rates.filter((r) => r.active);
  const avgPrice = activeRates.length > 0 ? activeRates.reduce((s, r) => s + r.basePrice, 0) / activeRates.length : 0;
  const cheapest = activeRates.length > 0 ? activeRates.reduce((a, b) => (a.basePrice < b.basePrice ? a : b)) : null;
  const fastest = activeRates.length > 0 ? activeRates.reduce((a, b) => (a.estimatedDays <= b.estimatedDays ? a : b)) : null;

  const compareResults = activeRates
    .filter((r) => r.zone === compareZone)
    .map((r) => ({
      ...r,
      totalPrice: r.basePrice + (parseFloat(compareWeight) || 0) * r.perKg,
    }))
    .sort((a, b) => a.totalPrice - b.totalPrice);

  const chartData = compareResults.map((r) => ({
    name: `${r.company} (${r.service})`,
    fiyat: r.totalPrice,
  }));

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-slate-200 rounded-md" />)}
          </div>
          <div className="h-80 rounded-md bg-slate-200 mt-6" />
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
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            Kargo Karşılaştırma
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kargo firması fiyatlarını karşılaştırın ve en uygun seçeneği bulun</p>
        </div>
        <button 
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Yeni Fiyat Ekle
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-blue-500" /> Aktif Firma / Hizmet
            </p>
            <p className="text-3xl font-bold text-slate-800">{activeRates.length}</p>
            <p className="text-xs text-slate-400 mt-1">{new Set(activeRates.map((r) => r.company)).size} farklı şirket</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Ort. Başlangıç Fiyatı
            </p>
            <p className="text-3xl font-bold text-slate-800">₺{avgPrice.toFixed(0)}</p>
            <p className="text-xs text-slate-400 mt-1">Tüm hizmetler geneli</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> En Ucuz Seçenek
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1 truncate" title={cheapest?.company}>{cheapest?.company || '-'}</p>
            <p className="text-xs text-slate-400 mt-1">₺{cheapest?.basePrice || 0} başlangıç</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-violet-500" /> En Hızlı Teslimat
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1 truncate" title={fastest?.company}>{fastest?.company || '-'}</p>
            <p className="text-xs text-slate-400 mt-1">
              {fastest?.estimatedDays === 0 ? 'Aynı Gün' : `${fastest?.estimatedDays || '-'} gün tahmini`}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Compare */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-800">Hızlı Karşılaştırma Hesaplayıcı</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-slate-50 rounded-md border border-slate-100">
          <div className="w-full sm:w-48">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Ağırlık / Desi (kg)</label>
            <input
              type="number"
              value={compareWeight}
              onChange={(e) => setCompareWeight(e.target.value)}
              placeholder="5"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Bölge</label>
            <div className="relative">
              <select 
                value={compareZone} 
                onChange={(e) => setCompareZone(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <button 
            onClick={() => setShowCompare(true)} 
            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" /> Hesapla
          </button>
        </div>

        {showCompare && compareResults.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" /> Karşılaştırma Sonuçları (Ucuzdan Pahalıya)
              </h3>
              {compareResults.slice(0, 6).map((r, idx) => (
                <div key={r.id} className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${idx === 0 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 ${
                      idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-emerald-400' : 'bg-slate-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{r.company} <span className="font-medium text-slate-500">({r.service})</span></p>
                      <p className="text-xs text-slate-500 mt-0.5">Kg başı: ₺{r.perKg} &middot; Tahmini: {r.estimatedDays === 0 ? 'Aynı gün' : `${r.estimatedDays} gün`}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${idx === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>₺{r.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="h-80 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" /> Fiyat Grafiği
              </h3>
              <div className="flex-1 w-full min-h-0">
                <div style={{ width: "100%", height: "100%", minHeight: 300 }}><ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" angle={-45} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#e2e8f0" tickFormatter={(value) => `₺${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(value: any) => [`₺${value.toFixed(2)}`, 'Toplam Fiyat']}
                    />
                    <Bar dataKey="fiyat" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Carrier Rate Table */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Tüm Kargo Fiyatları ve Hizmetleri</h2>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Firma</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Hizmet</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Bölge</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Başlangıç</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Kg Başı</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Maks Ağırlık</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Süre</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Durum</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3 opacity-50" />
                    Henüz kargo fiyatı eklenmemiş.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 max-w-[150px] truncate">{rate.company}</td>
                    <td className="py-3 px-4 text-slate-600">{rate.service}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                        {rate.zone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">₺{rate.basePrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">₺{rate.perKg.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{rate.maxWeight} kg</td>
                    <td className="py-3 px-4 text-center">
                      {rate.estimatedDays === 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aynı Gün
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 font-medium">{rate.estimatedDays} Gün</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        rate.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {rate.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => openEdit(rate)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-800">{editingRate ? 'Kargo Fiyatı Düzenle' : 'Yeni Kargo Fiyatı'}</h2>
              <button onClick={() => { setDialogOpen(false); resetForm(); }} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Firma</label>
                  <input value={formCompany} onChange={(e) => setFormCompany(e.target.value)} placeholder="Örn: Aras Kargo" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Hizmet</label>
                  <input value={formService} onChange={(e) => setFormService(e.target.value)} placeholder="Örn: Standart" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Bölge</label>
                <div className="relative">
                  <select value={formZone} onChange={(e) => setFormZone(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
                    {zones.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Başlangıç (₺)</label>
                  <input type="number" value={formBasePrice} onChange={(e) => setFormBasePrice(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kg Başı (₺)</label>
                  <input type="number" step="0.1" value={formPerKg} onChange={(e) => setFormPerKg(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Maks Ağırlık (kg)</label>
                  <input type="number" value={formMaxWeight} onChange={(e) => setFormMaxWeight(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Tahmini Teslimat Süresi</label>
                  <div className="relative">
                    <input type="number" value={formEstimatedDays} onChange={(e) => setFormEstimatedDays(e.target.value)} placeholder="0 = Aynı Gün" className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Gün</span>
                  </div>
                </div>
                <div className="flex flex-col justify-end pb-1.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">Aktif</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => { setDialogOpen(false); resetForm(); }} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors shadow-sm">
                İptal
              </button>
              <button 
                onClick={handleSave} 
                disabled={!formCompany.trim() || !formService.trim()} 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {editingRate ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
