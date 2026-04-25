'use client';

import { useState, useEffect, useMemo } from 'react';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  RefreshCw,
  TrendingUp,
  ArrowRightLeft,
  Plus,
  Edit2,
  Globe,
  Clock,
  BarChart3,
} from 'lucide-react';

interface CurrencyRate {
  id: string;
  code: string;
  name: string;
  rate: number;
  source: string;
  active: boolean;
  lastUpdate: string;
}

interface TrendData {
  date: string;
  USD: number;
  EUR: number;
  GBP: number;
}

const demoRates: CurrencyRate[] = [
  { id: '1', code: 'USD', name: 'Amerikan Doları', rate: 34.25, source: 'TCMB', active: true, lastUpdate: '2025-01-15T10:30:00' },
  { id: '2', code: 'EUR', name: 'Euro', rate: 36.80, source: 'TCMB', active: true, lastUpdate: '2025-01-15T10:30:00' },
  { id: '3', code: 'GBP', name: 'İngiliz Sterlini', rate: 42.15, source: 'TCMB', active: true, lastUpdate: '2025-01-15T10:30:00' },
  { id: '4', code: 'SAR', name: 'Suudi Riyali', rate: 9.13, source: 'TCMB', active: true, lastUpdate: '2025-01-15T10:30:00' },
  { id: '5', code: 'CNY', name: 'Çin Yuanı', rate: 4.71, source: 'TCMB', active: false, lastUpdate: '2025-01-14T10:30:00' },
  { id: '6', code: 'JPY', name: 'Japon Yeni', rate: 0.218, source: 'TCMB', active: false, lastUpdate: '2025-01-14T10:30:00' },
  { id: '7', code: 'RUB', name: 'Rus Rublesi', rate: 0.345, source: 'TCMB', active: false, lastUpdate: '2025-01-13T10:30:00' },
  { id: '8', code: 'AED', name: 'BAE Dirhemi', rate: 9.33, source: 'TCMB', active: true, lastUpdate: '2025-01-15T10:30:00' },
];

const demoTrend: TrendData[] = [
  { date: '01 Oca', USD: 32.50, EUR: 35.10, GBP: 40.80 },
  { date: '05 Oca', USD: 33.10, EUR: 35.60, GBP: 41.20 },
  { date: '10 Oca', USD: 33.80, EUR: 36.20, GBP: 41.90 },
  { date: '15 Oca', USD: 34.25, EUR: 36.80, GBP: 42.15 },
];

export default function MultiCurrency() {
  const { sidebarOpen } = useAppStore();
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CurrencyRate | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formSource, setFormSource] = useState('TCMB');
  const [formActive, setFormActive] = useState(true);
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('TRY');
  const [convertAmount, setConvertAmount] = useState('1000');

  useEffect(() => {
    fetch('/api/multi-currency')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.rates) && data.rates.length > 0) {
          setRates(data.rates);
        } else {
          setRates(demoRates);
        }
        if (Array.isArray(data?.trend) && data.trend.length > 0) {
          setTrend(data.trend);
        } else {
          setTrend(demoTrend);
        }
      })
      .catch(() => {
        setRates(demoRates);
        setTrend(demoTrend);
      })
      .finally(() => setLoading(false));
  }, []);

  const convertedResult = useMemo(() => {
    const amount = parseFloat(convertAmount) || 0;
    const fromRate = convertFrom === 'TRY' ? 1 : (rates.find((r) => r.code === convertFrom)?.rate || 1);
    const toRate = convertTo === 'TRY' ? 1 : (rates.find((r) => r.code === convertTo)?.rate || 1);
    return (amount * fromRate) / toRate;
  }, [convertFrom, convertTo, convertAmount, rates]);

  const handleSave = () => {
    const payload = {
      code: formCode,
      name: formName,
      rate: parseFloat(formRate),
      source: formSource,
      active: formActive,
    };

    fetch('/api/multi-currency', {
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
        setDialogOpen(false);
        resetForm();
      });
  };

  const resetForm = () => {
    setEditingRate(null);
    setFormCode('');
    setFormName('');
    setFormRate('');
    setFormSource('TCMB');
    setFormActive(true);
  };

  const openEdit = (rate: CurrencyRate) => {
    setEditingRate(rate);
    setFormCode(rate.code);
    setFormName(rate.name);
    setFormRate(rate.rate.toString());
    setFormSource(rate.source);
    setFormActive(rate.active);
    setDialogOpen(true);
  };

  const activeCount = rates.filter((r) => r.active).length;
  const lastUpdate = rates.length > 0 ? rates[0].lastUpdate : '-';

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Çoklu Döviz Yönetimi</h1>
        <p className="mb-6 text-slate-500">Döviz kurlarını yönetin ve dönüşümleri gerçekleştirin</p>
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
        <h1 className="text-2xl font-bold text-slate-800">Çoklu Döviz Yönetimi</h1>
        <p className="text-slate-500 mt-1">Döviz kurlarını yönetin, dönüşümleri gerçekleştirin ve trendleri takip edin</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Aktif Kur Sayısı</p>
              <p className="text-2xl font-bold mt-1">{activeCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Son Güncelleme</p>
              <p className="text-lg font-bold mt-1">
                {lastUpdate !== '-' ? new Date(lastUpdate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">USD / TRY</p>
              <p className="text-2xl font-bold mt-1">
                {rates.find((r) => r.code === 'USD')?.rate?.toFixed(2) || '-'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">EUR / TRY</p>
              <p className="text-2xl font-bold mt-1">
                {rates.find((r) => r.code === 'EUR')?.rate?.toFixed(2) || '-'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Currency Converter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Döviz Çevirici</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600">Miktar</Label>
              <Input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="Miktar giriniz"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <Label className="text-sm text-slate-600">Kaynak</Label>
                <Select value={convertFrom} onValueChange={setConvertFrom}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                    {rates.filter((r) => r.active).map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Hedef</Label>
                <Select value={convertTo} onValueChange={setConvertTo}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                    {rates.filter((r) => r.active).map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-sm text-emerald-600">Sonuç</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {convertedResult?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '0.00'}{' '}
                <span className="text-sm font-normal">{convertTo}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Rate Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-800">Kur Trendi</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Güncelle
            </Button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend />
                <Line type="monotone" dataKey="USD" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="EUR" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="GBP" stroke="#047857" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Exchange Rate Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Döviz Kurları</h2>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" />
                Yeni Kur Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRate ? 'Kur Düzenle' : 'Yeni Kur Ekle'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-slate-600">Para Birimi Kodu</Label>
                  <Input
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="USD"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Para Birimi Adı</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Amerikan Doları"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Kur (TRY Karşılığı)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    placeholder="34.25"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Kaynak</Label>
                  <Select value={formSource} onValueChange={setFormSource}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TCMB">TCMB</SelectItem>
                      <SelectItem value="ECB">ECB</SelectItem>
                      <SelectItem value="MANUEL">Manuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-600">Aktif</Label>
                  <Switch checked={formActive} onCheckedChange={setFormActive} />
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
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Para Birimi</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Kur (TRY)</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Kaynak</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Durum</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Son Güncelleme</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{rate.code}</span>
                      <span className="text-slate-500 text-xs">{rate.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    {rate.rate.toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">
                      {rate.source}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={rate.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                      {rate.active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(rate.lastUpdate).toLocaleString('tr-TR')}
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
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Henüz döviz kuru eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
}
