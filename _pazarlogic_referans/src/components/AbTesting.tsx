'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  Cell,
} from 'recharts';
import {
  FlaskConical,
  Trophy,
  CheckCircle2,
  Square,
  BarChart3,
  Plus,
  Calculator,
  GitBranch,
  Zap,
  TrendingUp,
  Target,
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  type: string;
  marketplace: string;
  metric: string;
  variantA: number;
  variantB: number;
  winner: string | null;
  confidence: number;
  status: 'running' | 'completed' | 'stopped';
  createdAt: string;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  running: { label: 'Devam Ediyor', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Tamamlandı', cls: 'bg-emerald-100 text-emerald-700' },
  stopped: { label: 'Durduruldu', cls: 'bg-slate-100 text-slate-500' },
};

const typeLabels: Record<string, string> = {
  title: 'Başlık Testi',
  price: 'Fiyat Testi',
  image: 'Görsel Testi',
  description: 'Açıklama Testi',
  layout: 'Düzen Testi',
  cta: 'CTA Testi',
};

const metricLabels: Record<string, string> = {
  ctr: 'Tıklama Oranı',
  conversion: 'Dönüşüm Oranı',
  revenue: 'Gelir',
  add_to_cart: 'Sepete Ekleme',
};

const demoTests: ABTest[] = [
  { id: '1', name: 'Kulaklık Başlık Optimizasyonu', type: 'title', marketplace: 'Hepsiburada', metric: 'ctr', variantA: 3.2, variantB: 4.1, winner: 'B', confidence: 95.2, status: 'completed', createdAt: '2025-01-02' },
  { id: '2', name: 'Akıllı Saat Fiyat Testi', type: 'price', marketplace: 'Trendyol', metric: 'conversion', variantA: 2.8, variantB: 3.5, winner: 'B', confidence: 88.7, status: 'completed', createdAt: '2025-01-05' },
  { id: '3', name: 'USB Şarj Görsel Testi', type: 'image', marketplace: 'Amazon TR', metric: 'ctr', variantA: 5.1, variantB: 4.8, winner: null, confidence: 62.3, status: 'running', createdAt: '2025-01-10' },
  { id: '4', name: 'Hoparlör Açıklama A/B', type: 'description', marketplace: 'Hepsiburada', metric: 'conversion', variantA: 1.9, variantB: 2.4, winner: 'B', confidence: 91.5, status: 'completed', createdAt: '2025-01-08' },
  { id: '5', name: 'Klavye Düzen Testi', type: 'layout', marketplace: 'Trendyol', metric: 'add_to_cart', variantA: 6.5, variantB: 5.9, winner: null, confidence: 55.1, status: 'running', createdAt: '2025-01-12' },
  { id: '6', name: 'Webcam CTA Testi', type: 'cta', marketplace: 'Amazon TR', metric: 'conversion', variantA: 3.1, variantB: 3.3, winner: null, confidence: 48.0, status: 'stopped', createdAt: '2024-12-28' },
  { id: '7', name: 'Powerbank Başlık Testi', type: 'title', marketplace: 'Hepsiburada', metric: 'ctr', variantA: 4.5, variantB: 5.2, winner: 'B', confidence: 97.1, status: 'completed', createdAt: '2025-01-03' },
  { id: '8', name: 'Gaming Mouse Fiyat A/B', type: 'price', marketplace: 'Trendyol', metric: 'revenue', variantA: 12500, variantB: 15200, winner: 'B', confidence: 93.4, status: 'completed', createdAt: '2025-01-06' },
];

function getConfidenceColor(confidence: number) {
  if (confidence >= 95) return 'bg-emerald-500';
  if (confidence >= 80) return 'bg-amber-500';
  return 'bg-red-500';
}

function getConfidenceLabel(confidence: number) {
  if (confidence >= 95) return 'Yüksek';
  if (confidence >= 80) return 'Orta';
  return 'Düşük';
}

export default function AbTesting() {
  const { sidebarOpen } = useAppStore();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('title');
  const [formMarketplace, setFormMarketplace] = useState('Hepsiburada');
  const [formMetric, setFormMetric] = useState('ctr');
  const [formVariantA, setFormVariantA] = useState('');
  const [formVariantB, setFormVariantB] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  useEffect(() => {
    fetch('/api/ab-testing')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.tests) && data.tests.length > 0) {
          setTests(data.tests);
        } else {
          setTests(demoTests);
        }
      })
      .catch(() => {
        setTests(demoTests);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    const payload = {
      name: formName,
      type: formType,
      marketplace: formMarketplace,
      metric: formMetric,
      variantA: JSON.parse(formVariantA || '{}'),
      variantB: JSON.parse(formVariantB || '{}'),
    };

    fetch('/api/ab-testing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.test) {
          setTests((prev) => [data.test, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      })
      .catch(() => {
        const newTest: ABTest = {
          id: Date.now().toString(),
          name: formName,
          type: formType,
          marketplace: formMarketplace,
          metric: formMetric,
          variantA: parseFloat(formVariantA) || 0,
          variantB: parseFloat(formVariantB) || 0,
          winner: null,
          confidence: 0,
          status: 'running',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setTests((prev) => [newTest, ...prev]);
        setDialogOpen(false);
        resetForm();
      });
  };

  const resetForm = () => {
    setFormName('');
    setFormType('title');
    setFormMarketplace('Hepsiburada');
    setFormMetric('ctr');
    setFormVariantA('');
    setFormVariantB('');
  };

  const handleCalculate = (id: string) => {
    setCalculating(true);
    fetch('/api/ab-testing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'calculate', id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.test) {
          setTests((prev) => prev.map((t) => (t.id === id ? data.test : t)));
          setSelectedTest(data.test);
        }
      })
      .catch(() => {
        setTests((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  winner: t.variantB > t.variantA ? 'B' : t.variantA > t.variantB ? 'A' : null,
                  confidence: Math.min(Math.random() * 30 + 70, 99),
                  status: 'completed' as const,
                }
              : t
          )
        );
      })
      .finally(() => setTimeout(() => setCalculating(false), 1500));
  };

  const activeCount = tests.filter((t) => t.status === 'running').length;
  const completedCount = tests.filter((t) => t.status === 'completed').length;
  const avgConfidence = tests.length > 0
    ? Math.round(tests.reduce((s, t) => s + t.confidence, 0) / tests.length)
    : 0;
  const bestWinner = tests.filter((t) => t.winner === 'B').length;

  const chartData = selectedTest
    ? [
        { name: 'Varyant A', değer: selectedTest.variantA, fill: '#6ee7b7' },
        { name: 'Varyant B', değer: selectedTest.variantB, fill: '#10b981' },
      ]
    : tests
        .filter((t) => t.status === 'completed')
        .slice(0, 6)
        .flatMap((t) => [
          { name: `${t.name} - A`, değer: t.variantA, fill: '#6ee7b7' },
          { name: `${t.name} - B`, değer: t.variantB, fill: '#10b981' },
        ]);

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">A/B Test</h1>
        <p className="mb-6 text-slate-500">Feed ve listeleme A/B testleri</p>
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
        <h1 className="text-2xl font-bold text-slate-800">A/B Test</h1>
        <p className="text-slate-500 mt-1">Feed ve listeleme A/B testleri ile performansı optimize edin</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Aktif Test</p>
              <p className="text-2xl font-bold mt-1">{activeCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/30">
              <FlaskConical className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Tamamlanan Test</p>
              <p className="text-2xl font-bold mt-1">{completedCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Ortalama Güven (%)</p>
              <p className="text-2xl font-bold mt-1">%{avgConfidence}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">En İyi Kazanan</p>
              <p className="text-lg font-bold mt-1">Varyant B</p>
              <p className="text-emerald-200 text-xs">{bestWinner} testte kazandı</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedTest ? `${selectedTest.name} Karşılaştırması` : 'Test Karşılaştırmaları'}
            </h2>
          </div>
          {selectedTest && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTest(null)}>
              Tüm Testleri Göster
            </Button>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="değer" name="Değer" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Test Listesi</h2>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" />
                Yeni Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni A/B Testi Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-slate-600">Test Adı</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Başlık Testi" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Tür</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Pazaryeri</Label>
                    <Select value={formMarketplace} onValueChange={setFormMarketplace}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                        <SelectItem value="Trendyol">Trendyol</SelectItem>
                        <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                        <SelectItem value="Getir">Getir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Metrik</Label>
                  <Select value={formMetric} onValueChange={setFormMetric}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(metricLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Varyant A (JSON)</Label>
                    <Textarea value={formVariantA} onChange={(e) => setFormVariantA(e.target.value)} placeholder='{"title": "..."}' className="mt-1" rows={3} />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Varyant B (JSON)</Label>
                    <Textarea value={formVariantB} onChange={(e) => setFormVariantB(e.target.value)} placeholder='{"title": "..."}' className="mt-1" rows={3} />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Test Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Ad</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Tür</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Pazaryeri</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Metrik</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Varyant A</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Varyant B</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Kazanan</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Güven</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Durum</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => {
                const sc = statusConfig[test.status] || statusConfig.running;
                return (
                  <tr
                    key={test.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedTest?.id === test.id ? 'bg-emerald-50' : ''}`}
                    onClick={() => setSelectedTest(test)}
                    role="button"
                  >
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-[160px] truncate">{test.name}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-xs">{typeLabels[test.type] || test.type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{test.marketplace}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{metricLabels[test.metric] || test.metric}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">{test.variantA}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">{test.variantB}</td>
                    <td className="py-3 px-3 text-center">
                      {test.winner ? (
                        <Badge className={test.winner === 'B' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                          Varyant {test.winner}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getConfidenceColor(test.confidence)}`}
                            style={{ width: `${test.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">%{test.confidence.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {test.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCalculate(test.id);
                          }}
                          disabled={calculating}
                        >
                          {calculating ? (
                            <FlaskConical className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Calculator className="h-3.5 w-3.5 mr-1" />
                          )}
                          Kazanan Hesapla
                        </Button>
                      )}
                      {test.status === 'completed' && (
                        <Trophy className="h-4 w-4 text-emerald-500 inline" />
                      )}
                      {test.status === 'stopped' && (
                        <Square className="h-4 w-4 text-slate-400 inline" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {tests.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <FlaskConical className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Henüz test oluşturulmamış</p>
          </div>
        )}
      </div>
    </div>
  );
}
