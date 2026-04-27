'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, AlertTriangle, CheckCircle2, Eye, Plus, ChevronDown, ChevronUp,
  Sparkles, Target, BarChart3, RefreshCw, Tag, Image as ImageIcon, Type,
  ShieldCheck, FileText, Search
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface QualityScore {
  title: number;
  image: number;
  description: number;
  price: number;
  attributes: number;
  seo: number;
}

interface QualityIssue {
  type: 'warning' | 'suggestion' | 'error';
  message: string;
}

interface ListingItem {
  id: string;
  product: string;
  marketplace: string;
  overallScore: number;
  scores: QualityScore;
  issues: QualityIssue[];
}

const MOCK_LISTINGS: ListingItem[] = [
  {
    id: '1',
    product: 'Kablosuz Kulaklık Pro',
    marketplace: 'Hepsiburada',
    overallScore: 92,
    scores: { title: 95, image: 90, description: 88, price: 92, attributes: 96, seo: 91 },
    issues: [
      { type: 'suggestion', message: 'Ürün başlığına "2025 Model" ekleyerek güncelliği vurgulayın' },
      { type: 'suggestion', message: 'Açıklamaya daha fazla teknik özellik ekleyin' },
    ],
  },
  {
    id: '2',
    product: 'Akıllı Saat V2',
    marketplace: 'Trendyol',
    overallScore: 78,
    scores: { title: 80, image: 85, description: 72, price: 78, attributes: 70, seo: 83 },
    issues: [
      { type: 'warning', message: 'Ürün başlığı 50 karakter sınırına yakın (48/50)' },
      { type: 'warning', message: 'Ürün özelliklerinde "Renk" alanı eksik' },
      { type: 'suggestion', message: 'SEO açıklamasına anahtar kelimeler ekleyin' },
    ],
  },
  {
    id: '3',
    product: 'USB-C Hızlı Şarj',
    marketplace: 'Amazon TR',
    overallScore: 85,
    scores: { title: 88, image: 90, description: 80, price: 86, attributes: 82, seo: 84 },
    issues: [
      { type: 'suggestion', message: 'Ürün görsellerine infografik ekleyin' },
    ],
  },
  {
    id: '4',
    product: 'Bluetooth Hoparlör Mini',
    marketplace: 'Hepsiburada',
    overallScore: 45,
    scores: { title: 50, image: 30, description: 55, price: 60, attributes: 35, seo: 40 },
    issues: [
      { type: 'error', message: 'Ürün görselleri düşük kaliteli (minimum 1000x1000 px gerekli)' },
      { type: 'warning', message: 'Ürün açıklaması çok kısa (minimum 500 karakter)' },
      { type: 'error', message: 'Ürün özellikleri tamamlanmamış (%35 doluluk)' },
      { type: 'suggestion', message: 'Fiyat karşılaştırma verilerini güncelleyin' },
      { type: 'warning', message: 'SEO başlığı anahtar kelime içermiyor' },
    ],
  },
  {
    id: '5',
    product: 'Mekanik Klavye RGB',
    marketplace: 'Trendyol',
    overallScore: 68,
    scores: { title: 72, image: 65, description: 60, price: 75, attributes: 70, seo: 66 },
    issues: [
      { type: 'warning', message: 'Ürün başlığında marka bilgisi eksik' },
      { type: 'suggestion', message: 'Video içerik ekleyerek dönüşüm oranını artırın' },
      { type: 'warning', message: 'Açıklama alanında HTML etiketleri kullanılmamış' },
    ],
  },
];

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreBadge(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function getIssueIcon(type: string) {
  if (type === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <Sparkles className="h-4 w-4 text-blue-500" />;
}

const dimensionLabels: Record<keyof QualityScore, string> = {
  title: 'Başlık',
  image: 'Görsel',
  description: 'Açıklama',
  price: 'Fiyat',
  attributes: 'Özellik',
  seo: 'SEO',
};

export default function ListingQuality() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setListings(MOCK_LISTINGS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleEvaluate = (id?: string) => {
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
    }, 1500);
  };

  const filteredListings = listings.filter(l => 
    search ? l.product.toLowerCase().includes(search.toLowerCase()) || l.marketplace.toLowerCase().includes(search.toLowerCase()) : true
  );

  const avgScore = listings.length > 0 ? Math.round(listings.reduce((s, l) => s + l.overallScore, 0) / listings.length) : 0;
  const excellent = listings.filter((l) => l.overallScore >= 80).length;
  const needsImprovement = listings.filter((l) => l.overallScore < 60).length;

  const radarData = listings.length > 0
    ? Object.keys(dimensionLabels).map((key) => {
        const avg = Math.round(
          listings.reduce((s, l) => s + (l.scores as any)[key], 0) / listings.length
        );
        return { dimension: dimensionLabels[key as keyof QualityScore], değer: avg, tam: 100 };
      })
    : [];

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-md" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="h-80 rounded-md bg-slate-200" />
            <div className="h-80 lg:col-span-2 rounded-md bg-slate-200" />
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
              <Star className="h-5 w-5 text-white" />
            </div>
            Listeleme Kalitesi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ürün listeleme kalite puanlama ve iyileştirme önerileri</p>
        </div>
        <button 
          onClick={() => handleEvaluate()} 
          disabled={evaluating}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
          {evaluating ? 'Değerlendiriliyor...' : 'Tümünü Değerlendir'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-500" /> Ortalama Skor
            </p>
            <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}<span className="text-lg text-slate-400 font-normal">/100</span></p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${getScoreBg(avgScore)}`} style={{ width: `${avgScore}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mükemmel (≥80)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{excellent}</p>
            <p className="text-xs text-slate-400 mt-1">Listeleme</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <Star className="h-5 w-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">İyileştirme Gerekli (&lt;60)</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{needsImprovement}</p>
            <p className="text-xs text-slate-400 mt-1">Listeleme</p>
          </div>
          <div className="p-2.5 rounded-md bg-red-50 border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Değerlendirme</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{listings.length}</p>
            <p className="text-xs text-slate-400 mt-1">Ürün</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-800">Kalite Boyutları</h2>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Ortalama Skor" dataKey="değer" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Main Content Area (Table) */}
        <div className="lg:col-span-2 bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Ürün adı veya pazaryeri ara..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Ürün & Pazaryeri</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-24">Genel Skor</th>
                  <th className="py-3 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-20" title="Başlık"><Type className="h-4 w-4 mx-auto"/></th>
                  <th className="py-3 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-20" title="Görsel"><ImageIcon className="h-4 w-4 mx-auto"/></th>
                  <th className="py-3 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-20" title="Açıklama"><FileText className="h-4 w-4 mx-auto"/></th>
                  <th className="py-3 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-20" title="Fiyat"><Tag className="h-4 w-4 mx-auto"/></th>
                  <th className="py-3 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-20" title="Özellik"><ShieldCheck className="h-4 w-4 mx-auto"/></th>
                  <th className="py-3 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center w-20" title="SEO"><Search className="h-4 w-4 mx-auto"/></th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Kriterlere uygun ürün bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <React.Fragment key={listing.id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${expandedId === listing.id ? 'bg-slate-50' : ''}`}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 line-clamp-1" title={listing.product}>{listing.product}</p>
                          <span className="inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {listing.marketplace}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold border ${getScoreBadge(listing.overallScore)}`}>
                            {listing.overallScore}
                          </span>
                        </td>
                        {['title', 'image', 'description', 'price', 'attributes', 'seo'].map((key) => {
                          const val = (listing.scores as Record<string, number>)[key];
                          return (
                            <td key={key} className="py-3 px-2">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-[11px] font-bold ${getScoreColor(val)}`}>{val}</span>
                                <div className="w-10 bg-slate-100 rounded-full h-1">
                                  <div className={`h-full rounded-full ${getScoreBg(val)}`} style={{ width: `${val}%` }} />
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEvaluate(listing.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Yeniden Değerlendir"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                              title="Detayları Gör"
                            >
                              {expandedId === listing.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedId === listing.id && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={9} className="p-0">
                            <div className="px-6 py-5 border-l-4 border-l-emerald-500 shadow-inner">
                              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-600" /> İyileştirme Önerileri
                              </h4>
                              
                              {listing.issues.length === 0 ? (
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-md">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                  <p className="text-sm font-medium text-emerald-700">Harika! Bu ürün listelemesinde iyileştirilmesi gereken bir sorun bulunamadı.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {listing.issues.map((issue, idx) => (
                                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-md border ${
                                      issue.type === 'error' ? 'bg-red-50 border-red-200' :
                                      issue.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                                      'bg-blue-50 border-blue-200'
                                    }`}>
                                      <div className="mt-0.5 shrink-0">{getIssueIcon(issue.type)}</div>
                                      <p className={`text-sm font-medium ${
                                        issue.type === 'error' ? 'text-red-700' :
                                        issue.type === 'warning' ? 'text-amber-700' :
                                        'text-blue-700'
                                      }`}>
                                        {issue.message}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}