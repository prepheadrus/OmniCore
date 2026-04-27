'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  FlaskConical, Trophy, CheckCircle2, Square, BarChart3, Plus, Calculator,
  GitBranch, Zap, TrendingUp, Target, X
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
  running: { label: 'Devam Ediyor', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Tamamlandı', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  stopped: { label: 'Durduruldu', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
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

const MOCK_TESTS: ABTest[] = [
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

export default function AbTesting() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('title');
  const [formMarketplace, setFormMarketplace] = useState('Hepsiburada');
  const [formMetric, setFormMetric] = useState('ctr');
  const [formVariantA, setFormVariantA] = useState('');
  const [formVariantB, setFormVariantB] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTests(MOCK_TESTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = () => {
    if (!formName.trim()) return;

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
    setTimeout(() => {
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
      setCalculating(false);
    }, 1500);
  };

  const activeCount = tests.filter((t) => t.status === 'running').length;
  const completedCount = tests.filter((t) => t.status === 'completed').length;
  const avgConfidence = tests.length > 0 ? Math.round(tests.reduce((s, t) => s + t.confidence, 0) / tests.length) : 0;
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
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-md" />)}
          </div>
          <div className="h-72 rounded-md bg-slate-200 mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            A/B Test
          </h1>
          <p className="text-sm text-slate-500 mt-1">Feed ve listeleme A/B testleri ile performansı optimize edin</p>
        </div>
        <button 
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Yeni Test Oluştur
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-blue-500" /> Aktif Test
            </p>
            <p className="text-3xl font-bold text-slate-800">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Tamamlanan Test
            </p>
            <p className="text-3xl font-bold text-slate-800">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-amber-500" /> Ortalama Güven
            </p>
            <p className="text-3xl font-bold text-slate-800">%{avgConfidence}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-emerald-600" /> En İyi Kazanan
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1">Varyant B</p>
            <p className="text-xs text-slate-400 mt-1">{bestWinner} testte kazandı</p>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-800">
              {selectedTest ? `${selectedTest.name} Karşılaştırması` : 'Test Karşılaştırmaları'}
            </h2>
          </div>
          {selectedTest && (
            <button 
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded"
              onClick={() => setSelectedTest(null)}
            >
              Tüm Testleri Göster
            </button>
          )}
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#e2e8f0" angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
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
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Test Listesi</h2>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Ad</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Tür / Pazar</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Metrik</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Varyant A</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Varyant B</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Kazanan</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Güven</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Durum</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-3 opacity-50" />
                    Henüz test oluşturulmamış.
                  </td>
                </tr>
              ) : (
                tests.map((test) => {
                  const sc = statusConfig[test.status];
                  return (
                    <tr
                      key={test.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${selectedTest?.id === test.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[160px] truncate">{test.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            {typeLabels[test.type] || test.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{test.marketplace}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-slate-600">{metricLabels[test.metric] || test.metric}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">{test.variantA}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">{test.variantB}</td>
                      <td className="py-3 px-4 text-center">
                        {test.winner ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${test.winner === 'B' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            Varyant {test.winner}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-600">%{test.confidence.toFixed(1)}</span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getConfidenceColor(test.confidence)}`}
                              style={{ width: `${test.confidence}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {test.status === 'running' && (
                          <button
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition-colors disabled:opacity-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCalculate(test.id);
                            }}
                            disabled={calculating}
                          >
                            {calculating ? <FlaskConical className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5" />}
                            Hesapla
                          </button>
                        )}
                        {test.status === 'completed' && <Trophy className="h-4 w-4 text-emerald-500 mx-auto" />}
                        {test.status === 'stopped' && <Square className="h-4 w-4 text-slate-400 mx-auto" />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog Overlay */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Yeni A/B Testi Oluştur</h2>
              <button onClick={() => { setDialogOpen(false); resetForm(); }} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Test Adı</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Örn: Başlık Testi" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Tür</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Pazaryeri</label>
                  <select value={formMarketplace} onChange={(e) => setFormMarketplace(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
                    <option value="Hepsiburada">Hepsiburada</option>
                    <option value="Trendyol">Trendyol</option>
                    <option value="Amazon TR">Amazon TR</option>
                    <option value="Getir">Getir</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Metrik</label>
                <select value={formMetric} onChange={(e) => setFormMetric(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
                  {Object.entries(metricLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Varyant A (JSON)</label>
                  <textarea value={formVariantA} onChange={(e) => setFormVariantA(e.target.value)} placeholder='{"title": "..."}' className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 resize-y" rows={3} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Varyant B (JSON)</label>
                  <textarea value={formVariantB} onChange={(e) => setFormVariantB(e.target.value)} placeholder='{"title": "..."}' className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 resize-y" rows={3} />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => { setDialogOpen(false); resetForm(); }} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors shadow-sm">
                İptal
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!formName.trim()} 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                Test Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
