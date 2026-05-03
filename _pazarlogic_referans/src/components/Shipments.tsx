'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { Truck, Search, Clock, CheckCircle, Plus, Pencil, Download, FileSpreadsheet, Printer, RefreshCw, Filter, MapPin } from 'lucide-react';

interface Shipment { id: string; trackingNumber: string; orderNumber: string; carrier: string; status: string; customerName: string; address: string; createdAt: string; }

const statusMap: Record<string, { label: string; cls: string; pct: number }> = {
  pending: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-800', pct: 0 },
  picked_up: { label: 'Alindi', cls: 'bg-blue-100 text-blue-800', pct: 25 },
  in_transit: { label: 'Dagitimda', cls: 'bg-purple-100 text-purple-800', pct: 50 },
  out_for_delivery: { label: 'Teslimat Yolunda', cls: 'bg-violet-100 text-violet-800', pct: 75 },
  delivered: { label: 'Teslim Edildi', cls: 'bg-emerald-100 text-emerald-800', pct: 100 },
};

function exportToCSV(data: Shipment[], filename: string) {
  const headers = ['Takip No', 'Siparis No', 'Kargo Firmasi', 'Durum', 'Musteri', 'Tarih'];
  const rows = data.map(s => [s.trackingNumber, s.orderNumber, s.carrier, s.status, s.customerName, s.createdAt]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Shipments() {
  const { sidebarOpen } = useAppStore();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [newShipment, setNewShipment] = useState({ orderNo: '', carrier: '', trackingNo: '' });
  const [trackShipment, setTrackShipment] = useState<Shipment | null>(null);
  const [editShipment, setEditShipment] = useState<Shipment | null>(null);
  const [editFormData, setEditFormData] = useState({ trackingNumber: '', carrier: '', status: '', customerName: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/shipments').then((r) => r.json()).then((d) => setShipments(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const carriers = [...new Set(shipments.map((s) => s.carrier))];
  const filtered = shipments.filter((s) => {
    if (search && !s.trackingNumber.toLowerCase().includes(search.toLowerCase()) && !s.orderNumber.toLowerCase().includes(search.toLowerCase()) && !s.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (carrierFilter !== 'all' && s.carrier !== carrierFilter) return false;
    return true;
  });

  const pending = shipments.filter((s) => s.status === 'pending').length;
  const inTransit = shipments.filter((s) => s.status === 'in_transit' || s.status === 'out_for_delivery').length;
  const delivered = shipments.filter((s) => s.status === 'delivered').length;

  const handleNewShipment = () => {
    if (!newShipment.orderNo) return;
    const id = `new-${Date.now()}`;
    const shipment: Shipment = {
      id, trackingNumber: newShipment.trackingNo, orderNumber: newShipment.orderNo,
      carrier: newShipment.carrier, status: 'pending', customerName: '-', address: '-', createdAt: new Date().toISOString(),
    };
    setShipments(prev => [shipment, ...prev]);
    setShowNewShipment(false);
    setNewShipment({ orderNo: '', carrier: '', trackingNo: '' });
  };

  const handleEdit = (s: Shipment) => {
    setEditShipment(s);
    setEditFormData({ trackingNumber: s.trackingNumber, carrier: s.carrier, status: s.status, customerName: s.customerName });
  };

  const handleUpdateEdit = () => {
    if (!editShipment) return;
    setShipments(prev => prev.map(s => s.id === editShipment.id ? {
      ...s,
      trackingNumber: editFormData.trackingNumber,
      carrier: editFormData.carrier,
      status: editFormData.status,
      customerName: editFormData.customerName,
    } : s));
    setEditShipment(null);
  };

  const handleExportCSV = () => exportToCSV(filtered, 'sevkiyatlar.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'sevkiyatlar.xlsx');

  if (loading) return (<div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}><h1 className="mb-6 text-2xl font-bold text-slate-800">Kargo & Lojistik</h1><div className="animate-pulse grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><Card key={i}><CardContent className="p-5"><div className="h-8 bg-slate-200 rounded"/></CardContent></Card>)}</div></div>);

  return (
    <div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Kargo & Lojistik</h1><p className="text-sm text-slate-500">{filtered.length} kargo listeleniyor</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Kargo</p><p className="text-2xl font-bold text-slate-900 mt-1">{shipments.length}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><Truck className="h-5 w-5 text-white"/></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Bekleyen</p><p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Dagitimda</p><p className="text-2xl font-bold text-purple-600 mt-1">{inTransit}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Teslim Edildi</p><p className="text-2xl font-bold text-emerald-600 mt-1">{delivered}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500"><CheckCircle className="h-5 w-5 text-white"/></div></div></CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewShipment(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Sevkiyat</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><Input placeholder="Takip no, siparis no veya musteri ara..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9 h-10"/></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Durum"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Durumlar</SelectItem><SelectItem value="pending">Beklemede</SelectItem><SelectItem value="picked_up">Alindi</SelectItem><SelectItem value="in_transit">Dagitimda</SelectItem><SelectItem value="out_for_delivery">Teslimat Yolunda</SelectItem><SelectItem value="delivered">Teslim Edildi</SelectItem></SelectContent></Select><Select value={carrierFilter} onValueChange={setCarrierFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Kargo Firmasi"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Firmalar</SelectItem>{carriers.map((c)=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
      )}

      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Takip No</th><th className="text-left py-3 px-4 font-medium text-slate-600">Siparis No</th><th className="text-left py-3 px-4 font-medium text-slate-600">Kargo Firmasi</th><th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th><th className="text-left py-3 px-4 font-medium text-slate-600">Ilerleme</th><th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th><th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th></tr></thead><tbody>{filtered.map((s)=>{const st=statusMap[s.status]||statusMap.pending;return(<tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800 font-mono text-xs">{s.trackingNumber}</td><td className="py-3 px-4 text-slate-600">{s.orderNumber}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{s.carrier}</Badge></td><td className="py-3 px-4"><Badge className={`${st.cls} text-xs`}>{st.label}</Badge></td><td className="py-3 px-4 w-32"><Progress value={st.pct} className="h-2"/><span className="text-xs text-slate-400 ml-2">{st.pct}%</span></td><td className="py-3 px-4 text-slate-600">{s.customerName}</td><td className="py-3 px-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString('tr-TR')}</td><td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={()=>setTrackShipment(s)}><MapPin className="h-3.5 w-3.5 mr-1" />Takip</Button><Button size="sm" variant="ghost" onClick={()=>handleEdit(s)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button></div></td></tr>)})}</tbody></table></div></CardContent></Card>

      {/* Edit Shipment Dialog */}
      <Dialog open={!!editShipment} onOpenChange={() => setEditShipment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sevkiyat Duzenle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Takip No</Label><Input className="mt-1" value={editFormData.trackingNumber} onChange={e => setEditFormData(p => ({ ...p, trackingNumber: e.target.value }))} placeholder="Takip numarasi" /></div>
            <div><Label>Kargo Firmasi</Label><Select value={editFormData.carrier} onValueChange={v => setEditFormData(p => ({ ...p, carrier: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Kargo firmasi secin" /></SelectTrigger><SelectContent><SelectItem value="Aras Kargo">Aras Kargo</SelectItem><SelectItem value="Yurtici Kargo">Yurtici Kargo</SelectItem><SelectItem value="MNG Kargo">MNG Kargo</SelectItem><SelectItem value="PTT Kargo">PTT Kargo</SelectItem><SelectItem value="Trendyol Express">Trendyol Express</SelectItem><SelectItem value="HepsiJet">HepsiJet</SelectItem></SelectContent></Select></div>
            <div><Label>Durum</Label><Select value={editFormData.status} onValueChange={v => setEditFormData(p => ({ ...p, status: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Durum secin" /></SelectTrigger><SelectContent><SelectItem value="pending">Beklemede</SelectItem><SelectItem value="picked_up">Alindi</SelectItem><SelectItem value="in_transit">Dagitimda</SelectItem><SelectItem value="out_for_delivery">Teslimat Yolunda</SelectItem><SelectItem value="delivered">Teslim Edildi</SelectItem></SelectContent></Select></div>
            <div><Label>Musteri</Label><Input className="mt-1" value={editFormData.customerName} onChange={e => setEditFormData(p => ({ ...p, customerName: e.target.value }))} placeholder="Musteri adi" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditShipment(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Shipment Dialog */}
      <Dialog open={showNewShipment} onOpenChange={setShowNewShipment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Sevkiyat</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Siparis No</Label><Input className="mt-1" value={newShipment.orderNo} onChange={e => setNewShipment(p => ({ ...p, orderNo: e.target.value }))} placeholder="Siparis No" /></div>
            <div><Label>Kargo Firmasi</Label><Select value={newShipment.carrier} onValueChange={v => setNewShipment(p => ({ ...p, carrier: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Kargo firmasi secin" /></SelectTrigger><SelectContent><SelectItem value="Aras Kargo">Aras Kargo</SelectItem><SelectItem value="Yurtici Kargo">Yurtici Kargo</SelectItem><SelectItem value="MNG Kargo">MNG Kargo</SelectItem><SelectItem value="PTT Kargo">PTT Kargo</SelectItem><SelectItem value="Trendyol Express">Trendyol Express</SelectItem><SelectItem value="HepsiJet">HepsiJet</SelectItem></SelectContent></Select></div>
            <div><Label>Takip No</Label><Input className="mt-1" value={newShipment.trackingNo} onChange={e => setNewShipment(p => ({ ...p, trackingNo: e.target.value }))} placeholder="Takip numarasi" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewShipment(false)}>Iptal</Button>
            <Button onClick={handleNewShipment}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Shipment Dialog */}
      <Dialog open={!!trackShipment} onOpenChange={() => setTrackShipment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kargo Takip</DialogTitle></DialogHeader>
          {trackShipment && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Takip No:</span><span className="font-medium font-mono">{trackShipment.trackingNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Siparis No:</span><span className="font-medium">{trackShipment.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Kargo Firmasi:</span><span>{trackShipment.carrier}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Durum:</span><Badge className={statusMap[trackShipment.status]?.cls}>{statusMap[trackShipment.status]?.label}</Badge></div>
              <div className="flex justify-between"><span className="text-slate-500">Ilerleme:</span><span>{statusMap[trackShipment.status]?.pct}%</span></div>
              <Progress value={statusMap[trackShipment.status]?.pct || 0} className="h-2 mt-2" />
              <div className="flex justify-between"><span className="text-slate-500">Musteri:</span><span>{trackShipment.customerName}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
