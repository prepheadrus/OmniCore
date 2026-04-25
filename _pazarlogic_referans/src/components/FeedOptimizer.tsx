'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Edit, Play, CheckCircle, XCircle, AlertTriangle,
  FileText, Image, CheckSquare, DollarSign, Type, Settings, RefreshCw,
  ChevronLeft, ChevronRight, Eye, X, Save, Filter, Target, Shield, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';

/* ─── Types ─── */
interface ContentRule {
  id: string;
  name: string;
  type: string;
  channel: string;
  category: string;
  description: string;
  template: string;
  variables: string;
  isActive: boolean;
  priority: number;
  applyCount: number;
  lastApplied: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QualityCategory {
  category: string;
  totalProducts: number;
  score: number;
  issues: string[];
}

interface ChannelCompliance {
  channel: string;
  channelKey: string;
  compliance: number;
  totalProducts: number;
  requiredMet: number;
  missingFields: string[];
  warnings: number;
  errors: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Summary {
  total: number;
  active: number;
  avgQualityScore: number;
  errorRate: number;
  totalApplied: number;
}

/* ─── Constants ─── */
const TYPE_CONFIG: Record<string, { label: string; icon: typeof Type; color: string }> = {
  title_template: { label: 'Başlık Şablonu', icon: Type, color: 'bg-blue-100 text-blue-700' },
  description_template: { label: 'Açıklama Şablonu', icon: FileText, color: 'bg-violet-100 text-violet-700' },
  image_rule: { label: 'Görsel Kuralı', icon: Image, color: 'bg-pink-100 text-pink-700' },
  field_validation: { label: 'Alan Doğrulama', icon: CheckSquare, color: 'bg-amber-100 text-amber-700' },
  price_validation: { label: 'Fiyat Doğrulama', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
};

const CHANNEL_CONFIG: Record<string, { label: string; color: string }> = {
  all: { label: 'Tüm Kanallar', color: 'bg-slate-100 text-slate-700' },
  trendyol: { label: 'Trendyol', color: 'bg-orange-100 text-orange-700' },
  hepsiburada: { label: 'Hepsiburada', color: 'bg-blue-100 text-blue-700' },
  n11: { label: 'n11', color: 'bg-purple-100 text-purple-700' },
  amazon: { label: 'Amazon TR', color: 'bg-slate-200 text-slate-800' },
};

const TEMPLATE_VARIABLES = ['{name}', '{brand}', '{sku}', '{price}', '{category}', '{description}', '{gtin}', '{mpn}', '{stock}', '{attributes}'];

/* ─── Helper ─── */
function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function scoreBgColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreBarColor(score: number) {
  if (score >= 80) return '[&>div]:bg-emerald-500';
  if (score >= 60) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ─── Main Component ─── */
export default function FeedOptimizer() {
  /* State */
  const [rules, setRules] = useState<ContentRule[]>([]);
  const [qualityScores, setQualityScores] = useState<QualityCategory[]>([]);
  const [channelCompliance, setChannelCompliance] = useState<ChannelCompliance[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, avgQualityScore: 0, errorRate: 0, totalApplied: 0 });
  const [loading, setLoading] = useState(true);
  const { sidebarOpen } = useAppStore();
  const [applyingRule, setApplyingRule] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<{ ruleName: string; affectedProducts: number } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ContentRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    name: '', type: 'field_validation', channel: 'all', category: '',
    description: '', template: '', priority: 0, isActive: true,
  });

  // Quality check
  const [checkingChannels, setCheckingChannels] = useState(false);
  const [checkResults, setCheckResults] = useState<null | { summary: { totalChecked: number; totalErrors: number; totalWarnings: number; avgCompliance: number; checkedAt: string }; channelResults: Array<{ channel: string; compliance: number; totalChecked: number; errors: number; warnings: number }> }>(null);

  /* Fetch data */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (filterChannel !== 'all') params.set('channel', filterChannel);
      if (filterStatus !== 'all') params.set('isActive', filterStatus);

      const [rulesRes, qualityRes] = await Promise.all([
        fetch(`/api/content-rules?${params.toString()}`),
        fetch('/api/feed-quality'),
      ]);
      const rulesData = await rulesRes.json();
      const qualityData = await qualityRes.json();

      setRules(Array.isArray(rulesData?.rules) ? rulesData.rules : []);
      setSummary(rulesData?.summary || { total: 0, active: 0, avgQualityScore: 0, errorRate: 0, totalApplied: 0 });

      if (Array.isArray(qualityData?.qualityScores)) setQualityScores(qualityData.qualityScores);
      if (Array.isArray(qualityData?.channelCompliance)) setChannelCompliance(qualityData.channelCompliance);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterType, filterChannel, filterStatus]);

  /* Filter rules by search */
  const filteredRules = rules.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* Reset form */
  const resetForm = () => {
    setForm({ name: '', type: 'field_validation', channel: 'all', category: '', description: '', template: '', priority: 0, isActive: true });
  };

  /* Create rule */
  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await fetch('/api/content-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch { /* handled silently */ }
  };

  /* Update rule */
  const handleUpdate = async () => {
    if (!editingRule || !form.name.trim()) return;
    try {
      await fetch('/api/content-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRule.id, ...form }),
      });
      setEditDialogOpen(false);
      setEditingRule(null);
      resetForm();
      fetchData();
    } catch { /* handled silently */ }
  };

  /* Delete rule */
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await fetch('/api/content-rules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingId }),
      });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchData();
    } catch { /* handled silently */ }
  };

  /* Toggle active */
  const handleToggle = async (rule: ContentRule) => {
    try {
      await fetch('/api/content-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      fetchData();
    } catch { /* handled silently */ }
  };

  /* Apply rule */
  const handleApply = async (rule: ContentRule) => {
    setApplyingRule(rule.id);
    setApplyResult(null);
    try {
      const res = await fetch('/api/content-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', ruleId: rule.id }),
      });
      const data = await res.json();
      if (data.success) {
        setApplyResult({ ruleName: data.ruleName, affectedProducts: data.affectedProducts });
        fetchData();
      }
    } catch { /* handled silently */ }
    finally { setApplyingRule(null); }
  };

  /* Open edit */
  const openEdit = (rule: ContentRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name, type: rule.type, channel: rule.channel,
      category: rule.category, description: rule.description,
      template: rule.template, priority: rule.priority, isActive: rule.isActive,
    });
    setEditDialogOpen(true);
  };

  /* Run channel check */
  const runChannelCheck = async () => {
    setCheckingChannels(true);
    setCheckResults(null);
    try {
      const res = await fetch('/api/feed-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_check' }),
      });
      const data = await res.json();
      if (data.success) setCheckResults(data);
    } catch { /* handled silently */ }
    finally { setCheckingChannels(false); }
  };

  /* ─── Render ─── */
  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-100 p-4 md:p-6 transition-all`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="h-7 w-7 text-emerald-600" />
            Feed Optimizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Akıllı kurallar ve kalite kontrolleriyle ürün feedlerinizi optimize edin</p>
        </div>
        <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Yeni Kural Ekle
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Settings className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Kural</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aktif Kurallar</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Ort. Kalite Skoru</p>
              <p className={`text-2xl font-bold ${scoreColor(summary.avgQualityScore)}`}>
                {loading ? '...' : `%${summary.avgQualityScore}`}
              </p>
              <Progress value={summary.avgQualityScore} className={`h-1.5 mt-1 ${scoreBarColor(summary.avgQualityScore)}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Hata Oranı</p>
              <p className={`text-2xl font-bold ${summary.errorRate > 20 ? 'text-red-600' : summary.errorRate > 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {loading ? '...' : `%${summary.errorRate}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules" className="gap-1.5"><Settings className="h-4 w-4" /> İçerik Kuralları</TabsTrigger>
          <TabsTrigger value="quality" className="gap-1.5"><Shield className="h-4 w-4" /> Kalite Skorları</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1.5"><CheckSquare className="h-4 w-4" /> Kanal Uyumluluk</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: İçerik Kuralları ═══ */}
        <TabsContent value="rules">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Kural ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">Tüm Tipler</option>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">Tüm Kanallar</option>
                    {Object.entries(CHANNEL_CONFIG).filter(([k]) => k !== 'all').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">Tüm Durumlar</option>
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply result banner */}
          {applyResult && (
            <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-emerald-800 font-medium">
                  &quot;{applyResult.ruleName}&quot; kuralı başarıyla uygulandı — <strong>{applyResult.affectedProducts}</strong> ürün etkilendi.
                </span>
              </div>
              <button onClick={() => setApplyResult(null)}><X className="h-4 w-4 text-emerald-600" /></button>
            </div>
          )}

          {/* Rule cards grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="flex gap-2"><div className="h-8 bg-slate-200 rounded w-20" /><div className="h-8 bg-slate-200 rounded w-20" /></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Filter className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-600">Kural bulunamadı</h3>
                <p className="text-sm text-slate-400 mt-1">Filtreleri değiştirin veya yeni bir kural oluşturun.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule) => {
                const tc = TYPE_CONFIG[rule.type] || TYPE_CONFIG.field_validation;
                const cc = CHANNEL_CONFIG[rule.channel] || CHANNEL_CONFIG.all;
                const TypeIcon = tc.icon;
                return (
                  <Card key={rule.id} className={`transition-shadow hover:shadow-md ${!rule.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tc.color}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 text-sm">{rule.name}</h3>
                            <span className="text-xs text-slate-400">{tc.label}</span>
                          </div>
                        </div>
                        <Switch size="sm" checked={rule.isActive} onCheckedChange={() => handleToggle(rule)} />
                      </div>

                      {rule.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{rule.description}</p>}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className={cc.color}>{cc.label}</Badge>
                        <Badge variant="outline">Öncelik: {rule.priority}</Badge>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                        <span>Uygulama: <strong className="text-slate-600">{rule.applyCount}</strong></span>
                        <span>Son: {formatDate(rule.lastApplied)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <Button size="sm" onClick={() => handleApply(rule)} disabled={!rule.isActive || applyingRule === rule.id} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1">
                          {applyingRule === rule.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                          Uygula
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(rule)} className="h-8 text-xs gap-1">
                          <Edit className="h-3 w-3" /> Düzenle
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setDeletingId(rule.id); setDeleteDialogOpen(true); }} className="h-8 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" /> Sil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══ TAB 2: Kalite Skorları ═══ */}
        <TabsContent value="quality">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-32 bg-slate-200 rounded" /></CardContent></Card>
              ))}
            </div>
          ) : qualityScores.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" /><h3 className="text-lg font-medium text-slate-600">Kalite verisi yok</h3></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {qualityScores.map((qs) => (
                <Card key={qs.category} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 text-sm">{qs.category}</h3>
                      <span className={`text-2xl font-bold ${scoreColor(qs.score)}`}>{qs.score}%</span>
                    </div>
                    {/* Circular indicator */}
                    <div className="flex items-center justify-center mb-3">
                      <div className="relative h-20 w-20">
                        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={qs.score >= 80 ? '#10b981' : qs.score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${qs.score}, 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-600">{qs.totalProducts} ürün</span>
                        </div>
                      </div>
                    </div>
                    {/* Issues */}
                    {qs.issues.length > 0 ? (
                      <div className="space-y-1">
                        {qs.issues.map((issue) => (
                          <div key={issue} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <XCircle className={`h-3 w-3 ${qs.score < 60 ? 'text-red-400' : 'text-amber-400'}`} />
                            {issue}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle className="h-3 w-3" /> Sorun bulunamadı
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ TAB 3: Kanal Uyumluluk ═══ */}
        <TabsContent value="compliance">
          {/* Check button */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Kanal Uyumluluk Kontrolü</h3>
              <p className="text-sm text-slate-500">Tüm pazaryerleri için uyumluluk durumunu kontrol edin</p>
            </div>
            <Button onClick={runChannelCheck} disabled={checkingChannels} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {checkingChannels ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Tüm Kanalları Kontrol Et
            </Button>
          </div>

          {/* Check results banner */}
          {checkResults && (
            <Card className="mb-4 border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Kontrol Tamamlandı</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-emerald-700">
                  <span>Toplam Kontrol: <strong>{checkResults.summary.totalChecked}</strong></span>
                  <span>Hata: <strong className="text-red-600">{checkResults.summary.totalErrors}</strong></span>
                  <span>Uyarı: <strong className="text-amber-600">{checkResults.summary.totalWarnings}</strong></span>
                  <span>Ort. Uyumluluk: <strong>%{checkResults.summary.avgCompliance}</strong></span>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-48 bg-slate-200 rounded" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channelCompliance.map((ch) => (
                <Card key={ch.channelKey} className={`border ${ch.borderColor}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`font-semibold ${ch.color} text-lg`}>{ch.channel}</h3>
                        <p className="text-xs text-slate-500">{ch.totalProducts} ürün listeleniyor</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-3xl font-bold ${scoreColor(ch.compliance)}`}>{ch.compliance}%</span>
                        <div className="mt-1">
                          <Badge variant={ch.compliance >= 80 ? 'default' : ch.compliance >= 60 ? 'secondary' : 'destructive'} className="text-xs">
                            {ch.compliance >= 80 ? 'İyi' : ch.compliance >= 60 ? 'Orta' : 'Kritik'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Progress value={ch.compliance} className={`h-2 mb-4 ${scoreBarColor(ch.compliance)}`} />

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-slate-50">
                        <p className="text-lg font-bold text-emerald-600">{ch.requiredMet}</p>
                        <p className="text-xs text-slate-500">Gereken Alan</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-50">
                        <p className="text-lg font-bold text-amber-600">{ch.warnings}</p>
                        <p className="text-xs text-slate-500">Uyarı</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-red-50">
                        <p className="text-lg font-bold text-red-600">{ch.errors}</p>
                        <p className="text-xs text-slate-500">Hata</p>
                      </div>
                    </div>

                    {/* Missing fields */}
                    {ch.missingFields.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Eksik Alanlar:</p>
                        <div className="flex flex-wrap gap-1">
                          {ch.missingFields.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══ Create Dialog ═══ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Kural Ekle</DialogTitle>
            <DialogDescription>Ürün feedinizi optimize etmek için yeni bir kural oluşturun.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kural Adı *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kural adını girin" />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kanal</Label>
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(CHANNEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Kategori (opsiyonel)" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kural açıklaması" />
            </div>
            {(form.type === 'title_template' || form.type === 'description_template') && (
              <div className="space-y-2">
                <Label>Şablon</Label>
                <textarea
                  value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                  placeholder="Şablon içeriğini girin..."
                />
                <p className="text-xs text-slate-400">Kullanılabilir değişkenler:</p>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs cursor-pointer hover:bg-emerald-50" onClick={() => setForm({ ...form, template: form.template + v })}>
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} min={0} max={100} />
              </div>
              <div className="space-y-2 flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                  <Label>Aktif</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <Save className="h-4 w-4" /> Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Edit Dialog ═══ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kuralı Düzenle</DialogTitle>
            <DialogDescription>&quot;{editingRule?.name}&quot; kuralını güncelleyin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kural Adı *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kanal</Label>
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(CHANNEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {(form.type === 'title_template' || form.type === 'description_template') && (
              <div className="space-y-2">
                <Label>Şablon</Label>
                <textarea
                  value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                />
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs cursor-pointer hover:bg-emerald-50" onClick={() => setForm({ ...form, template: form.template + v })}>
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} min={0} max={100} />
              </div>
              <div className="space-y-2 flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                  <Label>Aktif</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>İptal</Button>
            <Button onClick={handleUpdate} disabled={!form.name.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <Save className="h-4 w-4" /> Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Dialog ═══ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Kuralı Sil
            </DialogTitle>
            <DialogDescription>Bu kuralı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-1">
              <Trash2 className="h-4 w-4" /> Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
