'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { Search, Package, AlertTriangle } from 'lucide-react';

interface Product {
  id: string; name: string; sku: string; barcode: string; price: number;
  stock: number; cost: number; category: string; brand: string; marketplace: string;
}

const stockBadge = (s: number) => {
  if (s === 0) return { label: 'Stok Yok', cls: 'bg-red-100 text-red-700' };
  if (s <= 10) return { label: 'Kritik', cls: 'bg-amber-100 text-amber-700' };
  if (s <= 20) return { label: 'Dusuk', cls: 'bg-orange-100 text-orange-700' };
  if (s <= 50) return { label: 'Normal', cls: 'bg-blue-100 text-blue-700' };
  return { label: 'Yeterli', cls: 'bg-emerald-100 text-emerald-700' };
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export default function Products() {
  const { sidebarOpen } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowStock = filtered.filter((p) => p.stock > 0 && p.stock <= 20);
  const noStock = filtered.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Urun & Stok</h1>
        {[1,2,3].map(i => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-10 bg-slate-200 rounded" /></CardContent></Card>)}
      </div>
    );
  }

  const renderTable = (items: Product[]) => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-3 px-4 font-medium text-slate-600">Urun Adi</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">SKU</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Fiyat</th>
              <th className="text-center py-3 px-4 font-medium text-slate-600">Stok</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Maliyet</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Kategori</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Marka</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Pazaryeri</th>
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-400">Urun bulunamadi</td></tr>}
              {items.map((p) => {
                const sb = stockBadge(p.stock);
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500">{p.sku}</td>
                    <td className="py-3 px-4 text-right font-medium">{fmt(p.price)}</td>
                    <td className="py-3 px-4 text-center"><Badge className={`${sb.cls} text-xs`}>{p.stock} - {sb.label}</Badge></td>
                    <td className="py-3 px-4 text-right text-slate-500">{fmt(p.cost)}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{p.category}</Badge></td>
                    <td className="py-3 px-4 text-slate-600">{p.brand}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{p.marketplace}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Urun & Stok Yonetimi</h1>
        <p className="text-sm text-slate-500">{filtered.length} urun listeleniyor</p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Urun adı veya SKU ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tum Urunler ({filtered.length})</TabsTrigger>
          <TabsTrigger value="low">Dusuk Stok ({lowStock.length})</TabsTrigger>
          <TabsTrigger value="none">Stok Yok ({noStock.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderTable(filtered)}</TabsContent>
        <TabsContent value="low">{renderTable(lowStock)}</TabsContent>
        <TabsContent value="none">{renderTable(noStock)}</TabsContent>
      </Tabs>
    </div>
  );
}
