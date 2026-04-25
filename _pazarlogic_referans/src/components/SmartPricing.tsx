'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  DollarSign, TrendingUp, TrendingDown, Target, Zap, Plus,
  ToggleLeft, ToggleRight, BarChart3, AlertTriangle, Check,
  Percent, ArrowRight, GripVertical,
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
const MARKETPLACE_LABELS: Record<string, string> = { all: 'Tümü', trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', n11: 'n11' };

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function marginColor(m: number) { return m > 30 ? 'text-emerald-600' : m > 15 ? 'text-blue-600' : m > 5 ? 'text-amber-600' : 'text-red-600'; }
function marginBadge(m: number) { return m > 30 ? 'bg-emerald-100 text-emerald-700' : m > 15 ? 'bg-blue-100 text-blue-700' : m > 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'; }
function marginLabel(m: number) { return m > 30 ? 'Yüksek' : m > 15 ? 'Orta' : m > 5 ? 'Düşük' : 'Zarar'; }

function SortablePriceRuleItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded shrink-0" aria-label="Sürükle">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ---------- skeleton ---------- */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-5"><div className="h-20 bg-slate-200 rounded-lg" /></CardContent></Card>)}</div>
      <Card><CardContent className="p-6"><div className="h-64 bg-slate-200 rounded-lg" /></CardContent></Card>
    </div>
  );
}

/* ---------- main component ---------- */
export default function SmartPricing() {
  const { sidebarOpen } = useAppStore();
  const [tab, setTab] = useState<'rules' | 'margin' | 'compete'>('rules');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ---------- new rule form ---------- */
  const [form, setForm] = useState({ name: '', description: '', type: 'markup', baseField: 'cost', value: 15, valueType: 'percentage', marketplace: 'all', minMargin: 5, priority: 1 });

  useEffect(() => {
    Promise.all([
      fetch('/api/price-rules').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ])
      .then(([r, p]) => { setRules(Array.isArray(r) ? r : []); setProducts(Array.isArray(p) ? p : []); })
      .finally(() => setLoading(false));
  }, []);

  /* ---------- DnD ---------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setRules((items) => {
        const oldIndex = items.findIndex((r) => r.id === active.id);
        const newIndex = items.findIndex((r) => r.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((r, i) => ({ ...r, priority: i }));
      });
    }
  }

  /* ---------- stats ---------- */
  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.active).length;
  const avgMargin = products.length > 0 ? products.reduce((a, b) => a + ((b.price - b.cost) / b.price) * 100, 0) / products.length : 0;
  const updatedProducts = new Set(rules.filter(r => r.active).map(r => r.id)).size;

  /* ---------- simulated competitor prices ---------- */
  const competitorData = useMemo(() =>
    products.slice(0, 20).map(p => {
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
    const newRule: PriceRule = { id: `rule-${Date.now()}`, ...form } as PriceRule;
    setRules(prev => [...prev, newRule]);
    setDialogOpen(false);
    setForm({ name: '', description: '', type: 'markup', baseField: 'cost', value: 15, valueType: 'percentage', marketplace: 'all', minMargin: 5, priority: 1 });
  };

  /* ---------- loading ---------- */
  if (loading) return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      <Skeleton />
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Akıllı Fiyatlandırma</h1>
        <p className="text-sm text-slate-500 mt-1">Otomatik fiyat kuralları ve kar marjı yönetimi</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Kural</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalRules}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><Target className="h-5 w-5 text-white" /></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Aktif Kurallar</p><p className="text-2xl font-bold text-slate-900 mt-1">{activeRules}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500"><Zap className="h-5 w-5 text-white" /></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Ortalama Marj</p><p className={cn('text-2xl font-bold mt-1', marginColor(avgMargin))}>{avgMargin.toFixed(1)}%</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500"><Percent className="h-5 w-5 text-white" /></div></div><Progress value={Math.min(avgMargin, 100)} className="mt-2 h-1.5" /></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Güncellenen Ürün</p><p className="text-2xl font-bold text-slate-900 mt-1">{updatedProducts}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500"><BarChart3 className="h-5 w-5 text-white" /></div></div></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {([['rules', 'Fiyat Kuralları', ToggleLeft], ['margin', 'Kar Analizi', BarChart3], ['compete', 'Rekabet Analizi', TrendingUp]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={cn('flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors', tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {/* Tab 1: Fiyat Kuralları */}
      {tab === 'rules' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
            <GripVertical className="h-3.5 w-3.5" />
            <span>Sürükle Bırak ile Öncelik Sırala</span>
          </div>
          <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {rules.length === 0 && <Card><CardContent className="p-10 text-center text-slate-400"><AlertTriangle className="h-8 w-8 mx-auto mb-2" /><p>Henüz bir fiyat kuralı tanımlanmamış.</p></CardContent></Card>}
          {rules.map(rule => (
            <SortablePriceRuleItem key={rule.id} id={rule.id}>
            <Card className={cn('transition-all', !rule.active && 'opacity-60')}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 truncate">{rule.name}</h3>
                      <Badge className={cn('text-xs', RULE_TYPE_BADGE[rule.type])}>{RULE_TYPE_LABELS[rule.type]}</Badge>
                      <Badge variant="outline" className="text-xs">#{rule.priority}</Badge>
                    </div>
                    {rule.description && <p className="text-sm text-slate-500 mb-3">{rule.description}</p>}
                    {/* Visual rule */}
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm font-mono">
                      <span className="text-slate-500">EĞER</span>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{rule.baseField}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-500">SONRA</span>
                      <span className={cn('px-2 py-0.5 rounded text-xs font-bold text-white', rule.type === 'markup' ? 'bg-emerald-500' : rule.type === 'discount' ? 'bg-red-500' : rule.type === 'match' ? 'bg-blue-500' : 'bg-amber-500')}>{RULE_TYPE_LABELS[rule.type].toUpperCase()}</span>
                      <span className="bg-slate-700 text-white px-2 py-0.5 rounded text-xs font-bold">{rule.value}{rule.valueType === 'percentage' ? '%' : ' ₺'}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>Temel: <strong className="text-slate-700">{rule.baseField}</strong></span>
                      <span>Tip: <strong className="text-slate-700">{rule.valueType === 'percentage' ? 'Yüzde' : 'Sabit'}</strong></span>
                      <span>Pazaryer: <strong className="text-slate-700">{MARKETPLACE_LABELS[rule.marketplace]}</strong></span>
                      {rule.minMargin > 0 && <span className="flex items-center gap-1">Min Marj: <strong className="text-amber-600">{rule.minMargin}%</strong></span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch checked={rule.active} onCheckedChange={(checked) => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: checked } : r))} />
                    <span className={cn('text-xs font-medium', rule.active ? 'text-emerald-600' : 'text-slate-400')}>{rule.active ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </SortablePriceRuleItem>
          ))}
          <Button onClick={() => setDialogOpen(true)} className="w-full py-6 text-base"><Plus className="h-4 w-4 mr-2" />Yeni Kural Ekle</Button>
        </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <Card className="shadow-lg border-2 border-blue-300 w-96 rotate-1">
                <CardContent className="p-4">
                  <p className="font-semibold text-slate-800">{rules.find((r) => r.id === activeId)?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Öncelik: #{(rules.find((r) => r.id === activeId)?.priority ?? 0) + 1}</p>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Tab 2: Kar Analizi */}
      {tab === 'margin' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Yüksek Marj', marginStats.high, 'bg-emerald-100 text-emerald-700', Check], ['Orta Marj', marginStats.medium, 'bg-blue-100 text-blue-700', BarChart3], ['Düşük Marj', marginStats.low, 'bg-amber-100 text-amber-700', AlertTriangle], ['Zarar', marginStats.loss, 'bg-red-100 text-red-700', TrendingDown]].map(([label, count, cls, Icon]) => (
              <Card key={label as string}><CardContent className="p-4 flex items-center gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', cls)}>{(() => { const I = Icon as React.ComponentType<{ className?: string }>; return <I className="h-4 w-4" />; })()}</div><div><p className="text-xs text-slate-500">{label as string}</p><p className="text-lg font-bold text-slate-800">{count as number}</p></div></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 font-medium text-slate-600">Ürün Adı</th><th className="text-left py-3 px-4 font-medium text-slate-600">SKU</th>
            <th className="text-right py-3 px-4 font-medium text-slate-600">Maliyet</th><th className="text-right py-3 px-4 font-medium text-slate-600">Satış Fiyatı</th>
            <th className="text-right py-3 px-4 font-medium text-slate-600">Marj %</th><th className="text-right py-3 px-4 font-medium text-slate-600">Marj TL</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
          </tr></thead><tbody>{products.map(p => { const m = ((p.price - p.cost) / p.price) * 100; const tl = p.price - p.cost; return (
            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 font-medium text-slate-800">{p.name}</td><td className="py-3 px-4 text-slate-500">{p.sku}</td>
              <td className="py-3 px-4 text-right text-slate-500">{fmt(p.cost)}</td><td className="py-3 px-4 text-right font-medium">{fmt(p.price)}</td>
              <td className={cn('py-3 px-4 text-right font-semibold', marginColor(m))}>{m.toFixed(1)}%</td>
              <td className={cn('py-3 px-4 text-right font-medium', tl > 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(tl)}</td>
              <td className="py-3 px-4"><Badge className={cn('text-xs', marginBadge(m))}>{marginLabel(m)}</Badge></td>
            </tr>
          ); })}</tbody></table></div></CardContent></Card>
        </div>
      )}

      {/* Tab 3: Rekabet Analizi */}
      {tab === 'compete' && (
        <Card><CardContent className="p-0"><CardHeader className="pb-0"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500" />Pazaryer Karşılaştırma (Simüle Edilmiş)</CardTitle></CardHeader>
          <div className="px-2 pb-2"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 font-medium text-slate-600">Ürün</th>
            <th className="text-right py-3 px-4 font-medium text-slate-600">Bizim Fiyat</th>
            <th className="text-right py-3 px-4 font-medium text-slate-600">Trendyol Ort.</th>
            <th className="text-right py-3 px-4 font-medium text-slate-600">HB Ort.</th>
            <th className="text-right py-3 px-4 font-medium text-slate-600">n11 Ort.</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
          </tr></thead><tbody>{competitorData.map(c => {
            const cheapest = c.status === 'En Ucuz';
            const medium = c.status === 'Orta';
            return (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-800">{c.name}</td>
                <td className={cn('py-3 px-4 text-right font-semibold', cheapest ? 'text-emerald-600' : 'text-slate-800')}>{fmt(c.price)}</td>
                <td className={cn('py-3 px-4 text-right', c.trendyol < c.price ? 'text-red-500' : 'text-emerald-600')}>{fmt(c.trendyol)}</td>
                <td className={cn('py-3 px-4 text-right', c.hb < c.price ? 'text-red-500' : 'text-emerald-600')}>{fmt(c.hb)}</td>
                <td className={cn('py-3 px-4 text-right', c.n11 < c.price ? 'text-red-500' : 'text-emerald-600')}>{fmt(c.n11)}</td>
                <td className="py-3 px-4"><Badge className={cn('text-xs', cheapest ? 'bg-emerald-100 text-emerald-700' : medium ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')}>{c.status}</Badge></td>
              </tr>
            );
          })}</tbody></table></div></div>
        </CardContent></Card>
      )}

      {/* New Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Yeni Fiyat Kuralı Ekle</DialogTitle><DialogDescription>Ürünlerinize otomatik fiyatlandırma kuralı tanımlayın.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Kural Adı</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="örn. Genel Markup" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Açıklama</label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kural açıklaması (opsiyonel)" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Kural Türü</label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as PriceRule['type'] }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="markup">Markup</SelectItem><SelectItem value="discount">İndirim</SelectItem><SelectItem value="match">Eşleştirme</SelectItem><SelectItem value="max_price">Maks Fiyat</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Temel Alan</label><Select value={form.baseField} onValueChange={v => setForm(f => ({ ...f, baseField: v }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cost">Maliyet</SelectItem><SelectItem value="price">Satış Fiyatı</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Değer</label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Değer Tipi</label><Select value={form.valueType} onValueChange={v => setForm(f => ({ ...f, valueType: v as 'percentage' | 'fixed' }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Yüzde (%)</SelectItem><SelectItem value="fixed">Sabit (₺)</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Minimum Marj %</label><Input type="number" value={form.minMargin} onChange={e => setForm(f => ({ ...f, minMargin: +e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Pazaryer</label><Select value={form.marketplace} onValueChange={v => setForm(f => ({ ...f, marketplace: v }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tümü</SelectItem><SelectItem value="trendyol">Trendyol</SelectItem><SelectItem value="hepsiburada">Hepsiburada</SelectItem><SelectItem value="n11">n11</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Öncelik</label><Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))} min={1} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button><Button onClick={handleSaveRule} disabled={!form.name.trim()}><Check className="h-4 w-4 mr-1" />Kaydet</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
