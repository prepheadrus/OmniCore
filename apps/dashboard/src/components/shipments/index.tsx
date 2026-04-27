'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Search, Clock, CheckCircle, Package, ChevronDown } from 'lucide-react';

interface Shipment { 
  id: string; 
  trackingNumber: string; 
  orderNumber: string; 
  carrier: string; 
  status: string; 
  customerName: string; 
  address: string; 
  createdAt: string; 
}

const statusMap: Record<string, { label: string; cls: string; pct: number }> = {
  pending: { label: 'Beklemede', cls: 'bg-amber-50 text-amber-700 border-amber-200', pct: 0 },
  picked_up: { label: 'Alındı', cls: 'bg-blue-50 text-blue-700 border-blue-200', pct: 25 },
  in_transit: { label: 'Dağıtımda', cls: 'bg-purple-50 text-purple-700 border-purple-200', pct: 50 },
  out_for_delivery: { label: 'Teslimat Yolunda', cls: 'bg-violet-50 text-violet-700 border-violet-200', pct: 75 },
  delivered: { label: 'Teslim Edildi', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', pct: 100 },
};

const MOCK_SHIPMENTS: Shipment[] = [
  { id: '1', trackingNumber: 'TR123456789', orderNumber: 'ORD-001', carrier: 'Yurtiçi Kargo', status: 'pending', customerName: 'Ahmet Yılmaz', address: 'İstanbul, Türkiye', createdAt: new Date().toISOString() },
  { id: '2', trackingNumber: 'AR987654321', orderNumber: 'ORD-002', carrier: 'Aras Kargo', status: 'in_transit', customerName: 'Ayşe Demir', address: 'Ankara, Türkiye', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', trackingNumber: 'MG456123789', orderNumber: 'ORD-003', carrier: 'MNG Kargo', status: 'delivered', customerName: 'Mehmet Kaya', address: 'İzmir, Türkiye', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', trackingNumber: 'PT789456123', orderNumber: 'ORD-004', carrier: 'PTT Kargo', status: 'out_for_delivery', customerName: 'Fatma Çelik', address: 'Bursa, Türkiye', createdAt: new Date(Date.now() - 43200000).toISOString() },
  { id: '5', trackingNumber: 'SA321654987', orderNumber: 'ORD-005', carrier: 'Sürat Kargo', status: 'picked_up', customerName: 'Ali Yılmaz', address: 'Antalya, Türkiye', createdAt: new Date(Date.now() - 21600000).toISOString() },
];

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');

  useEffect(() => { 
    const timer = setTimeout(() => {
      setShipments(MOCK_SHIPMENTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const carriers = [...new Set(shipments.map((s) => s.carrier))];
  
  const filtered = shipments.filter((s) => {
    if (search && !s.trackingNumber.toLowerCase().includes(search.toLowerCase()) && !s.orderNumber.toLowerCase().includes(search.toLowerCase()) && !s.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (carrierFilter !== 'all' && s.carrier !== carrierFilter) return false;
    return true;
  });

  const pending = shipments.filter((s) => s.status === 'pending').length;
  const inTransit = shipments.filter((s) => s.status === 'in_transit' || s.status === 'out_for_delivery' || s.status === 'picked_up').length;
  const delivered = shipments.filter((s) => s.status === 'delivered').length;

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="h-96 rounded-md bg-slate-200" />
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
              <Truck className="h-5 w-5 text-white" />
            </div>
            Kargo & Lojistik
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tüm kargo gönderilerini ve durumlarını gerçek zamanlı takip edin</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Kargo</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{shipments.length}</p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <Package className="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bekleyen</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{pending}</p>
          </div>
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dağıtımda</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{inTransit}</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teslim Edildi</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{delivered}</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Takip no, sipariş no veya müşteri ara..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-40">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="picked_up">Alındı</option>
                <option value="in_transit">Dağıtımda</option>
                <option value="out_for_delivery">Teslimat Yolunda</option>
                <option value="delivered">Teslim Edildi</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-40">
              <select 
                value={carrierFilter} 
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
              >
                <option value="all">Tüm Firmalar</option>
                {carriers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Takip No</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Sipariş No</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Kargo Firması</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Durum</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider w-40">İlerleme</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Müşteri</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Kriterlere uygun kargo bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const st = statusMap[s.status] || statusMap.pending;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800 font-mono text-xs">{s.trackingNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{s.orderNumber}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                          {s.carrier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded border text-xs font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                st.pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: `${st.pct}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 w-6 text-right">{st.pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{s.customerName}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString('tr-TR')}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {filtered.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 font-medium">
            {filtered.length} kargo listeleniyor
          </div>
        )}
      </div>
    </div>
  );
}
