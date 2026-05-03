'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { Search, Package, AlertTriangle, Plus, Pencil, Trash2, Download, FileSpreadsheet, Printer, Upload, RefreshCw, Filter, Copy } from 'lucide-react';

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

function exportToCSV(data: Product[], filename: string) {
  const headers = ['Urun Adi', 'SKU', 'Fiyat', 'Stok', 'Maliyet', 'Kategori', 'Marka', 'Pazaryeri'];
  const rows = data.map(p => [p.name, p.sku, p.price, p.stock, p.cost, p.category, p.brand, p.marketplace]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Products() {
  const { sidebarOpen } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', stock: '', category: '', brand: '' });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', sku: '', price: '', stock: '', category: '', brand: '' });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowStock = filtered.filter((p) => p.stock > 0 && p.stock <= 20);
  const noStock = filtered.filter((p) => p.stock === 0);

  const handleNewProduct = () => {
    if (!newProduct.name) return;
    const id = `new-${Date.now()}`;
    const product: Product = {
      id, name: newProduct.name, sku: newProduct.sku, barcode: '', price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 0, cost: 0, category: newProduct.category, brand: newProduct.brand || '-', marketplace: 'Trendyol',
    };
    setProducts(prev => [product, ...prev]);
    setShowNewProduct(false);
    setNewProduct({ name: '', sku: '', price: '', stock: '', category: '', brand: '' });
  };

  const handleCopy = (p: Product) => {
    const copy = { ...p, id: `copy-${Date.now()}`, name: `${p.name} (Kopya)` };
    setProducts(prev => [copy, ...prev]);
  };

  const handleDelete = (p: Product) => {
    if (!confirm(`"${p.name}" urununu silmek istediginize emin misiniz?`)) return;
    setProducts(prev => prev.filter(x => x.id !== p.id));
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditFormData({ name: product.name, sku: product.sku, price: String(product.price), stock: String(product.stock), category: product.category, brand: product.brand });
  };

  const handleUpdateEdit = () => {
    if (!editProduct) return;
    setProducts(prev => prev.map(p => p.id === editProduct.id ? {
      ...p,
      name: editFormData.name,
      sku: editFormData.sku,
      price: parseFloat(editFormData.price) || 0,
      stock: parseInt(editFormData.stock) || 0,
      category: editFormData.category,
      brand: editFormData.brand,
    } : p));
    setEditProduct(null);
  };

  const handleImport = () => alert('Urun ice aktarma ozelligi yakinda aktif olacak');
  const handleExportCSV = () => exportToCSV(filtered, 'urunler.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'urunler.xlsx');

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
              <th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th>
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-slate-400">Urun bulunamadi</td></tr>}
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(p)}><Copy className="h-3.5 w-3.5 mr-1" />Kopyala</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
  );

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Urun & Stok Yonetimi</h1>
        <p className="text-sm text-slate-500">{filtered.length} urun listeleniyor</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewProduct(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Urun</Button>
        <Button size="sm" variant="outline" onClick={handleImport}><Upload className="h-4 w-4 mr-1" /> Ice Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Urun adi veya SKU ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>
        </div>
      )}

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

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Urun Duzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Urun Adi</Label>
              <Input className="mt-1" value={editFormData.name} onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))} placeholder="Urun adini girin" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <Input className="mt-1" value={editFormData.sku} onChange={e => setEditFormData(p => ({ ...p, sku: e.target.value }))} placeholder="SKU" />
              </div>
              <div>
                <Label>Kategori</Label>
                <Input className="mt-1" value={editFormData.category} onChange={e => setEditFormData(p => ({ ...p, category: e.target.value }))} placeholder="Kategori" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fiyat (TL)</Label>
                <Input className="mt-1" type="number" value={editFormData.price} onChange={e => setEditFormData(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Stok</Label>
                <Input className="mt-1" type="number" value={editFormData.stock} onChange={e => setEditFormData(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Marka</Label>
              <Input className="mt-1" value={editFormData.brand} onChange={e => setEditFormData(p => ({ ...p, brand: e.target.value }))} placeholder="Marka adini girin" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={showNewProduct} onOpenChange={setShowNewProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Urun</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Urun Adi</Label>
              <Input className="mt-1" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Urun adini girin" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <Input className="mt-1" value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} placeholder="SKU" />
              </div>
              <div>
                <Label>Kategori</Label>
                <Input className="mt-1" value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} placeholder="Kategori" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fiyat (TL)</Label>
                <Input className="mt-1" type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Stok</Label>
                <Input className="mt-1" type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Marka</Label>
              <Input className="mt-1" value={newProduct.brand} onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))} placeholder="Marka adini girin" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProduct(false)}>Iptal</Button>
            <Button onClick={handleNewProduct}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
