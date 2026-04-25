'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  GitBranch, Package, Truck, CheckCircle, Clock, AlertTriangle,
  User, Zap, ArrowRight, Filter, Search, Eye, RotateCcw,
  ShoppingCart, BarChart3,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Stage = 'new' | 'confirmed' | 'picking' | 'packing' | 'ready' | 'shipped';

interface FulfillmentOrder {
  id: string; orderNumber: string; customerName: string; marketplace: string;
  totalAmount: number; items: number; stage: Stage; assignedTo: string | null;
  priority: 'normal' | 'urgent' | 'express'; createdAt: string; updatedAt: string;
}

interface PipelineStage {
  stage: Stage; label: string; count: number; totalAmount: number; orders: FulfillmentOrder[];
}

interface Summary {
  totalOrders: number; pipeline: { stage: Stage; label: string; count: number }[];
  urgentCount: number; unassignedCount: number; avgFulfillmentTime: number; todayShipped: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAGE_CONFIG: Record<Stage, { label: string; icon: typeof Package; color: string; bg: string; border: string }> = {
  new: { label: 'Yeni Siparişler', icon: ShoppingCart, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-300' },
  confirmed: { label: 'Onaylandı', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
  picking: { label: 'Toplama', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
  packing: { label: 'Paketleme', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' },
  ready: { label: 'Kargoya Hazır', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' },
  shipped: { label: 'Kargoya Verildi', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
};

const PRIORITY_BADGE: Record<string, string> = {
  normal: 'bg-slate-100 text-slate-600',
  urgent: 'bg-red-100 text-red-700',
  express: 'bg-amber-100 text-amber-700',
};

const MP_COLORS: Record<string, string> = {
  trendyol: '#3b82f6', hepsiburada: '#f97316', 'amazon tr': '#f59e0b', n11: '#8b5cf6',
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FulfillmentPipeline() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<{ pipeline: PipelineStage[]; summary: Summary; urgentOrders: FulfillmentOrder[]; unassigned: FulfillmentOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<FulfillmentOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetch('/api/fulfillment').then(r => r.json()).then(d => setData(d && typeof d === 'object' && !Array.isArray(d) ? d : null)).finally(() => setLoading(false));
  }, []);

  const handleViewDetail = (order: FulfillmentOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  if (loading || !data) {
    return (
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-200" />)}</div>
          <div className="grid grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[400px] rounded-xl bg-slate-200" />)}</div>
        </div>
      </div>
    );
  }

  const { pipeline, summary, urgentOrders, unassigned } = data;

  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            Sipariş Karşılama
          </h1>
          <p className="text-sm text-slate-500 mt-1">Channable tarzı sipariş karşılama pipeline&apos;ı</p>
        </div>
        <div className="flex items-center gap-3">
          {summary.unassignedCount > 0 && (
            <Badge className="bg-red-50 text-red-700 border border-red-200 gap-1">
              <AlertTriangle className="h-3 w-3" />{summary.unassignedCount} atamasız
            </Badge>
          )}
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
            <Truck className="h-3 w-3" />{summary.todayShipped} bugün kargoya verildi
          </Badge>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {summary.pipeline.map(p => {
          const cfg = STAGE_CONFIG[p.stage];
          const Icon = cfg.icon;
          return (
            <Card key={p.stage} className={cn('shadow-sm border-t-2', cfg.border)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                  <span className="text-xs font-medium text-slate-600">{p.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{p.count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Urgent + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-red-500" />Acil Siparişler</CardTitle></CardHeader>
          <CardContent>
            {urgentOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Acil sipariş yok</p>
            ) : (
              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {urgentOrders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => handleViewDetail(o)}>
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-[10px]', PRIORITY_BADGE[o.priority])}>{o.priority === 'express' ? 'EXPRESS' : 'ACİL'}</Badge>
                      <span className="text-sm font-medium text-slate-700">{o.orderNumber}</span>
                    </div>
                    <span className="text-xs text-slate-400">{fmt(o.totalAmount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Ort. Karşılama Süresi</p>
                <p className="text-2xl font-bold text-slate-900">{summary.avgFulfillmentTime}</p>
                <p className="text-xs text-slate-400">saat</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-slate-900">{summary.totalOrders}</p>
                <p className="text-xs text-slate-400">pipeline&apos;da</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Atamasız</p>
                <p className={cn('text-2xl font-bold', summary.unassignedCount > 0 ? 'text-red-600' : 'text-emerald-600')}>{summary.unassignedCount}</p>
                <p className="text-xs text-slate-400">sipariş</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="relative">
        {/* Search */}
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Sipariş numarası veya müşteri ara..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Pipeline Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {pipeline.map(stage => {
            const cfg = STAGE_CONFIG[stage.stage];
            const StageIcon = cfg.icon;
            const filteredOrders = stage.orders.filter(o =>
              !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
            );

            return (
              <div key={stage.stage} className={cn('rounded-xl border bg-white overflow-hidden', cfg.border)}>
                {/* Column Header */}
                <div className={cn('px-3 py-2.5 border-b flex items-center justify-between', cfg.bg)}>
                  <div className="flex items-center gap-2">
                    <StageIcon className={cn('h-4 w-4', cfg.color)} />
                    <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold h-5 px-1.5">{filteredOrders.length}</Badge>
                </div>

                {/* Column Body */}
                <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                  {filteredOrders.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-8">Sipariş yok</p>
                  ) : (
                    filteredOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => handleViewDetail(order)}
                        className={cn(
                          'rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all',
                          order.priority === 'urgent' ? 'border-red-200 bg-red-50/30' :
                          order.priority === 'express' ? 'border-amber-200 bg-amber-50/30' :
                          'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono font-semibold text-slate-700">{order.orderNumber}</span>
                          <Badge className={cn('text-[9px] px-1', PRIORITY_BADGE[order.priority])}>
                            {order.priority === 'express' ? 'EXP' : order.priority === 'urgent' ? 'ACİL' : ''}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-1.5 truncate">{order.customerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{order.items} ürün</span>
                          <span className="text-xs font-semibold text-slate-700">{fmt(order.totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MP_COLORS[order.marketplace.toLowerCase()] || '#64748b' }} />
                          <span className="text-[10px] text-slate-400">{order.marketplace}</span>
                        </div>
                        {order.assignedTo && (
                          <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-100">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] text-slate-500">{order.assignedTo}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-300 mt-1">{relTime(order.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Sipariş Detayı</DialogTitle><DialogDescription>{selectedOrder?.orderNumber}</DialogDescription></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-500">Müşteri</p><p className="font-medium">{selectedOrder.customerName}</p></div>
                <div><p className="text-xs text-slate-500">Pazaryeri</p><p className="font-medium">{selectedOrder.marketplace}</p></div>
                <div><p className="text-xs text-slate-500">Tutar</p><p className="font-medium">{fmt(selectedOrder.totalAmount)}</p></div>
                <div><p className="text-xs text-slate-500">Ürün Sayısı</p><p className="font-medium">{selectedOrder.items}</p></div>
                <div><p className="text-xs text-slate-500">Öncelik</p><Badge className={cn('text-xs', PRIORITY_BADGE[selectedOrder.priority])}>{selectedOrder.priority === 'express' ? 'Express' : selectedOrder.priority === 'urgent' ? 'Acil' : 'Normal'}</Badge></div>
                <div><p className="text-xs text-slate-500">Aşama</p><Badge variant="outline">{STAGE_CONFIG[selectedOrder.stage].label}</Badge></div>
                <div><p className="text-xs text-slate-500">Atanan</p><p className="font-medium">{selectedOrder.assignedTo || 'Atanmamış'}</p></div>
                <div><p className="text-xs text-slate-500">Tarih</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p></div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                {selectedOrder.stage === 'new' && <Button className="flex-1 gap-1 text-sm"><CheckCircle className="h-3.5 w-3.5" />Onayla</Button>}
                {selectedOrder.stage === 'confirmed' && <Button className="flex-1 gap-1 text-sm"><Package className="h-3.5 w-3.5" />Toplamaya Başla</Button>}
                {selectedOrder.stage === 'picking' && <Button className="flex-1 gap-1 text-sm"><Package className="h-3.5 w-3.5" />Paketlemeye Al</Button>}
                {selectedOrder.stage === 'packing' && <Button className="flex-1 gap-1 text-sm"><Truck className="h-3.5 w-3.5" />Kargoya Ver</Button>}
                {selectedOrder.stage === 'ready' && <Button className="flex-1 gap-1 text-sm"><CheckCircle className="h-3.5 w-3.5" />Kargo Oluştur</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
