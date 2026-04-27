'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Box, Layers, Building2, PackageCheck } from 'lucide-react';

interface WarehouseItem { 
  id: string; 
  name: string; 
  code: string; 
  address: string; 
  capacity: number; 
  usedSpace: number; 
  type: string; 
  status: string; 
}

const typeLabels: Record<string, { label: string; cls: string }> = {
  standard: { label: 'Standart', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  '3pl': { label: '3PL', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  fba: { label: 'FBA', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const MOCK_WAREHOUSES: WarehouseItem[] = [
  { id: 'w1', name: 'İstanbul Ana Depo', code: 'IST-01', address: 'Tuzla, İstanbul', capacity: 15000, usedSpace: 12500, type: 'standard', status: 'active' },
  { id: 'w2', name: 'Avrupa Yakası Dağıtım', code: 'IST-02', address: 'Esenyurt, İstanbul', capacity: 8000, usedSpace: 7200, type: 'standard', status: 'active' },
  { id: 'w3', name: 'Trendyol Lojistik (3PL)', code: 'TR-3PL', address: 'Gebze, Kocaeli', capacity: 20000, usedSpace: 18000, type: '3pl', status: 'active' },
  { id: 'w4', name: 'Amazon FBA Deposu', code: 'AMZ-FBA', address: 'Ankara', capacity: 5000, usedSpace: 2100, type: 'fba', status: 'active' },
  { id: 'w5', name: 'İzmir Aktarma', code: 'IZM-01', address: 'Bornova, İzmir', capacity: 6000, usedSpace: 3400, type: 'standard', status: 'active' },
];

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const timer = setTimeout(() => {
      setWarehouses(MOCK_WAREHOUSES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const totalCapacity = warehouses.reduce((a, b) => a + b.capacity, 0);
  const totalUsed = warehouses.reduce((a, b) => a + b.usedSpace, 0);
  const avgUsage = warehouses.length > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  const usageColor = (pct: number) => pct > 85 ? 'text-red-600' : pct > 65 ? 'text-amber-600' : 'text-emerald-600';
  const progressColor = (pct: number) => pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500';

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
            {[1,2,3,4,5].map(i => <div key={i} className="h-48 rounded-md bg-slate-200" />)}
          </div>
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
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Depo Yönetimi (WMS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Fiziksel ve 3PL depoların kapasite ve doluluk takibi</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Depo</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{warehouses.length}</p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <Building2 className="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Kapasite</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{totalCapacity.toLocaleString('tr-TR')}</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <Box className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kullanılan Alan</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{totalUsed.toLocaleString('tr-TR')}</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <Layers className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ort. Doluluk</p>
            <p className={`text-3xl font-bold mt-2 ${usageColor(avgUsage)}`}>%{avgUsage}</p>
          </div>
          <div className={`p-2.5 rounded-md border ${avgUsage > 85 ? 'bg-red-50 border-red-100' : avgUsage > 65 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <PackageCheck className={`h-5 w-5 ${avgUsage > 85 ? 'text-red-600' : avgUsage > 65 ? 'text-amber-600' : 'text-emerald-600'}`} />
          </div>
        </div>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
        {warehouses.map((w) => {
          const pct = w.capacity > 0 ? Math.round((w.usedSpace / w.capacity) * 100) : 0;
          const tl = typeLabels[w.type] || typeLabels.standard;
          
          return (
            <div key={w.id} className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-slate-500" />
                    {w.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                    <MapPin className="h-3 w-3" />
                    {w.address}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tl.cls}`}>
                  {tl.label}
                </span>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-mono">KOD: {w.code}</span>
                  <span className="font-medium text-slate-700">Kapasite: {w.capacity.toLocaleString('tr-TR')}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Doluluk Oranı</span>
                    <span className={`text-sm font-bold ${usageColor(pct)}`}>%{pct}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${progressColor(pct)}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Dolu</span>
                    <span className="font-bold text-slate-700">{w.usedSpace.toLocaleString('tr-TR')} br</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div className="flex flex-col text-right">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Boş</span>
                    <span className="font-bold text-slate-700">{(w.capacity - w.usedSpace).toLocaleString('tr-TR')} br</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
