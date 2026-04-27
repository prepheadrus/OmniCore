'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, FileText, Image, Type, ShieldCheck, Plus,
  AlertTriangle, Wand2, Eye, Search, Settings, Tag, Layers, CheckCircle, Save
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContentRule {
  id: string; 
  name: string; 
  type: string; 
  status: string; 
  priority: number;
  description: string; 
  template: string; 
  channel: string; 
  category: string;
  createdAt: string; 
  applyCount: number;
}

interface QualityScore {
  category: string; 
  totalProducts: number; 
  validProducts: number; 
  score: number;
  issues: { missing_images: number; short_title: number; missing_gtin: number; short_description: number };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  title_template: { label: 'Başlık Şablonu', icon: Type, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  description_template: { label: 'Açıklama Şablonu', icon: FileText, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  image_requirement: { label: 'Görsel Kuralı', icon: Image, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  field_validation: { label: 'Alan Doğrulama', icon: ShieldCheck, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  price_validation: { label: 'Fiyat Doğrulama', icon: Tag, color: 'bg-red-50 text-red-700 border-red-200' },
};

const CHANNEL_LABELS: Record<string, string> = {
  all: 'Tüm Kanallar', trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', amazon: 'Amazon TR', n11: 'n11', website: 'Web Sitesi',
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_DATA = {
  summary: {
    totalRules: 12,
    activeRules: 9,
    totalApplied: 4850,
    avgQualityScore: 86
  },
  rules: [
    {
      id: 'r1',
      name: 'Trendyol Standart Başlık Formatı',
      type: 'title_template',
      status: 'active',
      priority: 10,
      description: 'Marka, model ve anahtar kelimeleri birleştirerek SEO uyumlu Trendyol başlığı oluşturur.',
      template: '{Marka} {Model} - {Renk} {Boyut} | {AnahtarKelime}',
      channel: 'trendyol',
      category: 'Elektronik',
      createdAt: '2025-01-10T10:00:00Z',
      applyCount: 1250
    },
    {
      id: 'r2',
      name: 'Eksik Görsel Kontrolü (Min 3)',
      type: 'image_requirement',
      status: 'active',
      priority: 20,
      description: 'En az 3 yüksek çözünürlüklü görsele sahip olmayan ürünleri yayınlamaz.',
      template: 'min_images >= 3 AND image_resolution >= 800x800',
      channel: 'all',
      category: 'Tüm Kategoriler',
      createdAt: '2025-01-12T14:30:00Z',
      applyCount: 4850
    },
    {
      id: 'r3',
      name: 'Amazon TR Açıklama Optimizasyonu',
      type: 'description_template',
      status: 'paused',
      priority: 15,
      description: 'Amazon kurallarına uygun, maddeler halinde (bullet points) açıklama şablonu.',
      template: '• {Özellik1}\n• {Özellik2}\n• Garanti: {Garanti}',
      channel: 'amazon',
      category: 'Tüm Kategoriler',
      createdAt: '2025-01-15T09:15:00Z',
      applyCount: 840
    }
  ],
  qualityScores: [
    {
      category: 'Elektronik',
      totalProducts: 1500,
      validProducts: 1350,
      score: 90,
      issues: { missing_images: 12, short_title: 45, missing_gtin: 5, short_description: 88 }
    },
    {
      category: 'Moda & Giyim',
      totalProducts: 3200,
      validProducts: 2400,
      score: 75,
      issues: { missing_images: 150, short_title: 320, missing_gtin: 120, short_description: 210 }
    },
    {
      category: 'Ev & Yaşam',
      totalProducts: 850,
      validProducts: 720,
      score: 84,
      issues: { missing_images: 30, short_title: 15, missing_gtin: 40, short_description: 45 }
    }
  ]
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ContentRules() {
  const [data, setData] = useState<{ rules: ContentRule[]; qualityScores: QualityScore[]; summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState<'rules' | 'quality'>('rules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRule, setPreviewRule] = useState<ContentRule | null>(null);

  const [form, setForm] = useState({
    name: '', type: 'title_template', channel: 'all', category: 'Tüm Kategoriler',
    description: '', template: '', priority: 10,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (!form.name.trim()) return;
    const newRule: ContentRule = {
      id: `r${Date.now()}`,
      name: form.name,
      type: form.type,
      status: 'active',
      priority: form.priority,
      description: form.description,
      template: form.template,
      channel: form.channel,
      category: form.category,
      createdAt: new Date().toISOString(),
      applyCount: 0
    };
    
    setData(prev => prev ? {
      ...prev,
      rules: [newRule, ...prev.rules],
      summary: { ...prev.summary, totalRules: prev.summary.totalRules + 1, activeRules: prev.summary.activeRules + 1 }
    } : null);
    
    setDialogOpen(false);
    setForm({ name: '', type: 'title_template', channel: 'all', category: 'Tüm Kategoriler', description: '', template: '', priority: 10 });
  };

  const filteredRules = (data?.rules || []).filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    return true;
  });

  const simulatePreview = (rule: ContentRule) => {
    const samples: Record<string, Record<string, string>> = {
      title_template: { '{Marka}': 'Apple', '{Model}': 'iPhone 15 Pro', '{Renk}': 'Siyah', '{Boyut}': '256GB', '{AnahtarKelime}': 'Garantili' },
      description_template: { '{Özellik1}': 'A17 Pro çip', '{Özellik2}': '48MP kamera', '{Garanti}': '2 Yıl Apple Türkiye' },
      image_requirement: { 'min_images': '5', 'first_bg': 'white', 'min_width': '1000', 'min_height': '1000' },
      field_validation: { 'gtin': '8901234567890', 'barcode': '8901234567890', 'brand': 'Apple', 'warranty': '2 Yıl' },
      price_validation: { 'max_decimals': '2', 'no_currency_symbol': 'true' },
    };
    let result = rule.template;
    const vars = samples[rule.type] || {};
    Object.entries(vars).forEach(([key, value]) => { 
      result = result.split(key).join(value); 
    });
    return result;
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="h-96 rounded-md bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            İçerik Optimizasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ürün içeriklerinizi kurallarla otomatik optimize edin ve kaliteyi artırın</p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Yeni Kural Ekle
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Kural</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{data.summary.totalRules}</p>
            <p className="text-xs text-slate-400 mt-1">{data.summary.activeRules} aktif kural</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100"><Layers className="h-5 w-5 text-blue-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uygulama</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{data.summary.totalApplied.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-slate-400 mt-1">ürüne uygulandı</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100"><Wand2 className="h-5 w-5 text-emerald-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ort. Kalite Skoru</p>
              <div className="p-1.5 rounded-md bg-violet-50 border border-violet-100"><ShieldCheck className="h-3.5 w-3.5 text-violet-600" /></div>
            </div>
            <p className={`text-2xl font-bold ${data.summary.avgQualityScore >= 90 ? 'text-emerald-600' : data.summary.avgQualityScore >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{data.summary.avgQualityScore}/100</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div className={`h-1.5 rounded-full ${data.summary.avgQualityScore >= 90 ? 'bg-emerald-500' : data.summary.avgQualityScore >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${data.summary.avgQualityScore}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hata Oranı</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{100 - data.summary.avgQualityScore}%</p>
            <p className="text-xs text-slate-400 mt-1">düzeltme gerekli</p>
          </div>
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-100"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'rules', label: 'İçerik Kuralları', icon: Settings },
          { id: 'quality', label: 'Kalite Skorları', icon: ShieldCheck },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content: Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input placeholder="Kural ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
              <option value="all">Tüm Tipler</option>
              <option value="title_template">Başlık Şablonu</option>
              <option value="description_template">Açıklama Şablonu</option>
              <option value="image_requirement">Görsel Kuralı</option>
              <option value="field_validation">Alan Doğrulama</option>
              <option value="price_validation">Fiyat Doğrulama</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredRules.length === 0 ? (
              <div className="bg-white rounded-md border border-slate-200 shadow-sm p-12 text-center text-slate-500">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-base font-medium text-slate-700">Henüz içerik kuralı tanımlanmamış</p>
                <p className="text-sm mt-1">Yukarıdaki butonla yeni kural ekleyebilirsiniz</p>
              </div>
            ) : (
              filteredRules.map(rule => {
                const typeInfo = TYPE_LABELS[rule.type] || TYPE_LABELS.field_validation;
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={rule.id} className={`bg-white rounded-md border shadow-sm transition-all overflow-hidden flex flex-col md:flex-row ${rule.status === 'active' ? 'border-l-4 border-l-emerald-500 border-y-slate-200 border-r-slate-200' : 'border-l-4 border-l-slate-300 border-y-slate-200 border-r-slate-200'}`}>
                    <div className="p-5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-base mr-2">{rule.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${typeInfo.color}`}>
                          <TypeIcon className="h-3 w-3" /> {typeInfo.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {CHANNEL_LABELS[rule.channel] || rule.channel}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          Prio: {rule.priority}
                        </span>
                        {rule.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3"/> Aktif</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Duraklatıldı</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{rule.description}</p>
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-md px-3 py-2.5 text-xs font-mono text-slate-700 mb-4 overflow-x-auto whitespace-pre-wrap">
                        <span className="text-slate-400 font-sans font-semibold mr-2 select-none">Kural / Şablon:</span>
                        {rule.template}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-slate-400"/> Kategori: <strong className="text-slate-700">{rule.category}</strong></span>
                        <span className="flex items-center gap-1.5"><Wand2 className="h-3.5 w-3.5 text-slate-400"/> Uygulama: <strong className="text-slate-700">{rule.applyCount.toLocaleString('tr-TR')} ürün</strong></span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-4 md:w-48 flex md:flex-col justify-end md:justify-center gap-3">
                      <button onClick={() => { setPreviewRule(rule); setPreviewOpen(true); }} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md transition-colors shadow-sm">
                        <Eye className="h-4 w-4" /> Önizle
                      </button>
                      <button className={`w-full flex items-center justify-center gap-2 px-3 py-2 border text-xs font-medium rounded-md transition-colors shadow-sm ${rule.status === 'active' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
                        {rule.status === 'active' ? 'Duraklat' : 'Aktifleştir'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Content: Quality Scores */}
      {activeTab === 'quality' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-base font-semibold text-slate-800">Kategori Bazlı İçerik Kalitesi</h3>
            <p className="text-sm text-slate-500 mt-1">Ürünlerin kategori bazlı içerik doluluk oranları ve eksikleri</p>
          </div>
          <div className="p-6 space-y-8">
            {data.qualityScores.map(qs => (
              <div key={qs.category} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-800">{qs.category}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {qs.validProducts.toLocaleString('tr-TR')} / {qs.totalProducts.toLocaleString('tr-TR')} Geçerli
                    </span>
                  </div>
                  <span className={`text-xl font-bold ${qs.score >= 90 ? 'text-emerald-600' : qs.score >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{qs.score}/100</span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full ${qs.score >= 90 ? 'bg-emerald-500' : qs.score >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${qs.score}%` }}></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Image className="h-3.5 w-3.5"/> Eksik Görsel</span>
                    <span className="text-sm font-bold text-slate-700">{qs.issues.missing_images}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Type className="h-3.5 w-3.5"/> Kısa Başlık</span>
                    <span className="text-sm font-bold text-slate-700">{qs.issues.short_title}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5"/> Eksik GTIN</span>
                    <span className="text-sm font-bold text-slate-700">{qs.issues.missing_gtin}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5"/> Kısa Açıklama</span>
                    <span className="text-sm font-bold text-slate-700">{qs.issues.short_description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Şablon Önizleme</h2>
              <p className="text-sm text-slate-500 mt-1">{previewRule?.name}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="rounded-md border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Orijinal Şablon / Kural</p>
                <div className="bg-slate-50 p-3 rounded font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                  {previewRule?.template}
                </div>
              </div>
              <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Uygulandıktan Sonra (Örnek)</p>
                <div className="bg-white p-3 rounded font-medium text-sm text-slate-800 whitespace-pre-wrap border border-emerald-100 shadow-sm">
                  {previewRule ? simulatePreview(previewRule) : ''}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => setPreviewOpen(false)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Rule Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-600"/> Yeni İçerik Kuralı Ekle</h2>
              <p className="text-sm text-slate-500 mt-1">Ürün içeriklerinizi otomatik optimize eden kurallar tanımlayın.</p>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kural Adı</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="örn: Trendyol Başlık Formatı" className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kural Tipi</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 bg-white">
                    <option value="title_template">Başlık Şablonu</option>
                    <option value="description_template">Açıklama Şablonu</option>
                    <option value="image_requirement">Görsel Kuralı</option>
                    <option value="field_validation">Alan Doğrulama</option>
                    <option value="price_validation">Fiyat Doğrulama</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kanal</label>
                  <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 bg-white">
                    <option value="all">Tüm Kanallar</option>
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                    <option value="amazon">Amazon TR</option>
                    <option value="n11">n11</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Kategori</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="örn: Elektronik veya Tümü" className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Öncelik (1-100)</label>
                  <input type="number" min="1" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Açıklama</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kuralın ne yaptığını kısaca açıklayın..." className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Şablon / Kural</span>
                  <span className="text-[10px] text-slate-400 font-normal normal-case">Değişkenleri {'{Değişken}'} formatında yazın</span>
                </label>
                <textarea 
                  value={form.template} 
                  onChange={e => setForm(f => ({ ...f, template: e.target.value }))} 
                  placeholder="{Marka} {Model} - {Renk} {Boyut}" 
                  className="w-full px-3 py-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 font-mono min-h-[100px] resize-y" 
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setDialogOpen(false)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors shadow-sm">
                İptal
              </button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.template.trim()} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Save className="h-4 w-4" /> Kuralı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
