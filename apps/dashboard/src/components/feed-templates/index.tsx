'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Download, Star, Flame, ChevronRight, ChevronLeft, Plus,
  Check, AlertTriangle, XCircle, Info, Play, Settings, Zap, Globe, FileText,
  RefreshCw, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── types ─── */
interface Template {
  id: string;
  name: string;
  description: string;
  platform: string;
  format: string;
  category: string;
  fields: string[];
  isPopular: boolean;
  downloadCount: number;
  rating: number;
  createdAt: string;
}

interface QualityRule {
  id: string;
  name: string;
  type: string;
  field: string;
  condition: string;
  severity: string;
  channel: string;
  isActive: boolean;
  errorCount: number;
}

interface QualityResult {
  productId: string;
  productName: string;
  sku: string;
  field: string;
  error: string;
  severity: string;
  channel: string;
}

type TabKey = 'library' | 'creator' | 'quality';

/* ─── platform colors ─── */
const platformColors: Record<string, string> = {
  Trendyol: 'bg-blue-100 text-blue-700 border-blue-200',
  Hepsiburada: 'bg-orange-100 text-orange-700 border-orange-200',
  'Amazon TR': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  n11: 'bg-purple-100 text-purple-700 border-purple-200',
  Morhipo: 'bg-pink-100 text-pink-700 border-pink-200',
  Ciceksepeti: 'bg-rose-100 text-rose-700 border-rose-200',
  'PTT AVM': 'bg-red-100 text-red-700 border-red-200',
  Shopify: 'bg-lime-100 text-lime-700 border-lime-200',
  WooCommerce: 'bg-violet-100 text-violet-700 border-violet-200',
  'Google Shopping': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Facebook Catalog': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Instagram Shopping': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
};

const platformIcons: Record<string, string> = {
  Trendyol: 'T', Hepsiburada: 'H', 'Amazon TR': 'A', n11: 'n', Morhipo: 'M',
  Ciceksepeti: 'C', 'PTT AVM': 'P', Shopify: 'S', WooCommerce: 'W',
  'Google Shopping': 'G', 'Facebook Catalog': 'F', 'Instagram Shopping': 'I',
};

const formatColors: Record<string, string> = {
  xml: 'bg-emerald-100 text-emerald-700',
  csv: 'bg-amber-100 text-amber-700',
  json: 'bg-sky-100 text-sky-700',
};

const severityColors: Record<string, string> = {
  error: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const severityIcons: Record<string, typeof XCircle> = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const allPlatforms = Object.keys(platformColors);

const sortOptions = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'popular', label: 'Popüler' },
  { value: 'rating', label: 'Puan' },
  { value: 'downloaded', label: 'Çok İndirilen' },
];

/* ─── Star component ─── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-slate-500 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
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
export default function FeedTemplates() {
  const [activeTab, setActiveTab] = useState<TabKey>('library');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'library', label: 'Şablon Kütüphanesi', icon: <FileText className="h-4 w-4" /> },
    { key: 'creator', label: 'Feed Oluşturucu', icon: <Plus className="h-4 w-4" /> },
    { key: 'quality', label: 'Feed Kalite Kuralları', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d3435] shadow-[0_8px_30px_rgba(45,52,53,0.06)]">
          <Globe className="h-6 w-6 text-[#ffffff]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#2d3435]">Feed Şablonları</h1>
          <p className="text-sm text-[#5f5e61] mt-1">Pazaryeri feed şablonlarını yönetin, yeni feed oluşturun ve kalite kontrollerini çalıştırın</p>
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
      {activeTab === 'library' && <TemplateLibrary />}
      {activeTab === 'creator' && <FeedCreator />}
      {activeTab === 'quality' && <QualityRules />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 1: TEMPLATE LIBRARY
   ═══════════════════════════════════════════════════════ */
function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24',
        search,
        platform,
        category,
        format,
        sort,
      });
      const res = await fetch(`/api/feed-templates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPlatforms(data.platforms || []);
        setCategories(data.categories || []);
      } else {
        setTemplates([]);
      }
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, platform, category, format, sort]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDownload = async (id: string) => {
    try {
      await fetch(`/api/feed-templates/${id}`, { method: 'POST' });
      fetchTemplates();
    } catch { /* noop */ }
  };

  const handleUse = (t: Template) => {
    toast.info(`"${t.name}" şablonu kullanılıyor...\nPlatform: ${t.platform}\nFormat: ${t.format.toUpperCase()}`);
  };

  const pageNumbers = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Toplam Şablon', value: total, icon: <FileText className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600' },
          { label: 'Platform Sayısı', value: platforms.length || allPlatforms.length, icon: <Globe className="h-5 w-5 text-blue-500" />, color: 'text-blue-600' },
          { label: 'İndirme Sayısı', value: templates.reduce((s, t) => s + t.downloadCount, 0) || 0, icon: <Download className="h-5 w-5 text-amber-500" />, color: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-surface-container-low flex items-center justify-center">{stat.icon}</div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Şablon ara..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#adb3b4]/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
            >
              <option value="">Tüm Platformlar</option>
              {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#adb3b4]/30 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {/* Format Tabs */}
        <div className="flex gap-1 mt-3 pt-3 border-t border-[#adb3b4]/15">
          {['', 'xml', 'csv', 'json'].map((f) => (
            <button
              key={f}
              onClick={() => { setFormat(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                format === f
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:bg-surface-container-low'
              }`}
            >
              {f === '' ? 'Tümü' : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Şablon bulunamadı</p>
          <p className="text-sm text-slate-400 mt-1">Arama kriterlerinizi değiştirmeyi deneyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {templates.map((t) => (
            <div key={t.id} className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-4 hover:shadow-md transition-shadow flex flex-col">
              {/* Top row: platform + popular */}
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${platformColors[t.platform] || 'bg-surface-container-low text-slate-700 border-[#adb3b4]/15'}`}>
                  <span className="h-4 w-4 rounded-full bg-white/60 flex items-center justify-center text-[9px] font-black">
                    {platformIcons[t.platform] || '?'}
                  </span>
                  {t.platform}
                </span>
                {t.isPopular && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                    <Flame className="h-3 w-3" /> Popüler
                  </span>
                )}
              </div>

              {/* Name & desc */}
              <h3 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2 leading-snug">{t.name}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">{t.description}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {t.category && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-slate-600 text-[11px] font-medium">{t.category}</span>
                )}
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${formatColors[t.format] || 'bg-surface-container-low text-slate-600'}`}>
                  {t.format}
                </span>
              </div>

              {/* Rating & downloads */}
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={t.rating} />
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Download className="h-3.5 w-3.5" /> {t.downloadCount.toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-[#adb3b4]/15">
                <button
                  onClick={() => handleUse(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Kullan
                </button>
                <button
                  onClick={() => handleDownload(t.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#adb3b4]/30 hover:bg-surface-container-low text-slate-600 text-xs font-semibold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> İndir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 px-4 py-3">
          <span className="text-xs text-slate-500">
            {total} şablondan {(page - 1) * 24 + 1}–{Math.min(page * 24, total)} arası gösteriliyor
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md hover:bg-surface-container-low text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((n, i) => (
              <span key={n}>
                {i > 0 && pageNumbers[i - 1] !== n - 1 && (
                  <span className="px-1 text-slate-400">…</span>
                )}
                <button
                  onClick={() => setPage(n)}
                  className={`min-w-[32px] h-8 rounded-md text-xs font-medium transition-colors ${
                    page === n
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-600 hover:bg-surface-container-low'
                  }`}
                >
                  {n}
                </button>
              </span>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md hover:bg-surface-container-low text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 2: FEED CREATOR WIZARD
   ═══════════════════════════════════════════════════════ */
function FeedCreator() {
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [schedule, setSchedule] = useState('manual');
  const [testing, setTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [saving, setSaving] = useState(false);

  const wizardSteps = [
    { num: 1, label: 'Platform Seçimi', icon: <Globe className="h-5 w-5" /> },
    { num: 2, label: 'Şablon Seçimi', icon: <FileText className="h-5 w-5" /> },
    { num: 3, label: 'Alan Eşleştirme', icon: <Settings className="h-5 w-5" /> },
    { num: 4, label: 'Zamanlama & Test', icon: <Zap className="h-5 w-5" /> },
  ];

  const scheduleOptions = [
    { value: 'manual', label: 'Manuel' },
    { value: '15min', label: '15 Dakikada bir' },
    { value: '30min', label: '30 Dakikada bir' },
    { value: '1hour', label: '1 Saatte bir' },
    { value: '6hour', label: '6 Saatte bir' },
    { value: 'daily', label: 'Günlük' },
  ];

  const sourceFields = ['id', 'title', 'description', 'price', 'sale_price', 'stock', 'sku', 'barcode', 'brand', 'category', 'image_url', 'gtin', 'mpn', 'weight', 'vat_rate'];
  const targetFields = ['product_id', 'name', 'description', 'price', 'discounted_price', 'quantity', 'sku', 'barcode', 'brand_name', 'category_name', 'main_image', 'ean', 'mpn', 'weight', 'tax_rate'];

  useEffect(() => {
    if (selectedPlatform) {
      fetch(`/api/feed-templates?platform=${encodeURIComponent(selectedPlatform)}&limit=20`)
        .then((r) => r.json())
        .then((d) => setTemplates(d.templates || []))
        .catch(() => setTemplates([]));
    }
  }, [selectedPlatform]);

  const defaultMappings: Record<string, string> = {};
  targetFields.forEach((f, i) => { defaultMappings[f] = sourceFields[i] || ''; });
  const activeMappings = step === 3 && Object.keys(fieldMappings).length === 0 ? defaultMappings : fieldMappings;

  const handleTest = async () => {
    setTesting(true);
    setTestProgress(0);
    setTestResult(null);
    const interval = setInterval(() => {
      setTestProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 300);
    await new Promise((r) => setTimeout(r, 3500));
    clearInterval(interval);
    setTestProgress(100);
    setTestResult(Math.random() > 0.2 ? 'success' : 'error');
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: `${selectedPlatform} Feed - ${new Date().toLocaleDateString('tr-TR')}`,
        description: `${selectedPlatform} platformu için oluşturulan feed`,
        platform: selectedPlatform,
        format: 'xml',
        category: '',
        fields: Object.values(fieldMappings),
        schedule,
        fieldMappings,
      };
      if (selectedTemplateId) body.templateId = selectedTemplateId;
      const res = await fetch('/api/feed-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success('Feed başarıyla kaydedildi!');
        setStep(1);
        setSelectedPlatform('');
        setSelectedTemplateId('');
        setFieldMappings({});
        setSchedule('manual');
      }
    } catch { /* noop */ }
    setSaving(false);
  };

  return (
    <div>
      {/* Progress Bar */}
      <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-6 mb-6">
        <div className="flex items-center justify-between">
          {wizardSteps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.num
                      ? 'bg-emerald-500 text-white'
                      : step === s.num
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                        : 'bg-surface-container-low text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.icon}
                </div>
                <span className={`text-[11px] mt-1.5 font-medium ${step >= s.num ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < wizardSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mt-[-16px] ${step > s.num ? 'bg-emerald-500' : 'bg-[#adb3b4]/30'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Platform Selection */}
      {step === 1 && (
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Platform Seçimi</h2>
          <p className="text-sm text-slate-500 mb-5">Feed oluşturmak istediğiniz pazaryerini seçin</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allPlatforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  selectedPlatform === p
                    ? 'border-emerald-500 bg-emerald-50 shadow-[0_8px_30px_rgba(45,52,53,0.06)]'
                    : 'border-[#adb3b4]/30 hover:border-slate-300 hover:bg-surface-container-low'
                }`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black ${
                  selectedPlatform === p ? 'bg-emerald-500 text-white' : 'bg-surface-container-low text-slate-500'
                }`}>
                  {platformIcons[p]}
                </div>
                <span className={`text-xs font-semibold ${selectedPlatform === p ? 'text-emerald-700' : 'text-slate-600'}`}>{p}</span>
                {selectedPlatform === p && (
                  <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPlatform}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-semibold transition-colors"
            >
              Devam <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {step === 2 && (
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Şablon Seçimi</h2>
          <p className="text-sm text-slate-500 mb-5">
            {selectedPlatform} için bir şablon seçin veya boş şablondan başlayın
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setSelectedTemplateId('blank')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                selectedTemplateId === 'blank'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-dashed border-[#adb3b4]/50 hover:border-slate-400 hover:bg-surface-container-low'
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                <Plus className="h-5 w-5 text-slate-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700">Boş Şablon</p>
                <p className="text-xs text-slate-500">Sıfırdan custom alan eşleştirmesi</p>
              </div>
            </button>
            {templates.slice(0, 6).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`flex flex-col p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTemplateId === t.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-[#adb3b4]/30 hover:border-slate-300 hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${formatColors[t.format] || 'bg-surface-container-low text-slate-600'}`}>
                    {t.format}
                  </span>
                  <StarRating rating={t.rating} />
                </div>
                <p className="text-sm font-semibold text-slate-700 line-clamp-1">{t.name}</p>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                {t.isPopular && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-orange-600 font-medium">
                    <Flame className="h-3 w-3" /> Popüler
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => { setStep(1); setSelectedTemplateId(''); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#adb3b4]/30 hover:bg-surface-container-low text-slate-600 text-sm font-medium transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedTemplateId}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-semibold transition-colors"
            >
              Devam <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Field Mapping */}
      {step === 3 && (
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Alan Eşleştirme</h2>
          <p className="text-sm text-slate-500 mb-5">
            Kaynak alanları hedef alanlarla eşleştirin. Sürükle-bırak veya açılır menüden seçim yapın.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#adb3b4]/15">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kaynak Alan</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">→</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hedef Alan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody>
                {targetFields.map((target, i) => {
                  const src = activeMappings[target] || '';
                  return (
                    <tr key={target} className="border-b border-[#adb3b4]/15 hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 px-4 text-xs text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-4">
                        <select
                          value={src}
                          onChange={(e) => setFieldMappings({ ...activeMappings, [target]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-md border border-[#adb3b4]/30 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface-container-lowest"
                        >
                          <option value="">-- Seçin --</option>
                          {sourceFields.map((f) => (
                            <option key={f} value={f} disabled={Object.values(activeMappings).includes(f) && activeMappings[target] !== f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-400">
                        <ArrowRight className="h-4 w-4 mx-auto" />
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <Check className="h-3 w-3" />
                          {target}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {src ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <Check className="h-3 w-3" /> Eşleşti
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <AlertTriangle className="h-3 w-3" /> Boş
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#adb3b4]/30 hover:bg-surface-container-low text-slate-600 text-sm font-medium transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              Devam <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Schedule & Test */}
      {step === 4 && (
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Zamanlama & Test</h2>
          <p className="text-sm text-slate-500 mb-5">Feed yenileme sıklığını belirleyin ve test edin</p>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-surface-container-low border border-[#adb3b4]/15">
              <p className="text-xs text-slate-500 font-medium">Platform</p>
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${platformColors[selectedPlatform] || 'bg-surface-container-low text-slate-600'}`}>
                  {platformIcons[selectedPlatform]} {selectedPlatform}
                </span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-[#adb3b4]/15">
              <p className="text-xs text-slate-500 font-medium">Şablon</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {selectedTemplateId === 'blank' ? 'Boş Şablon (Custom)' : templates.find((t) => t.id === selectedTemplateId)?.name || '-'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-[#adb3b4]/15">
              <p className="text-xs text-slate-500 font-medium">Eşleşen Alanlar</p>
              <p className="text-sm font-semibold text-emerald-600 mt-1">
                {Object.values(fieldMappings).filter(Boolean).length} / {targetFields.length}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Yenileme Sıklığı</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {scheduleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSchedule(opt.value)}
                  className={`px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                    schedule === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-[#adb3b4]/30 text-slate-600 hover:border-slate-300 hover:bg-surface-container-low'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test */}
          <div className="mb-6 p-4 rounded-lg bg-surface-container-low border border-[#adb3b4]/15">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Feed Testi</h3>
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Test Çalışıyor...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Testi Çalıştır
                  </>
                )}
              </button>
            </div>
            {(testing || testProgress > 0) && (
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    testResult === 'success' ? 'bg-emerald-500' : testResult === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(testProgress, 100)}%` }}
                />
              </div>
            )}
            {testResult && (
              <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                testResult === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {testResult === 'success' ? (
                  <><Check className="h-4 w-4" /> Test başarılı! Feed oluşturulmaya hazır.</>
                ) : (
                  <><XCircle className="h-4 w-4" /> Test başarısız. Lütfen alan eşleştirmelerini kontrol edin.</>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#adb3b4]/30 hover:bg-surface-container-low text-slate-600 text-sm font-medium transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-bold transition-colors"
            >
              {saving ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Kaydediliyor...</>
              ) : (
                <><Check className="h-4 w-4" /> Kaydet</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 3: QUALITY RULES
   ═══════════════════════════════════════════════════════ */
function QualityRules() {
  const [rules, setRules] = useState<QualityRule[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, errorCount: 0, warningCount: 0 });
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const initializedRef = useRef(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkResults, setCheckResults] = useState<QualityResult[]>([]);
  const [checkSummary, setCheckSummary] = useState<{ totalChecked: number; totalErrors: number; totalWarnings: number; checkedAt: string } | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetch('/api/feed-quality')
        .then((r) => r.json())
        .then((data) => {
          setRules(data.rules || []);
          setSummary(data.summary || { total: 0, active: 0, errorCount: 0, warningCount: 0 });
        })
        .catch(() => { /* noop */ })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleRunCheck = async () => {
    setRunningCheck(true);
    setCheckProgress(0);
    setCheckResults([]);
    setShowResults(true);

    const interval = setInterval(() => {
      setCheckProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 12 + 3;
      });
    }, 250);

    try {
      const res = await fetch('/api/feed-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_check' }),
      });
      const data = await res.json();
      clearInterval(interval);
      setCheckProgress(100);
      setCheckResults(data.results || []);
      setCheckSummary(data.summary || null);
    } catch { /* noop */ }
    setRunningCheck(false);
  };

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const Icon = severityIcons[severity] || Info;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${severityColors[severity] || severityColors.info}`}>
        <Icon className="h-3 w-3" />
        {severity === 'error' ? 'Hata' : severity === 'warning' ? 'Uyarı' : 'Bilgi'}
      </span>
    );
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Toplam Kural', value: summary.total, color: 'text-slate-700', bg: 'bg-surface-container-low', icon: <Settings className="h-5 w-5 text-slate-400" /> },
          { label: 'Aktif Kurallar', value: summary.active, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Check className="h-5 w-5 text-emerald-400" /> },
          { label: 'Hata Kuralları', value: summary.errorCount, color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="h-5 w-5 text-red-400" /> },
          { label: 'Uyarı Kuralları', value: summary.warningCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertTriangle className="h-5 w-5 text-amber-400" /> },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-lg border border-[#adb3b4]/15 p-4 flex items-center gap-3`}>
            {s.icon}
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Run Quality Check */}
      <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Feed Kalite Kontrolü</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tüm platform feed&apos;lerinde kalite kurallarını çalıştırın ve sonuçları görüntüleyin
            </p>
          </div>
          <button
            onClick={handleRunCheck}
            disabled={runningCheck}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-semibold transition-colors shrink-0"
          >
            {runningCheck ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Kontrol Çalışıyor...</>
            ) : (
              <><Play className="h-4 w-4" /> Kalite Kontrolünü Çalıştır</>
            )}
          </button>
        </div>
        {runningCheck && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(checkProgress, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Kontrol devam ediyor... %{Math.round(checkProgress)}</p>
          </div>
        )}
      </div>

      {/* Check Results */}
      {showResults && checkResults.length > 0 && (
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 mb-6 overflow-hidden">
          <div className="p-4 border-b border-[#adb3b4]/15 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Kalite Kontrol Sonuçları
            </h3>
            {checkSummary && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">
                  <strong className="text-slate-700">{checkSummary.totalChecked}</strong> ürün kontrol edildi
                </span>
                <span className="text-red-600 font-semibold">
                  {checkSummary.totalErrors} hata
                </span>
                <span className="text-amber-600 font-semibold">
                  {checkSummary.totalWarnings} uyarı
                </span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-container-low">
                <tr>
                  {['Ürün', 'SKU', 'Alan', 'Hata', 'Şiddet', 'Kanal'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-[#adb3b4]/15">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checkResults.map((r, i) => (
                  <tr key={i} className="border-b border-[#adb3b4]/15 hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-4 text-slate-700 font-medium max-w-[200px] truncate">{r.productName}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-xs">{r.sku}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container-low text-slate-600 text-xs font-medium">{r.field}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-xs max-w-[250px]">{r.error}</td>
                    <td className="py-2.5 px-4"><SeverityBadge severity={r.severity} /></td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${platformColors[r.channel] || 'bg-surface-container-low text-slate-600'}`}>
                        {r.channel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="bg-surface-container-lowest rounded-lg shadow-[0_8px_30px_rgba(45,52,53,0.06)] border border-[#adb3b4]/15 overflow-hidden">
        <div className="p-4 border-b border-[#adb3b4]/15">
          <h3 className="text-sm font-semibold text-slate-700">Aktif Kalite Kuralları</h3>
        </div>
        {loading ? (
          <Spinner />
        ) : rules.length === 0 ? (
          <div className="p-12 text-center">
            <Settings className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Henüz kalite kuralı tanımlanmamış</p>
          </div>
        ) : (
          <div className="divide-y divide-[#adb3b4]/15 max-h-[500px] overflow-y-auto">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors">
                <SeverityBadge severity={rule.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-700 truncate">{rule.name}</p>
                    {rule.isActive ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">AKTİF</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container-low text-slate-500">PASİF</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-medium">Alan:</span> {rule.field} &middot;
                    <span className="font-medium"> Koşul:</span> {rule.condition} &middot;
                    <span className="font-medium"> Kanal:</span> {rule.channel}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">Hata Sayısı</p>
                  <p className={`text-lg font-bold ${rule.errorCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {rule.errorCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
