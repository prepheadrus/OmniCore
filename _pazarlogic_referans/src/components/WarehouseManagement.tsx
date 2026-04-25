'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { Warehouse, MapPin, Box, BarChart3 } from 'lucide-react';

interface WarehouseItem { id: string; name: string; code: string; address: string; capacity: number; usedSpace: number; type: string; status: string; }

const typeLabels: Record<string, { label: string; cls: string }> = {
  standard: { label: 'Standart', cls: 'bg-blue-100 text-blue-700' },
  '3pl': { label: '3PL', cls: 'bg-purple-100 text-purple-700' },
  fba: { label: 'FBA', cls: 'bg-emerald-100 text-emerald-700' },
};

export default function WarehouseManagement() {
  const { sidebarOpen } = useAppStore();
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/warehouses').then((r) => r.json()).then((d) => setWarehouses(Array.isArray(d) ? d : [])).finally(() => setLoading(false)); }, []);

  const totalCapacity = warehouses.reduce((a, b) => a + b.capacity, 0);
  const totalUsed = warehouses.reduce((a, b) => a + b.usedSpace, 0);
  const avgUsage = warehouses.length > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  const usageColor = (pct: number) => pct > 80 ? 'text-red-600' : pct > 60 ? 'text-amber-600' : 'text-emerald-600';
  const progressColor = (pct: number) => pct > 80 ? '[&>div]:bg-red-500' : pct > 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500';

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {warehouses.map((w) => {
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
