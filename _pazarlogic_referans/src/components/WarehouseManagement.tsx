'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { Warehouse, MapPin, Box, BarChart3, Plus, Pencil, Trash2, Download, FileSpreadsheet, RefreshCw, Search, Filter } from 'lucide-react';

interface WarehouseItem { id: string; name: string; code: string; address: string; capacity: number; usedSpace: number; type: string; status: string; }

const typeLabels: Record<string, { label: string; cls: string }> = {
  standard: { label: 'Standart', cls: 'bg-blue-100 text-blue-700' },
  '3pl': { label: '3PL', cls: 'bg-purple-100 text-purple-700' },
  fba: { label: 'FBA', cls: 'bg-emerald-100 text-emerald-700' },
};

function exportToCSV(data: WarehouseItem[], filename: string) {
  const headers = ['Depo Adi', 'Kod', 'Adres', 'Kapasite', 'Kullanilan', 'Doluluk %'];
  const rows = data.map(w => [w.name, w.code, w.address, w.capacity, w.usedSpace, w.capacity > 0 ? Math.round((w.usedSpace / w.capacity) * 100) : 0]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function WarehouseManagement() {
  const { sidebarOpen } = useAppStore();
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', code: '', address: '', city: '', capacity: '', occupancy: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/warehouses').then((r) => r.json()).then((d) => setWarehouses(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalCapacity = warehouses.reduce((a, b) => a + b.capacity, 0);
  const totalUsed = warehouses.reduce((a, b) => a + b.usedSpace, 0);
  const avgUsage = warehouses.length > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  const usageColor = (pct: number) => pct > 80 ? 'text-red-600' : pct > 60 ? 'text-amber-600' : 'text-emerald-600';
  const progressColor = (pct: number) => pct > 80 ? '[&>div]:bg-red-500' : pct > 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500';

  const handleNewWarehouse = () => {
    if (!newWarehouse.name) return;
    const cap = parseInt(newWarehouse.capacity) || 0;
    const occ = parseInt(newWarehouse.occupancy) || 0;
    if (editId) {
      setWarehouses(prev => prev.map(w => w.id === editId ? { ...w, name: newWarehouse.name, code: newWarehouse.code, address: newWarehouse.address, capacity: cap, usedSpace: occ } : w));
    } else {
      const id = `new-${Date.now()}`;
      const warehouse: WarehouseItem = {
        id, name: newWarehouse.name, code: newWarehouse.code, address: `${newWarehouse.address}, ${newWarehouse.city}`,
        capacity: cap, usedSpace: occ, type: 'standard', status: 'active',
      };
      setWarehouses(prev => [warehouse, ...prev]);
    }
    setShowNewWarehouse(false);
    setEditId(null);
    setNewWarehouse({ name: '', code: '', address: '', city: '', capacity: '', occupancy: '' });
  };

  const handleEdit = (w: WarehouseItem) => {
    setEditId(w.id);
    setNewWarehouse({ name: w.name, code: w.code, address: w.address, city: '', capacity: String(w.capacity), occupancy: String(w.usedSpace) });
    setShowNewWarehouse(true);
  };

  const handleDelete = (w: WarehouseItem) => {
    if (!confirm(`"${w.name}" deposunu silmek istediginize emin misiniz?`)) return;
    setWarehouses(prev => prev.filter(x => x.id !== w.id));
  };

  const handleExportCSV = () => exportToCSV(warehouses, 'depo-raporu.csv');
  const handleExportExcel = () => exportToCSV(warehouses, 'depo-raporu.xlsx');

  const filteredWarehouses = warehouses.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return (<div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}><h1 className="mb-6 text-2xl font-bold text-slate-800">Depo Yonetimi</h1><div className="animate-pulse grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><Card key={i}><CardContent className="p-5"><div className="h-8 bg-slate-200 rounded"/></CardContent></Card>)}</div></div>);

  return (
    <div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Depo Yonetimi (WMS)</h1><p className="text-sm text-slate-500">Depo kapasite ve doluluk takibi</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Depo</p><p className="text-2xl font-bold text-slate-900 mt-1">{warehouses.length}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><Warehouse className="h-5 w-5 text-white"/></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Kapasite</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalCapacity.toLocaleString('tr-TR')}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500"><Box className="h-5 w-5 text-white"/></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Kullanilan Alan</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalUsed.toLocaleString('tr-TR')}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Ort. Doluluk</p><p className={`text-2xl font-bold mt-1 ${usageColor(avgUsage)}`}>{avgUsage}%</p></CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => { setEditId(null); setNewWarehouse({ name: '', code: '', address: '', city: '', capacity: '', occupancy: '' }); setShowNewWarehouse(true); }}><Plus className="h-4 w-4 mr-1" /> Yeni Depo</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Depo adi ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <Button size="sm" variant="outline" onClick={() => { setSearch(''); setShowFilter(false); }}>Temizle</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredWarehouses.map((w) => {
          const pct = w.capacity > 0 ? Math.round((w.usedSpace / w.capacity) * 100) : 0;
          const tl = typeLabels[w.type] || typeLabels.standard;
          return (
            <Card key={w.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{w.name}</CardTitle>
                  <Badge className={`${tl.cls} text-xs`}>{tl.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{w.address}</p>
                <div className="flex justify-between text-xs text-slate-500"><span>Kod: {w.code}</span><span>Kapasite: {w.capacity.toLocaleString('tr-TR')}</span></div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Kullanim</span><span className={`font-semibold ${usageColor(pct)}`}>{pct}%</span></div>
                  <Progress value={pct} className={`h-2 ${progressColor(pct)}`} />
                </div>
                <div className="flex justify-between text-xs text-slate-500"><span>Dolu: {w.usedSpace.toLocaleString('tr-TR')}</span><span>Bos: {(w.capacity - w.usedSpace).toLocaleString('tr-TR')}</span></div>
                <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(w)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 ml-auto" onClick={() => handleDelete(w)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Warehouse Dialog */}
      <Dialog open={showNewWarehouse} onOpenChange={setShowNewWarehouse}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Depoyu Duzenle' : 'Yeni Depo'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Depo Adi</Label><Input className="mt-1" value={newWarehouse.name} onChange={e => setNewWarehouse(p => ({ ...p, name: e.target.value }))} placeholder="Depo adi" /></div>
            <div><Label>Adres</Label><Input className="mt-1" value={newWarehouse.address} onChange={e => setNewWarehouse(p => ({ ...p, address: e.target.value }))} placeholder="Adres" /></div>
            <div><Label>Sehir</Label><Input className="mt-1" value={newWarehouse.city} onChange={e => setNewWarehouse(p => ({ ...p, city: e.target.value }))} placeholder="ornek: Istanbul" /></div>
            <div><Label>Kapasite</Label><Input className="mt-1" type="number" value={newWarehouse.capacity} onChange={e => setNewWarehouse(p => ({ ...p, capacity: e.target.value }))} placeholder="0" /></div>
            <div><Label>Doluluk Orani (%)</Label><Input className="mt-1" type="number" min="0" max="100" value={newWarehouse.occupancy} onChange={e => setNewWarehouse(p => ({ ...p, occupancy: e.target.value }))} placeholder="0" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWarehouse(false)}>Iptal</Button>
            <Button onClick={handleNewWarehouse}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
