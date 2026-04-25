'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Truck,
  DollarSign,
  Clock,
  Zap,
  Plus,
  Edit2,
  ArrowRightLeft,
  BarChart3,
  Package,
  Search,
} from 'lucide-react';

interface CarrierRate {
  id: string;
  company: string;
  service: string;
  zone: string;
  basePrice: number;
  perKg: number;
  maxWeight: number;
  estimatedDays: number;
  active: boolean;
}

const demoRates: CarrierRate[] = [
  { id: '1', company: 'Aras Kargo', service: 'Standart', zone: 'Yurtiçi', basePrice: 35, perKg: 2.5, maxWeight: 30, estimatedDays: 2, active: true },
  { id: '2', company: 'Aras Kargo', service: 'Hızlı', zone: 'Yurtiçi', basePrice: 55, perKg: 4, maxWeight: 30, estimatedDays: 1, active: true },
  { id: '3', company: 'Yurtiçi Kargo', service: 'Ekonomik', zone: 'Yurtiçi', basePrice: 30, perKg: 2, maxWeight: 25, estimatedDays: 3, active: true },
  { id: '4', company: 'Trendyol Express', service: 'Standart', zone: 'Yurtiçi', basePrice: 28, perKg: 2, maxWeight: 20, estimatedDays: 2, active: true },
  { id: '5', company: 'HepsiJet', service: 'Standart', zone: 'Yurtiçi', basePrice: 32, perKg: 2.2, maxWeight: 25, estimatedDays: 2, active: true },
  { id: '6', company: 'PTT Kargo', service: 'Ekonomik', zone: 'Yurtiçi', basePrice: 25, perKg: 1.8, maxWeight: 30, estimatedDays: 4, active: true },
  { id: '7', company: 'FedEx', service: 'International', zone: 'Avrupa', basePrice: 250, perKg: 15, maxWeight: 70, estimatedDays: 3, active: true },
  { id: '8', company: 'DHL', service: 'Express', zone: 'Dünya Geneli', basePrice: 300, perKg: 18, maxWeight: 70, estimatedDays: 2, active: true },
  { id: '9', company: 'UPS', service: 'Standard', zone: 'Avrupa', basePrice: 220, perKg: 14, maxWeight: 70, estimatedDays: 4, active: true },
  { id: '10', company: 'Trendyol Express', service: 'Aynı Gün', zone: 'Yurtiçi', basePrice: 45, perKg: 3, maxWeight: 10, estimatedDays: 0, active: false },
];

const zones = ['Yurtiçi', 'Avrupa', 'Dünya Geneli', 'Kuzey Amerika', 'Asya'];

export default function CarrierRates() {
  const { sidebarOpen } = useAppStore();
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CarrierRate | null>(null);
  const [formCompany, setFormCompany] = useState('');
  const [formService, setFormService] = useState('');
  const [formZone, setFormZone] = useState('Yurtiçi');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [formPerKg, setFormPerKg] = useState('');
  const [formMaxWeight, setFormMaxWeight] = useState('');
  const [formEstimatedDays, setFormEstimatedDays] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [compareWeight, setCompareWeight] = useState('5');
  const [compareZone, setCompareZone] = useState('Yurtiçi');
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    fetch('/api/carrier-rates')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.rates) && data.rates.length > 0) {
          setRates(data.rates);
        } else {
          setRates(demoRates);
        }
      })
      .catch(() => {
        setRates(demoRates);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    const payload = {
      company: formCompany,
      service: formService,
      zone: formZone,
      basePrice: parseFloat(formBasePrice),
      perKg: parseFloat(formPerKg),
      maxWeight: parseFloat(formMaxWeight),
      estimatedDays: parseInt(formEstimatedDays),
      active: formActive,
    };

    fetch('/api/carrier-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingRate ? { ...payload, id: editingRate.id } : payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.rate) {
          setRates((prev) => {
            const idx = prev.findIndex((r) => r.id === data.rate.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = data.rate;
              return updated;
            }
            return [...prev, data.rate];
          });
        }
        setDialogOpen(false);
        resetForm();
      })
      .catch(() => {
        const newRate: CarrierRate = {
          id: Date.now().toString(),
          company: formCompany,
          service: formService,
          zone: formZone,
          basePrice: parseFloat(formBasePrice) || 0,
          perKg: parseFloat(formPerKg) || 0,
          maxWeight: parseFloat(formMaxWeight) || 0,
          estimatedDays: parseInt(formEstimatedDays) || 0,
          active: formActive,
        };
        setRates((prev) => [...prev, newRate]);
        setDialogOpen(false);
        resetForm();
      });
  };

  const resetForm = () => {
    setEditingRate(null);
    setFormCompany('');
    setFormService('');
    setFormZone('Yurtiçi');
    setFormBasePrice('');
    setFormPerKg('');
    setFormMaxWeight('');
    setFormEstimatedDays('');
    setFormActive(true);
  };

  const openEdit = (rate: CarrierRate) => {
    setEditingRate(rate);
    setFormCompany(rate.company);
    setFormService(rate.service);
    setFormZone(rate.zone);
    setFormBasePrice(rate.basePrice.toString());
    setFormPerKg(rate.perKg.toString());
    setFormMaxWeight(rate.maxWeight.toString());
    setFormEstimatedDays(rate.estimatedDays.toString());
    setFormActive(rate.active);
    setDialogOpen(true);
  };

  const activeRates = rates.filter((r) => r.active);
  const avgPrice = activeRates.length > 0
    ? activeRates.reduce((s, r) => s + r.basePrice, 0) / activeRates.length
    : 0;
  const cheapest = activeRates.length > 0
    ? activeRates.reduce((a, b) => (a.basePrice < b.basePrice ? a : b))
    : null;
  const fastest = activeRates.length > 0
    ? activeRates.reduce((a, b) => (a.estimatedDays <= b.estimatedDays ? a : b))
    : null;

  const compareResults = activeRates
    .filter((r) => r.zone === compareZone)
    .map((r) => ({
      ...r,
      totalPrice: r.basePrice + (parseFloat(compareWeight) || 0) * r.perKg,
    }))
    .sort((a, b) => a.totalPrice - b.totalPrice);

  const chartData = compareResults.map((r) => ({
    name: r.company,
    fiyat: r.totalPrice,
    'kg başı': r.perKg,
  }));

  const calcPrice = (rate: CarrierRate, weight: number) => rate.basePrice + weight * rate.perKg;

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Kargo Karşılaştırma</h1>
        <p className="mb-6 text-slate-500">Kargo firması fiyat karşılaştırması</p>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kargo Karşılaştırma</h1>
        <p className="text-slate-500 mt-1">Kargo firması fiyatlarını karşılaştırın ve en uygun seçeneği bulun</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Aktif Kargo Firması</p>
              <p className="text-2xl font-bold mt-1">{new Set(activeRates.map((r) => r.company)).size}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Ortalama Başlangıç Fiyatı</p>
              <p className="text-2xl font-bold mt-1">₺{avgPrice.toFixed(0)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">En Ucuz Firma</p>
              <p className="text-lg font-bold mt-1">{cheapest?.company || '-'}</p>
              <p className="text-emerald-200 text-xs">₺{cheapest?.basePrice || 0} başlangıç</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">En Hızlı Teslimat</p>
              <p className="text-lg font-bold mt-1">{fastest?.company || '-'}</p>
              <p className="text-emerald-200 text-xs">
                {fastest?.estimatedDays === 0 ? 'Aynı Gün' : `${fastest?.estimatedDays || '-'} gün`}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Compare */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Hızlı Karşılaştırma</h2>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-sm text-slate-600">Ağırlık (kg)</Label>
            <Input
              type="number"
              value={compareWeight}
              onChange={(e) => setCompareWeight(e.target.value)}
              placeholder="5"
              className="mt-1 w-32"
            />
          </div>
          <div>
            <Label className="text-sm text-slate-600">Bölge</Label>
            <Select value={compareZone} onValueChange={setCompareZone}>
              <SelectTrigger className="mt-1 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowCompare(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Search className="h-4 w-4 mr-1" />
            Karşılaştır
          </Button>
        </div>

        {showCompare && compareResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-700">Sonuçlar (En ucuzdan pahalıya)</h3>
            {compareResults.slice(0, 5).map((r, idx) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                    idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-emerald-400' : 'bg-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{r.company} - {r.service}</p>
                    <p className="text-xs text-slate-500">Kg başı: ₺{r.perKg} | Tahmini: {r.estimatedDays === 0 ? 'Aynı gün' : `${r.estimatedDays} gün`}</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-700 text-lg">₺{r.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Chart */}
        {showCompare && chartData.length > 0 && (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value: number) => `₺${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="fiyat" name="Toplam Fiyat" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Carrier Rate Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Kargo Fiyatları</h2>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" />
                Yeni Fiyat Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRate ? 'Fiyat Düzenle' : 'Yeni Kargo Fiyatı'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Firma</Label>
                    <Input value={formCompany} onChange={(e) => setFormCompany(e.target.value)} placeholder="Aras Kargo" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Hizmet</Label>
                    <Input value={formService} onChange={(e) => setFormService(e.target.value)} placeholder="Standart" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Bölge</Label>
                  <Select value={formZone} onValueChange={setFormZone}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z} value={z}>{z}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Başlangıç Fiyatı (₺)</Label>
                    <Input type="number" value={formBasePrice} onChange={(e) => setFormBasePrice(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Kg Başı (₺)</Label>
                    <Input type="number" step="0.1" value={formPerKg} onChange={(e) => setFormPerKg(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Maks Ağırlık (kg)</Label>
                    <Input type="number" value={formMaxWeight} onChange={(e) => setFormMaxWeight(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Tahmini Gün</Label>
                    <Input type="number" value={formEstimatedDays} onChange={(e) => setFormEstimatedDays(e.target.value)} className="mt-1" />
                  </div>
                  <div className="flex items-end gap-2">
                    <Switch checked={formActive} onCheckedChange={setFormActive} />
                    <Label className="text-sm text-slate-600">Aktif</Label>
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {editingRate ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Firma</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Hizmet</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Bölge</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Başlangıç Fiyatı</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Kg Başı</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Maks Ağırlık</th>
                <th className="text-center py-3 px-4 text-slate-500 font-medium">Tahmini Gün</th>
                <th className="text-center py-3 px-4 text-slate-500 font-medium">Durum</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{rate.company}</td>
                  <td className="py-3 px-4 text-slate-600">{rate.service}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{rate.zone}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">₺{rate.basePrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">₺{rate.perKg.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{rate.maxWeight} kg</td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    {rate.estimatedDays === 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Aynı Gün</Badge>
                    ) : (
                      `${rate.estimatedDays} gün`
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={rate.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                      {rate.active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(rate)}>
                      <Edit2 className="h-4 w-4 text-emerald-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rates.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Henüz kargo fiyatı eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
}
