'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Target, Zap, Plus,
  ToggleLeft, BarChart3, AlertTriangle, Check,
  Percent, ArrowRight, Settings, Save, X, ArrowUp, ArrowDown,
} from 'lucide-react';

/* ---------- types ---------- */
interface PriceRule {
  id: string; name: string; description: string; type: 'markup' | 'discount' | 'match' | 'max_price';
  baseField: string; value: number; valueType: 'percentage' | 'fixed';
  marketplace: string; minMargin: number; priority: number; active: boolean;
}
interface Product {
  id: string; name: string; sku: string; price: number; cost: number;
  stock: number; category: string; marketplace: string;
}

const RULE_TYPE_LABELS: Record<string, string> = { markup: 'Markup', discount: 'İndirim', match: 'Eşleştirme', max_price: 'Maks Fiyat' };
const RULE_TYPE_BADGE: Record<string, string> = { markup: 'bg-emerald-100 text-emerald-700', discount: 'bg-red-100 text-red-700', match: 'bg-blue-100 text-blue-700', max_price: 'bg-amber-100 text-amber-700' };
const MARKETPLACE_LABELS: Record<string, string> = { all: 'Tüm Kanallar', trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', n11: 'n11' };

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function marginColor(m: number) { return m > 30 ? 'text-emerald-600' : m > 15 ? 'text-blue-600' : m > 5 ? 'text-amber-600' : 'text-red-600'; }
function marginBadge(m: number) { return m > 30 ? 'bg-emerald-100 text-emerald-700' : m > 15 ? 'bg-blue-100 text-blue-700' : m > 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'; }
function marginLabel(m: number) { return m > 30 ? 'Yüksek' : m > 15 ? 'Orta' : m > 5 ? 'Düşük' : 'Zarar'; }
function marginBgColor(m: number) { return m > 30 ? 'bg-emerald-500' : m > 15 ? 'bg-blue-500' : m > 5 ? 'bg-amber-500' : 'bg-red-500'; }

// MOCK DATA
const MOCK_RULES: PriceRule[] = [
  { id: '1', name: 'Trendyol Buybox Rekabeti', description: 'Rakiplerin altına %1 inerek buybox kazan.', type: 'match', baseField: 'competitor_price', value: 1, valueType: 'percentage', marketplace: 'trendyol', minMargin: 12, priority: 1, active: true },
  { id: '2', name: 'Genel Markup %30', description: 'Maliyet üzerinden tüm kanallara standart markup.', type: 'markup', baseField: 'cost', value: 30, valueType: 'percentage', marketplace: 'all', minMargin: 20, priority: 2, active: true },
  { id: '3', name: 'Hafta Sonu İndirimi', description: 'Seçili kategorilerde hafta sonu indirimi uygula.', type: 'discount', baseField: 'price', value: 50, valueType: 'fixed', marketplace: 'hepsiburada', minMargin: 10, priority: 3, active: false }
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Apple iPhone 15 Pro Kılıf', sku: 'APP-IP15-CASE', price: 499, cost: 200, stock: 150, category: 'Aksesuar', marketplace: 'all' },
  { id: 'p2', name: 'Samsung Galaxy S24 Ultra Ekran Koruyucu', sku: 'SAM-S24U-SCR', price: 299, cost: 80, stock: 300, category: 'Aksesuar', marketplace: 'all' },
  { id: 'p3', name: 'MacBook Air M3 Şarj Adaptörü', sku: 'MAC-M3-CHG', price: 1299, cost: 800, stock: 45, category: 'Elektronik', marketplace: 'all' },
  { id: 'p4', name: 'Logitech MX Master 3S Mouse', sku: 'LOG-MX3S', price: 3499, cost: 2100, stock: 20, category: 'Elektronik', marketplace: 'all' },
  { id: 'p5', name: 'Sony WH-1000XM5 Kulaklık', sku: 'SNY-WHXM5', price: 9999, cost: 7500, stock: 12, category: 'Elektronik', marketplace: 'all' },
];

export default function SmartPricing() {
  const [tab, setTab] = useState<'rules' | 'margin' | 'compete'>('rules');
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ---------- new rule form ---------- */
  const [form, setForm] = useState({ name: '', description: '', type: 'markup', baseField: 'cost', value: 15, valueType: 'percentage', marketplace: 'all', minMargin: 5, priority: 1 });

  useEffect(() => {
    // Simulate fetch with mock data
    setTimeout(() => {
      setRules(MOCK_RULES);
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 500);
  }, []);

  /* ---------- stats ---------- */
  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.active).length;
  const avgMargin = products.length > 0 ? products.reduce((a, b) => a + ((b.price - b.cost) / b.price) * 100, 0) / products.length : 0;
  const updatedProducts = new Set(rules.filter(r => r.active).map(r => r.id)).size * 142; // mock count

  /* ---------- simulated competitor prices ---------- */
  const competitorData = useMemo(() =>
    products.slice(0, 20).map(p => {
      const seed = p.id.charCodeAt(0);
      const trendyol = +(p.price * (0.92 + ((seed * 7) % 16) / 100)).toFixed(2);
      const hb = +(p.price * (0.94 + ((seed * 11) % 12) / 100)).toFixed(2);
      const n11 = +(p.price * (0.90 + ((seed * 13) % 20) / 100)).toFixed(2);
      const minComp = Math.min(trendyol, hb, n11);
      const status = p.price <= minComp ? 'En Ucuz' : p.price < minComp * 1.05 ? 'Orta' : 'Pahalı';
      return { ...p, trendyol, hb, n11, status };
    }),
    [products]
  );

  /* ---------- margin tab helpers ---------- */
  const marginStats = useMemo(() => {
    const margins = products.map(p => ((p.price - p.cost) / p.price) * 100);
    const high = margins.filter(m => m > 30).length;
    const medium = margins.filter(m => m > 15 && m <= 30).length;
    const low = margins.filter(m => m > 5 && m <= 15).length;
    const loss = margins.filter(m => m <= 5).length;
    return { high, medium, low, loss };
  }, [products]);

  const handleSaveRule = () => {
    if (!form.name.trim()) return;
    const newRule: PriceRule = { id: `rule-${Date.now()}`, ...form, active: true } as PriceRule;
    setRules(prev => [...prev, newRule].map((r, i) => ({ ...r, priority: i + 1 })));
    setDialogOpen(false);
    setForm({ name: '', description: '', type: 'markup', baseField: 'cost', value: 15, valueType: 'percentage', marketplace: 'all', minMargin: 5, priority: 1 });
  };

  const toggleRuleActive = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;
    
    setRules(prev => {
      const newRules = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
      return newRules.map((r, i) => ({ ...r, priority: i + 1 }));
    });
  };

  /* ---------- loading ---------- */
  if (loading) return (
    <div className="p-8 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d3435] shadow-[0_8px_30px_rgba(45,52,53,0.06)]">
            <Target className="h-6 w-6 text-[#ffffff]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#2d3435]">Akıllı Fiyatlandırma</h1>
            <p className="text-sm text-[#5f5e61] mt-1">Otomatik fiyat kuralları ve kâr marjı yönetimi</p>
          </div>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5f5e61] hover:bg-[#535255] text-[#faf7fb] text-sm font-semibold transition-colors shadow-[0_8px_30px_rgba(45,52,53,0.06)]"
        >
          <Plus className="h-4 w-4" /> Yeni Kural Ekle
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-[#5a6061] font-medium">Toplam Kural</p>
            <p className="text-xl font-bold text-[#2d3435]">{totalRules}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Zap className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-[#5a6061] font-medium">Aktif Kurallar</p>
            <p className="text-xl font-bold text-[#2d3435]">{activeRules}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Percent className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#5a6061] font-medium">Ortalama Marj</p>
            <p className={`text-xl font-bold ${marginColor(avgMargin)}`}>{avgMargin.toFixed(1)}%</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${marginBgColor(avgMargin)}`} style={{ width: `${Math.min(avgMargin, 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-[#5a6061] font-medium">Güncellenen Ürün</p>
            <p className="text-xl font-bold text-[#2d3435]">{updatedProducts}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] p-1 mb-6 border border-[#adb3b4]/15 w-fit">
        {([
          { key: 'rules', label: 'Fiyat Kuralları', Icon: ToggleLeft },
          { key: 'margin', label: 'Kâr Analizi', Icon: BarChart3 },
          { key: 'compete', label: 'Rekabet Analizi', Icon: TrendingUp }
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              tab === key
                ? 'bg-[#5f5e61] text-[#faf7fb] shadow-[0_8px_30px_rgba(45,52,53,0.06)]'
                : 'text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#2d3435]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Fiyat Kuralları */}
      {tab === 'rules' && (
        <div className="space-y-4">
          {rules.length === 0 && (
            <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-12 text-center text-[#5a6061]">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-[#2d3435]">Henüz bir fiyat kuralı tanımlanmamış.</p>
              <p className="text-sm mt-1">Yukarıdaki butonu kullanarak ilk kuralınızı oluşturun.</p>
            </div>
          )}
          {rules.map((rule, index) => (
            <div key={rule.id} className={`bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-5 transition-opacity flex gap-4 ${!rule.active && 'opacity-60'}`}>
              <div className="flex flex-col items-center justify-center border-r border-[#adb3b4]/15 pr-4 gap-1">
                <button onClick={() => moveRule(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:bg-[#f2f4f4] rounded disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-[#5a6061]">#{rule.priority}</span>
                <button onClick={() => moveRule(index, 'down')} disabled={index === rules.length - 1} className="p-1 text-slate-400 hover:bg-[#f2f4f4] rounded disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-[#2d3435] text-sm">{rule.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${RULE_TYPE_BADGE[rule.type]}`}>{RULE_TYPE_LABELS[rule.type]}</span>
                    </div>
                    {rule.description && <p className="text-xs text-[#5a6061] mb-4">{rule.description}</p>}
                    
                    <div className="flex flex-wrap items-center gap-2 bg-[#f9f9f9] rounded-lg border border-[#adb3b4]/15 px-3 py-2 text-xs font-mono mb-4 w-fit">
                      <span className="text-[#5a6061]">EĞER</span>
                      <span className="bg-[#dde4e5] text-[#2d3435] px-2 py-0.5 rounded font-semibold">{rule.baseField}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="text-[#5a6061]">SONRA</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-white ${rule.type === 'markup' ? 'bg-emerald-500' : rule.type === 'discount' ? 'bg-red-500' : rule.type === 'match' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                        {RULE_TYPE_LABELS[rule.type].toUpperCase()}
                      </span>
                      <span className="bg-[#2d3435] text-white px-2 py-0.5 rounded font-bold">{rule.value}{rule.valueType === 'percentage' ? '%' : ' ₺'}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5a6061]">
                      <span>Temel: <strong className="text-[#2d3435]">{rule.baseField}</strong></span>
                      <span>Tip: <strong className="text-[#2d3435]">{rule.valueType === 'percentage' ? 'Yüzde' : 'Sabit'}</strong></span>
                      <span>Kanal: <strong className="text-[#2d3435]">{MARKETPLACE_LABELS[rule.marketplace]}</strong></span>
                      {rule.minMargin > 0 && <span className="flex items-center gap-1">Min Marj: <strong className="text-amber-600">% {rule.minMargin}</strong></span>}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-[#adb3b4]/15 pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => toggleRuleActive(rule.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={rule.active}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.active ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className={`text-xs font-semibold ${rule.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {rule.active ? 'AKTİF' : 'PASİF'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Kâr Analizi */}
      {tab === 'margin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[['Yüksek Marj (>%30)', marginStats.high, 'text-emerald-600', 'bg-emerald-50', Check], 
              ['Orta Marj (%15-%30)', marginStats.medium, 'text-blue-600', 'bg-blue-50', BarChart3], 
              ['Düşük Marj (%5-%15)', marginStats.low, 'text-amber-600', 'bg-amber-50', AlertTriangle], 
              ['Zarar (<%5)', marginStats.loss, 'text-red-600', 'bg-red-50', TrendingDown]
            ].map(([label, count, textColor, bgColor, Icon]) => (
              <div key={label as string} className={`bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-3`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
                  {(() => { const I = Icon as React.ComponentType<{ className?: string }>; return <I className={`h-5 w-5 ${textColor}`} />; })()}
                </div>
                <div>
                  <p className="text-xs text-[#5a6061] font-medium">{label as string}</p>
                  <p className={`text-xl font-bold ${textColor}`}>{count as number}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#adb3b4]/15 bg-[#f9f9f9]">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Ürün Adı</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">SKU</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Maliyet</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Satış Fiyatı</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Marj %</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Marj TL</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => { 
                    const m = ((p.price - p.cost) / p.price) * 100; 
                    const tl = p.price - p.cost; 
                    return (
                      <tr key={p.id} className="border-b border-[#adb3b4]/15 hover:bg-[#f2f4f4] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#2d3435]">{p.name}</td>
                        <td className="py-3 px-4 text-xs font-mono text-[#5a6061]">{p.sku}</td>
                        <td className="py-3 px-4 text-right text-[#5a6061]">{fmt(p.cost)}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#2d3435]">{fmt(p.price)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${marginColor(m)}`}>{m.toFixed(1)}%</td>
                        <td className={`py-3 px-4 text-right font-medium ${tl > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(tl)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${marginBadge(m)}`}>{marginLabel(m)}</span>
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

      {/* Tab 3: Rekabet Analizi */}
      {tab === 'compete' && (
        <div className="bg-[#ffffff] rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 overflow-hidden">
          <div className="p-5 border-b border-[#adb3b4]/15">
            <h3 className="text-sm font-semibold text-[#2d3435] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Pazaryerleri Karşılaştırma (Simüle Edilmiş Canlı Fiyatlar)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#adb3b4]/15 bg-[#f9f9f9]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Ürün</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Bizim Fiyatımız</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Trendyol Min.</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Hepsiburada Min.</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">n11 Min.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#5a6061] uppercase tracking-wider">Rekabet Durumu</th>
                </tr>
              </thead>
              <tbody>
                {competitorData.map(c => {
                  const cheapest = c.status === 'En Ucuz';
                  const medium = c.status === 'Orta';
                  return (
                    <tr key={c.id} className="border-b border-[#adb3b4]/15 hover:bg-[#f2f4f4] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#2d3435]">{c.name}</td>
                      <td className={`py-3 px-4 text-right font-bold ${cheapest ? 'text-emerald-600' : 'text-[#2d3435]'}`}>{fmt(c.price)}</td>
                      <td className={`py-3 px-4 text-right ${c.trendyol < c.price ? 'text-red-500 font-semibold' : 'text-[#5a6061]'}`}>{fmt(c.trendyol)}</td>
                      <td className={`py-3 px-4 text-right ${c.hb < c.price ? 'text-red-500 font-semibold' : 'text-[#5a6061]'}`}>{fmt(c.hb)}</td>
                      <td className={`py-3 px-4 text-right ${c.n11 < c.price ? 'text-red-500 font-semibold' : 'text-[#5a6061]'}`}>{fmt(c.n11)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${cheapest ? 'bg-emerald-100 text-emerald-700' : medium ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
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

      {/* Dialog for New Rule */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#adb3b4]/15">
            <div className="flex items-center justify-between p-5 border-b border-[#adb3b4]/15 bg-[#f9f9f9]">
              <div>
                <h2 className="text-lg font-bold text-[#2d3435]">Yeni Fiyat Kuralı Ekle</h2>
                <p className="text-xs text-[#5a6061] mt-0.5">Ürünlerinize otomatik fiyatlandırma kuralı tanımlayın.</p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-2 hover:bg-[#dde4e5] rounded-lg transition-colors">
                <X className="h-5 w-5 text-[#5a6061]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#2d3435]">Kural Adı</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="örn. Genel Markup"
                  className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#2d3435]">Açıklama</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Kural açıklaması (opsiyonel)"
                  className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2d3435]">Kural Türü</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as PriceRule['type'] }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="markup">Markup</option>
                    <option value="discount">İndirim</option>
                    <option value="match">Eşleştirme</option>
                    <option value="max_price">Maks Fiyat</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2d3435]">Temel Alan</label>
                  <select
                    value={form.baseField}
                    onChange={e => setForm(f => ({ ...f, baseField: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="cost">Maliyet</option>
                    <option value="price">Satış Fiyatı</option>
                    <option value="competitor_price">Rakip Fiyatı</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2d3435]">Değer</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2d3435]">Değer Tipi</label>
                  <select
                    value={form.valueType}
                    onChange={e => setForm(f => ({ ...f, valueType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit (₺)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2d3435]">Minimum Marj %</label>
                  <input
                    type="number"
                    value={form.minMargin}
                    onChange={e => setForm(f => ({ ...f, minMargin: +e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#2d3435]">Kanal</label>
                  <select
                    value={form.marketplace}
                    onChange={e => setForm(f => ({ ...f, marketplace: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="all">Tüm Kanallar</option>
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                    <option value="n11">n11</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#adb3b4]/15 bg-[#f9f9f9]">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-[#5a6061] hover:bg-[#dde4e5] transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSaveRule}
                disabled={!form.name.trim()}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#5f5e61] hover:bg-[#535255] disabled:bg-slate-300 disabled:cursor-not-allowed text-[#faf7fb] text-sm font-bold transition-colors shadow-[0_8px_30px_rgba(45,52,53,0.06)]"
              >
                <Save className="h-4 w-4" /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
