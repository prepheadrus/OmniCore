'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { DollarSign, Target, Percent, TrendingUp, Download, FileSpreadsheet, Printer, RefreshCw, Filter, Pencil, TrendingUpIcon } from 'lucide-react';

interface Product { id: string; name: string; sku: string; price: number; cost: number; stock: number; category: string; marketplace: string; }

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const marginColor = (m: number) => m > 30 ? 'text-emerald-600' : m > 15 ? 'text-blue-600' : m > 5 ? 'text-amber-600' : 'text-red-600';
const marginBadge = (m: number) => m > 30 ? 'bg-emerald-100 text-emerald-700' : m > 15 ? 'bg-blue-100 text-blue-700' : m > 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

function exportToCSV(data: Product[], filename: string) {
  const headers = ['Urun Adi', 'SKU', 'Satis Fiyati', 'Maliyet', 'Kar Marji', 'Kar (TL)'];
  const rows = data.map(p => {
    const margin = ((p.price - p.cost) / p.price) * 100;
    return [p.name, p.sku, p.price, p.cost, margin.toFixed(1), p.price - p.cost];
  });
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Pricing() {
  const { sidebarOpen } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [simulationProduct, setSimulationProduct] = useState<Product | null>(null);
  const [simPrice, setSimPrice] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({ price: '', cost: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = products.filter((p) => search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) : true);
  const avgPrice = filtered.length > 0 ? filtered.reduce((a, b) => a + b.price, 0) / filtered.length : 0;
  const avgMargin = filtered.length > 0 ? filtered.reduce((a, b) => a + ((b.price - b.cost) / b.price) * 100, 0) / filtered.length : 0;
  const maxPrice = filtered.length > 0 ? Math.max(...filtered.map((p) => p.price)) : 0;

  const handleExportCSV = () => exportToCSV(filtered, 'fiyat-analizi.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'fiyat-analizi.xlsx');

  const openSimulation = (p: Product) => {
    setSimulationProduct(p);
    setSimPrice(String(p.price));
  };

  const handleEdit = (p: Product) => {
    setEditProduct(p);
    setEditFormData({ price: String(p.price), cost: String(p.cost) });
  };

  const handleUpdateEdit = () => {
    if (!editProduct) return;
    setProducts(prev => prev.map(p => p.id === editProduct.id ? {
      ...p,
      price: parseFloat(editFormData.price) || 0,
      cost: parseFloat(editFormData.cost) || 0,
    } : p));
    setEditProduct(null);
  };

  if (loading) return (<div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}><h1 className="mb-6 text-2xl font-bold text-slate-800">Fiyat Yonetimi</h1><div className="animate-pulse grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><Card key={i}><CardContent className="p-5"><div className="h-8 bg-slate-200 rounded"/></CardContent></Card>)}</div></div>);

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Fiyat Yonetimi</h1><p className="text-sm text-slate-500">Kar marjı analizi ve fiyat optimizasyonu</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Urun</p><p className="text-2xl font-bold text-slate-900 mt-1">{filtered.length}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><Target className="h-5 w-5 text-white"/></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Ortalama Fiyat</p><p className="text-2xl font-bold text-slate-900 mt-1">{fmt(avgPrice)}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500"><DollarSign className="h-5 w-5 text-white"/></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Ort. Kar Marjı</p><p className={`text-2xl font-bold mt-1 ${marginColor(avgMargin)}`}>{avgMargin.toFixed(1)}%</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500"><Percent className="h-5 w-5 text-white"/></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">En Yuksek Fiyat</p><p className="text-2xl font-bold text-slate-900 mt-1">{fmt(maxPrice)}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500"><TrendingUp className="h-5 w-5 text-white"/></div></div></CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4"><CardContent className="p-4"><div className="relative max-w-md"><Input placeholder="Urun adi veya SKU ara..." value={search} onChange={(e)=>setSearch(e.target.value)} className="h-10"/></div></CardContent></Card>
      )}

      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Urun Adi</th><th className="text-left py-3 px-4 font-medium text-slate-600">SKU</th><th className="text-right py-3 px-4 font-medium text-slate-600">Satis Fiyati</th><th className="text-right py-3 px-4 font-medium text-slate-600">Maliyet</th><th className="text-right py-3 px-4 font-medium text-slate-600">Kar Marjı</th><th className="text-right py-3 px-4 font-medium text-slate-600">Kar (TL)</th><th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th><th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th></tr></thead><tbody>{filtered.map((p)=>{const margin=((p.price-p.cost)/p.price)*100;return(<tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{p.name}</td><td className="py-3 px-4 text-slate-500">{p.sku}</td><td className="py-3 px-4 text-right font-medium">{fmt(p.price)}</td><td className="py-3 px-4 text-right text-slate-500">{fmt(p.cost)}</td><td className={`py-3 px-4 text-right font-semibold ${marginColor(margin)}`}>{margin.toFixed(1)}%</td><td className={`py-3 px-4 text-right font-medium ${p.price-p.cost>0?'text-emerald-600':'text-red-600'}`}>{fmt(p.price-p.cost)}</td><td className="py-3 px-4"><Badge className={`${marginBadge(margin)} text-xs`}>{margin>30?'Yuksek':margin>15?'Orta':margin>5?'Dusuk':'Zarar'}</Badge></td><td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={()=>handleEdit(p)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button><Button size="sm" variant="ghost" onClick={()=>openSimulation(p)}><TrendingUpIcon className="h-3.5 w-3.5 mr-1" />Simulasyon</Button></div></td></tr>)})}</tbody></table></div></CardContent></Card>

      {/* Edit Price Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Fiyat Duzenle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">{editProduct?.name} ({editProduct?.sku})</p>
            </div>
            <div>
              <Label>Satis Fiyati (TL)</Label>
              <Input className="mt-1" type="number" value={editFormData.price} onChange={e => setEditFormData(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <Label>Maliyet (TL)</Label>
              <Input className="mt-1" type="number" value={editFormData.cost} onChange={e => setEditFormData(p => ({ ...p, cost: e.target.value }))} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Simulation Dialog */}
      {simulationProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSimulationProduct(null)}>
          <Card className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fiyat Simulasyonu</h3>
              <p className="text-sm text-slate-500 mb-4">{simulationProduct.name} ({simulationProduct.sku})</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mevcut Fiyat: {fmt(simulationProduct.price)}</p>
                  <p className="text-xs text-slate-500 mb-1">Maliyet: {fmt(simulationProduct.cost)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Yeni Fiyat (TL)</p>
                  <Input type="number" value={simPrice} onChange={e => setSimPrice(e.target.value)} placeholder="0.00" />
                </div>
                {simPrice && !isNaN(parseFloat(simPrice)) && (
                  <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Yeni Kar Marjı:</span><span className={marginColor(((parseFloat(simPrice) - simulationProduct.cost) / parseFloat(simPrice)) * 100)}>{(((parseFloat(simPrice) - simulationProduct.cost) / parseFloat(simPrice)) * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Yeni Kar:</span><span className={parseFloat(simPrice) - simulationProduct.cost > 0 ? 'text-emerald-600' : 'text-red-600'}>{fmt(parseFloat(simPrice) - simulationProduct.cost)}</span></div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setSimulationProduct(null)}>Kapat</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
