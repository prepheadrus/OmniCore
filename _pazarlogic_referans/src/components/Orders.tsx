'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Search, Filter, Clock, Package, Truck, CheckCircle, XCircle, Plus, Pencil, Trash2, Download, FileSpreadsheet, Printer, Upload, RefreshCw, Eye, Ban } from 'lucide-react';

interface Order {
  id: string; orderNumber: string; customerName: string; status: string;
  totalAmount: number; marketplace: string; items: number; createdAt: string;
}

const statusMap: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-800', icon: <Clock className="h-3 w-3" /> },
  processing: { label: 'Hazirlaniyor', cls: 'bg-blue-100 text-blue-800', icon: <Package className="h-3 w-3" /> },
  shipped: { label: 'Kargoda', cls: 'bg-purple-100 text-purple-800', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Teslim Edildi', cls: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Iptal', cls: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

function exportToCSV(data: Order[], filename: string) {
  const headers = ['Siparis No', 'Musteri', 'Durum', 'Tutar', 'Pazaryeri', 'Adet', 'Tarih'];
  const rows = data.map(o => [o.orderNumber, o.customerName, o.status, o.totalAmount, o.marketplace, o.items, o.createdAt]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Orders() {
  const { sidebarOpen } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({ customerName: '', product: '', quantity: '', price: '', cargoFirm: '' });
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState({ customerName: '', status: '', totalAmount: '', marketplace: '' });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/orders').then((r) => r.json()).then((d) => setOrders(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/orders').then((r) => r.json()).then((d) => setOrders(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (marketFilter !== 'all' && o.marketplace !== marketFilter) return false;
    return true;
  });

  const handleNewOrder = () => {
    if (!newOrder.customerName) return;
    const id = `new-${Date.now()}`;
    const order: Order = {
      id, orderNumber: `SP-${String(orders.length + 1).padStart(5, '0')}`,
      customerName: newOrder.customerName, status: 'pending',
      totalAmount: parseFloat(newOrder.price) * parseInt(newOrder.quantity) || 0,
      marketplace: 'Trendyol', items: parseInt(newOrder.quantity) || 0,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [order, ...prev]);
    setShowNewOrder(false);
    setNewOrder({ customerName: '', product: '', quantity: '', price: '', cargoFirm: '' });
  };

  const handleCancelOrder = (order: Order) => {
    if (!confirm(`"${order.orderNumber}" siparisini iptal etmek istediginize emin misiniz?`)) return;
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
  };

  const handleDeleteOrder = (order: Order) => {
    if (!confirm(`"${order.orderNumber}" siparisini silmek istediginize emin misiniz?`)) return;
    setOrders(prev => prev.filter(o => o.id !== order.id));
  };

  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setEditFormData({ customerName: order.customerName, status: order.status, totalAmount: String(order.totalAmount), marketplace: order.marketplace });
  };

  const handleUpdateEdit = () => {
    if (!editOrder) return;
    setOrders(prev => prev.map(o => o.id === editOrder.id ? {
      ...o,
      customerName: editFormData.customerName,
      status: editFormData.status,
      totalAmount: parseFloat(editFormData.totalAmount) || 0,
      marketplace: editFormData.marketplace,
    } : o));
    setEditOrder(null);
  };

  const handleImport = () => {
    alert('Siparis ice aktarma ozelligi yakinda aktif olacak');
  };

  const handleExportCSV = () => exportToCSV(filtered, 'siparisler.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'siparisler.xlsx');

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Siparisler</h1>
        {[1,2,3].map(i => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-10 bg-slate-200 rounded" /></CardContent></Card>)}
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Siparisler (OMS)</h1>
          <p className="text-sm text-slate-500">{filtered.length} siparis listeleniyor</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewOrder(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Siparis</Button>
        <Button size="sm" variant="outline" onClick={handleImport}><Upload className="h-4 w-4 mr-1" /> Ice Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Siparis no veya musteri ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Durum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="processing">Hazirlaniyor</SelectItem>
                  <SelectItem value="shipped">Kargoda</SelectItem>
                  <SelectItem value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem value="cancelled">Iptal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={marketFilter} onValueChange={setMarketFilter}>
                <SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Pazaryeri" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Pazaryerleri</SelectItem>
                  <SelectItem value="Trendyol">Trendyol</SelectItem>
                  <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                  <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                  <SelectItem value="n11">n11</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Siparis No</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Tutar</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Pazaryeri</th>
                <th className="text-center py-3 px-4 font-medium text-slate-600">Adet</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-400">Siparis bulunamadi</td></tr>}
                {filtered.map((o) => {
                  const st = statusMap[o.status] || statusMap.pending;
                  return (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{o.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{o.customerName}</td>
                      <td className="py-3 px-4"><Badge className={`${st.cls} gap-1 text-xs`}>{st.icon} {st.label}</Badge></td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">{fmt(o.totalAmount)}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{o.marketplace}</Badge></td>
                      <td className="py-3 px-4 text-center text-slate-600">{o.items}</td>
                      <td className="py-3 px-4 text-slate-500">{fmtDate(o.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetailOrder(o)}><Eye className="h-3.5 w-3.5 mr-1" />Detay</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(o)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                          {o.status !== 'cancelled' && (
                            <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700" onClick={() => handleCancelOrder(o)}><Ban className="h-3.5 w-3.5 mr-1" />Iptal</Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteOrder(o)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Order Dialog */}
      <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Siparis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Musteri Adi</Label>
              <Input className="mt-1" value={newOrder.customerName} onChange={e => setNewOrder(p => ({ ...p, customerName: e.target.value }))} placeholder="Musteri adini girin" />
            </div>
            <div>
              <Label>Urun</Label>
              <Input className="mt-1" value={newOrder.product} onChange={e => setNewOrder(p => ({ ...p, product: e.target.value }))} placeholder="Urun adini girin" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Miktar</Label>
                <Input className="mt-1" type="number" value={newOrder.quantity} onChange={e => setNewOrder(p => ({ ...p, quantity: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <Label>Fiyat (TL)</Label>
                <Input className="mt-1" type="number" value={newOrder.price} onChange={e => setNewOrder(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div>
              <Label>Kargo Firmasi</Label>
              <Select value={newOrder.cargoFirm} onValueChange={v => setNewOrder(p => ({ ...p, cargoFirm: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Kargo firmasi secin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aras">Aras Kargo</SelectItem>
                  <SelectItem value="yurtici">Yurtici Kargo</SelectItem>
                  <SelectItem value="mng">MNG Kargo</SelectItem>
                  <SelectItem value="ptt">PTT Kargo</SelectItem>
                  <SelectItem value="trendyol-express">Trendyol Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewOrder(false)}>Iptal</Button>
            <Button onClick={handleNewOrder}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Siparis Duzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Musteri Adi</Label>
              <Input className="mt-1" value={editFormData.customerName} onChange={e => setEditFormData(p => ({ ...p, customerName: e.target.value }))} placeholder="Musteri adini girin" />
            </div>
            <div>
              <Label>Durum</Label>
              <Select value={editFormData.status} onValueChange={v => setEditFormData(p => ({ ...p, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Durum secin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="processing">Hazirlaniyor</SelectItem>
                  <SelectItem value="shipped">Kargoda</SelectItem>
                  <SelectItem value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem value="cancelled">Iptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tutar (TL)</Label>
                <Input className="mt-1" type="number" value={editFormData.totalAmount} onChange={e => setEditFormData(p => ({ ...p, totalAmount: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Pazaryeri</Label>
                <Select value={editFormData.marketplace} onValueChange={v => setEditFormData(p => ({ ...p, marketplace: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pazaryeri secin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trendyol">Trendyol</SelectItem>
                    <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                    <SelectItem value="n11">n11</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrder(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Siparis Detayi</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Siparis No:</span><span className="font-medium">{detailOrder.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Musteri:</span><span className="font-medium">{detailOrder.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Durum:</span><Badge className={statusMap[detailOrder.status]?.cls}>{statusMap[detailOrder.status]?.label}</Badge></div>
              <div className="flex justify-between"><span className="text-slate-500">Tutar:</span><span className="font-medium">{fmt(detailOrder.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pazaryeri:</span><Badge variant="outline">{detailOrder.marketplace}</Badge></div>
              <div className="flex justify-between"><span className="text-slate-500">Adet:</span><span className="font-medium">{detailOrder.items}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tarih:</span><span>{fmtDate(detailOrder.createdAt)}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
