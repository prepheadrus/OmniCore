'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { Truck, Search, Clock, CheckCircle } from 'lucide-react';

interface Shipment { id: string; trackingNumber: string; orderNumber: string; carrier: string; status: string; customerName: string; address: string; createdAt: string; }

const statusMap: Record<string, { label: string; cls: string; pct: number }> = {
  pending: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-800', pct: 0 },
  picked_up: { label: 'Alindi', cls: 'bg-blue-100 text-blue-800', pct: 25 },
  in_transit: { label: 'Dagitimda', cls: 'bg-purple-100 text-purple-800', pct: 50 },
  out_for_delivery: { label: 'Teslimat Yolunda', cls: 'bg-violet-100 text-violet-800', pct: 75 },
  delivered: { label: 'Teslim Edildi', cls: 'bg-emerald-100 text-emerald-800', pct: 100 },
};

export default function Shipments() {
  const { sidebarOpen } = useAppStore();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');

  useEffect(() => { fetch('/api/shipments').then((r) => r.json()).then((d) => setShipments(Array.isArray(d) ? d : [])).finally(() => setLoading(false)); }, []);

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
      <Card className="mb-4"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><Input placeholder="Takip no, siparis no veya musteri ara..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9 h-10"/></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Durum"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Durumlar</SelectItem><SelectItem value="pending">Beklemede</SelectItem><SelectItem value="picked_up">Alindi</SelectItem><SelectItem value="in_transit">Dagitimda</SelectItem><SelectItem value="out_for_delivery">Teslimat Yolunda</SelectItem><SelectItem value="delivered">Teslim Edildi</SelectItem></SelectContent></Select><Select value={carrierFilter} onValueChange={setCarrierFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Kargo Firmasi"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Firmalar</SelectItem>{carriers.map((c)=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Takip No</th><th className="text-left py-3 px-4 font-medium text-slate-600">Siparis No</th><th className="text-left py-3 px-4 font-medium text-slate-600">Kargo Firmasi</th><th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th><th className="text-left py-3 px-4 font-medium text-slate-600">Ilerleme</th><th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th></tr></thead><tbody>{filtered.map((s)=>{const st=statusMap[s.status]||statusMap.pending;return(<tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800 font-mono text-xs">{s.trackingNumber}</td><td className="py-3 px-4 text-slate-600">{s.orderNumber}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{s.carrier}</Badge></td><td className="py-3 px-4"><Badge className={`${st.cls} text-xs`}>{st.label}</Badge></td><td className="py-3 px-4 w-32"><Progress value={st.pct} className="h-2"/><span className="text-xs text-slate-400 ml-2">{st.pct}%</span></td><td className="py-3 px-4 text-slate-600">{s.customerName}</td><td className="py-3 px-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString('tr-TR')}</td></tr>)})}</tbody></table></div></CardContent></Card>
    </div>
  );
}
