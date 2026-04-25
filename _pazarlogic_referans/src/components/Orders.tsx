'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Search, Filter, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

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

export default function Orders() {
  const { sidebarOpen } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');

  useEffect(() => {
    fetch('/api/orders').then((r) => r.json()).then((d) => setOrders(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (marketFilter !== 'all' && o.marketplace !== marketFilter) return false;
    return true;
  });

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
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">Siparis bulunamadi</td></tr>}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
