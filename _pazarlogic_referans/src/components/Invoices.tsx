'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { FileText, Clock, Send, CheckCircle, AlertCircle, Search, Plus, Pencil, Trash2, Download, FileSpreadsheet, Printer, RefreshCw, Filter, Eye } from 'lucide-react';

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

function exportToCSV(data: Invoice[], filename: string) {
  const headers = ['Fatura No', 'Musteri', 'Tur', 'Tutar', 'Durum', 'Tarih'];
  const rows = data.map(i => [i.invoiceNumber, i.customerName, typeLabels[i.type] || i.type, i.amount, i.status, i.date]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Invoices() {
  const { sidebarOpen } = useAppStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ orderNo: '', customer: '', amount: '', kdv: '', taxNo: '' });
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [editFormData, setEditFormData] = useState({ customerName: '', amount: '', type: '', status: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/invoices').then((r) => r.json()).then((d) => setInvoices(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = invoices.filter((inv) => {
    if (search && !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) && !inv.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  const totalAmount = invoices.reduce((a, b) => a + b.amount, 0);
  const approved = invoices.filter((i) => i.status === 'approved').length;
  const pending = invoices.filter((i) => i.status === 'draft' || i.status === 'sent').length;

  const handleNewInvoice = () => {
    if (!newInvoice.customer) return;
    const id = `new-${Date.now()}`;
    const invoice: Invoice = {
      id, invoiceNumber: `FAT-${String(invoices.length + 1).padStart(5, '0')}`,
      customerName: newInvoice.customer, type: 'sales', amount: parseFloat(newInvoice.amount) || 0,
      status: 'draft', date: new Date().toISOString(),
    };
    setInvoices(prev => [invoice, ...prev]);
    setShowNewInvoice(false);
    setNewInvoice({ orderNo: '', customer: '', amount: '', kdv: '', taxNo: '' });
  };

  const handleDelete = (inv: Invoice) => {
    if (!confirm(`"${inv.invoiceNumber}" faturasini silmek istediginize emin misiniz?`)) return;
    setInvoices(prev => prev.filter(i => i.id !== inv.id));
  };

  const handleEdit = (inv: Invoice) => {
    setEditInvoice(inv);
    setEditFormData({ customerName: inv.customerName, amount: String(inv.amount), type: inv.type, status: inv.status });
  };

  const handleUpdateEdit = () => {
    if (!editInvoice) return;
    setInvoices(prev => prev.map(i => i.id === editInvoice.id ? {
      ...i,
      customerName: editFormData.customerName,
      amount: parseFloat(editFormData.amount) || 0,
      type: editFormData.type,
      status: editFormData.status,
    } : i));
    setEditInvoice(null);
  };

  const handleExportCSV = () => exportToCSV(filtered, 'faturalar.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'faturalar.xlsx');

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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewInvoice(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Fatura</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><Input placeholder="Fatura no veya musteri ara..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9 h-10"/></div><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Tur"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Turler</SelectItem><SelectItem value="sales">Satis</SelectItem><SelectItem value="purchase">Satın Alma</SelectItem><SelectItem value="return">Iade</SelectItem></SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40 h-10"><SelectValue placeholder="Durum"/></SelectTrigger><SelectContent><SelectItem value="all">Tum Durumlar</SelectItem><SelectItem value="draft">Taslak</SelectItem><SelectItem value="sent">Gonderildi</SelectItem><SelectItem value="approved">Onaylandi</SelectItem><SelectItem value="cancelled">Iptal</SelectItem></SelectContent></Select></div></CardContent></Card>
      )}

      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Fatura No</th><th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tur</th><th className="text-right py-3 px-4 font-medium text-slate-600">Tutar</th><th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th><th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th></tr></thead><tbody>{filtered.map((inv)=>{const st=statusMap[inv.status]||statusMap.draft;return(<tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{inv.invoiceNumber}</td><td className="py-3 px-4 text-slate-600">{inv.customerName}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{typeLabels[inv.type]||inv.type}</Badge></td><td className="py-3 px-4 text-right font-medium">{fmt(inv.amount)}</td><td className="py-3 px-4"><Badge className={`${st.cls} gap-1 text-xs`}>{st.icon} {st.label}</Badge></td><td className="py-3 px-4 text-slate-500">{fmtDate(inv.date)}</td><td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={()=>setViewInvoice(inv)}><Eye className="h-3.5 w-3.5 mr-1" />Goruntule</Button><Button size="sm" variant="ghost" onClick={()=>handleEdit(inv)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button><Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={()=>handleDelete(inv)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>)})}</tbody></table></div></CardContent></Card>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editInvoice} onOpenChange={() => setEditInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Fatura Duzenle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Musteri</Label><Input className="mt-1" value={editFormData.customerName} onChange={e => setEditFormData(p => ({ ...p, customerName: e.target.value }))} placeholder="Musteri adi" /></div>
            <div><Label>Tutar (TL)</Label><Input className="mt-1" type="number" value={editFormData.amount} onChange={e => setEditFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
            <div><Label>Tur</Label><Select value={editFormData.type} onValueChange={v => setEditFormData(p => ({ ...p, type: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Tur secin" /></SelectTrigger><SelectContent><SelectItem value="sales">Satis</SelectItem><SelectItem value="purchase">Satın Alma</SelectItem><SelectItem value="return">Iade</SelectItem></SelectContent></Select></div>
            <div><Label>Durum</Label><Select value={editFormData.status} onValueChange={v => setEditFormData(p => ({ ...p, status: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Durum secin" /></SelectTrigger><SelectContent><SelectItem value="draft">Taslak</SelectItem><SelectItem value="sent">Gonderildi</SelectItem><SelectItem value="approved">Onaylandi</SelectItem><SelectItem value="cancelled">Iptal</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInvoice(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Fatura</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Siparis No</Label><Input className="mt-1" value={newInvoice.orderNo} onChange={e => setNewInvoice(p => ({ ...p, orderNo: e.target.value }))} placeholder="Siparis No" /></div>
              <div><Label>Vergi No</Label><Input className="mt-1" value={newInvoice.taxNo} onChange={e => setNewInvoice(p => ({ ...p, taxNo: e.target.value }))} placeholder="Vergi No" /></div>
            </div>
            <div><Label>Musteri</Label><Input className="mt-1" value={newInvoice.customer} onChange={e => setNewInvoice(p => ({ ...p, customer: e.target.value }))} placeholder="Musteri adi" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tutar (TL)</Label><Input className="mt-1" type="number" value={newInvoice.amount} onChange={e => setNewInvoice(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>KDV (%)</Label><Input className="mt-1" type="number" value={newInvoice.kdv} onChange={e => setNewInvoice(p => ({ ...p, kdv: e.target.value }))} placeholder="18" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewInvoice(false)}>Iptal</Button>
            <Button onClick={handleNewInvoice}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Fatura Detayi</DialogTitle></DialogHeader>
          {viewInvoice && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Fatura No:</span><span className="font-medium">{viewInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Musteri:</span><span className="font-medium">{viewInvoice.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tur:</span><span>{typeLabels[viewInvoice.type]}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tutar:</span><span className="font-medium">{fmt(viewInvoice.amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Durum:</span><Badge className={statusMap[viewInvoice.status]?.cls}>{statusMap[viewInvoice.status]?.label}</Badge></div>
              <div className="flex justify-between"><span className="text-slate-500">Tarih:</span><span>{fmtDate(viewInvoice.date)}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
