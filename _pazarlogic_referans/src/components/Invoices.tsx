'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { FileText, Clock, Send, CheckCircle, AlertCircle, Search } from 'lucide-react';

interface Invoice { id: string; invoiceNumber: string; customerName: string; type: string; amount: number; status: string; date: string; }

const statusMap: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft: { label: 'Taslak', cls: 'bg-amber-100 text-amber-800', icon: <Clock className="h-3 w-3" /> },
  sent: { label: 'Gonderildi', cls: 'bg-blue-100 text-blue-800', icon: <Send className="h-3 w-3" /> },
  approved: { label: 'Onaylandi', cls: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Iptal', cls: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
};
const typeLabels: Record<string, string> = { sales: 'Satis', purchase: 'Satın Alma', return: 'Iade' };
const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

export default function Invoices() {
  const { sidebarOpen } = useAppStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetch('/api/invoices').then((r) => r.json()).then((d) => setInvoices(Array.isArray(d) ? d : [])).finally(() => setLoading(false)); }, []);

  const filtered = invoices.filter((inv) => {
    if (search && !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) && !inv.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  const totalAmount = invoices.reduce((a, b) => a + b.amount, 0);
  const approved = invoices.filter((i) => i.status === 'approved').length;
  const pending = invoices.filter((i) => i.status === 'draft' || i.status === 'sent').length;

  if (loading) return (<div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}><h1 className="mb-6 text-2xl font-bold text-slate-800">E-Fatura</h1><div className="animate-pulse grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><Card key={i}><CardContent className="p-5"><div className="h-8 bg-slate-200 rounded"/></CardContent></Card>)}</div></div>);

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">E-Fatura Yonetimi</h1><p className="text-sm text-slate-500">{filtered.length} fatura listeleniyor</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Toplam Fatura</p><p className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Onaylanan</p><p className="text-2xl font-bold text-emerald-600 mt-1">{approved}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Bekleyen</p><p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Toplam Tutar</p><p className="text-2xl font-bold text-slate-900 mt-1">{fmt(totalAmount)}</p></CardContent></Card>
      </div>
      <Card className="mb-4"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><Input placeholder="Fatura no veya musteri ara..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9 h-10"/></div><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Tur"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Turler</SelectItem><SelectItem value="sales">Satis</SelectItem><SelectItem value="purchase">Satın Alma</SelectItem><SelectItem value="return">Iade</SelectItem></SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Durum"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Durumlar</SelectItem><SelectItem value="draft">Taslak</SelectItem><SelectItem value="sent">Gonderildi</SelectItem><SelectItem value="approved">Onaylandi</SelectItem><SelectItem value="cancelled">Iptal</SelectItem></SelectContent></Select></div></CardContent></Card>
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Fatura No</th><th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tur</th><th className="text-right py-3 px-4 font-medium text-slate-600">Tutar</th><th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th></tr></thead><tbody>{filtered.map((inv)=>{const st=statusMap[inv.status]||statusMap.draft;return(<tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{inv.invoiceNumber}</td><td className="py-3 px-4 text-slate-600">{inv.customerName}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{typeLabels[inv.type]||inv.type}</Badge></td><td className="py-3 px-4 text-right font-medium">{fmt(inv.amount)}</td><td className="py-3 px-4"><Badge className={`${st.cls} gap-1 text-xs`}>{st.icon} {st.label}</Badge></td><td className="py-3 px-4 text-slate-500">{fmtDate(inv.date)}</td></tr>)})}</tbody></table></div></CardContent></Card>
    </div>
  );
}
