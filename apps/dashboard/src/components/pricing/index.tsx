'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TrendingUp, Target, Plus, BarChart3, Settings, Save, X, ToggleLeft, Check, AlertTriangle, TrendingDown
} from 'lucide-react';
import { PriceRuleSchema, PriceRuleFormData } from '@omnicore/core-domain';
import { useGetPriceRules, useCreatePriceRule } from './hooks';
import { toast } from 'sonner';

const RULE_TYPE_LABELS: Record<string, string> = { markup: 'Markup', discount: 'İndirim', match: 'Eşleştirme', max_price: 'Maks Fiyat' };
const RULE_TYPE_BADGE: Record<string, string> = { markup: 'bg-emerald-50 text-emerald-700', discount: 'bg-rose-50 text-rose-700', match: 'bg-blue-50 text-blue-700', max_price: 'bg-amber-50 text-amber-700' };
const MARKETPLACE_LABELS: Record<string, string> = { all: 'Tüm Kanallar', trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', n11: 'n11' };

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function marginColor(m: number) { return m > 30 ? 'text-emerald-600' : m > 15 ? 'text-blue-600' : m > 5 ? 'text-amber-600' : 'text-rose-600'; }
function marginBadge(m: number) { return m > 30 ? 'bg-emerald-50 text-emerald-700' : m > 15 ? 'bg-blue-50 text-blue-700' : m > 5 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'; }
function marginLabel(m: number) { return m > 30 ? 'Yüksek' : m > 15 ? 'Orta' : m > 5 ? 'Düşük' : 'Zarar'; }

const MOCK_PRODUCTS = [
  { id: '1', name: 'Kablosuz Kulaklık', sku: 'AUDIO-01', price: 1299, cost: 800, stock: 45, category: 'Elektronik', marketplace: 'Trendyol' },
  { id: '2', name: 'Akıllı Saat', sku: 'WATCH-02', price: 2499, cost: 1500, stock: 12, category: 'Elektronik', marketplace: 'Hepsiburada' },
  { id: '3', name: 'Koşu Ayakkabısı', sku: 'SHOE-03', price: 1899, cost: 1200, stock: 0, category: 'Giyim', marketplace: 'Trendyol' },
  { id: '4', name: 'Yoga Matı', sku: 'SPORTS-04', price: 349, cost: 150, stock: 89, category: 'Spor', marketplace: 'n11' },
  { id: '5', name: 'Su Şişesi 1L', sku: 'HOME-05', price: 129, cost: 130, stock: 200, category: 'Ev', marketplace: 'Trendyol' },
];

export default function SmartPricing() {
  const [activeTab, setActiveTab] = useState<'rules'|'analysis'|'competitors'>('rules');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: rules = [], isPending: isLoadingRules, isError: isErrorRules } = useGetPriceRules();
  const createRuleMutation = useCreatePriceRule();

  const products = MOCK_PRODUCTS;

  const marginStats = useMemo(() => {
    const margins = products.map(p => ((p.price - p.cost) / p.price) * 100);
    const high = margins.filter(m => m > 30).length;
    const medium = margins.filter(m => m > 15 && m <= 30).length;
    const low = margins.filter(m => m > 5 && m <= 15).length;
    const loss = margins.filter(m => m <= 5).length;
    return { high, medium, low, loss };
  }, [products]);

  const competitorData = useMemo(() =>
    products.map(p => {
      const seed = p.id.charCodeAt(0);
      const trendyol = +(p.price * (0.92 + ((seed * 7) % 16) / 100)).toFixed(2);
      const hb = +(p.price * (0.94 + ((seed * 11) % 12) / 100)).toFixed(2);
      const n11 = +(p.price * (0.90 + ((seed * 13) % 20) / 100)).toFixed(2);
      const minComp = Math.min(trendyol, hb, n11);
      const status = p.price < minComp ? 'En Ucuz' : p.price < minComp * 1.05 ? 'Orta' : 'Pahalı';
      return { ...p, trendyol, hb, n11, status };
    }),
    [products]
  );

  const form = useForm<PriceRuleFormData>({
    resolver: zodResolver(PriceRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'markup',
      baseField: 'cost',
      value: 0,
      valueType: 'percentage',
      minMargin: 0,
      maxPrice: 0,
      roundTo: 0,
      marketplace: 'all',
      categoryId: '',
      isActive: true,
      priority: 0,
    }
  });

  const onSubmit = (data: PriceRuleFormData) => {
    createRuleMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Fiyat kuralı başarıyla oluşturuldu.');
        setDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error('Kural oluşturulurken bir hata oluştu: ' + error.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Akıllı Fiyatlandırma</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rakip fiyatları ve maliyetlerinize göre otonom fiyat yönetimi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm">
            <Settings className="w-4 h-4" /> Ayarlar
          </button>
          <button
            onClick={() => { form.reset(); setDialogOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Kural Ekle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Kural', val: rules.length, sub: 'Sistemde kayıtlı', color: 'text-slate-800', icon: Target },
          { label: 'Aktif Kurallar', val: rules.filter(r => r.isActive).length, sub: 'Şu an çalışan', color: 'text-emerald-600', icon: ToggleLeft },
          { label: 'Ortalama Marj', val: '%42', sub: 'Maliyet üzerinden', color: 'text-blue-600', icon: TrendingUp },
          { label: 'Otonom Güncelleme', val: '284', sub: 'Son 24 saat', color: 'text-amber-600', icon: BarChart3 }
        ].map((k, i) => (
          <div key={i} className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{k.label}</p>
              <h3 className={`text-2xl font-bold mt-2 ${k.color}`}>{k.val}</h3>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </div>
            <div className={`p-2 rounded-md bg-slate-50 border border-slate-100 ${k.color}`}>
              <k.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'rules', label: 'Fiyat Kuralları' },
          { id: 'analysis', label: 'Kâr Analizi' },
          { id: 'competitors', label: 'Rakip Radarı' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as 'rules' | 'analysis' | 'competitors')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Rules Tab Content */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          {isLoadingRules ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : isErrorRules ? (
            <div className="p-12 text-center text-rose-600 font-medium">
              Kurallar yüklenirken bir hata oluştu.
            </div>
          ) : rules.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800">Henüz Fiyat Kuralı Yok</h3>
              <p className="text-slate-500 mt-2 max-w-sm">Satışlarınızı otomatize etmek için yeni bir fiyatlandırma kuralı oluşturun.</p>
              <button
                onClick={() => setDialogOpen(true)}
                className="mt-6 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
              >
                İlk Kuralı Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Kural Adı</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Tür</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Değer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Kanal</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Güvenlik Marjı</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{r.name}</div>
                        {r.description && <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${RULE_TYPE_BADGE[r.type]}`}>
                          {RULE_TYPE_LABELS[r.type]}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {r.valueType === 'percentage' ? `%${r.value}` : `${r.value} TL`}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{MARKETPLACE_LABELS[r.marketplace]}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${marginBadge(r.minMargin)}`}>
                          Min %{r.minMargin}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {r.isActive ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Pasif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analysis Tab Content */}
      {activeTab === 'analysis' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Yüksek Marj', marginStats.high, 'bg-emerald-50 text-emerald-600 border border-emerald-100', Check], 
              ['Orta Marj', marginStats.medium, 'bg-blue-50 text-blue-600 border border-blue-100', BarChart3], 
              ['Düşük Marj', marginStats.low, 'bg-amber-50 text-amber-600 border border-amber-100', AlertTriangle], 
              ['Zarar', marginStats.loss, 'bg-rose-50 text-rose-600 border border-rose-100', TrendingDown]
            ].map(([label, count, cls, Icon]) => (
              <div key={label as string} className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-md ${cls}`}>
                  {(() => { const I = Icon as React.ComponentType<{ className?: string }>; return <I className="h-5 w-5" />; })()}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label as string}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{count as number}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Ürün Adı</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">SKU</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Maliyet</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Satış Fiyatı</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Marj %</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Marj TL</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => { 
                    const m = ((p.price - p.cost) / p.price) * 100; 
                    const tl = p.price - p.cost; 
                    return (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">{p.name}</td>
                        <td className="py-3 px-4 text-slate-500">{p.sku}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{fmt(p.cost)}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">{fmt(p.price)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${marginColor(m)}`}>{m.toFixed(1)}%</td>
                        <td className={`py-3 px-4 text-right font-medium ${tl > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(tl)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${marginBadge(m)}`}>
                            {marginLabel(m)}
                          </span>
                        </td>
                      </tr>
                    ); 
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Competitors Tab Content */}
      {activeTab === 'competitors' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800">Pazaryer Karşılaştırma (Simüle Edilmiş)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Ürün</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Bizim Fiyat</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Trendyol Ort.</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">HB Ort.</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">n11 Ort.</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Durum</th>
                </tr>
              </thead>
              <tbody>
                {competitorData.map(c => {
                  const cheapest = c.status === 'En Ucuz';
                  const medium = c.status === 'Orta';
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{c.name}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${cheapest ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {fmt(c.price)}
                      </td>
                      <td className={`py-3 px-4 text-right ${c.trendyol < c.price ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {fmt(c.trendyol)}
                      </td>
                      <td className={`py-3 px-4 text-right ${c.hb < c.price ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {fmt(c.hb)}
                      </td>
                      <td className={`py-3 px-4 text-right ${c.n11 < c.price ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {fmt(c.n11)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cheapest ? 'bg-emerald-50 text-emerald-700' : medium ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Yeni Fiyat Kuralı</h2>
              <button onClick={() => setDialogOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <form id="rule-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Kural Adı</label>
                  <input
                    {...form.register('name')}
                    placeholder="Örn: Genel Markup Kuralı"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                  />
                  {form.formState.errors.name && <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Açıklama</label>
                  <input
                    {...form.register('description')}
                    placeholder="Opsiyonel açıklama"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Kural Türü</label>
                    <select
                      {...form.register('type')}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                    >
                      <option value="markup">Markup (Kâr Ekle)</option>
                      <option value="discount">İndirim</option>
                      <option value="match">Eşleştirme</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Hesaplama Temeli</label>
                    <select
                      {...form.register('baseField')}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                    >
                      <option value="cost">Maliyet Üzerinden</option>
                      <option value="price">Satış Fiyatı Üzerinden</option>
                      <option value="competitor_price">Rakip Fiyatı Üzerinden</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Değer</label>
                    <input
                      type="number"
                      step="0.01"
                      {...form.register('value', { valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                    />
                     {form.formState.errors.value && <p className="text-xs text-rose-500">{form.formState.errors.value.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Değer Tipi</label>
                    <select
                      {...form.register('valueType')}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                    >
                      <option value="percentage">Yüzde (%)</option>
                      <option value="fixed">Sabit Tutar (TL)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Net Kâr Kalkanı (Min. Marj %)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...form.register('minMargin', { valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                    />
                    <p className="text-[10px] text-slate-500">Maliyet, komisyon ve kargo düşüldükten sonraki minimum kâr oranı.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Kanal</label>
                    <select
                      {...form.register('marketplace')}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
                    >
                      <option value="all">Tüm Kanallar</option>
                      <option value="trendyol">Trendyol</option>
                      <option value="hepsiburada">Hepsiburada</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                form="rule-form"
                disabled={createRuleMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {createRuleMutation.isPending ? 'Kaydediliyor...' : <><Save className="w-4 h-4" /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
