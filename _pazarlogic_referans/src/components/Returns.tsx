'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { RotateCcw, TrendingDown, Download, FileSpreadsheet, Filter, RefreshCw, CheckCircle, XCircle, Eye, AlertTriangle, Plus } from 'lucide-react';

interface ReturnItem {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  status: string;
  totalAmount: number;
  refundAmount: number;
  type: string;
  createdAt: string;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-800' },
  processing: { label: 'Isleniyor', cls: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Onaylandi', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Reddedildi', cls: 'bg-red-100 text-red-800' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function exportToCSV(data: ReturnItem[], filename: string) {
  const headers = ['Iade No', 'Siparis', 'Musteri', 'Neden', 'Tur', 'Tutar', 'Iade Tutar', 'Durum'];
  const rows = data.map(r => [r.returnNumber, r.orderNumber, r.customerName, r.reason, r.type, r.totalAmount, r.refundAmount, r.status]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Returns() {
  const { sidebarOpen } = useAppStore();
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [confirmItem, setConfirmItem] = useState<ReturnItem | null>(null);
  const [showNewReturn, setShowNewReturn] = useState(false);
  const [newReturn, setNewReturn] = useState({ orderId: '', product: '', reason: '', amount: '', notes: '' });
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [detailItem, setDetailItem] = useState<ReturnItem | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/returns')
      .then((r) => r.json())
      .then((d) => setReturns(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalReturns = returns.length;
  const totalRefund = returns.reduce((a, b) => a + b.refundAmount, 0);
  const pending = returns.filter((r) => r.status === 'pending').length;

  const handleApprove = (item: ReturnItem) => {
    setConfirmAction('approve');
    setConfirmItem(item);
  };

  const handleReject = (item: ReturnItem) => {
    setConfirmAction('reject');
    setConfirmItem(item);
  };

  const confirmActionDialog = () => {
    if (!confirmItem || !confirmAction) return;
    if (confirmAction === 'approve') {
      setReturns(prev => prev.map(r => r.id === confirmItem.id ? { ...r, status: 'approved' } : r));
    } else {
      setReturns(prev => prev.map(r => r.id === confirmItem.id ? { ...r, status: 'rejected' } : r));
    }
    setConfirmItem(null);
    setConfirmAction(null);
  };

  const handleExportCSV = () => exportToCSV(returns, 'iadeler.csv');
  const handleExportExcel = () => exportToCSV(returns, 'iadeler.xlsx');

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Iade Yonetimi</h1>
        <div className="animate-pulse grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Iade & Iptal Yonetimi</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Iade</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalReturns}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                <RotateCcw className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Bekleyen</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Iade Tutari</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(totalRefund)}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewReturn(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Iade</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Iade No</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Siparis</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Neden</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Tur</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Tutar</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Iade</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => {
                  const st = statusMap[r.status] || statusMap.pending;
                  return (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{r.returnNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{r.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{r.customerName}</td>
                      <td className="py-3 px-4 text-slate-500">{r.reason}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {r.type === 'full' ? 'Tam' : 'Kismi'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{fmt(r.totalAmount)}</td>
                      <td className="py-3 px-4 text-right text-red-600">{fmt(r.refundAmount)}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${st.cls} text-xs`}>{st.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleApprove(r)}><CheckCircle className="h-3.5 w-3.5 mr-1" />Onayla</Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleReject(r)}><XCircle className="h-3.5 w-3.5 mr-1" />Reddet</Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setDetailItem(r)}><Eye className="h-3.5 w-3.5 mr-1" />Detay</Button>
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

      {/* Confirm Approve/Reject Dialog */}
      <Dialog open={!!confirmItem && !!confirmAction} onOpenChange={() => { setConfirmItem(null); setConfirmAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'approve' ? 'Iade Onayla' : 'Iade Reddet'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {confirmAction === 'approve'
              ? `"${confirmItem?.returnNumber}" numarali iade talebini onaylamak istediginize emin misiniz?`
              : `"${confirmItem?.returnNumber}" numarali iade talebini reddetmek istediginize emin misiniz?`}
          </p>
          {confirmItem && (
            <div className="text-sm space-y-1 text-slate-500">
              <p>Iade Tutari: <strong className="text-red-600">{fmt(confirmItem.refundAmount)}</strong></p>
              <p>Musteri: {confirmItem.customerName}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmItem(null); setConfirmAction(null); }}>Vazgec</Button>
            <Button variant={confirmAction === 'approve' ? 'default' : 'destructive'} onClick={confirmActionDialog}>
              {confirmAction === 'approve' ? 'Onayla' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Return Dialog */}
      <Dialog open={showNewReturn} onOpenChange={setShowNewReturn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Iade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Siparis No</Label>
              <Input className="mt-1" value={newReturn.orderId} onChange={e => setNewReturn(p => ({ ...p, orderId: e.target.value }))} placeholder="Siparis numarasini girin" />
            </div>
            <div>
              <Label>Urun</Label>
              <Input className="mt-1" value={newReturn.product} onChange={e => setNewReturn(p => ({ ...p, product: e.target.value }))} placeholder="Urun adini girin" />
            </div>
            <div>
              <Label>Iade Nedeni</Label>
              <Select value={newReturn.reason} onValueChange={v => setNewReturn(p => ({ ...p, reason: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Neden secin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bozuk Urun">Bozuk Urun</SelectItem>
                  <SelectItem value="Yanlis Urun">Yanlis Urun</SelectItem>
                  <SelectItem value="Begenmedi">Begenmedi</SelectItem>
                  <SelectItem value="Diger">Diger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Iade Tutari (TL)</Label>
              <Input className="mt-1" type="number" value={newReturn.amount} onChange={e => setNewReturn(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <Label>Notlar</Label>
              <Textarea className="mt-1" value={newReturn.notes} onChange={e => setNewReturn(p => ({ ...p, notes: e.target.value }))} placeholder="Ek notlar (opsiyonel)" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewReturn(false)}>Iptal</Button>
            <Button onClick={() => {
              if (!newReturn.orderId || !newReturn.product) return;
              const id = `new-${Date.now()}`;
              const item: ReturnItem = {
                id,
                returnNumber: `IADE-${String(returns.length + 1).padStart(5, '0')}`,
                orderNumber: newReturn.orderId,
                customerName: 'Musteri',
                reason: newReturn.reason || 'Diger',
                status: 'pending',
                totalAmount: parseFloat(newReturn.amount) || 0,
                refundAmount: parseFloat(newReturn.amount) || 0,
                type: 'full',
                createdAt: new Date().toISOString(),
              };
              setReturns(prev => [item, ...prev]);
              setShowNewReturn(false);
              setNewReturn({ orderId: '', product: '', reason: '', amount: '', notes: '' });
            }}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Iade Detayi</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Iade No:</span><span className="font-medium">{detailItem.returnNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Siparis:</span><span>{detailItem.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Musteri:</span><span>{detailItem.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Neden:</span><span>{detailItem.reason}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tur:</span><span>{detailItem.type === 'full' ? 'Tam Iade' : 'Kismi Iade'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tutar:</span><span>{fmt(detailItem.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Iade Tutari:</span><span className="text-red-600 font-medium">{fmt(detailItem.refundAmount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Durum:</span><Badge className={statusMap[detailItem.status]?.cls}>{statusMap[detailItem.status]?.label}</Badge></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
