'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Trash2, Edit, Play, CheckCircle, XCircle, AlertTriangle,
  FileText, Image as ImageIcon, CheckSquare, DollarSign, Type, Settings, RefreshCw,
  X, Save, Filter, Target, Shield, TrendingUp,
} from 'lucide-react';

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

type TabKey = 'rules' | 'quality' | 'compliance';

/* ─── Constants ─── */
const TYPE_CONFIG: Record<string, { label: string; icon: typeof Type; color: string }> = {
  title_template: { label: 'Başlık Şablonu', icon: Type, color: 'bg-blue-100 text-blue-700' },
  description_template: { label: 'Açıklama Şablonu', icon: FileText, color: 'bg-violet-100 text-violet-700' },
  image_rule: { label: 'Görsel Kuralı', icon: ImageIcon, color: 'bg-pink-100 text-pink-700' },
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

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ─── Loading spinner ─── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  );
}

/* ─── Main Component ─── */
export default function FeedOptimizer() {
  /* State */
  const [activeTab, setActiveTab] = useState<TabKey>('rules');
  const [rules, setRules] = useState<ContentRule[]>([]);
  const [qualityScores, setQualityScores] = useState<QualityCategory[]>([]);
  const [channelCompliance, setChannelCompliance] = useState<ChannelCompliance[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, avgQualityScore: 0, errorRate: 0, totalApplied: 0 });
  const [loading, setLoading] = useState(true);
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
  const fetchData = useCallback(async () => {
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
  }, [filterType, filterChannel, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'rules', label: 'İçerik Kuralları', icon: <Settings className="h-4 w-4" /> },
    { key: 'quality', label: 'Kalite Skorları', icon: <Shield className="h-4 w-4" /> },
    { key: 'compliance', label: 'Kanal Uyumluluk', icon: <CheckSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d3435] shadow-[0_8px_30px_rgba(45,52,53,0.06)]">
            <Target className="h-6 w-6 text-[#ffffff]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#2d3435]">Feed Optimizasyonu</h1>
            <p className="text-sm text-[#5f5e61] mt-1">Akıllı kurallar ve kalite kontrolleriyle ürün feed&apos;lerinizi optimize edin</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setCreateDialogOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-[0_8px_30px_rgba(45,52,53,0.06)]"
        >
          <Plus className="h-4 w-4" /> Yeni Kural Ekle
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-surface-container-low flex items-center justify-center">
            <Settings className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Toplam Kural</p>
            <p className="text-xl font-bold text-slate-800">{loading ? '...' : summary.total}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Aktif Kurallar</p>
            <p className="text-xl font-bold text-slate-800">{loading ? '...' : summary.active}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">Ort. Kalite Skoru</p>
            <p className={`text-xl font-bold ${scoreColor(summary.avgQualityScore)}`}>
              {loading ? '...' : `%${summary.avgQualityScore}`}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${scoreBgColor(summary.avgQualityScore)}`} style={{ width: `${summary.avgQualityScore}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Hata Oranı</p>
            <p className={`text-xl font-bold ${summary.errorRate > 20 ? 'text-red-600' : summary.errorRate > 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {loading ? '...' : `%${summary.errorRate}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] p-1 mb-6 border border-[#adb3b4]/15">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-500 text-white shadow-[0_8px_30px_rgba(45,52,53,0.06)]'
                : 'text-slate-600 hover:bg-surface-container-low hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && (
        <div>
          {/* Filters */}
          <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kural ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                >
                  <option value="all">Tüm Tipler</option>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                >
                  {Object.entries(CHANNEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Apply result banner */}
          {applyResult && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-emerald-800 font-medium">
                  &quot;{applyResult.ruleName}&quot; kuralı başarıyla uygulandı — <strong>{applyResult.affectedProducts}</strong> ürün etkilendi.
                </span>
              </div>
              <button onClick={() => setApplyResult(null)} className="p-1 hover:bg-emerald-100 rounded-full transition-colors"><X className="h-4 w-4 text-emerald-600" /></button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <Spinner />
          ) : filteredRules.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-12 text-center">
              <Filter className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600">Kural bulunamadı</h3>
              <p className="text-sm text-slate-400 mt-1">Filtreleri değiştirin veya yeni bir kural oluşturun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredRules.map((rule) => {
                const tc = TYPE_CONFIG[rule.type] || TYPE_CONFIG.field_validation;
                const cc = CHANNEL_CONFIG[rule.channel] || CHANNEL_CONFIG.all;
                const TypeIcon = tc.icon;
                return (
                  <div key={rule.id} className={`bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-5 transition-shadow hover:shadow-md flex flex-col ${!rule.isActive ? 'opacity-60' : ''}`}>
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tc.color}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{rule.name}</h3>
                          <span className="text-xs text-slate-500 font-medium">{tc.label}</span>
                        </div>
                      </div>
                      {/* Custom toggle switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(rule)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={rule.isActive}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            rule.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {rule.description && <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1">{rule.description}</p>}
                    {!rule.description && <div className="flex-1" />}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${cc.color}`}>
                        {cc.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-slate-600 text-[11px] font-semibold border border-[#adb3b4]/15">
                        Öncelik: {rule.priority}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <span>Uygulama: <strong className="text-slate-600">{rule.applyCount}</strong></span>
                      <span>Son: {formatDate(rule.lastApplied)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#adb3b4]/15">
                      <button
                        onClick={() => handleApply(rule)}
                        disabled={!rule.isActive || applyingRule === rule.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors"
                      >
                        {applyingRule === rule.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        Uygula
                      </button>
                      <button
                        onClick={() => openEdit(rule)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#adb3b4]/30 hover:bg-surface-container-low text-slate-600 text-xs font-semibold transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Düzenle
                      </button>
                      <button
                        onClick={() => { setDeletingId(rule.id); setDeleteDialogOpen(true); }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quality' && (
        <div>
          {loading ? (
            <Spinner />
          ) : qualityScores.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-12 text-center">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600">Kalite verisi yok</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {qualityScores.map((qs) => (
                <div key={qs.category} className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-5 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">{qs.category}</h3>
                    <span className={`text-xl font-bold ${scoreColor(qs.score)}`}>{qs.score}%</span>
                  </div>
                  {/* Circular indicator */}
                  <div className="relative h-24 w-24 mb-4">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={qs.score >= 80 ? '#10b981' : qs.score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${qs.score}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-600">{qs.totalProducts} ürün</span>
                    </div>
                  </div>
                  {/* Issues */}
                  <div className="w-full mt-auto">
                    {qs.issues.length > 0 ? (
                      <div className="space-y-1.5">
                        {qs.issues.map((issue) => (
                          <div key={issue} className="flex items-start gap-1.5 text-xs text-slate-500">
                            <XCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${qs.score < 60 ? 'text-red-400' : 'text-amber-400'}`} />
                            <span className="leading-snug">{issue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <CheckCircle className="h-4 w-4" /> Sorun bulunamadı
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div>
          {/* Check button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Kanal Uyumluluk Kontrolü</h3>
              <p className="text-sm text-slate-500">Tüm pazaryerleri için uyumluluk durumunu kontrol edin</p>
            </div>
            <button
              onClick={runChannelCheck}
              disabled={checkingChannels}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-semibold transition-colors shadow-[0_8px_30px_rgba(45,52,53,0.06)] shrink-0"
            >
              {checkingChannels ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Tüm Kanalları Kontrol Et
            </button>
          </div>

          {/* Check results banner */}
          {checkResults && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Kontrol Tamamlandı</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-emerald-700 bg-white/50 p-3 rounded-md">
                <span>Toplam Kontrol: <strong>{checkResults.summary.totalChecked}</strong></span>
                <span>Hata: <strong className="text-red-600">{checkResults.summary.totalErrors}</strong></span>
                <span>Uyarı: <strong className="text-amber-600">{checkResults.summary.totalWarnings}</strong></span>
                <span>Ort. Uyumluluk: <strong>%{checkResults.summary.avgCompliance}</strong></span>
              </div>
            </div>
          )}

          {loading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
              {channelCompliance.map((ch) => (
                <div key={ch.channelKey} className={`bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-5 ${ch.borderColor ? `border-l-4 ${ch.borderColor.replace('border-', 'border-l-')}` : ''}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`font-bold ${ch.color} text-lg`}>{ch.channel}</h3>
                      <p className="text-xs text-slate-500 font-medium">{ch.totalProducts} ürün listeleniyor</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-3xl font-black ${scoreColor(ch.compliance)}`}>{ch.compliance}%</span>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ch.compliance >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          ch.compliance >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {ch.compliance >= 80 ? 'İyi' : ch.compliance >= 60 ? 'Orta' : 'Kritik'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
                    <div className={`h-full rounded-full ${scoreBgColor(ch.compliance)}`} style={{ width: `${ch.compliance}%` }} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="text-center p-3 rounded-lg bg-surface-container-low border border-[#adb3b4]/15">
                      <p className="text-xl font-bold text-emerald-600">{ch.requiredMet}</p>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Gereken Alan</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-xl font-bold text-amber-600">{ch.warnings}</p>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Uyarı</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-xl font-bold text-red-600">{ch.errors}</p>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Hata</p>
                    </div>
                  </div>

                  {/* Missing fields */}
                  {ch.missingFields.length > 0 && (
                    <div className="pt-4 border-t border-[#adb3b4]/15">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Eksik Alanlar:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ch.missingFields.map((f) => (
                          <span key={f} className="px-2 py-1 rounded bg-red-50 border border-red-100 text-[11px] font-medium text-red-600">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Create/Edit Dialog ═══ */}
      {(createDialogOpen || editDialogOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-[#adb3b4]/15">
            <div className="flex items-center justify-between p-5 border-b border-[#adb3b4]/15">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{editDialogOpen ? 'Kuralı Düzenle' : 'Yeni Kural Ekle'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editDialogOpen ? `"${editingRule?.name}" kuralını güncelleyin.` : 'Ürün feed&apos;inizi optimize etmek için yeni bir kural oluşturun.'}
                </p>
              </div>
              <button onClick={() => { setCreateDialogOpen(false); setEditDialogOpen(false); }} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="grid gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Kural Adı *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Kural adını girin"
                      className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tip</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                    >
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Kanal</label>
                    <select
                      value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                    >
                      {Object.entries(CHANNEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Kategori</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Kategori (opsiyonel)"
                      className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Açıklama</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Kural açıklaması"
                    className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                  />
                </div>
                {(form.type === 'title_template' || form.type === 'description_template') && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Şablon</label>
                    <textarea
                      value={form.template}
                      onChange={(e) => setForm({ ...form, template: e.target.value })}
                      className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest resize-y custom-scrollbar"
                      placeholder="Şablon içeriğini girin..."
                    />
                    <p className="text-xs text-slate-500 font-medium">Kullanılabilir değişkenler:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setForm({ ...form, template: form.template + v })}
                          className="px-2 py-1 rounded bg-surface-container-low hover:bg-emerald-50 border border-[#adb3b4]/30 hover:border-emerald-200 text-xs font-mono text-slate-600 hover:text-emerald-700 transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#adb3b4]/15 pt-5 mt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Öncelik</label>
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                      min={0} max={100}
                      className="w-full px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={form.isActive}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            form.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-sm font-semibold text-slate-700">Kural Aktif</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#adb3b4]/15 bg-surface-container-low/50">
              <button
                onClick={() => { setCreateDialogOpen(false); setEditDialogOpen(false); }}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-surface-container-low border border-transparent hover:border-[#adb3b4]/30 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={editDialogOpen ? handleUpdate : handleCreate}
                disabled={!form.name.trim()}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shadow-[0_8px_30px_rgba(45,52,53,0.06)]"
              >
                <Save className="h-4 w-4" /> {editDialogOpen ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Delete Dialog ═══ */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#adb3b4]/15">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Kuralı Sil</h2>
                  <p className="text-sm text-slate-500 mt-1">Bu kuralı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-surface-container-low transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
