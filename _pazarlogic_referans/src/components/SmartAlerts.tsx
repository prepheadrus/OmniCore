'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  AlertTriangle, Bell, Plus, Search, Filter, Eye, Edit, Trash2,
  RefreshCw, Settings, Check, X, Calendar, Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AlertCategory = 'stock' | 'price' | 'order' | 'performance' | 'competitor' | 'listing';
type AlertStatus = 'active' | 'paused' | 'triggered';

interface AlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  metric: string;
  condition: string;
  threshold: string;
  channels: string[];
  frequency: string;
  cooldownMinutes: number;
  status: AlertStatus;
  createdAt: string;
}

interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  category: AlertCategory;
  metricValue: string;
  channel: string;
  status: 'sent' | 'read' | 'dismissed';
  triggeredAt: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_CFG: Record<AlertCategory, { label: string; badge: string; icon: string }> = {
  stock: { label: 'Stok', badge: 'bg-blue-100 text-blue-700', icon: '📦' },
  price: { label: 'Fiyat', badge: 'bg-emerald-100 text-emerald-700', icon: '💰' },
  order: { label: 'Sipariş', badge: 'bg-orange-100 text-orange-700', icon: '🛒' },
  performance: { label: 'Performans', badge: 'bg-purple-100 text-purple-700', icon: '📊' },
  competitor: { label: 'Rakip', badge: 'bg-red-100 text-red-700', icon: '🎯' },
  listing: { label: 'Listeleme', badge: 'bg-teal-100 text-teal-700', icon: '📋' },
};

const CONDITION_OPTIONS = [
  { value: 'greater_than', label: 'Büyükse' },
  { value: 'less_than', label: 'Küçükse' },
  { value: 'equals', label: 'Eşitse' },
  { value: 'not_equals', label: 'Eşit değilse' },
  { value: 'increases_by', label: '% Artarsa' },
  { value: 'decreases_by', label: '% Azalırsa' },
  { value: 'changes', label: 'Değişirse' },
];

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Anında' },
  { value: 'hourly', label: 'Saatlik' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
];

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'E-posta' },
  { value: 'push', label: 'Push Bildirim' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'sms', label: 'SMS' },
  { value: 'in_app', label: 'Uygulama İçi' },
];

const CHANNEL_LABELS: Record<string, string> = {
  email: 'E-posta', push: 'Push', webhook: 'Webhook', sms: 'SMS', in_app: 'Uygulama',
};

const CONDITION_LABELS: Record<string, string> = {
  greater_than: '>', less_than: '<', equals: '=', not_equals: '≠',
  increases_by: '+%', decreases_by: '-%', changes: 'Δ',
};

function relTime(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  if (s < 604800) return `${Math.floor(s / 86400)} gün önce`;
  return new Date(d).toLocaleDateString('tr-TR');
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: AlertRule[] = [
  { id: 'ar-001', name: 'Düşük Stok Uyarısı', category: 'stock', metric: 'Ürün Stok Miktarı', condition: 'less_than', threshold: '10', channels: ['email', 'push'], frequency: 'immediate', cooldownMinutes: 30, status: 'active', createdAt: '2024-11-20T10:00:00Z' },
  { id: 'ar-002', name: 'Fiyat Düşüşü Takibi', category: 'price', metric: 'Rakip Fiyat Değişimi', condition: 'decreases_by', threshold: '5', channels: ['email', 'webhook'], frequency: 'hourly', cooldownMinutes: 60, status: 'active', createdAt: '2024-11-22T14:00:00Z' },
  { id: 'ar-003', name: 'Sipariş Artışı', category: 'order', metric: 'Günlük Sipariş Sayısı', condition: 'increases_by', threshold: '50', channels: ['email'], frequency: 'daily', cooldownMinutes: 360, status: 'active', createdAt: '2024-12-01T09:00:00Z' },
  { id: 'ar-004', name: 'Düşük Dönüşüm Oranı', category: 'performance', metric: 'Liste → Satış Oranı', condition: 'less_than', threshold: '2', channels: ['email', 'push', 'in_app'], frequency: 'daily', cooldownMinutes: 720, status: 'active', createdAt: '2024-12-05T11:00:00Z' },
  { id: 'ar-005', name: 'Yeni Rakip Ürün', category: 'competitor', metric: 'Rakip Yeni Liste Sayısı', condition: 'greater_than', threshold: '0', channels: ['email', 'push'], frequency: 'daily', cooldownMinutes: 1440, status: 'active', createdAt: '2024-12-08T16:00:00Z' },
  { id: 'ar-006', name: 'Liste Düşmesi', category: 'listing', metric: 'Pazaryeri Aktif Liste Sayısı', condition: 'decreases_by', threshold: '10', channels: ['email', 'sms'], frequency: 'hourly', cooldownMinutes: 60, status: 'paused', createdAt: '2024-12-10T08:00:00Z' },
  { id: 'ar-007', name: 'Stok Tükenmesi', category: 'stock', metric: 'Stok Durumu', condition: 'equals', threshold: '0', channels: ['email', 'push', 'sms'], frequency: 'immediate', cooldownMinutes: 15, status: 'active', createdAt: '2024-12-12T13:00:00Z' },
  { id: 'ar-008', name: 'Yüksek İade Oranı', category: 'performance', metric: 'İade Oranı (%)', condition: 'greater_than', threshold: '5', channels: ['email', 'in_app'], frequency: 'daily', cooldownMinutes: 1440, status: 'active', createdAt: '2024-12-13T10:00:00Z' },
  { id: 'ar-009', name: 'MAP İhlali', category: 'competitor', metric: 'Satış Fiyatı vs MAP Fiyatı', condition: 'less_than', threshold: '0', channels: ['email', 'webhook', 'push'], frequency: 'hourly', cooldownMinutes: 30, status: 'active', createdAt: '2024-12-14T09:00:00Z' },
  { id: 'ar-010', name: 'Yorum Değerlendirme', category: 'listing', metric: 'Ortalama Yıldız Puanı', condition: 'decreases_by', threshold: '0.5', channels: ['email'], frequency: 'daily', cooldownMinutes: 1440, status: 'paused', createdAt: '2024-12-14T15:00:00Z' },
];

const MOCK_TRIGGERED: TriggeredAlert[] = [
  { id: 'ta-001', ruleId: 'ar-007', ruleName: 'Stok Tükenmesi', category: 'stock', metricValue: 'iPhone 15 Pro Max — Stok: 0', channel: 'email', status: 'read', triggeredAt: '2024-12-15T14:30:00Z' },
  { id: 'ta-002', ruleId: 'ar-002', ruleName: 'Fiyat Düşüşü Takibi', category: 'price', metricValue: 'Samsung Galaxy S24 Ultra — Rakip %8 düşüş', channel: 'push', status: 'sent', triggeredAt: '2024-12-15T13:15:00Z' },
  { id: 'ta-003', ruleId: 'ar-009', ruleName: 'MAP İhlali', category: 'competitor', metricValue: 'Sony WH-1000XM5 — Trendyol: ₺7.499 (MAP: ₺8.999)', channel: 'email', status: 'read', triggeredAt: '2024-12-15T11:45:00Z' },
  { id: 'ta-004', ruleId: 'ar-001', ruleName: 'Düşük Stok Uyarısı', category: 'stock', metricValue: 'MacBook Air M3 — Stok: 3', channel: 'push', status: 'dismissed', triggeredAt: '2024-12-15T10:00:00Z' },
  { id: 'ta-005', ruleId: 'ar-004', ruleName: 'Düşük Dönüşüm Oranı', category: 'performance', metricValue: 'Trendyol Genel — Dönüşüm: %1.4', channel: 'in_app', status: 'read', triggeredAt: '2024-12-15T08:30:00Z' },
  { id: 'ta-006', ruleId: 'ar-005', ruleName: 'Yeni Rakip Ürün', category: 'competitor', metricValue: 'Hepsiburada — 3 yeni rakip liste tespit edildi', channel: 'email', status: 'sent', triggeredAt: '2024-12-14T22:00:00Z' },
  { id: 'ta-007', ruleId: 'ar-003', ruleName: 'Sipariş Artışı', category: 'order', metricValue: 'Günlük Sipariş: 234 (+67% artış)', channel: 'email', status: 'read', triggeredAt: '2024-12-14T18:00:00Z' },
  { id: 'ta-008', ruleId: 'ar-008', ruleName: 'Yüksek İade Oranı', category: 'performance', metricValue: 'iPad Air M2 — İade Oranı: %6.2', channel: 'email', status: 'sent', triggeredAt: '2024-12-14T09:15:00Z' },
  { id: 'ta-009', ruleId: 'ar-007', ruleName: 'Stok Tükenmesi', category: 'stock', metricValue: 'Logitech MX Master 3S — Stok: 0', channel: 'sms', status: 'read', triggeredAt: '2024-12-13T16:30:00Z' },
  { id: 'ta-010', ruleId: 'ar-002', ruleName: 'Fiyat Düşüşü Takibi', category: 'price', metricValue: 'Xiaomi 14 Ultra — n11: ₺45.999 (MAP: ₺48.499)', channel: 'webhook', status: 'dismissed', triggeredAt: '2024-12-13T12:00:00Z' },
];

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="h-4 w-96 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SmartAlerts() {
  const { sidebarOpen } = useAppStore();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [triggered, setTriggered] = useState<TriggeredAlert[]>([]);
  const [loading, setLoading] = useState(true);

  /* --- Create Rule Form --- */
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AlertCategory>('stock');
  const [formMetric, setFormMetric] = useState('');
  const [formCondition, setFormCondition] = useState('greater_than');
  const [formThreshold, setFormThreshold] = useState('');
  const [formChannels, setFormChannels] = useState<string[]>(['email']);
  const [formFrequency, setFormFrequency] = useState('immediate');
  const [formCooldown, setFormCooldown] = useState('30');

  /* --- Filters --- */
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('all');
  const [triggerSearch, setTriggerSearch] = useState('');

  /* ---------- Load Data ---------- */
  useEffect(() => {
    fetch('/api/smart-alerts')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res)) {
          setRules(res);
          setTriggered([]);
        } else if (res && typeof res === 'object') {
          setRules(res.rules || MOCK_RULES);
          setTriggered(res.triggered || MOCK_TRIGGERED);
        } else {
          setRules(MOCK_RULES);
          setTriggered(MOCK_TRIGGERED);
        }
      })
      .catch(() => {
        setRules(MOCK_RULES);
        setTriggered(MOCK_TRIGGERED);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Derived ---------- */
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (ruleSearch.trim()) {
        const q = ruleSearch.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.metric.toLowerCase().includes(q)) return false;
      }
      if (ruleCategoryFilter !== 'all' && r.category !== ruleCategoryFilter) return false;
      return true;
    });
  }, [rules, ruleSearch, ruleCategoryFilter]);

  const filteredTriggered = useMemo(() => {
    return triggered.filter((t) => {
      if (triggerSearch.trim()) {
        const q = triggerSearch.toLowerCase();
        if (!t.ruleName.toLowerCase().includes(q) && !t.metricValue.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [triggered, triggerSearch]);

  const kpiStats = useMemo(() => {
    const activeRules = rules.filter((r) => r.status === 'active').length;
    const todayCount = triggered.filter((t) => {
      const today = new Date().toDateString();
      return new Date(t.triggeredAt).toDateString() === today;
    }).length;

    // Most triggered category
    const catCounts: Record<string, number> = {};
    triggered.forEach((t) => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total: rules.length,
      active: activeRules,
      todayCount,
      topCategory: topCategory ? CATEGORY_CFG[topCategory[0] as AlertCategory]?.label : '-',
    };
  }, [rules, triggered]);

  /* ---------- Handlers ---------- */
  const toggleRuleStatus = (id: string) => {
    setRules((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      return { ...r, status: r.status === 'active' ? 'paused' : 'active' };
    }));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCreateRule = () => {
    if (!formName.trim() || !formMetric.trim() || !formThreshold.trim()) return;

    const newRule: AlertRule = {
      id: `ar-${Date.now()}`,
      name: formName,
      category: formCategory,
      metric: formMetric,
      condition: formCondition,
      threshold: formThreshold,
      channels: formChannels,
      frequency: formFrequency,
      cooldownMinutes: parseInt(formCooldown) || 30,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      fetch('/api/smart-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...newRule }),
      });
    } catch { /* fallback */ }

    setRules((prev) => [...prev, newRule]);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('stock');
    setFormMetric('');
    setFormCondition('greater_than');
    setFormThreshold('');
    setFormChannels(['email']);
    setFormFrequency('immediate');
    setFormCooldown('30');
  };

  const toggleChannel = (channel: string) => {
    setFormChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <Skeleton />
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>

      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Akıllı Bildirim Motoru</h1>
              <p className="text-sm text-amber-100 mt-0.5">Özelleştirilebilir kurallar ile kritik değişikliklerden anında haberdar olun</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 px-3 py-1">
              <Zap className="h-3.5 w-3.5 mr-1" />
              Gerçek Zamanlı
            </Badge>
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Toplam Kural', value: kpiStats.total, icon: <Settings className="h-5 w-5 text-white" />, bg: 'bg-slate-700' },
          { label: 'Aktif Kural', value: kpiStats.active, icon: <Zap className="h-5 w-5 text-white" />, bg: 'bg-emerald-500' },
          { label: 'Bugün Tetiklenen', value: kpiStats.todayCount, icon: <Bell className="h-5 w-5 text-white" />, bg: 'bg-orange-500' },
          { label: 'En Çok Tetiklenen', value: kpiStats.topCategory, icon: <AlertTriangle className="h-5 w-5 text-white" />, bg: 'bg-red-500' },
        ].map((k, i) => (
          <Card key={i} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', k.bg)}>{k.icon}</div>
              </div>
              <p className="text-xl font-bold text-slate-900">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== TABS ===== */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto">
          <TabsTrigger value="rules" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-1.5" />
            Aktif Kurallar
          </TabsTrigger>
          <TabsTrigger value="create" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Kural Oluştur
          </TabsTrigger>
          <TabsTrigger value="triggered" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-1.5" />
            Tetiklenen Bildirimler
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Active Rules ===== */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-600" />
                  Yapılandırılmış Kurallar
                  <Badge variant="secondary" className="ml-1">{filteredRules.length} kural</Badge>
                </CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Kural adı veya metrik ara..." value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={ruleCategoryFilter} onValueChange={setRuleCategoryFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {Object.entries(CATEGORY_CFG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kural Adı</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Koşul</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kanallar</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sıklık</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-slate-400">Kural bulunamadı</TableCell>
                      </TableRow>
                    ) : (
                      filteredRules.map((r) => {
                        const cat = CATEGORY_CFG[r.category];
                        return (
                          <TableRow key={r.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{r.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{r.metric}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', cat.badge)}>
                                <span className="mr-1">{cat.icon}</span>
                                {cat.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-xs font-mono font-semibold px-1.5">
                                  {CONDITION_LABELS[r.condition] || r.condition}
                                </Badge>
                                <span className="text-sm font-semibold text-slate-700">{r.threshold}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {r.channels.map((ch) => (
                                  <Badge key={ch} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                    {CHANNEL_LABELS[ch] || ch}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{r.frequency === 'immediate' ? 'Anında' : r.frequency === 'hourly' ? 'Saatlik' : r.frequency === 'daily' ? 'Günlük' : 'Haftalık'}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={r.status === 'active'}
                                  onCheckedChange={() => toggleRuleStatus(r.id)}
                                />
                                <span className={cn('text-xs font-medium', r.status === 'active' ? 'text-emerald-600' : 'text-slate-500')}>
                                  {r.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Düzenle">
                                  <Edit className="h-4 w-4 text-slate-500" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Sil" onClick={() => deleteRule(r.id)}>
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Create Rule ===== */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4 text-amber-500" />
                Yeni Kural Oluştur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Rule Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Kural Adı</Label>
                    <Input
                      placeholder="Örn: Düşük Stok Uyarısı"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Kategori</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(CATEGORY_CFG).map(([k, v]) => (
                        <Badge
                          key={k}
                          variant={formCategory === k ? 'default' : 'outline'}
                          className={cn('cursor-pointer justify-center text-xs py-2', formCategory === k ? '' : '')}
                          style={formCategory === k ? { backgroundColor: v.badge.includes('blue') ? '#3b82f6' : v.badge.includes('emerald') ? '#10b981' : v.badge.includes('orange') ? '#f97316' : v.badge.includes('purple') ? '#8b5cf6' : v.badge.includes('red') ? '#ef4444' : '#14b8a6', color: '#fff' } : {}}
                          onClick={() => setFormCategory(k as AlertCategory)}
                        >
                          <span className="mr-1">{v.icon}</span>
                          {v.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metric */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Metrik</Label>
                    <Input
                      placeholder="Örn: Ürün Stok Miktarı, Rakip Fiyat Değişimi..."
                      value={formMetric}
                      onChange={(e) => setFormMetric(e.target.value)}
                    />
                  </div>

                  {/* Condition + Threshold */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Koşul</Label>
                      <Select value={formCondition} onValueChange={setFormCondition}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Eşik Değeri</Label>
                      <Input
                        placeholder="10"
                        value={formThreshold}
                        onChange={(e) => setFormThreshold(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Notification Channels */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Bildirim Kanalları</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {CHANNEL_OPTIONS.map((ch) => (
                        <div key={ch.value} className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleChannel(ch.value)}>
                          <Checkbox
                            checked={formChannels.includes(ch.value)}
                            onCheckedChange={() => toggleChannel(ch.value)}
                          />
                          <Label className="text-sm text-slate-700 cursor-pointer flex-1">{ch.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Kontrol Sıklığı</Label>
                    <Select value={formFrequency} onValueChange={setFormFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cooldown */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Bekleme Süresi (dakika)</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="30"
                      value={formCooldown}
                      onChange={(e) => setFormCooldown(e.target.value)}
                    />
                    <p className="text-xs text-slate-400">Aynı kuralın tekrar tetiklenmesi için beklenecek süre</p>
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              {formName && formMetric && formThreshold && (
                <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kural Önizleme</p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{formName}</span>: {formMetric} değeri{' '}
                    <Badge variant="outline" className="text-xs font-mono font-semibold mx-1 px-1.5">
                      {CONDITION_LABELS[formCondition]} {formThreshold}
                    </Badge>{' '}
                    olduğunda{' '}
                    {formChannels.map((ch) => CHANNEL_LABELS[ch]).join(', ')} kanalına bildirim gönder
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200">
                <Button
                  onClick={handleCreateRule}
                  disabled={!formName.trim() || !formMetric.trim() || !formThreshold.trim()}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Kural Oluştur
                </Button>
                <Button variant="outline" onClick={resetForm}>Sıfırla</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: Triggered Alerts ===== */}
        <TabsContent value="triggered">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-500" />
                  Tetiklenen Bildirimler
                  <Badge variant="secondary" className="ml-1">{filteredTriggered.length} bildirim</Badge>
                </CardTitle>
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 px-3 py-1">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Canlı İzleme
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Kural veya metrik değeri ara..." value={triggerSearch} onChange={(e) => setTriggerSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zaman</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kural</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Metrik Değeri</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kanal</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTriggered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-slate-400">Tetiklenen bildirim bulunamadı</TableCell>
                      </TableRow>
                    ) : (
                      filteredTriggered.map((t) => {
                        const cat = CATEGORY_CFG[t.category];
                        const statusCfg: Record<string, { label: string; badge: string }> = {
                          sent: { label: 'Gönderildi', badge: 'bg-blue-100 text-blue-700' },
                          read: { label: 'Okundu', badge: 'bg-emerald-100 text-emerald-700' },
                          dismissed: { label: 'Reddedildi', badge: 'bg-slate-100 text-slate-600' },
                        };
                        const st = statusCfg[t.status];
                        return (
                          <TableRow key={t.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell>
                              <div>
                                <p className="text-xs text-slate-500">{formatDateTime(t.triggeredAt)}</p>
                                <p className="text-[10px] text-slate-400">{relTime(t.triggeredAt)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-slate-800">{t.ruleName}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', cat.badge)}>
                                <span className="mr-1">{cat.icon}</span>
                                {cat.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-700 max-w-[250px] truncate block">{t.metricValue}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {CHANNEL_LABELS[t.channel] || t.channel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', st.badge)}>{st.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
