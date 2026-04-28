'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GitBranch, Zap, Play, Pause, Plus, Trash2, GripVertical, ArrowRight,
  Filter, Settings2, Truck, Printer, Tag, Mail, Scissors, Clock, Star,
  BarChart3, Search, Package, AlertCircle, CheckCircle2, CircleDot,
  ChevronDown, Pencil, Shield, Layers, RotateCcw, X
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TriggerType = 'order_created' | 'payment_received' | 'shipped';

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface RuleAction {
  id: string;
  type: string;
  params: string;
}

interface SmartOrderRule {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  channels: string[];
  priority: number;
  active: boolean;
  matchCount: number;
  lastMatched: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TRIGGER_LABELS: Record<TriggerType, string> = {
  order_created: 'Sipariş Oluşturulduğunda',
  payment_received: 'Ödeme Alındığında',
  shipped: 'Kargolandığında',
};

const TRIGGER_COLORS: Record<TriggerType, string> = {
  order_created: 'bg-blue-50 text-blue-700 border-blue-200',
  payment_received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  shipped: 'bg-amber-50 text-amber-700 border-amber-200',
};

const TRIGGER_ICONS: Record<TriggerType, any> = {
  order_created: Package,
  payment_received: CheckCircle2,
  shipped: Truck,
};

const CONDITION_FIELDS = [
  { value: 'order_amount', label: 'Sipariş Tutarı' },
  { value: 'weight', label: 'Ağırlık' },
  { value: 'marketplace', label: 'Pazar Yeri' },
  { value: 'customer_segment', label: 'Müşteri Segmenti' },
  { value: 'shipping_city', label: 'Kargo Adresi Şehri' },
  { value: 'product_category', label: 'Ürün Kategorisi' },
  { value: 'payment_method', label: 'Ödeme Yöntemi' },
  { value: 'item_count', label: 'Ürün Adedi' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Eşittir' },
  { value: 'not_equals', label: 'Eşit Değildir' },
  { value: 'greater_than', label: 'Büyüktür' },
  { value: 'less_than', label: 'Küçüktür' },
  { value: 'contains', label: 'İçerir' },
  { value: 'between', label: 'Arasında' },
];

const ACTION_TYPES = [
  { value: 'assign_carrier', label: 'Kargoyu Ata', icon: Truck },
  { value: 'print_label', label: 'Etiket Yazdır', icon: Printer },
  { value: 'change_status', label: 'Durumu Değiştir', icon: RotateCcw },
  { value: 'send_email', label: 'E-posta Gönder', icon: Mail },
  { value: 'split_order', label: 'Siparişi Böl', icon: Scissors },
  { value: 'hold_order', label: 'Beklemeye Al', icon: Clock },
  { value: 'assign_priority', label: 'Öncelik Ata', icon: Star },
  { value: 'add_tag', label: 'Etiket Ekle', icon: Tag },
];

const CHANNELS = [
  { value: 'all', label: 'Tümü' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'etsy', label: 'Etsy' },
];

const ACTION_ICONS: Record<string, any> = {
  assign_carrier: Truck,
  print_label: Printer,
  change_status: RotateCcw,
  send_email: Mail,
  split_order: Scissors,
  hold_order: Clock,
  assign_priority: Star,
  add_tag: Tag,
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  assign_carrier: 'Kargoyu Ata',
  print_label: 'Etiket Yazdır',
  change_status: 'Durumu Değiştir',
  send_email: 'E-posta Gönder',
  split_order: 'Siparişi Böl',
  hold_order: 'Beklemeye Al',
  assign_priority: 'Öncelik Ata',
  add_tag: 'Etiket Ekle',
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: SmartOrderRule[] = [
  {
    id: 'rule-001', name: 'Yüksek Değerli Sipariş - Aras Kargo', description: '5000₺ üzeri siparişlerde Aras Kargoyu otomatik atar ve sigorta etiketi ekler',
    trigger: 'order_created', conditions: [{ id: 'c1', field: 'order_amount', operator: 'greater_than', value: '5000' }],
    actions: [{ id: 'a1', type: 'assign_carrier', params: 'Aras Kargo' }, { id: 'a2', type: 'add_tag', params: 'Sigortalı Kargo' }],
    channels: ['all'], priority: 1, active: true, matchCount: 1847, lastMatched: new Date().toISOString(), createdAt: '2024-06-12'
  },
  {
    id: 'rule-002', name: 'İstanbul Hızlı Kargo', description: 'İstanbul adresli siparişleri aynı gün teslimat kargosuna yönlendirir',
    trigger: 'payment_received', conditions: [{ id: 'c2', field: 'shipping_city', operator: 'equals', value: 'İstanbul' }, { id: 'c2b', field: 'order_amount', operator: 'less_than', value: '15000' }],
    actions: [{ id: 'a2a', type: 'assign_carrier', params: 'Yurtiçi Same Day' }, { id: 'a2b', type: 'assign_priority', params: 'Yüksek' }],
    channels: ['all'], priority: 2, active: true, matchCount: 5234, lastMatched: new Date(Date.now() - 3600000).toISOString(), createdAt: '2024-05-20'
  },
  {
    id: 'rule-003', name: 'Otomatik Etiket + Fatura Yazdırma', description: '2000₺ üzeri siparişlerde kargo etiketi ve faturayı otomatik yazdırır',
    trigger: 'payment_received', conditions: [{ id: 'c3', field: 'order_amount', operator: 'greater_than', value: '2000' }],
    actions: [{ id: 'a3a', type: 'print_label', params: 'Kargo Etiketi + Fatura' }, { id: 'a3b', type: 'change_status', params: 'Kargoya Hazır' }],
    channels: ['trendyol', 'hepsiburada'], priority: 3, active: true, matchCount: 8921, lastMatched: new Date(Date.now() - 86400000).toISOString(), createdAt: '2024-04-08'
  },
  {
    id: 'rule-004', name: 'Riskli Sipariş Bekletme', description: '5000₺ üzeri ve yeni müşteri siparişlerini manuel onaya alır',
    trigger: 'order_created', conditions: [{ id: 'c4a', field: 'order_amount', operator: 'greater_than', value: '5000' }, { id: 'c4b', field: 'customer_segment', operator: 'equals', value: 'Yeni Müşteri' }],
    actions: [{ id: 'a4a', type: 'hold_order', params: 'Manuel Onay Bekliyor' }, { id: 'a4b', type: 'send_email', params: 'risk-alert@pazarlogic.com' }, { id: 'a4c', type: 'add_tag', params: 'Riskli Sipariş' }],
    channels: ['all'], priority: 1, active: true, matchCount: 342, lastMatched: new Date(Date.now() - 172800000).toISOString(), createdAt: '2024-07-15'
  },
  {
    id: 'rule-006', name: 'Hepsiburada Kargo Şablonu', description: 'Hepsiburada siparişlerinde otomatik Hepsijet kargo ataması yapar',
    trigger: 'payment_received', conditions: [{ id: 'c6', field: 'marketplace', operator: 'equals', value: 'Hepsiburada' }],
    actions: [{ id: 'a6a', type: 'assign_carrier', params: 'Hepsijet' }, { id: 'a6b', type: 'change_status', params: 'Kargoya Verildi' }],
    channels: ['hepsiburada'], priority: 5, active: false, matchCount: 4512, lastMatched: new Date(Date.now() - 500000000).toISOString(), createdAt: '2024-03-25'
  }
];

function getFieldLabel(fieldValue: string): string { return CONDITION_FIELDS.find(f => f.value === fieldValue)?.label ?? fieldValue; }
function getOperatorLabel(opValue: string): string { return CONDITION_OPERATORS.find(o => o.value === opValue)?.label ?? opValue; }
function getChannelLabel(channelValue: string): string { return CHANNELS.find(c => c.value === channelValue)?.label ?? channelValue; }
function formatMatchCount(count: number): string { return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString(); }

function formatLastMatched(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} gün önce`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SmartOrderRules() {
  const [rules, setRules] = useState<SmartOrderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SmartOrderRule | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTrigger, setFormTrigger] = useState<TriggerType>('order_created');
  const [formPriority, setFormPriority] = useState(5);
  const [formChannel, setFormChannel] = useState('all');
  const [formConditions, setFormConditions] = useState<RuleCondition[]>([]);
  const [formActions, setFormActions] = useState<RuleAction[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRules(MOCK_RULES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const openForm = (rule?: SmartOrderRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormName(rule.name);
      setFormDesc(rule.description);
      setFormTrigger(rule.trigger);
      setFormPriority(rule.priority);
      setFormChannel(rule.channels[0] || 'all');
      setFormConditions([...rule.conditions]);
      setFormActions([...rule.actions]);
    } else {
      setEditingRule(null);
      setFormName('');
      setFormDesc('');
      setFormTrigger('order_created');
      setFormPriority(5);
      setFormChannel('all');
      setFormConditions([]);
      setFormActions([]);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || formConditions.length === 0 || formActions.length === 0) return;
    
    const saved: SmartOrderRule = {
      id: editingRule?.id ?? `rule-${Date.now()}`,
      name: formName,
      description: formDesc,
      trigger: formTrigger,
      conditions: formConditions,
      actions: formActions,
      channels: [formChannel],
      priority: formPriority,
      active: editingRule?.active ?? true,
      matchCount: editingRule?.matchCount ?? 0,
      lastMatched: editingRule?.lastMatched ?? new Date().toISOString(),
      createdAt: editingRule?.createdAt ?? new Date().toISOString().split('T')[0],
    };

    if (editingRule) {
      setRules(prev => prev.map(r => r.id === saved.id ? saved : r));
    } else {
      setRules(prev => [saved, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const filteredRules = rules.filter(r => {
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === 'active' && !r.active) return false;
    if (statusFilter === 'paused' && r.active) return false;
    if (triggerFilter !== 'all' && r.trigger !== triggerFilter) return false;
    return true;
  });

  const activeRules = rules.filter(r => r.active).length;
  const totalMatches = rules.reduce((a, b) => a + b.matchCount, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-4 mt-6">
            {[1,2].map(i => <div key={i} className="h-64 rounded-md bg-slate-200" />)}
          </div>
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
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            Akıllı Sipariş Kuralları
          </h1>
          <p className="text-sm text-slate-500 mt-1">Siparişlerinizi otomatik kurallar ile yönetin, aksiyonlar atayın ve zaman kazanın.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Yeni Kural Oluştur
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5 text-emerald-500"/> Aktif Kural</p>
            <p className="text-3xl font-bold text-slate-800">{activeRules}<span className="text-lg text-slate-400 font-normal">/{rules.length}</span></p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rules.length > 0 ? (activeRules/rules.length)*100 : 0}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-sky-500"/> Toplam Eşleşme</p>
          <div>
            <p className="text-3xl font-bold text-slate-800">{formatMatchCount(totalMatches)}</p>
            <p className="text-xs text-slate-400 mt-1">Ort. {formatMatchCount(Math.round(totalMatches/Math.max(rules.length, 1)))} / kural</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500"/> Otomatik İşlem</p>
          <div>
            <p className="text-3xl font-bold text-slate-800">{activeRules}</p>
            <p className="text-xs text-slate-400 mt-1">Aktif otomasyon kuralı</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-violet-500"/> Son 7 Gün</p>
          <div>
            <p className="text-3xl font-bold text-slate-800">{formatMatchCount(Math.floor(totalMatches * 0.12))}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">+12%</span> geçen haftaya göre</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
          <button onClick={() => setStatusFilter('all')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${statusFilter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Layers className="h-4 w-4" /> Tüm Kurallar
          </button>
          <button onClick={() => setStatusFilter('active')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${statusFilter === 'active' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Play className="h-4 w-4" /> Aktif
          </button>
          <button onClick={() => setStatusFilter('paused')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${statusFilter === 'paused' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            <Pause className="h-4 w-4" /> Pasif
          </button>
        </div>
        <div className="h-px w-full sm:w-px sm:h-8 bg-slate-200 mx-2" />
        <div className="flex w-full sm:flex-1 gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Kural ara..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white" />
          </div>
          <div className="relative w-48">
            <select value={triggerFilter} onChange={e => setTriggerFilter(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white">
              <option value="all">Tüm Tetikleyiciler</option>
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-16 text-center">
          <GitBranch className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800">Kural Bulunamadı</h3>
          <p className="text-sm text-slate-500 mt-1">Filtrelere uygun kural yok veya henüz oluşturmadınız.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRules.map(rule => {
            const TIcon = TRIGGER_ICONS[rule.trigger];
            return (
              <div key={rule.id} className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${rule.priority <= 2 ? 'bg-emerald-500' : rule.priority <= 5 ? 'bg-amber-400' : 'bg-slate-400'}`} />
                
                <div className="p-5 border-b border-slate-100 pl-6 flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-800 truncate" title={rule.name}>{rule.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${TRIGGER_COLORS[rule.trigger]}`}>
                        <TIcon className="w-3 h-3" /> {TRIGGER_LABELS[rule.trigger]}
                      </span>
                      {rule.priority <= 2 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200"><Shield className="w-3 h-3"/> Yüksek Öncelik</span>}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{rule.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {rule.active ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3 text-slate-400" />}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={rule.active} onChange={() => toggleRule(rule.id)} />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                <div className="p-5 pl-6 space-y-4 flex-1 bg-slate-50/50">
                  {/* Condition Flow */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Koşullar</p>
                    {rule.conditions.length === 0 ? <p className="text-xs text-slate-500 italic">Koşul tanımlanmamış</p> : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-bold">EĞER</span>
                        {rule.conditions.map((c, i) => (
                          <React.Fragment key={c.id}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">{getFieldLabel(c.field)}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{getOperatorLabel(c.operator)}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 text-xs font-medium">&quot;{c.value}&quot;</span>
                            {i < rule.conditions.length - 1 && <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">VE</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-emerald-500"/><div className="h-px bg-slate-200 flex-1"/></div>
                  
                  {/* Action Flow */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aksiyonlar</p>
                    {rule.actions.length === 0 ? <p className="text-xs text-slate-500 italic">Aksiyon tanımlanmamış</p> : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-bold">SONRA</span>
                        {rule.actions.map((a, i) => {
                          const AIcon = ACTION_ICONS[a.type] || Zap;
                          return (
                            <React.Fragment key={a.id}>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 text-xs font-medium">
                                <AIcon className="w-3.5 h-3.5" />
                                <span>{ACTION_TYPE_LABELS[a.type] || a.type}</span>
                                {a.params && <span className="text-slate-400">({a.params})</span>}
                              </span>
                              {i < rule.actions.length - 1 && <ArrowRight className="w-3 h-3 text-slate-400" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pl-6 border-t border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> <strong className="text-slate-800">{formatMatchCount(rule.matchCount)}</strong> eşleşme</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Son: {formatLastMatched(rule.lastMatched)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openForm(rule)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors" title="Düzenle"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Sil"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Settings2 className="w-5 h-5 text-emerald-600" /> {editingRule ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur'}</h2>
                <p className="text-sm text-slate-500 mt-1">Sipariş otomasyon kuralını ve aksiyonlarını tanımlayın.</p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-white flex-1">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kural Adı</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="örn: Yüksek değerli sipariş kuralı" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Açıklama</label>
                  <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Kuralın amacını yazın" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500"/> Tetikleyici</label>
                <select value={formTrigger} onChange={e => setFormTrigger(e.target.value as TriggerType)} className="w-full sm:w-64 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 bg-white">
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Filter className="w-3.5 h-3.5 text-emerald-600"/> Koşullar</label>
                  <button onClick={() => setFormConditions([...formConditions, { id: `c${Date.now()}`, field: 'order_amount', operator: 'greater_than', value: '' }])} className="text-xs font-medium text-slate-600 border border-slate-200 bg-white px-2.5 py-1.5 rounded hover:bg-slate-50 flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Ekle</button>
                </div>
                {formConditions.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-300 rounded-md text-center text-slate-500 text-sm bg-slate-50">Koşul eklemediniz. Bu durumda kural tetikleyici çalıştığında her siparişe uygulanır.</div>
                ) : (
                  <div className="space-y-2">
                    {formConditions.map((c, idx) => (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        {idx > 0 && <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">VE</span>}
                        <select value={c.field} onChange={e => setFormConditions(formConditions.map(fc => fc.id === c.id ? { ...fc, field: e.target.value } : fc))} className="w-full sm:w-40 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-slate-800">
                          {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <select value={c.operator} onChange={e => setFormConditions(formConditions.map(fc => fc.id === c.id ? { ...fc, operator: e.target.value } : fc))} className="w-full sm:w-32 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-slate-800">
                          {CONDITION_OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <input value={c.value} onChange={e => setFormConditions(formConditions.map(fc => fc.id === c.id ? { ...fc, value: e.target.value } : fc))} placeholder="Değer..." className="w-full flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800" />
                        <button onClick={() => setFormConditions(formConditions.filter(fc => fc.id !== c.id))} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-600"/> Aksiyonlar</label>
                  <button onClick={() => setFormActions([...formActions, { id: `a${Date.now()}`, type: 'assign_carrier', params: '' }])} className="text-xs font-medium text-slate-600 border border-slate-200 bg-white px-2.5 py-1.5 rounded hover:bg-slate-50 flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Ekle</button>
                </div>
                {formActions.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-300 rounded-md text-center text-slate-500 text-sm bg-slate-50">Aksiyon eklemediniz.</div>
                ) : (
                  <div className="space-y-2">
                    {formActions.map((a, idx) => (
                      <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        {idx > 0 && <span className="hidden sm:inline-block"><ArrowRight className="w-3.5 h-3.5 text-slate-400" /></span>}
                        <select value={a.type} onChange={e => setFormActions(formActions.map(fa => fa.id === a.id ? { ...fa, type: e.target.value } : fa))} className="w-full sm:w-48 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-slate-800">
                          {ACTION_TYPES.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
                        </select>
                        <input value={a.params} onChange={e => setFormActions(formActions.map(fa => fa.id === a.id ? { ...fa, params: e.target.value } : fa))} placeholder="Parametre (örn: Aras Kargo)" className="w-full flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800" />
                        <button onClick={() => setFormActions(formActions.filter(fa => fa.id !== a.id))} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kanal</label>
                  <select value={formChannel} onChange={e => setFormChannel(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 bg-white">
                    {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Öncelik (1-10)</label>
                  <input type="number" min="1" max="10" value={formPriority} onChange={e => setFormPriority(parseInt(e.target.value) || 5)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                  <p className="text-[10px] text-slate-400 mt-1">Sayı ne kadar küçükse öncelik o kadar yüksektir.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setDialogOpen(false)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors shadow-sm">
                İptal
              </button>
              <button 
                onClick={handleSave} 
                disabled={!formName.trim() || formActions.length === 0} 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> {editingRule ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
