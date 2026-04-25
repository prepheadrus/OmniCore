'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Globe, Download, FileText, MapPin, DollarSign, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const countries = ['Almanya', 'Fransa', 'Hollanda', 'Belcika', 'Ingiltere', 'İtalya', 'İspanya', 'ABD', 'Kanada', 'Avustralya', 'BAE', 'Suudi Arabistan'];

const carriers = [
  { value: 'dhl', label: 'DHL' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'ptt', label: 'PTT' },
];

interface MicroExportItem {
  id: string;
  exportNumber: string;
  country: string;
  carrier: string;
  totalValue: number;
  status: string;
  statusLabel?: string;
  trackingNo: string;
  productName: string;
  createdAt: string;
}

const demoExports: MicroExportItem[] = [
  { id: '1', exportNumber: 'ME-000001', country: 'Almanya', carrier: 'DHL', totalValue: 249.99, status: 'delivered', statusLabel: 'Teslim Edildi', trackingNo: 'TR123456789', productName: 'iPhone 15 Pro Max', createdAt: '2025-04-15T00:00:00.000Z' },
  { id: '2', exportNumber: 'ME-000002', country: 'Fransa', carrier: 'FedEx', totalValue: 199.99, status: 'shipped', statusLabel: 'Kargoda', trackingNo: 'TR987654321', productName: 'Samsung Galaxy S24', createdAt: '2025-04-14T00:00:00.000Z' },
  { id: '3', exportNumber: 'ME-000003', country: 'Hollanda', carrier: 'UPS', totalValue: 89.99, status: 'pending', statusLabel: 'Hazirlaniyor', trackingNo: '', productName: 'Sony WH-1000XM5', createdAt: '2025-04-12T00:00:00.000Z' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Hazirlaniyor', cls: 'bg-amber-100 text-amber-700' },
  shipped: { label: 'Kargoda', cls: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Teslim Edildi', cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Iptal Edildi', cls: 'bg-red-100 text-red-700' },
};

export default function MicroExport() {
  const { sidebarOpen } = useAppStore();
  const [exports, setExports] = useState<MicroExportItem[]>(demoExports);
  const [loading, setLoading] = useState(false);
  const [formCountry, setFormCountry] = useState('');
  const [formCarrier, setFormCarrier] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!formCountry) {
      setErrorMsg('Lutfen hedef ulke secin');
      return;
    }
    if (!formCarrier) {
      setErrorMsg('Lutfen kargo firmasi secin');
      return;
    }
    const value = parseFloat(formValue);
    if (!value || value <= 0) {
      setErrorMsg('Lutfen gecerli bir toplam deger girin');
      return;
    }

    setLoading(true);

    const payload = {
      country: formCountry,
      carrier: formCarrier,
      totalValue: formValue,
      productName: formProduct,
    };

    fetch('/api/micro-exports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          const sc = statusConfig[data.status] || statusConfig.pending;
          const newItem: MicroExportItem = {
            ...data,
            statusLabel: sc.label,
          };
          setExports((prev) => [newItem, ...prev]);
          setSuccessMsg(`Ihracat ${data.exportNumber} basariyla olusturuldu`);
          resetForm();
        } else {
          setErrorMsg(data.error || 'Ihracat olusturulamadi');
        }
      })
      .catch(() => {
        // Fallback: add locally
        const count = exports.length + 1;
        const newExport: MicroExportItem = {
          id: Date.now().toString(),
          exportNumber: `ME-${String(count).padStart(6, '0')}`,
          country: formCountry,
          carrier: carriers.find((c) => c.value === formCarrier)?.label || formCarrier,
          totalValue: value,
          status: 'pending',
          statusLabel: 'Hazirlaniyor',
          trackingNo: '',
          productName: formProduct,
          createdAt: new Date().toISOString(),
        };
        setExports((prev) => [newExport, ...prev]);
        setSuccessMsg(`Ihracat ${newExport.exportNumber} basariyla olusturuldu`);
        resetForm();
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setFormCountry('');
    setFormCarrier('');
    setFormValue('');
    setFormProduct('');
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string, label?: string) => {
    const sc = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${sc.cls} text-xs`}>
        {label || sc.label}
      </Badge>
    );
  };

  return (
    <div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Mikro Ihracat</h1><p className="text-sm text-slate-500">Kucuk ve ortak olcekte e-ihracat yonetimi</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"><Info className="h-5 w-5 text-blue-600"/></div><div><h3 className="font-semibold text-slate-800 text-sm">Mikro Ihracat Nedir?</h3><p className="text-xs text-slate-500 mt-1">$300 altindaki B2C satislarda kolay ihracat. Gumruk beyannamesi gerektirmez, hizli teslimat.</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><DollarSign className="h-5 w-5 text-emerald-600"/></div><div><h3 className="font-semibold text-slate-800 text-sm">Avantajlar</h3><ul className="text-xs text-slate-500 mt-1 space-y-1"><li>Gumruk beyannamesi gerekmez</li><li>Hizli kargo teslimati</li><li>Dusuk maliyet</li><li>KDV iadesi</li></ul></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100"><Globe className="h-5 w-5 text-violet-600"/></div><div><h3 className="font-semibold text-slate-800 text-sm">Uygulanan Ulkeler</h3><div className="flex flex-wrap gap-1 mt-2">{countries.map((c)=><Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</div></div></div></CardContent></Card>
      </div>

      {/* Yeni Ihracat Formu */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Yeni Ihracat Olustur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Hedef Ulke</Label>
              <Select value={formCountry} onValueChange={setFormCountry}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Ulke secin"/></SelectTrigger>
                <SelectContent>{countries.map((c)=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kargo Firmasi</Label>
              <Select value={formCarrier} onValueChange={setFormCarrier}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Firma secin"/></SelectTrigger>
                <SelectContent>{carriers.map((c)=><SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Toplam Deger (USD)</Label>
              <Input placeholder="0.00" type="number" className="h-10" value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Urun Adi (Opsiyonel)</Label>
              <Input placeholder="Urun adi" className="h-10" value={formProduct} onChange={(e) => setFormProduct(e.target.value)}/>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0"/>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 rounded-lg p-2.5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0"/>
              {successMsg}
            </div>
          )}

          <div className="mt-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Olusturuluyor...' : 'Ihracat Olustur'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Son Ihracatlar Tablosu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/>Son Ihracatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Ihracat No</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Urun</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Ulke</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Deger</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-emerald-700 font-medium text-xs">{exp.exportNumber}</td>
                    <td className="py-3 px-4 text-slate-800">{exp.productName || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.country}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(exp.createdAt)}</td>
                    <td className="py-3 px-4">{getStatusBadge(exp.status, exp.statusLabel)}</td>
                    <td className="py-3 px-4 text-right font-medium">${exp.totalValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {exports.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Globe className="h-12 w-12 mx-auto mb-2 opacity-50"/>
              <p>Henuz ihracat bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
