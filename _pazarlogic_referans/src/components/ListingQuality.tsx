'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Star,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

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

const demoListings: ListingItem[] = [
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
  {
    id: '6',
    product: 'Gaming Mouse Ergonomik',
    marketplace: 'Amazon TR',
    overallScore: 88,
    scores: { title: 90, image: 92, description: 85, price: 88, attributes: 86, seo: 89 },
    issues: [
      { type: 'suggestion', message: 'A/B testi ile başlık optimizasyonu yapın' },
    ],
  },
  {
    id: '7',
    product: 'Webcam HD 1080p',
    marketplace: 'Hepsiburada',
    overallScore: 55,
    scores: { title: 60, image: 45, description: 58, price: 65, attributes: 50, seo: 52 },
    issues: [
      { type: 'error', message: 'Ürün görsellerinde arka plan düzensiz' },
      { type: 'warning', message: 'Ürün başlığı anahtar kelimeleri içermiyor' },
      { type: 'warning', message: 'SEO meta açıklaması çok kısa' },
      { type: 'suggestion', message: 'Müşteri soruları bölümünü güncelleyin' },
    ],
  },
  {
    id: '8',
    product: 'Powerbank 20000mAh',
    marketplace: 'Trendyol',
    overallScore: 82,
    scores: { title: 85, image: 80, description: 82, price: 84, attributes: 78, seo: 83 },
    issues: [
      { type: 'suggestion', message: 'Farklı açılardan ürün görselleri ekleyin' },
      { type: 'suggestion', message: 'Kullanım videosu ekleyin' },
    ],
  },
];

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreBadge(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function getIssueIcon(type: string) {
  if (type === 'error') return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
  if (type === 'warning') return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
  return <Sparkles className="h-3.5 w-3.5 text-blue-500" />;
}

const dimensionLabels: Record<string, string> = {
  title: 'Başlık',
  image: 'Görsel',
  description: 'Açıklama',
  price: 'Fiyat',
  attributes: 'Özellik',
  seo: 'SEO',
};

export default function ListingQuality() {
  const { sidebarOpen } = useAppStore();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetch('/api/listing-quality')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.listings) && data.listings.length > 0) {
          setListings(data.listings);
        } else {
          setListings(demoListings);
        }
      })
      .catch(() => {
        setListings(demoListings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEvaluate = (id?: string) => {
    setEvaluating(true);
    fetch('/api/listing-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'evaluate', id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => {})
      .finally(() => setTimeout(() => setEvaluating(false), 1500));
  };

  const avgScore = listings.length > 0
    ? Math.round(listings.reduce((s, l) => s + l.overallScore, 0) / listings.length)
    : 0;
  const excellent = listings.filter((l) => l.overallScore > 80).length;
  const needsImprovement = listings.filter((l) => l.overallScore < 60).length;

  const radarData = listings.length > 0
    ? Object.keys(dimensionLabels).map((key) => {
        const avg = Math.round(
          listings.reduce((s, l) => s + (l.scores as unknown as Record<string, number>)[key], 0) / listings.length
        );
        return { dimension: dimensionLabels[key], değer: avg, tam: 100 };
      })
    : [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Listeleme Kalitesi</h1>
        <p className="mb-6 text-slate-500">Ürün listeleme kalite puanlama</p>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Listeleme Kalitesi</h1>
        <p className="text-slate-500 mt-1">Ürün listeleme kalite puanlama ve iyileştirme önerileri</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Ortalama Skor</p>
              <p className="text-2xl font-bold mt-1">{avgScore}/100</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Mükemmel (&gt;80)</p>
              <p className="text-2xl font-bold mt-1">{excellent}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Star className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">İyileştirme Gerekli (&lt;60)</p>
              <p className="text-2xl font-bold mt-1">{needsImprovement}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Değerlendirme</p>
              <p className="text-2xl font-bold mt-1">{listings.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Kalite Boyutları</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} stroke="#64748b" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Radar name="Ortalama Skor" dataKey="değer" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-800">Kalite Tablosu</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEvaluate()}
              disabled={evaluating}
            >
              {evaluating ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1" />
              )}
              {evaluating ? 'Değerlendiriliyor...' : 'Tümünü Değerlendir'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Ürün</th>
                  <th className="text-left py-3 px-3 text-slate-500 font-medium">Pazaryeri</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Genel Skor</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Başlık</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Görsel</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Açıklama</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Fiyat</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">Özellik</th>
                  <th className="text-center py-3 px-3 text-slate-500 font-medium">SEO</th>
                  <th className="text-right py-3 px-3 text-slate-500 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-[150px] truncate">{listing.product}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-xs">{listing.marketplace}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getScoreBadge(listing.overallScore)}`}>
                        {listing.overallScore}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getScoreBarColor(listing.scores.title)}`} style={{ width: `${listing.scores.title}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-7 text-right ${getScoreColor(listing.scores.title)}`}>{listing.scores.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getScoreBarColor(listing.scores.image)}`} style={{ width: `${listing.scores.image}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-7 text-right ${getScoreColor(listing.scores.image)}`}>{listing.scores.image}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getScoreBarColor(listing.scores.description)}`} style={{ width: `${listing.scores.description}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-7 text-right ${getScoreColor(listing.scores.description)}`}>{listing.scores.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getScoreBarColor(listing.scores.price)}`} style={{ width: `${listing.scores.price}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-7 text-right ${getScoreColor(listing.scores.price)}`}>{listing.scores.price}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getScoreBarColor(listing.scores.attributes)}`} style={{ width: `${listing.scores.attributes}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-7 text-right ${getScoreColor(listing.scores.attributes)}`}>{listing.scores.attributes}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getScoreBarColor(listing.scores.seo)}`} style={{ width: `${listing.scores.seo}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-7 text-right ${getScoreColor(listing.scores.seo)}`}>{listing.scores.seo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs"
                          onClick={() => handleEvaluate(listing.id)}>
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs"
                          onClick={() => toggleExpand(listing.id)}>
                          {expandedId === listing.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expanded Issues */}
      {expandedId && (() => {
        const listing = listings.find((l) => l.id === expandedId);
        if (!listing) return null;
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {listing.product} - Sorunlar ve Öneriler
              </h3>
              <Badge className={getScoreBadge(listing.overallScore)}>
                Skor: {listing.overallScore}/100
              </Badge>
            </div>
            {listing.issues.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-600 font-medium">Harika! Herhangi bir sorun bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {listing.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      issue.type === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : issue.type === 'warning'
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {getIssueIcon(issue.type)}
                    <p className={`text-sm ${
                      issue.type === 'error'
                        ? 'text-red-700'
                        : issue.type === 'warning'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}>
                      {issue.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid grid-cols-6 gap-3">
              {Object.entries(dimensionLabels).map(([key, label]) => {
                const val = (listing.scores as unknown as Record<string, number>)[key];
                return (
                  <div key={key} className="text-center">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <Progress value={val} className="h-2 mb-1" />
                    <p className={`text-sm font-bold ${getScoreColor(val)}`}>{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
