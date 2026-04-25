'use client';
import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Trash2, Plus, RefreshCw, Clock, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, XCircle, Activity, Zap, Settings, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Label } from '@/components/ui/label';

// ─── Types ───────────────────────────────────────────────────────
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  actionData: string;
  isActive: boolean;
  runCount: number;
  lastRun: string | null;
  createdAt: string;
}

interface StockSyncLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  channel: string;
  oldStock: number;
  newStock: number;
  status: string;
  error: string;
  triggeredBy: string;
  createdAt: string;
}

interface PriceHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  ruleApplied: string;
  marketplace: string;
  changedBy: string;
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────
const TRIGGER_OPTIONS = [
  { value: 'order.status_changed', label: 'Sipariş Durum Değişimi' },
  { value: 'product.stock_low', label: 'Ürün Stok Azalması' },
  { value: 'product.stock_changed', label: 'Ürün Stok Değişimi' },
  { value: 'daily_schedule', label: 'Günlük Zamanlama' },
  { value: 'campaign.started', label: 'Kampanya Başlangıcı' },
  { value: 'order.delivered', label: 'Sipariş Teslim Edildi' },
  { value: 'webhook.trigger', label: 'Webhook Tetikleyici' },
];

const ACTION_OPTIONS = [
  { value: 'assign_carrier', label: 'Kargo Ata' },
  { value: 'send_notification', label: 'Bildirim Gönder' },
  { value: 'create_invoice', label: 'Fatura Oluştur' },
  { value: 'competitor_price_check', label: 'Rakip Fiyat Kontrolü' },
  { value: 'sync_all_channels', label: 'Tüm Kanalları Senkronize Et' },
  { value: 'update_prices', label: 'Fiyatları Güncelle' },
  { value: 'sync_stock', label: 'Stok Senkronize Et' },
  { value: 'send_email', label: 'E-posta Gönder' },
];

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Tüm Kanallar' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'n11', label: 'n11' },
];

const MARKETPLACE_OPTIONS = [
  { value: 'all', label: 'Tüm Pazar Yerleri' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'n11', label: 'n11' },
];

// ─── Helpers ─────────────────────────────────────────────────────
function channelBadgeClass(channel: string): string {
  switch (channel.toLowerCase()) {
    case 'trendyol':
      return 'bg-blue-100 text-blue-700';
    case 'hepsiburada':
    case 'hb':
      return 'bg-orange-100 text-orange-700';
    case 'amazon':
      return 'bg-yellow-100 text-yellow-700';
    case 'n11':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function channelLabel(channel: string): string {
  const map: Record<string, string> = {
    trendyol: 'Trendyol',
    hepsiburada: 'Hepsiburada',
    hb: 'Hepsiburada',
    amazon: 'Amazon',
    n11: 'n11',
  };
  return map[channel.toLowerCase()] || channel;
}

function statusBadge(status: string) {
  switch (status) {
    case 'success':
      return <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1"><CheckCircle className="h-3 w-3" />Başarılı</Badge>;
    case 'error':
      return <Badge className="bg-red-100 text-red-700 border-0 gap-1"><XCircle className="h-3 w-3" />Hata</Badge>;
    case 'running':
      return <Badge className="bg-blue-100 text-blue-700 border-0 gap-1"><RefreshCw className="h-3 w-3 animate-spin" />Çalışıyor</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-600 border-0">{status}</Badge>;
  }
}

function triggerBadge(trigger: string) {
  const found = TRIGGER_OPTIONS.find((t) => t.value === trigger);
  return (
    <Badge variant="outline" className="text-xs font-normal gap-1">
      <Zap className="h-3 w-3 text-amber-500" />
      {found?.label || trigger}
    </Badge>
  );
}

function actionBadge(action: string) {
  const found = ACTION_OPTIONS.find((a) => a.value === action);
  return (
    <Badge variant="outline" className="text-xs font-normal gap-1">
      <Settings className="h-3 w-3 text-slate-500" />
      {found?.label || action}
    </Badge>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
    </div>
  );
}

function formatCurrency(val: number): string {
  return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

// ─── Main Component ──────────────────────────────────────────────
export default function DataAutomation() {
  const { sidebarOpen } = useAppStore();
  const mainMargin = sidebarOpen ? 'lg:ml-64' : 'ml-16';

  // ── Tab State ──
  const [activeTab, setActiveTab] = useState('rules');

  // ── Automation Rules State ──
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [ruleSummary, setRuleSummary] = useState({ total: 0, active: 0, totalRuns: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    trigger: '',
    condition: '{}',
    action: '',
    actionData: '{}',
    isActive: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ── Stock Sync State ──
  const [syncLogs, setSyncLogs] = useState<StockSyncLog[]>([]);
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncSummary, setSyncSummary] = useState({ totalSyncs: 0, successRate: 0, lastSyncTime: null as string | null });
  const [syncFilters, setSyncFilters] = useState({ channel: 'all', status: 'all', triggeredBy: 'all' });
  const [syncPage, setSyncPage] = useState(1);
  const [syncTotalPages, setSyncTotalPages] = useState(1);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // ── Price History State ──
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceSummary, setPriceSummary] = useState({ totalChanges: 0, avgChangePercent: 0, lastChangeTime: null as string | null });
  const [priceFilters, setPriceFilters] = useState({ marketplace: 'all', changedBy: 'all' });
  const [pricePage, setPricePage] = useState(1);
  const [priceTotalPages, setPriceTotalPages] = useState(1);

  // ─── Fetch Automation Rules ─────────────────────────────────────
  const fetchRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const res = await fetch('/api/automation');
      const data = await res.json();
      if (Array.isArray(data.rules)) {
        setRules(data.rules);
        setRuleSummary({
          total: data.summary?.total ?? data.rules.length,
          active: data.summary?.active ?? data.rules.filter((r: AutomationRule) => r.isActive).length,
          totalRuns: data.summary?.totalRuns ?? data.rules.reduce((s: number, r: AutomationRule) => s + r.runCount, 0),
        });
      }
    } catch (err) {
      console.error('Kurallar yüklenirken hata:', err);
    } finally {
      setRulesLoading(false);
    }
  }, []);

  // ─── Fetch Stock Sync Logs ──────────────────────────────────────
  const fetchSyncLogs = useCallback(async () => {
    setSyncLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(syncPage),
        limit: '10',
      });
      if (syncFilters.channel !== 'all') params.set('channel', syncFilters.channel);
      if (syncFilters.status !== 'all') params.set('status', syncFilters.status);
      if (syncFilters.triggeredBy !== 'all') params.set('triggeredBy', syncFilters.triggeredBy);

      const res = await fetch(`/api/stock-sync-log?${params}`);
      const data = await res.json();
      if (Array.isArray(data.logs)) {
        setSyncLogs(data.logs);
        setSyncTotalPages(data.totalPages || 1);
        setSyncSummary({
          totalSyncs: data.summary?.totalSyncs ?? 0,
          successRate: data.summary?.successRate ?? 0,
          lastSyncTime: data.summary?.lastSyncTime ?? null,
        });
      }
    } catch (err) {
      console.error('Stok senkronizasyon kayıtları yüklenirken hata:', err);
    } finally {
      setSyncLoading(false);
    }
  }, [syncPage, syncFilters]);

  // ─── Fetch Price History ────────────────────────────────────────
  const fetchPriceHistory = useCallback(async () => {
    setPriceLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pricePage),
        limit: '10',
      });
      if (priceFilters.marketplace !== 'all') params.set('marketplace', priceFilters.marketplace);
      if (priceFilters.changedBy !== 'all') params.set('changedBy', priceFilters.changedBy);

      const res = await fetch(`/api/price-history?${params}`);
      const data = await res.json();
      if (Array.isArray(data.history)) {
        setPriceHistory(data.history);
        setPriceTotalPages(data.totalPages || 1);
        setPriceSummary({
          totalChanges: data.summary?.totalChanges ?? 0,
          avgChangePercent: data.summary?.avgChangePercent ?? 0,
          lastChangeTime: data.summary?.lastChangeTime ?? null,
        });
      }
    } catch (err) {
      console.error('Fiyat geçmişi yüklenirken hata:', err);
    } finally {
      setPriceLoading(false);
    }
  }, [pricePage, priceFilters]);

  // ─── Load data on mount / tab switch ────────────────────────────
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (activeTab === 'stock-sync') fetchSyncLogs();
  }, [activeTab, fetchSyncLogs]);

  useEffect(() => {
    if (activeTab === 'price-history') fetchPriceHistory();
  }, [activeTab, fetchPriceHistory]);

  // ─── Handlers ───────────────────────────────────────────────────
  async function handleToggleRule(id: string) {
    try {
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
      await fetch(`/api/automation/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });
      fetchRules();
    } catch {
      fetchRules();
    }
  }

  async function handleRunRule(id: string) {
    setRunningRuleId(id);
    try {
      await fetch(`/api/automation/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' }),
      });
      fetchRules();
    } catch {
      // silent
    } finally {
      setRunningRuleId(null);
    }
  }

  async function handleDeleteRule(id: string, name: string) {
    if (!confirm(`"${name}" kuralını silmek istediğinize emin misiniz?`)) return;
    try {
      await fetch(`/api/automation/${id}`, { method: 'DELETE' });
      fetchRules();
    } catch {
      // silent
    }
  }

  async function handleCreateRule() {
    if (!formState.name.trim() || !formState.trigger || !formState.action) return;
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setFormState({ name: '', description: '', trigger: '', condition: '{}', action: '', actionData: '{}', isActive: true });
        fetchRules();
      }
    } catch {
      // silent
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleSyncAll() {
    setSyncingAll(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 400);
    // Simulate a sync call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    clearInterval(interval);
    setSyncProgress(100);
    setTimeout(() => {
      setSyncingAll(false);
      setSyncProgress(0);
      fetchSyncLogs();
    }, 600);
  }

  const successRate = ruleSummary.totalRuns > 0
    ? Math.round((ruleSummary.active / ruleSummary.total) * 100)
    : 0;

  // ─── Stat Card ──────────────────────────────────────────────────
  function StatCard({ icon, label, value, iconBg, valueColor = 'text-slate-900' }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    iconBg: string;
    valueColor?: string;
  }) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Pagination ─────────────────────────────────────────────────
  function Pagination({ page, totalPages, onPageChange }: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-slate-500">
          Sayfa {page} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className={`${mainMargin} min-h-screen bg-slate-100 p-6 transition-all`}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-7 w-7 text-emerald-600" />
            Veri Otomasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fiyat, stok ve entegrasyon otomasyonlarınızı yönetin
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="rules">
            <Zap className="h-4 w-4 mr-1" />
            Otomasyon Kuralları
          </TabsTrigger>
          <TabsTrigger value="stock-sync">
            <RefreshCw className="h-4 w-4 mr-1" />
            Stok Senkronizasyon Geçmişi
          </TabsTrigger>
          <TabsTrigger value="price-history">
            <TrendingUp className="h-4 w-4 mr-1" />
            Fiyat Değişim Geçmişi
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 1: Automation Rules                                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <TabsContent value="rules">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Activity className="h-5 w-5 text-white" />}
              label="Toplam Kural"
              value={ruleSummary.total}
              iconBg="bg-slate-600"
            />
            <StatCard
              icon={<Zap className="h-5 w-5 text-white" />}
              label="Aktif Kurallar"
              value={ruleSummary.active}
              iconBg="bg-emerald-500"
              valueColor="text-emerald-600"
            />
            <StatCard
              icon={<Play className="h-5 w-5 text-white" />}
              label="Toplam Çalışma"
              value={ruleSummary.totalRuns}
              iconBg="bg-amber-500"
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-white" />}
              label="Başarılı Oran (%)"
              value={`${successRate}%`}
              iconBg="bg-emerald-500"
              valueColor="text-emerald-600"
            />
          </div>

          {/* Add Rule Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Yeni Kural Ekle
            </Button>
          </div>

          {/* Rule Cards */}
          {rulesLoading ? (
            <LoadingSpinner />
          ) : rules.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Henüz otomasyon kuralı bulunmuyor</p>
                <p className="text-sm text-slate-400 mt-1">Yeni bir kural ekleyerek otomasyonlara başlayın</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-slate-800 text-base">{rule.name}</h3>
                          <Badge className={`${rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} border-0 text-xs`}>
                            {rule.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-slate-500 mb-2 line-clamp-1">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {triggerBadge(rule.trigger)}
                          {actionBadge(rule.action)}
                        </div>
                      </div>

                      {/* Right: Meta + Actions */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Meta Info */}
                        <div className="text-xs text-slate-500 space-y-1 hidden md:block">
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            Çalışma: <span className="font-medium text-slate-700">{rule.runCount}</span>
                          </div>
                          {rule.lastRun && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(rule.lastRun)}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            disabled={!rule.isActive || runningRuleId === rule.id}
                            onClick={() => handleRunRule(rule.id)}
                          >
                            {runningRuleId === rule.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            Şimdi Çalıştır
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteRule(rule.id, rule.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 2: Stock Sync History                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <TabsContent value="stock-sync">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<RefreshCw className="h-5 w-5 text-white" />}
              label="Toplam Senkron"
              value={syncSummary.totalSyncs}
              iconBg="bg-slate-600"
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-white" />}
              label="Başarı Oranı"
              value={`${syncSummary.successRate}%`}
              iconBg="bg-emerald-500"
              valueColor="text-emerald-600"
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-white" />}
              label="Son Senkron Zamanı"
              value={syncSummary.lastSyncTime ? new Date(syncSummary.lastSyncTime).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
              iconBg="bg-amber-500"
            />
            <StatCard
              icon={<Activity className="h-5 w-5 text-white" />}
              label="Otomatik / Manuel"
              value={syncLogs.length > 0 ? `${syncLogs.filter((l) => l.triggeredBy === 'auto').length} / ${syncLogs.filter((l) => l.triggeredBy === 'manual').length}` : '-'}
              iconBg="bg-blue-500"
            />
          </div>

          {/* Filters + Sync All */}
          <Card className="shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Filter className="h-4 w-4" />
                  Filtrele
                </div>
                <Select value={syncFilters.channel} onValueChange={(v) => { setSyncFilters((f) => ({ ...f, channel: v })); setSyncPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Kanal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={syncFilters.status} onValueChange={(v) => { setSyncFilters((f) => ({ ...f, status: v })); setSyncPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="success">Başarılı</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={syncFilters.triggeredBy} onValueChange={(v) => { setSyncFilters((f) => ({ ...f, triggeredBy: v })); setSyncPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tetikleyici" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="auto">Otomatik</SelectItem>
                    <SelectItem value="manual">Manuel</SelectItem>
                  </SelectContent>
                </Select>
                <div className="sm:ml-auto">
                  <Button
                    onClick={handleSyncAll}
                    disabled={syncingAll}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {syncingAll ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Tümünü Senkronize Et
                  </Button>
                </div>
              </div>
              {syncingAll && (
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(syncProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Senkronize ediliyor... %{Math.round(Math.min(syncProgress, 100))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Logs Table */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Ürün Adı</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">SKU</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Kanal</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Eski Stok</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Yeni Stok</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Tetikleyici</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncLoading ? (
                      <tr>
                        <td colSpan={8}>
                          <LoadingSpinner />
                        </td>
                      </tr>
                    ) : syncLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400">
                          Kayıt bulunamadı
                        </td>
                      </tr>
                    ) : (
                      syncLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{log.productName || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{log.sku || '-'}</td>
                          <td className="px-4 py-3">
                            <Badge className={`${channelBadgeClass(log.channel)} border-0 text-xs`}>
                              {channelLabel(log.channel)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{log.oldStock}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-medium ${log.newStock > log.oldStock ? 'text-emerald-600' : log.newStock < log.oldStock ? 'text-red-500' : 'text-slate-700'}`}>
                              {log.newStock > log.oldStock && <ArrowUpRight className="inline h-3.5 w-3.5 mr-0.5" />}
                              {log.newStock < log.oldStock && <ArrowDownRight className="inline h-3.5 w-3.5 mr-0.5" />}
                              {log.newStock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{statusBadge(log.status)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`${log.triggeredBy === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'} border-0 text-xs`}>
                              {log.triggeredBy === 'auto' ? 'Otomatik' : 'Manuel'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(log.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-2">
                <Pagination page={syncPage} totalPages={syncTotalPages} onPageChange={setSyncPage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 3: Price Change History                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <TabsContent value="price-history">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              label="Toplam Değişim"
              value={priceSummary.totalChanges}
              iconBg="bg-slate-600"
            />
            <StatCard
              icon={<Activity className="h-5 w-5 text-white" />}
              label="Ortalama Değişim %"
              value={`${priceSummary.avgChangePercent}%`}
              iconBg="bg-amber-500"
              valueColor="text-amber-600"
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-white" />}
              label="Son Değişim"
              value={priceSummary.lastChangeTime ? new Date(priceSummary.lastChangeTime).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
              iconBg="bg-emerald-500"
            />
            <StatCard
              icon={<Settings className="h-5 w-5 text-white" />}
              label="Manuel / Otomatik"
              value={priceHistory.length > 0 ? `${priceHistory.filter((h) => h.changedBy === 'manual').length} / ${priceHistory.filter((h) => h.changedBy === 'auto').length}` : '-'}
              iconBg="bg-blue-500"
            />
          </div>

          {/* Filters */}
          <Card className="shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Filter className="h-4 w-4" />
                  Filtrele
                </div>
                <Select value={priceFilters.marketplace} onValueChange={(v) => { setPriceFilters((f) => ({ ...f, marketplace: v })); setPricePage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pazaryeri" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETPLACE_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priceFilters.changedBy} onValueChange={(v) => { setPriceFilters((f) => ({ ...f, changedBy: v })); setPricePage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Değişen Kişi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="auto">Otomatik</SelectItem>
                    <SelectItem value="manual">Manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Price History Table */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Ürün Adı</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">SKU</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Eski Fiyat</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Yeni Fiyat</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Değişim %</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Kural</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Pazaryeri</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Tür</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceLoading ? (
                      <tr>
                        <td colSpan={9}>
                          <LoadingSpinner />
                        </td>
                      </tr>
                    ) : priceHistory.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-slate-400">
                          Kayıt bulunamadı
                        </td>
                      </tr>
                    ) : (
                      priceHistory.map((entry) => {
                        const changePercent = entry.oldPrice > 0
                          ? ((entry.newPrice - entry.oldPrice) / entry.oldPrice) * 100
                          : 0;
                        const isIncrease = changePercent > 0;
                        const isDecrease = changePercent < 0;

                        return (
                          <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{entry.productName || '-'}</td>
                            <td className="px-4 py-3 text-slate-600">{entry.sku || '-'}</td>
                            <td className="px-4 py-3 text-right text-slate-500 line-through">{formatCurrency(entry.oldPrice)}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(entry.newPrice)}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center gap-1 font-medium ${isIncrease ? 'text-emerald-600' : isDecrease ? 'text-red-500' : 'text-slate-500'}`}>
                                {isIncrease && <TrendingUp className="h-3.5 w-3.5" />}
                                {isDecrease && <TrendingDown className="h-3.5 w-3.5" />}
                                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs max-w-[120px] truncate">{entry.ruleApplied || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge className={`${channelBadgeClass(entry.marketplace)} border-0 text-xs`}>
                                {channelLabel(entry.marketplace)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge className={`${entry.changedBy === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'} border-0 text-xs`}>
                                {entry.changedBy === 'auto' ? 'Otomatik' : 'Manuel'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-2">
                <Pagination page={pricePage} totalPages={priceTotalPages} onPageChange={setPricePage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Create Rule Dialog                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Kural Ekle</DialogTitle>
            <DialogDescription>
              Otomasyon kuralı oluşturarak işlemlerinizi otomatikleştirin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Kural Adı */}
            <div className="space-y-2">
              <Label htmlFor="rule-name">Kural Adı *</Label>
              <Input
                id="rule-name"
                placeholder="örn: Düşük Stok Uyarısı"
                value={formState.name}
                onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              />
            </div>

            {/* Açıklama */}
            <div className="space-y-2">
              <Label htmlFor="rule-desc">Açıklama</Label>
              <textarea
                id="rule-desc"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Kural ne yapar, hangi koşullarda tetiklenir?"
                value={formState.description}
                onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
              />
            </div>

            {/* Tetikleyici */}
            <div className="space-y-2">
              <Label>Tetikleyici *</Label>
              <Select value={formState.trigger} onValueChange={(v) => setFormState((s) => ({ ...s, trigger: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tetikleyici seçin" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Koşul */}
            <div className="space-y-2">
              <Label htmlFor="rule-condition">Koşul (JSON)</Label>
              <textarea
                id="rule-condition"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs resize-none"
                placeholder='{"stockThreshold": 5}'
                value={formState.condition}
                onChange={(e) => setFormState((s) => ({ ...s, condition: e.target.value }))}
              />
            </div>

            {/* Aksiyon */}
            <div className="space-y-2">
              <Label>Aksiyon *</Label>
              <Select value={formState.action} onValueChange={(v) => setFormState((s) => ({ ...s, action: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aksiyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aksiyon Verileri */}
            <div className="space-y-2">
              <Label htmlFor="rule-action-data">Aksiyon Verileri (JSON)</Label>
              <textarea
                id="rule-action-data"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs resize-none"
                placeholder='{"channel": "trendyol", "percentage": 10}'
                value={formState.actionData}
                onChange={(e) => setFormState((s) => ({ ...s, actionData: e.target.value }))}
              />
            </div>

            {/* Aktif */}
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="rule-active" className="cursor-pointer">Aktif</Label>
              <Switch
                id="rule-active"
                checked={formState.isActive}
                onCheckedChange={(checked) => setFormState((s) => ({ ...s, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateRule}
              disabled={!formState.name.trim() || !formState.trigger || !formState.action || formSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {formSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Kural Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
