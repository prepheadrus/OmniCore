'use client';

import { useState, useMemo } from 'react';
import {
  MessageSquareHeart,
  Star,
  ThumbsUp,
  Minus,
  ThumbsDown,
  RefreshCw,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Reply,
  Flag,
  Eye,
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  ChevronDown,
  X,
  Send,
  BarChart3,
  Hash,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Sentiment = 'olumlu' | 'notr' | 'olumsuz';

interface Review {
  id: string;
  comment: string;
  rating: number;
  customer: string;
  platform: string;
  product: string;
  sentiment: Sentiment;
  date: string;
  replied: boolean;
  replyText?: string;
  flagged: boolean;
}

interface ProductSummary {
  id: string;
  name: string;
  avgRating: number;
  reviewCount: number;
  platform: string;
  positive: number;
  negative: number;
}

interface TrendData {
  month: string;
  olumlu: number;
  notr: number;
  olumsuz: number;
  avgRating: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const mockReviews: Review[] = [
  {
    id: 'R001',
    comment:
      'Harika bir ürün! Çok beğendim, kalitesi gerçekten üst düzey. Kesinlikle tavsiye ederim.',
    rating: 5,
    customer: 'Ahmet Yılmaz',
    platform: 'Trendyol',
    product: 'Kablosuz Kulaklık Pro',
    sentiment: 'olumlu',
    date: '2025-01-10',
    replied: true,
    replyText: 'Değerli yorumunuz için teşekkür ederiz!',
    flagged: false,
  },
  {
    id: 'R002',
    comment:
      'Ürün beklediğim gibi değildi. Kargo geç geldi ve ambalaj hasarlıydı. İade etmek istiyorum.',
    rating: 2,
    customer: 'Elif Demir',
    platform: 'Hepsiburada',
    product: 'Akıllı Saat X200',
    sentiment: 'olumsuz',
    date: '2025-01-09',
    replied: false,
    flagged: false,
  },
  {
    id: 'R003',
    comment: 'İdare eder. Fiyat/performans oranı makul ama daha iyi olabilir.',
    rating: 3,
    customer: 'Mehmet Kaya',
    platform: 'Amazon TR',
    product: 'Bluetooth Hoparlör Mini',
    sentiment: 'notr',
    date: '2025-01-08',
    replied: false,
    flagged: false,
  },
  {
    id: 'R004',
    comment:
      'Hızlı kargo ve mükemmel paketleme! Ürün fotoğraftaki gibi, çok memnunum.',
    rating: 5,
    customer: 'Ayşe Çelik',
    platform: 'Trendyol',
    product: 'Organik Cilt Bakım Seti',
    sentiment: 'olumlu',
    date: '2025-01-07',
    replied: true,
    replyText: 'Memnuniyetiniz bizim için çok değerli!',
    flagged: false,
  },
  {
    id: 'R005',
    comment:
      'Ürün çalışmıyor! Açtığımda bozuk çıktı. Parama yazık. Kesinlikle almayın.',
    rating: 1,
    customer: 'Fatma Şahin',
    platform: 'Hepsiburada',
    product: 'Kablosuz Kulaklık Pro',
    sentiment: 'olumsuz',
    date: '2025-01-06',
    replied: false,
    flagged: true,
  },
  {
    id: 'R006',
    comment:
      'Çok güzel bir tasarım ve malzeme. Ofis için birebir. Arkadaşlarıma da önerdim.',
    rating: 4,
    customer: 'Ali Öztürk',
    platform: 'Trendyol',
    product: 'Ergonomik Ofis Sandalyesi',
    sentiment: 'olumlu',
    date: '2025-01-05',
    replied: false,
    flagged: false,
  },
  {
    id: 'R007',
    comment: 'Normal bir ürün. Beklentimi karşıladı ama hayran bırakmadı.',
    rating: 3,
    customer: 'Zeynep Arslan',
    platform: 'Amazon TR',
    product: 'Yoga Matı Premium',
    sentiment: 'notr',
    date: '2025-01-04',
    replied: false,
    flagged: false,
  },
  {
    id: 'R008',
    comment:
      'Müşteri hizmetleri çok ilgisiz. Sorunuma çözüm bulamadılar. Ürün de vasat.',
    rating: 2,
    customer: 'Burak Koç',
    platform: 'Hepsiburada',
    product: 'Akıllı Saat X200',
    sentiment: 'olumsuz',
    date: '2025-01-03',
    replied: false,
    flagged: false,
  },
  {
    id: 'R009',
    comment:
      'İkinci kez alıyorum, yine çok memnunum. Kalitesi değişmedi, tavsiye ederim herkese.',
    rating: 5,
    customer: 'Selin Aydın',
    platform: 'Trendyol',
    product: 'Organik Cilt Bakım Seti',
    sentiment: 'olumlu',
    date: '2025-01-02',
    replied: true,
    replyText: 'Bizi tercih ettiğiniz için teşekkürler!',
    flagged: false,
  },
  {
    id: 'R010',
    comment:
      'Renk farklı geldi, fotoğraftaki gibi değil. Ama kalite fena değil.',
    rating: 3,
    customer: 'Emre Yıldız',
    platform: 'Amazon TR',
    product: 'Ergonomik Ofis Sandalyesi',
    sentiment: 'notr',
    date: '2025-01-01',
    replied: false,
    flagged: false,
  },
  {
    id: 'R011',
    comment:
      'Süper ses kalitesi! Bass tam istediğim gibi. Bluetooth bağlantısı da çok stabil.',
    rating: 5,
    customer: 'Deniz Polat',
    platform: 'Hepsiburada',
    product: 'Bluetooth Hoparlör Mini',
    sentiment: 'olumlu',
    date: '2024-12-30',
    replied: false,
    flagged: false,
  },
  {
    id: 'R012',
    comment:
      'Batarya ömrü çok kısa. 2 saatte bitiyor. Bu fiyata bu performans kabul edilemez.',
    rating: 1,
    customer: 'Ceren Aktaş',
    platform: 'Trendyol',
    product: 'Akıllı Saat X200',
    sentiment: 'olumsuz',
    date: '2024-12-28',
    replied: false,
    flagged: true,
  },
];

const mockProductSummaries: ProductSummary[] = [
  {
    id: 'P001',
    name: 'Kablosuz Kulaklık Pro',
    avgRating: 3.5,
    reviewCount: 128,
    platform: 'Trendyol',
    positive: 72,
    negative: 56,
  },
  {
    id: 'P002',
    name: 'Akıllı Saat X200',
    avgRating: 2.8,
    reviewCount: 95,
    platform: 'Hepsiburada',
    positive: 38,
    negative: 57,
  },
  {
    id: 'P003',
    name: 'Bluetooth Hoparlör Mini',
    avgRating: 4.0,
    reviewCount: 67,
    platform: 'Amazon TR',
    positive: 45,
    negative: 22,
  },
  {
    id: 'P004',
    name: 'Organik Cilt Bakım Seti',
    avgRating: 4.7,
    reviewCount: 203,
    platform: 'Trendyol',
    positive: 178,
    negative: 25,
  },
  {
    id: 'P005',
    name: 'Ergonomik Ofis Sandalyesi',
    avgRating: 3.8,
    reviewCount: 56,
    platform: 'Trendyol',
    positive: 34,
    negative: 22,
  },
  {
    id: 'P006',
    name: 'Yoga Matı Premium',
    avgRating: 3.3,
    reviewCount: 42,
    platform: 'Amazon TR',
    positive: 18,
    negative: 24,
  },
];

const mockTrends: TrendData[] = [
  { month: 'Ağustos', olumlu: 62, notr: 22, olumsuz: 16, avgRating: 3.9 },
  { month: 'Eylül', olumlu: 58, notr: 24, olumsuz: 18, avgRating: 3.7 },
  { month: 'Ekim', olumlu: 65, notr: 20, olumsuz: 15, avgRating: 4.0 },
  { month: 'Kasım', olumlu: 55, notr: 25, olumsuz: 20, avgRating: 3.6 },
  { month: 'Aralık', olumlu: 60, notr: 22, olumsuz: 18, avgRating: 3.8 },
  { month: 'Ocak', olumlu: 50, notr: 25, olumsuz: 25, avgRating: 3.5 },
];

const commonKeywords: string[] = [
  'Kaliteli',
  'Hızlı Kargo',
  'İade',
  'Fiyat/Performans',
  'Paketleme',
  'Müşteri Hizmetleri',
  'Batarya',
  'Ses Kalitesi',
  'Tasarım',
  'Malzeme',
  'Renk Farklı',
  'Çalışmıyor',
  'Çok Beğendim',
  'Bozuk Çıktı',
  'Memnunum',
  'İlgi',
  'İkinci Alım',
  'Tavsiye Ederim',
];

const mockAiInsights = [
  {
    title: 'Genel Değerlendirme',
    text: 'Son 30 günde toplam 12 yorum analiz edildi. Olumlu yorum oranı %50, olumsuz yorum oranı %25 seviyesinde. Genel müşteri memnuniyeti 3.5/4.0 aralığından 3.2 seviyesine geriledi.',
    type: 'warning' as const,
  },
  {
    title: 'Kritik Ürün Uyarısı',
    text: '"Akıllı Saat X200" ürününde olumsuz yorum oranı %60\'a ulaştı. Batarya ömrü ve ürün çalışmaması başta olmak üzere ciddi şikayetler mevcut. Acil kalite kontrol önerilir.',
    type: 'danger' as const,
  },
  {
    title: 'Olumlu Trend',
    text: '"Organik Cilt Bakım Seti" ve "Bluetooth Hoparlör Mini" ürünlerinde yüksek memnuniyet devam ediyor. Tekrar alım oranı %35 ile sektör ortalamasının üzerinde.',
    type: 'success' as const,
  },
  {
    title: 'Platform Analizi',
    text: 'Hepsiburada\'daki yorumlar daha eleştirel (%38 olumsuz), Trendyol\'da ise genel memnuniyet daha yüksek (%55 olumlu). Platform bazlı strateji güncellemesi önerilir.',
    type: 'info' as const,
  },
  {
    title: 'Öncelikli Aksiyon',
    text: 'Yanıtlanmamış 9 yorum bulunmaktadır. Özellikle 1-2 puan alan yorumlara acil yanıt verilmesi, müşteri kaybını önlemek için kritik önem taşımaktadır.',
    type: 'warning' as const,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const sentimentConfig: Record<
  Sentiment,
  { label: string; color: string; bg: string; border: string }
> = {
  olumlu: {
    label: 'Olumlu',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  notr: {
    label: 'Nötr',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  olumsuz: {
    label: 'Olumsuz',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

const platformColors: Record<string, string> = {
  Trendyol: 'bg-orange-100 text-orange-700 border-orange-200',
  Hepsiburada: 'bg-violet-100 text-violet-700 border-violet-200',
  'Amazon TR': 'bg-amber-100 text-amber-700 border-amber-200',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReviewAnalysis() {
  const { sidebarOpen } = useAppStore();

  /* ----- local state ----- */
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [detailTarget, setDetailTarget] = useState<Review | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* ----- computed stats ----- */
  const stats = useMemo(() => {
    const total = reviews.length;
    const olumlu = reviews.filter((r) => r.sentiment === 'olumlu').length;
    const notr = reviews.filter((r) => r.sentiment === 'notr').length;
    const olumsuz = reviews.filter((r) => r.sentiment === 'olumsuz').length;
    const avgRating =
      total > 0
        ? (reviews.reduce((a, b) => a + b.rating, 0) / total).toFixed(1)
        : '0';
    const repliedCount = reviews.filter((r) => r.replied).length;
    const flaggedCount = reviews.filter((r) => r.flagged).length;
    return {
      total,
      olumlu,
      notr,
      olumsuz,
      olumluPct: total > 0 ? ((olumlu / total) * 100).toFixed(1) : '0',
      notrPct: total > 0 ? ((notr / total) * 100).toFixed(1) : '0',
      olumsuzPct: total > 0 ? ((olumsuz / total) * 100).toFixed(1) : '0',
      avgRating,
      repliedCount,
      flaggedCount,
    };
  }, [reviews]);

  /* ----- filtered reviews ----- */
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !r.comment.toLowerCase().includes(q) &&
          !r.customer.toLowerCase().includes(q) &&
          !r.product.toLowerCase().includes(q)
        )
          return false;
      }
      if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
      if (filterPlatform !== 'all' && r.platform !== filterPlatform) return false;
      if (filterRating !== 'all') {
        const target = parseInt(filterRating);
        if (target === 4) {
          if (r.rating < 4) return false;
        } else if (target === 1) {
          if (r.rating > 2) return false;
        } else {
          if (r.rating !== target) return false;
        }
      }
      return true;
    });
  }, [reviews, searchQuery, filterSentiment, filterPlatform, filterRating]);

  /* ----- keyword frequency ----- */
  const keywordFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    reviews.forEach((r) => {
      commonKeywords.forEach((kw) => {
        if (r.comment.toLowerCase().includes(kw.toLowerCase())) {
          freq[kw] = (freq[kw] || 0) + 1;
        }
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));
  }, [reviews]);

  /* ----- handlers ----- */
  const handleRefresh = () => {
    setReviews(mockReviews);
    setShowAiAnalysis(false);
  };

  const handleReply = () => {
    if (!replyTarget || !replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyTarget.id ? { ...r, replied: true, replyText: replyText.trim() } : r
      )
    );
    setReplyText('');
    setReplyTarget(null);
  };

  const handleFlag = (review: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, flagged: !r.flagged } : r))
    );
  };

  const handleAiAnalysis = () => {
    setAiLoading(true);
    setShowAiAnalysis(false);
    setTimeout(() => {
      setAiLoading(false);
      setShowAiAnalysis(true);
    }, 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Yorum',
      'Puan',
      'Müşteri',
      'Platform',
      'Ürün',
      'Duygu',
      'Tarih',
    ];
    const rows = filteredReviews.map((r) => [
      r.comment,
      r.rating,
      r.customer,
      r.platform,
      r.product,
      sentimentConfig[r.sentiment].label,
      r.date,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yorum-analiz.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ================================================================== */
  /*  RENDER                                                            */
  /* ================================================================== */
  return (
    <div
      className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-4 md:p-6 transition-all`}
    >
      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <MessageSquareHeart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Yorum &amp; Değerlendirme Analizi
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Tüm pazaryerlerindeki müşteri yorumlarını analiz edin
              </p>
            </div>
          </div>
          <Button
            onClick={handleAiAnalysis}
            disabled={aiLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
          >
            {aiLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI ile Analiz Et
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SENTIMENT OVERVIEW CARDS                                     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Toplam Yorum
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <MessageSquareHeart className="h-5 w-5 text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Ort. Puan: {stats.avgRating} / 5
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Olumlu %
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  %{stats.olumluPct}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <ThumbsUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 mt-2">
              {stats.olumlu} yorum
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Nötr %
                </p>
                <p className="text-2xl font-bold text-slate-600 mt-1">
                  %{stats.notrPct}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                <Minus className="h-5 w-5 text-slate-500" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{stats.notr} yorum</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Olumsuz %
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  %{stats.olumsuzPct}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <ThumbsDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-red-500 mt-2">
              {stats.olumsuz} yorum
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/*  SENTIMENT DISTRIBUTION BAR                                   */}
      {/* ============================================================ */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Duygu Dağılımı
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Olumlu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Nötr
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Olumsuz
              </span>
            </div>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${stats.olumluPct}%` }}
            />
            <div
              className="bg-slate-400 transition-all duration-500"
              style={{ width: `${stats.notrPct}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${stats.olumsuzPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>%{stats.olumluPct} Olumlu</span>
            <span>%{stats.notrPct} Nötr</span>
            <span>%{stats.olumsuzPct} Olumsuz</span>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/*  AI ANALYSIS PANEL                                            */}
      {/* ============================================================ */}
      {showAiAnalysis && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              AI Analiz Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAiInsights.map((insight, idx) => {
              const typeStyles: Record<string, string> = {
                success:
                  'border-emerald-300 bg-white',
                warning:
                  'border-amber-300 bg-white',
                danger:
                  'border-red-300 bg-white',
                info:
                  'border-blue-300 bg-white',
              };
              const iconStyles: Record<string, string> = {
                success: 'text-emerald-600',
                warning: 'text-amber-600',
                danger: 'text-red-600',
                info: 'text-blue-600',
              };
              return (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 p-3 ${typeStyles[insight.type]}`}
                >
                  <div className="flex items-start gap-2">
                    {insight.type === 'success' && (
                      <TrendingUp className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[insight.type]}`} />
                    )}
                    {insight.type === 'danger' && (
                      <TrendingDown className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[insight.type]}`} />
                    )}
                    {insight.type === 'warning' && (
                      <Flag className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[insight.type]}`} />
                    )}
                    {insight.type === 'info' && (
                      <BarChart3 className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[insight.type]}`} />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {insight.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  AI LOADING                                                   */}
      {/* ============================================================ */}
      {aiLoading && (
        <Card className="mb-6 border-emerald-200">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-slate-700">
              AI yorumları analiz ediyor...
            </p>
            <p className="text-xs text-slate-500">
              Bu işlem birkaç saniye sürebilir
            </p>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  TOOLBAR                                                      */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Yorum, müşteri veya ürün ara..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1.5" />
          Filtrele
          <ChevronDown
            className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>
        <Button size="sm" variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Yenile
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1.5" />
          Dışa Aktar
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-1.5" />
          Excel
        </Button>
        <Button size="sm" variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1.5" />
          Yazdır
        </Button>
      </div>

      {/* ============================================================ */}
      {/*  FILTER PANEL                                                 */}
      {/* ============================================================ */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[140px]">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Duygu
                </label>
                <Select
                  value={filterSentiment}
                  onValueChange={setFilterSentiment}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="olumlu">Olumlu</SelectItem>
                    <SelectItem value="notr">Nötr</SelectItem>
                    <SelectItem value="olumsuz">Olumsuz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[140px]">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Platform
                </label>
                <Select
                  value={filterPlatform}
                  onValueChange={setFilterPlatform}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="Trendyol">Trendyol</SelectItem>
                    <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[140px]">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Puan
                </label>
                <Select
                  value={filterRating}
                  onValueChange={setFilterRating}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="5">5 Yıldız</SelectItem>
                    <SelectItem value="4">4+ Yıldız</SelectItem>
                    <SelectItem value="3">3 Yıldız</SelectItem>
                    <SelectItem value="2">2 Yıldız</SelectItem>
                    <SelectItem value="1">1-2 Yıldız</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterSentiment('all');
                  setFilterPlatform('all');
                  setFilterRating('all');
                  setSearchQuery('');
                }}
                className="text-slate-500"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  TABS                                                         */}
      {/* ============================================================ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Tüm Yorumlar
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Duygu Analizi
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Ürün Bazlı
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Trendler
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB: TÜM YORUMLAR                                           */}
        {/* ============================================================ */}
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-3 px-4 font-medium text-slate-600">
                        Yorum
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-slate-600 w-24">
                        Puan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 w-36">
                        Müşteri
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 w-28">
                        Platform
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 w-40">
                        Ürün
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-slate-600 w-24">
                        Duygu
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 w-28">
                        Tarih
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-slate-600 w-52">
                        Aksiyon
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-slate-400"
                        >
                          <MessageSquareHeart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p>Yorum bulunamadı</p>
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((review) => {
                        const sent = sentimentConfig[review.sentiment];
                        return (
                          <tr
                            key={review.id}
                            className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="max-w-xs">
                                <p className="text-slate-700 line-clamp-2 text-xs leading-relaxed">
                                  {review.comment}
                                </p>
                                {review.replied && (
                                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                    <Reply className="h-3 w-3" />
                                    Yanıtlandı
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col items-center gap-0.5">
                                <StarRating rating={review.rating} />
                                <span className="text-xs text-slate-400">
                                  {review.rating}/5
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-xs">
                              {review.customer}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={`text-xs ${platformColors[review.platform] || ''}`}
                              >
                                {review.platform}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-xs text-slate-600">
                                {review.product}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${sent.bg} ${sent.color} ${sent.border}`}
                              >
                                {sent.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500">
                              {formatDate(review.date)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => {
                                    setReplyTarget(review);
                                    setReplyText(review.replyText || '');
                                  }}
                                >
                                  <Reply className="h-3 w-3 mr-1" />
                                  Yanıtla
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`h-7 text-xs ${review.flagged ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:bg-slate-50'}`}
                                  onClick={() => handleFlag(review)}
                                >
                                  <Flag
                                    className={`h-3 w-3 mr-1 ${review.flagged ? 'fill-amber-500' : ''}`}
                                  />
                                  İşaretle
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-slate-500 hover:bg-slate-50"
                                  onClick={() => setDetailTarget(review)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Detay
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB: DUYGU ANALİZİ                                          */}
        {/* ============================================================ */}
        <TabsContent value="sentiment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment by Platform */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Platform Bazlı Duygu Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Trendyol', 'Hepsiburada', 'Amazon TR'].map((platform) => {
                  const platformReviews = reviews.filter(
                    (r) => r.platform === platform
                  );
                  const total = platformReviews.length;
                  const olumluCount = platformReviews.filter(
                    (r) => r.sentiment === 'olumlu'
                  ).length;
                  const notrCount = platformReviews.filter(
                    (r) => r.sentiment === 'notr'
                  ).length;
                  const olumsuzCount = platformReviews.filter(
                    (r) => r.sentiment === 'olumsuz'
                  ).length;
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${platformColors[platform] || ''}`}
                          >
                            {platform}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {total} yorum
                          </span>
                        </div>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                        {total > 0 && (
                          <>
                            <div
                              className="bg-emerald-500"
                              style={{
                                width: `${(olumluCount / total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-slate-400"
                              style={{
                                width: `${(notrCount / total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-red-500"
                              style={{
                                width: `${(olumsuzCount / total) * 100}%`,
                              }}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500">
                        <span className="text-emerald-600">
                          {olumluCount} olumlu
                        </span>
                        <span className="text-slate-500">
                          {notrCount} nötr
                        </span>
                        <span className="text-red-500">
                          {olumsuzCount} olumsuz
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Common Keywords */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Sık Geçen Anahtar Kelimeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordFreq.length > 0 ? (
                    keywordFreq.map((kw) => {
                      const size =
                        kw.count >= 3
                          ? 'text-sm px-3 py-1.5'
                          : kw.count >= 2
                            ? 'text-xs px-2.5 py-1'
                            : 'text-xs px-2 py-0.5';
                      const intensity =
                        kw.count >= 3
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : kw.count >= 2
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200';
                      return (
                        <span
                          key={kw.word}
                          className={`inline-flex items-center gap-1 rounded-full border font-medium ${size} ${intensity}`}
                        >
                          <Hash className="h-3 w-3" />
                          {kw.word}
                          <span className="ml-0.5 opacity-60">({kw.count})</span>
                        </span>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400">
                      Yorumlardan anahtar kelime çıkarılamadı
                    </p>
                  )}
                </div>

                {/* Static tag cloud for all keywords */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Tüm Temalar
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {commonKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-default"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Puan Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => r.rating === star
                    ).length;
                    const pct =
                      reviews.length > 0
                        ? ((count / reviews.length) * 100).toFixed(0)
                        : 0;
                    return (
                      <div key={star} className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <span className="text-sm font-medium text-slate-700">
                            {star}
                          </span>
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              star >= 4
                                ? 'bg-emerald-500'
                                : star === 3
                                  ? 'bg-amber-400'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {count} (%{pct})
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB: ÜRÜN BAZLI                                             */}
        {/* ============================================================ */}
        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockProductSummaries.map((product) => {
              const ratingColor =
                product.avgRating >= 4
                  ? 'text-emerald-600'
                  : product.avgRating >= 3
                    ? 'text-amber-600'
                    : 'text-red-600';
              const ratingBg =
                product.avgRating >= 4
                  ? 'bg-emerald-50 border-emerald-100'
                  : product.avgRating >= 3
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-red-50 border-red-100';
              return (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Package className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                            {product.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] mt-1 ${platformColors[product.platform] || ''}`}
                          >
                            {product.platform}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-lg border p-3 mb-3 ${ratingBg}`}
                    >
                      <div>
                        <p className={`text-2xl font-bold ${ratingColor}`}>
                          {product.avgRating}
                        </p>
                      </div>
                      <div>
                        <StarRating rating={Math.round(product.avgRating)} />
                        <p className="text-xs text-slate-500 mt-0.5">
                          {product.reviewCount} değerlendirme
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-emerald-50 p-2 text-center">
                        <p className="text-xs text-emerald-600 font-medium">
                          Olumlu
                        </p>
                        <p className="text-sm font-bold text-emerald-700">
                          {product.positive}
                        </p>
                      </div>
                      <div className="rounded-md bg-red-50 p-2 text-center">
                        <p className="text-xs text-red-600 font-medium">
                          Olumsuz
                        </p>
                        <p className="text-sm font-bold text-red-700">
                          {product.negative}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs"
                    >
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Ürün Detayı
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB: TRENDLER                                               */}
        {/* ============================================================ */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Table */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Aylık Duygu Trendi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          Ay
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-emerald-600">
                          Olumlu
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-slate-500">
                          Nötr
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-red-600">
                          Olumsuz
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-slate-600">
                          Ort. Puan
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600 w-48">
                          Dağılım
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTrends.map((trend, idx) => {
                        const prevTrend = idx > 0 ? mockTrends[idx - 1] : null;
                        const ratingChange = prevTrend
                          ? trend.avgRating - prevTrend.avgRating
                          : 0;
                        return (
                          <tr
                            key={trend.month}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-3 px-4 font-medium text-slate-700">
                              {trend.month}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-emerald-600 font-medium">
                                %{trend.olumlu}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500">
                              %{trend.notr}
                            </td>
                            <td className="py-3 px-4 text-center text-red-600">
                              %{trend.olumsuz}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-medium text-slate-700">
                                  {trend.avgRating}
                                </span>
                                {ratingChange !== 0 && (
                                  <span
                                    className={`text-xs ${ratingChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                                  >
                                    {ratingChange > 0 ? (
                                      <TrendingUp className="h-3 w-3 inline" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 inline" />
                                    )}
                                    {ratingChange > 0 ? '+' : ''}
                                    {ratingChange.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100">
                                <div
                                  className="bg-emerald-500"
                                  style={{
                                    width: `${trend.olumlu}%`,
                                  }}
                                />
                                <div
                                  className="bg-slate-400"
                                  style={{ width: `${trend.notr}%` }}
                                />
                                <div
                                  className="bg-red-500"
                                  style={{
                                    width: `${trend.olumsuz}%`,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Trend Summary Cards */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <h4 className="text-sm font-semibold text-slate-700">
                      Düşen Trend
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Olumlu yorum oranı son 2 ayda{' '}
                    <span className="text-red-600 font-semibold">-10 puan</span>{' '}
                    geriledi. Ocak ayında en düşük seviyeye ulaştı.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flag className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-semibold text-slate-700">
                      Dikkat Gerektiren
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    1-2 yıldız veren yorumların oranı artıyor. Özellikle
                    kargo ve ürün kalitesi şikayetleri öne çıkıyor.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <h4 className="text-sm font-semibold text-slate-700">
                  İyi Performans
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Ekim ayında en yüksek olumlu yorum oranı (%65) ve ortalama
                    puan (4.0) görüldü. Bu performans hedef olarak korunmalı.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <h4 className="text-sm font-semibold text-slate-700">
                      Yanıt Oranı
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Toplam yorumların{' '}
                    <span className="font-semibold text-emerald-600">
                      %{stats.total > 0 ? ((stats.repliedCount / stats.total) * 100).toFixed(0) : 0}
                    </span>{' '}
                    yanıtlandı.{' '}
                    <span className="text-red-600 font-medium">
                      {stats.total - stats.repliedCount}
                    </span>{' '}
                    yorum hala yanıt bekliyor.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/*  REPLY DIALOG                                                 */}
      {/* ============================================================ */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Yorum Yanıtı
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {replyTarget.customer} &mdash;{' '}
                  {replyTarget.product}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setReplyTarget(null);
                  setReplyText('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <StarRating rating={replyTarget.rating} />
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${platformColors[replyTarget.platform] || ''}`}
                  >
                    {replyTarget.platform}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  &ldquo;{replyTarget.comment}&rdquo;
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Yanıtınız
                </label>
                <Textarea
                  placeholder="Müşteriye yanıtınızı yazın..."
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyTarget(null);
                  setReplyText('');
                }}
              >
                İptal
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  DETAIL DIALOG                                                */}
      {/* ============================================================ */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-sm font-semibold text-slate-800">
                Yorum Detayı
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setDetailTarget(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {detailTarget.customer}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(detailTarget.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${platformColors[detailTarget.platform] || ''}`}
                  >
                    {detailTarget.platform}
                  </Badge>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${sentimentConfig[detailTarget.sentiment].bg} ${sentimentConfig[detailTarget.sentiment].color} ${sentimentConfig[detailTarget.sentiment].border}`}
                  >
                    {sentimentConfig[detailTarget.sentiment].label}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Ürün</span>
                  <span className="text-xs font-medium text-slate-700">
                    {detailTarget.product}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Puan</span>
                  <StarRating rating={detailTarget.rating} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">İşaretli</span>
                  <span className="text-xs text-slate-700">
                    {detailTarget.flagged ? 'Evet' : 'Hayır'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Yanıt Durumu</span>
                  <span
                    className={`text-xs ${detailTarget.replied ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {detailTarget.replied ? 'Yanıtlandı' : 'Yanıt Bekliyor'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Yorum
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {detailTarget.comment}
                </p>
              </div>

              {detailTarget.replied && detailTarget.replyText && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-xs font-medium text-emerald-700 mb-1">
                    Satıcı Yanıtı
                  </p>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    {detailTarget.replyText}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailTarget(null)}
              >
                Kapat
              </Button>
              {!detailTarget.replied && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setReplyTarget(detailTarget);
                    setReplyText('');
                    setDetailTarget(null);
                  }}
                >
                  <Reply className="h-3.5 w-3.5 mr-1.5" />
                  Yanıtla
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
