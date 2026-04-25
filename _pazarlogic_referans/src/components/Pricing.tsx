'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { DollarSign, Target, Percent, TrendingUp } from 'lucide-react';

interface Product { id: string; name: string; sku: string; price: number; cost: number; stock: number; category: string; marketplace: string; }

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const marginColor = (m: number) => m > 30 ? 'text-emerald-600' : m > 15 ? 'text-blue-600' : m > 5 ? 'text-amber-600' : 'text-red-600';
const marginBadge = (m: number) => m > 30 ? 'bg-emerald-100 text-emerald-700' : m > 15 ? 'bg-blue-100 text-blue-700' : m > 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

export default function Pricing() {
  const { sidebarOpen } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/products').then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : [])).finally(() => setLoading(false)); }, []);

  const filtered = products.filter((p) => search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) : true);
  const avgPrice = filtered.length > 0 ? filtered.reduce((a, b) => a + b.price, 0) / filtered.length : 0;
  const avgMargin = filtered.length > 0 ? filtered.reduce((a, b) => a + ((b.price - b.cost) / b.price) * 100, 0) / filtered.length : 0;
  const maxPrice = filtered.length > 0 ? Math.max(...filtered.map((p) => p.price)) : 0;

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
      <Card className="mb-4"><CardContent className="p-4"><div className="relative max-w-md"><Input placeholder="Urun adi veya SKU ara..." value={search} onChange={(e)=>setSearch(e.target.value)} className="h-10"/></div></CardContent></Card>
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Urun Adi</th><th className="text-left py-3 px-4 font-medium text-slate-600">SKU</th><th className="text-right py-3 px-4 font-medium text-slate-600">Satis Fiyati</th><th className="text-right py-3 px-4 font-medium text-slate-600">Maliyet</th><th className="text-right py-3 px-4 font-medium text-slate-600">Kar Marjı</th><th className="text-right py-3 px-4 font-medium text-slate-600">Kar (TL)</th><th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th></tr></thead><tbody>{filtered.map((p)=>{const margin=((p.price-p.cost)/p.price)*100;return(<tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{p.name}</td><td className="py-3 px-4 text-slate-500">{p.sku}</td><td className="py-3 px-4 text-right font-medium">{fmt(p.price)}</td><td className="py-3 px-4 text-right text-slate-500">{fmt(p.cost)}</td><td className={`py-3 px-4 text-right font-semibold ${marginColor(margin)}`}>{margin.toFixed(1)}%</td><td className={`py-3 px-4 text-right font-medium ${p.price-p.cost>0?'text-emerald-600':'text-red-600'}`}>{fmt(p.price-p.cost)}</td><td className="py-3 px-4"><Badge className={`${marginBadge(margin)} text-xs`}>{margin>30?'Yuksek':margin>15?'Orta':margin>5?'Dusuk':'Zarar'}</Badge></td></tr>)})}</tbody></table></div></CardContent></Card>
    </div>
  );
}
