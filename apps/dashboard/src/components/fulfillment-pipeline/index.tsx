'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch, Package, Truck, CheckCircle, Clock, AlertTriangle,
  User, Zap, Search, ShoppingCart, X, PackageCheck
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Stage = 'new' | 'confirmed' | 'picking' | 'packing' | 'ready' | 'shipped';

interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  marketplace: string;
  totalAmount: number;
  items: number;
  stage: Stage;
  assignedTo: string | null;
  priority: 'normal' | 'urgent' | 'express';
  createdAt: string;
  updatedAt?: string;
}

interface PipelineStage {
  stage: Stage;
  label: string;
  count: number;
  totalAmount: number;
  orders: FulfillmentOrder[];
}

interface Summary {
  totalOrders: number;
  pipeline: { stage: Stage; label: string; count: number }[];
  urgentCount: number;
  unassignedCount: number;
  avgFulfillmentTime: number;
  todayShipped: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAGE_CONFIG: Record<Stage, { label: string; icon: any; color: string; bg: string; border: string }> = {
  new: { label: 'Yeni Siparişler', icon: ShoppingCart, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  confirmed: { label: 'Onaylandı', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  picking: { label: 'Toplama', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  packing: { label: 'Paketleme', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ready: { label: 'Kargoya Hazır', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  shipped: { label: 'Kargoya Verildi', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const PRIORITY_BADGE: Record<string, string> = {
  normal: 'bg-slate-100 text-slate-600 border-slate-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
  express: 'bg-amber-50 text-amber-700 border-amber-200',
};

const MP_COLORS: Record<string, string> = {
  trendyol: '#f27a1a', hepsiburada: '#ff6000', 'amazon tr': '#ff9900', n11: '#5c3ebf',
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const relTime = (d: string) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  return `${Math.floor(s / 86400)} gün önce`;
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_DATA = {
  summary: {
    totalOrders: 156,
    pipeline: [
      { stage: 'new' as Stage, label: 'Yeni Siparişler', count: 42 },
      { stage: 'confirmed' as Stage, label: 'Onaylandı', count: 35 },
      { stage: 'picking' as Stage, label: 'Toplama', count: 28 },
      { stage: 'packing' as Stage, label: 'Paketleme', count: 15 },
      { stage: 'ready' as Stage, label: 'Kargoya Hazır', count: 20 },
      { stage: 'shipped' as Stage, label: 'Kargoya Verildi', count: 16 },
    ],
    urgentCount: 12,
    unassignedCount: 8,
    avgFulfillmentTime: 4.5,
    todayShipped: 45
  },
  urgentOrders: [
    { id: 'o1', orderNumber: 'ORD-2026-001', customerName: 'Ahmet Yılmaz', marketplace: 'Trendyol', totalAmount: 1450.50, items: 3, stage: 'new' as Stage, assignedTo: null, priority: 'urgent' as const, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'o2', orderNumber: 'ORD-2026-002', customerName: 'Ayşe Demir', marketplace: 'Hepsiburada', totalAmount: 890.00, items: 1, stage: 'picking' as Stage, assignedTo: 'Mehmet K.', priority: 'express' as const, createdAt: new Date(Date.now() - 7200000).toISOString() }
  ],
  unassigned: [],
  pipeline: [
    { stage: 'new' as Stage, label: 'Yeni Siparişler', count: 42, totalAmount: 15000, orders: [
      { id: 'o1', orderNumber: 'ORD-2026-001', customerName: 'Ahmet Yılmaz', marketplace: 'Trendyol', totalAmount: 1450.50, items: 3, stage: 'new' as Stage, assignedTo: null, priority: 'urgent' as const, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'o4', orderNumber: 'ORD-2026-004', customerName: 'Veli Gök', marketplace: 'N11', totalAmount: 450.00, items: 1, stage: 'new' as Stage, assignedTo: null, priority: 'normal' as const, createdAt: new Date(Date.now() - 1800000).toISOString() }
    ]},
    { stage: 'confirmed' as Stage, label: 'Onaylandı', count: 35, totalAmount: 12000, orders: [
      { id: 'o3', orderNumber: 'ORD-2026-003', customerName: 'Can Yıldız', marketplace: 'Amazon TR', totalAmount: 3450.00, items: 2, stage: 'confirmed' as Stage, assignedTo: 'Ayşe B.', priority: 'normal' as const, createdAt: new Date(Date.now() - 8640000).toISOString() }
    ]},
    { stage: 'picking' as Stage, label: 'Toplama', count: 28, totalAmount: 9500, orders: [
       { id: 'o2', orderNumber: 'ORD-2026-002', customerName: 'Ayşe Demir', marketplace: 'Hepsiburada', totalAmount: 890.00, items: 1, stage: 'picking' as Stage, assignedTo: 'Mehmet K.', priority: 'express' as const, createdAt: new Date(Date.now() - 7200000).toISOString() }
    ]},
    { stage: 'packing' as Stage, label: 'Paketleme', count: 15, totalAmount: 6000, orders: [] },
    { stage: 'ready' as Stage, label: 'Kargoya Hazır', count: 20, totalAmount: 8500, orders: [] },
    { stage: 'shipped' as Stage, label: 'Kargoya Verildi', count: 16, totalAmount: 7200, orders: [] }
  ]
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FulfillmentPipeline() {
  const [data, setData] = useState<{ pipeline: PipelineStage[]; summary: Summary; urgentOrders: FulfillmentOrder[]; unassigned: FulfillmentOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<FulfillmentOrder | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleViewDetail = (order: FulfillmentOrder) => {
    setSelectedOrder(order);
  };

  const closeDetail = () => setSelectedOrder(null);

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-slate-200" />)}
          </div>
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-96 rounded-md bg-slate-200" />)}
          </div>
        </div>
      </div>
    );
  }

  const { pipeline, summary, urgentOrders, unassigned } = data;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <PackageCheck className="h-5 w-5 text-white" />
            </div>
            Sipariş Karşılama
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kanallardan gelen siparişlerin operasyonel pipeline yönetimi</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {summary.unassignedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">
              <AlertTriangle className="h-4 w-4" /> {summary.unassignedCount} atamasız
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium">
            <Truck className="h-4 w-4" /> {summary.todayShipped} bugün kargoya verildi
          </div>
        </div>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summary.pipeline.map(p => {
          const cfg = STAGE_CONFIG[p.stage];
          const Icon = cfg.icon;
          return (
            <div key={p.stage} className={`bg-white rounded-md border-t-2 ${cfg.border} shadow-sm border-x border-b border-slate-200 p-4 flex flex-col justify-between`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${cfg.color}`} />
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">{p.label}</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{p.count}</p>
            </div>
          );
        })}
      </div>

      {/* Urgent + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Zap className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-slate-800">Acil Siparişler</h3>
          </div>
          <div className="p-4 flex-1">
            {urgentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6">
                <CheckCircle className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Bekleyen acil sipariş yok</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {urgentOrders.slice(0, 5).map(o => (
                  <button
                    key={o.id}
                    onClick={() => handleViewDetail(o)}
                    className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${PRIORITY_BADGE[o.priority]}`}>
                        {o.priority === 'express' ? 'EXP' : 'ACİL'}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{o.orderNumber}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{fmt(o.totalAmount)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-md border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
          <div className="grid grid-cols-3 gap-6 divide-x divide-slate-100">
            <div className="text-center px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ort. Karşılama Süresi</p>
              <p className="text-3xl font-bold text-slate-800">{summary.avgFulfillmentTime}</p>
              <p className="text-xs text-slate-400 mt-1">saat</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-slate-800">{summary.totalOrders}</p>
              <p className="text-xs text-slate-400 mt-1">pipeline&apos;da</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Atamasız Sipariş</p>
              <p className={`text-3xl font-bold ${summary.unassignedCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{summary.unassignedCount}</p>
              <p className="text-xs text-slate-400 mt-1">bekliyor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
        {/* Search */}
        <div className="mb-6 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            placeholder="Sipariş numarası veya müşteri ara..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
          />
        </div>

        {/* Pipeline Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
          {pipeline.map(stage => {
            const cfg = STAGE_CONFIG[stage.stage];
            const StageIcon = cfg.icon;
            const filteredOrders = stage.orders.filter(o =>
              !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
            );

            return (
              <div key={stage.stage} className="flex-none w-72 flex flex-col bg-slate-50 rounded-lg border border-slate-200 snap-start">
                {/* Column Header */}
                <div className={`p-3 border-b border-slate-200 bg-white rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <StageIcon className={`h-4 w-4 ${cfg.color}`} />
                    <span className="text-sm font-semibold text-slate-800">{cfg.label}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{filteredOrders.length}</span>
                </div>

                {/* Column Body */}
                <div className="p-3 flex-1 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto">
                  {filteredOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-60">
                      <StageIcon className="h-8 w-8 mb-2" />
                      <p className="text-xs font-medium">Sipariş yok</p>
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => handleViewDetail(order)}
                        className={`bg-white rounded-md border p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
                          order.priority === 'urgent' ? 'border-red-200' :
                          order.priority === 'express' ? 'border-amber-200' : 'border-slate-200'
                        }`}
                      >
                        {/* Priority indicator line */}
                        {(order.priority === 'urgent' || order.priority === 'express') && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.priority === 'urgent' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        )}
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-800">{order.orderNumber}</span>
                          {(order.priority !== 'normal') && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_BADGE[order.priority]}`}>
                              {order.priority === 'express' ? 'EXPRESS' : 'ACİL'}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium text-slate-700 mb-2 truncate" title={order.customerName}>{order.customerName}</p>
                        
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="text-slate-500">{order.items} ürün</span>
                          <span className="font-bold text-slate-800">{fmt(order.totalAmount)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MP_COLORS[order.marketplace.toLowerCase()] || '#64748b' }} />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">{order.marketplace}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{relTime(order.createdAt)}</span>
                        </div>
                        
                        {order.assignedTo && (
                          <div className="flex items-center gap-1.5 mt-2 bg-slate-50 p-1.5 rounded text-[10px] font-medium text-slate-600">
                            <User className="h-3 w-3 text-slate-400" />
                            {order.assignedTo}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Sipariş Detayı</h2>
                <p className="text-sm text-slate-500 font-mono mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Müşteri</p>
                  <p className="font-medium text-slate-800">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pazaryeri</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MP_COLORS[selectedOrder.marketplace.toLowerCase()] || '#64748b' }} />
                    <p className="font-medium text-slate-800">{selectedOrder.marketplace}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tutar</p>
                  <p className="font-bold text-slate-800">{fmt(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ürün Sayısı</p>
                  <p className="font-medium text-slate-800">{selectedOrder.items} adet</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Öncelik</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${PRIORITY_BADGE[selectedOrder.priority]}`}>
                    {selectedOrder.priority === 'express' ? 'EXPRESS' : selectedOrder.priority === 'urgent' ? 'ACİL' : 'NORMAL'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mevcut Aşama</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                    {STAGE_CONFIG[selectedOrder.stage].label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Atanan Personel</p>
                  <p className="font-medium text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.assignedTo || <span className="text-slate-400 italic">Atanmamış</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sipariş Tarihi</p>
                  <p className="font-medium text-slate-800">{new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              {selectedOrder.stage === 'new' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                  <CheckCircle className="h-4 w-4" /> Siparişi Onayla
                </button>
              )}
              {selectedOrder.stage === 'confirmed' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                  <Package className="h-4 w-4" /> Toplamaya Başla
                </button>
              )}
              {selectedOrder.stage === 'picking' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                  <Package className="h-4 w-4" /> Paketlemeye Al
                </button>
              )}
              {selectedOrder.stage === 'packing' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                  <Truck className="h-4 w-4" /> Kargoya Ver
                </button>
              )}
              {selectedOrder.stage === 'ready' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                  <CheckCircle className="h-4 w-4" /> Kargo Fişi Oluştur
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
