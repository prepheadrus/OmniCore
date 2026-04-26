'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TrendingUp, Target, Plus, BarChart3, Settings, Save, X, ToggleLeft
} from 'lucide-react';
import { PriceRuleSchema, PriceRuleFormData } from '@omnicore/core-domain';

interface Product {
  id: string; name: string; sku: string; price: number; cost: number;
  stock: number; category: string; marketplace: string;
}

const RULE_TYPE_LABELS: Record<string, string> = { markup: 'Markup', discount: 'İndirim', match: 'Eşleştirme', max_price: 'Maks Fiyat' };
const RULE_TYPE_BADGE: Record<string, string> = { markup: 'bg-emerald-50 text-emerald-700', discount: 'bg-rose-50 text-rose-700', match: 'bg-blue-50 text-blue-700', max_price: 'bg-amber-50 text-amber-700' };
const MARKETPLACE_LABELS: Record<string, string> = { all: 'Tüm Kanallar', trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', n11: 'n11' };

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function marginBadge(m: number) { return m > 30 ? 'bg-emerald-50 text-emerald-700' : m > 15 ? 'bg-blue-50 text-blue-700' : m > 5 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'; }

const initialProducts: Product[] = [
  { id: '1', name: 'Pakbey Konsantre Cam Suyu 1 Lt', sku: 'PKB-001', price: 120, cost: 45, stock: 150, category: 'Oto Bakım', marketplace: 'all' },
  { id: '2', name: 'Lastik Parlatıcı (400 ml)', sku: 'PKB-002', price: 190, cost: 95, stock: 85, category: 'Oto Bakım', marketplace: 'trendyol' },
  { id: '3', name: 'Demir Tozu Sökücü', sku: 'PKB-003', price: 480, cost: 200, stock: 12, category: 'Kimyasallar', marketplace: 'all' },
];

export default function SmartPricing() {
  const [activeTab, setActiveTab] = useState<'rules'|'analysis'|'competitors'>('rules');
  const [rules, setRules] = useState<PriceRuleFormData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setRules(prev => [...prev, data]);
    setDialogOpen(false);
    form.reset();
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
            onClick={() => setActiveTab(t.id as any)}
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
          {rules.length === 0 ? (
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
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
