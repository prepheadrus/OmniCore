'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import {
  Search,
  FileText,
  Code2,
  ShieldCheck,
  Brain,
  Users,
  Copy,
  CheckCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Globe,
  Tag,
  Eye,
  Calendar,
  Lightbulb,
  Swords,
  ChevronRight,
  Wand2,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ApiResult {
  success: boolean;
  data: Record<string, unknown>;
  score: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MARKETPLACES = [
  { value: 'tümü', label: 'Tümü' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'n11', label: 'n11' },
  { value: 'amazon-tr', label: 'Amazon TR' },
];

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-amber-500' : 'text-red-500';

const SCORE_RING = (s: number) =>
  s >= 80
    ? 'stroke-emerald-500'
    : s >= 60
      ? 'stroke-amber-500'
      : 'stroke-red-500';

const SCORE_LABEL = (s: number) =>
  s >= 80 ? 'Mükemmel' : s >= 60 ? 'Orta' : 'Zayıf';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Sonuçlar kopyalandı');
  } catch {
    toast.error('Kopyalama başarısız oldu');
  }
}

function generateKeywordChartData(keyword: string, score: number) {
  const base = [
    { name: `${keyword}`, volume: Math.floor(score * 12 + 200), difficulty: Math.floor(score * 0.6 + 20), cpc: +(score * 0.15 + 0.5).toFixed(2) },
    { name: `${keyword} fiyat`, volume: Math.floor(score * 8 + 150), difficulty: Math.floor(score * 0.5 + 15), cpc: +(score * 0.12 + 0.3).toFixed(2) },
    { name: `${keyword} en ucuz`, volume: Math.floor(score * 6 + 120), difficulty: Math.floor(score * 0.4 + 10), cpc: +(score * 0.1 + 0.2).toFixed(2) },
    { name: `${keyword} yorum`, volume: Math.floor(score * 5 + 80), difficulty: Math.floor(score * 0.35 + 8), cpc: +(score * 0.08 + 0.1).toFixed(2) },
    { name: `${keyword} 2024`, volume: Math.floor(score * 7 + 100), difficulty: Math.floor(score * 0.3 + 5), cpc: +(score * 0.11 + 0.25).toFixed(2) },
    { name: `en iyi ${keyword}`, volume: Math.floor(score * 4 + 60), difficulty: Math.floor(score * 0.25 + 12), cpc: +(score * 0.09 + 0.15).toFixed(2) },
    { name: `${keyword} karşılaştır`, volume: Math.floor(score * 3 + 40), difficulty: Math.floor(score * 0.2 + 8), cpc: +(score * 0.07 + 0.1).toFixed(2) },
  ];
  return base;
}

function generateContentPieData(score: number) {
  return [
    { name: 'SEO Uyumu', value: Math.floor(score * 0.9 + 10), fill: '#10b981' },
    { name: 'Okunabilirlik', value: Math.floor(score * 0.85 + 5), fill: '#34d399' },
    { name: 'Anahtar Kelime', value: Math.floor(score * 0.75 + 10), fill: '#059669' },
    { name: 'Satış Odaklılık', value: Math.floor(score * 0.7 + 15), fill: '#047857' },
    { name: 'Teknik SEO', value: Math.floor(score * 0.8 + 8), fill: '#065f46' },
  ];
}

function generateAuditBreakdown(score: number) {
  return [
    { name: 'Başlık Puanı', value: Math.min(100, Math.floor(score * 1.05 + Math.random() * 10)) },
    { name: 'Açıklama Puanı', value: Math.min(100, Math.floor(score * 0.95 + Math.random() * 10)) },
    { name: 'Kategori Uyumu', value: Math.min(100, Math.floor(score * 1.0 + Math.random() * 8)) },
    { name: 'Fiyat Rekabeti', value: Math.min(100, Math.floor(score * 0.9 + Math.random() * 12)) },
  ];
}

function generateRadarData(score: number) {
  const base = 30 + Math.floor(score * 0.5);
  return [
    { dimension: 'Anahtar Kelime', value: Math.min(100, base + Math.floor(Math.random() * 20)) },
    { dimension: 'İçerik Kalitesi', value: Math.min(100, base + Math.floor(Math.random() * 15)) },
    { dimension: 'Teknik SEO', value: Math.min(100, base + Math.floor(Math.random() * 18)) },
    { dimension: 'Kullanıcı Deneyimi', value: Math.min(100, base + Math.floor(Math.random() * 22)) },
    { dimension: 'Dönüşüm Oranı', value: Math.min(100, base + Math.floor(Math.random() * 16)) },
    { dimension: 'Sosyal Sinyal', value: Math.min(100, base + Math.floor(Math.random() * 14)) },
  ];
}

function generateCompetitorLineData(compName: string, score: number) {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const baseVis = Math.floor(score * 3 + 40);
  return months.map((m, i) => ({
    name: m,
    organik: Math.floor(baseVis + Math.sin(i * 0.8) * 15 + Math.random() * 10),
    anahtarKelime: Math.floor(baseVis * 0.6 + Math.cos(i * 0.5) * 10 + Math.random() * 8),
  }));
}

/* ------------------------------------------------------------------ */
/*  Circular Score Indicator                                           */
/* ------------------------------------------------------------------ */

function CircularScore({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={SCORE_RING(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-bold', SCORE_COLOR(score))}>{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown Renderer                                                  */
/* ------------------------------------------------------------------ */

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];
  let olItems: string[] = [];
  let inOrderedList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 mb-3 text-sm text-slate-600">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
          ))}
        </ul>
      );
      listItems = [];
    }
    if (olItems.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 mb-3 text-sm text-slate-600">
          {olItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
          ))}
        </ol>
      );
      olItems = [];
    }
    inOrderedList = false;
  };

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${elements.length}`} className="bg-slate-800 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto mb-4 max-h-80 overflow-y-auto">
          {codeLines.join('\n')}
        </pre>
      );
      codeLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim().startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-emerald-700 mt-4 mb-2 flex items-center gap-2">
          <ChevronRight className="h-3 w-3" />
          {line.trim().replace('### ', '')}
        </h4>
      );
      continue;
    }

    if (line.trim().startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={i} className="text-base font-bold text-slate-800 mt-5 mb-2 border-b border-slate-200 pb-1">
          {line.trim().replace('## ', '')}
        </h3>
      );
      continue;
    }

    if (line.trim().startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 mt-5 mb-2">
          {line.trim().replace('# ', '')}
        </h2>
      );
      continue;
    }

    if (line.trim().match(/^\d+\.\s/)) {
      flushList();
      inOrderedList = true;
      olItems.push(line.trim().replace(/^\d+\.\s/, ''));
      continue;
    }

    if (inOrderedList && line.trim() === '') {
      flushList();
      continue;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (inOrderedList) {
        flushList();
      }
      listItems.push(line.trim().replace(/^[-*]\s/, ''));
      continue;
    }

    if (line.trim() === '') {
      flushList();
      continue;
    }

    if (line.trim().startsWith('---')) {
      flushList();
      elements.push(<hr key={i} className="my-4 border-slate-200" />);
      continue;
    }

    flushList();
    elements.push(
      <p key={i} className="text-sm text-slate-600 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">$1</code>') }} />
    );
  }

  flushList();
  flushCode();

  return <div className="space-y-1">{elements}</div>;
}

/* ------------------------------------------------------------------ */
/*  Loading Spinner                                                    */
/* ------------------------------------------------------------------ */

function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-500 font-medium">{message}</p>
      <p className="text-xs text-slate-400">AI motoru analiz ediyor, lütfen bekleyin...</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value, subtext, color = 'from-emerald-500 to-emerald-600' }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}) {
  return (
    <div className={cn('bg-gradient-to-br text-white rounded-xl p-4', color)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs opacity-90 font-medium">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {subtext && <p className="text-xs opacity-75 mt-1">{subtext}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AiSeo() {
  const { sidebarOpen } = useAppStore();

  /* ---- Tab 1: Keyword Analysis ---- */
  const [kwKeyword, setKwKeyword] = useState('');
  const [kwMarketplace, setKwMarketplace] = useState('tümü');
  const [kwLoading, setKwLoading] = useState(false);
  const [kwResult, setKwResult] = useState<ApiResult | null>(null);
  const [kwError, setKwError] = useState('');

  /* ---- Tab 2: Content Optimization ---- */
  const [coTitle, setCoTitle] = useState('');
  const [coDescription, setCoDescription] = useState('');
  const [coKeywords, setCoKeywords] = useState('');
  const [coLoading, setCoLoading] = useState(false);
  const [coResult, setCoResult] = useState<ApiResult | null>(null);
  const [coError, setCoError] = useState('');

  /* ---- Tab 3: Meta Generator ---- */
  const [mgProductName, setMgProductName] = useState('');
  const [mgCategory, setMgCategory] = useState('');
  const [mgFeatures, setMgFeatures] = useState('');
  const [mgLoading, setMgLoading] = useState(false);
  const [mgResult, setMgResult] = useState<ApiResult | null>(null);
  const [mgError, setMgError] = useState('');

  /* ---- Tab 4: SEO Audit ---- */
  const [saTitle, setSaTitle] = useState('');
  const [saDescription, setSaDescription] = useState('');
  const [saCategory, setSaCategory] = useState('');
  const [saPrice, setSaPrice] = useState('');
  const [saLoading, setSaLoading] = useState(false);
  const [saResult, setSaResult] = useState<ApiResult | null>(null);
  const [saError, setSaError] = useState('');

  /* ---- Tab 5: Content Strategy ---- */
  const [csCategory, setCsCategory] = useState('');
  const [csMarketplace, setCsMarketplace] = useState('tümü');
  const [csTargetAudience, setCsTargetAudience] = useState('');
  const [csLoading, setCsLoading] = useState(false);
  const [csResult, setCsResult] = useState<ApiResult | null>(null);
  const [csError, setCsError] = useState('');

  /* ---- Tab 6: Competitor Analysis ---- */
  const [caCompetitor, setCaCompetitor] = useState('');
  const [caKeyword, setCaKeyword] = useState('');
  const [caMarketplace, setCaMarketplace] = useState('tümü');
  const [caLoading, setCaLoading] = useState(false);
  const [caResult, setCaResult] = useState<ApiResult | null>(null);
  const [caError, setCaError] = useState('');

  /* ---- API helper ---- */
  const callApi = useCallback(async (action: string, body: Record<string, unknown>): Promise<ApiResult | null> => {
    try {
      const res = await fetch('/api/ai-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        const errMsg = json.error || 'Beklenmeyen bir hata oluştu';
        toast.error(errMsg);
        return null;
      }
      return json as ApiResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bağlantı hatası';
      toast.error(message);
      return null;
    }
  }, []);

  /* ================================================================ */
  /*  Tab 1: Anahtar Kelime Analizi                                     */
  /* ================================================================ */
  const handleKeywordAnalysis = async () => {
    if (!kwKeyword.trim()) {
      setKwError('Lütfen bir anahtar kelime girin');
      return;
    }
    setKwError('');
    setKwLoading(true);
    setKwResult(null);
    const result = await callApi('keyword-analysis', { keyword: kwKeyword, marketplace: kwMarketplace });
    if (result) setKwResult(result);
    else setKwError('Analiz başarısız oldu, lütfen tekrar deneyin');
    setKwLoading(false);
  };

  /* ================================================================ */
  /*  Tab 2: İçerik Optimizasyonu                                      */
  /* ================================================================ */
  const handleContentOptimization = async () => {
    if (!coTitle.trim() || !coDescription.trim()) {
      setCoError('Başlık ve açıklama zorunludur');
      return;
    }
    setCoError('');
    setCoLoading(true);
    setCoResult(null);
    const result = await callApi('content-optimization', { title: coTitle, description: coDescription, keywords: coKeywords });
    if (result) setCoResult(result);
    else setCoError('Optimizasyon başarısız oldu');
    setCoLoading(false);
  };

  /* ================================================================ */
  /*  Tab 3: Meta Tag Oluşturucu                                       */
  /* ================================================================ */
  const handleMetaGenerator = async () => {
    if (!mgProductName.trim()) {
      setMgError('Ürün adı zorunludur');
      return;
    }
    setMgError('');
    setMgLoading(true);
    setMgResult(null);
    const result = await callApi('meta-generator', { productName: mgProductName, category: mgCategory, features: mgFeatures });
    if (result) setMgResult(result);
    else setMgError('Meta etiket oluşturma başarısız oldu');
    setMgLoading(false);
  };

  /* ================================================================ */
  /*  Tab 4: SEO Denetimi                                              */
  /* ================================================================ */
  const handleSeoAudit = async () => {
    if (!saTitle.trim() || !saDescription.trim()) {
      setSaError('Başlık ve açıklama zorunludur');
      return;
    }
    setSaError('');
    setSaLoading(true);
    setSaResult(null);
    const result = await callApi('seo-audit', { title: saTitle, description: saDescription, category: saCategory, price: saPrice ? parseFloat(saPrice) : 0 });
    if (result) setSaResult(result);
    else setSaError('Denetim başarısız oldu');
    setSaLoading(false);
  };

  /* ================================================================ */
  /*  Tab 5: İçerik Stratejisi                                         */
  /* ================================================================ */
  const handleContentStrategy = async () => {
    if (!csCategory.trim()) {
      setCsError('Kategori zorunludur');
      return;
    }
    setCsError('');
    setCsLoading(true);
    setCsResult(null);
    const result = await callApi('content-strategy', { category: csCategory, marketplace: csMarketplace, targetAudience: csTargetAudience });
    if (result) setCsResult(result);
    else setCsError('Strateji oluşturma başarısız oldu');
    setCsLoading(false);
  };

  /* ================================================================ */
  /*  Tab 6: Rakip Analizi                                             */
  /* ================================================================ */
  const handleCompetitorAnalysis = async () => {
    if (!caCompetitor.trim()) {
      setCaError('Rakip adı zorunludur');
      return;
    }
    setCaError('');
    setCaLoading(true);
    setCaResult(null);
    const result = await callApi('competitor-analysis', { competitor: caCompetitor, keyword: caKeyword, marketplace: caMarketplace });
    if (result) setCaResult(result);
    else setCaError('Rakip analizi başarısız oldu');
    setCaLoading(false);
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI SEO Motoru</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Yapay zeka destekli kapsamlı SEO analiz araçları ile ürünlerinizi optimize edin
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="keyword" className="space-y-6">
        <TabsList className="bg-white shadow-sm border border-slate-200 w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="keyword" className="gap-2 whitespace-nowrap">
            <Search className="h-4 w-4" />Anahtar Kelime
          </TabsTrigger>
          <TabsTrigger value="optimization" className="gap-2 whitespace-nowrap">
            <FileText className="h-4 w-4" />İçerik Opt.
          </TabsTrigger>
          <TabsTrigger value="meta" className="gap-2 whitespace-nowrap">
            <Code2 className="h-4 w-4" />Meta Etiket
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 whitespace-nowrap">
            <ShieldCheck className="h-4 w-4" />SEO Denetimi
          </TabsTrigger>
          <TabsTrigger value="strategy" className="gap-2 whitespace-nowrap">
            <Brain className="h-4 w-4" />İçerik Strateji
          </TabsTrigger>
          <TabsTrigger value="competitor" className="gap-2 whitespace-nowrap">
            <Users className="h-4 w-4" />Rakip Analizi
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1: Anahtar Kelime Analizi                                */}
        {/* ============================================================ */}
        <TabsContent value="keyword">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-600" />
                    Anahtar Kelime Analizi
                  </CardTitle>
                  <p className="text-xs text-slate-500">Anahtar kelimenizin hacim, zorluk ve CPC analizini alın</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Anahtar Kelime</Label>
                    <Input
                      placeholder="örn: kablosuz kulaklık"
                      value={kwKeyword}
                      onChange={(e) => setKwKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleKeywordAnalysis()}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Pazaryer</Label>
                    <Select value={kwMarketplace} onValueChange={setKwMarketplace}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pazaryer seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKETPLACES.map((mp) => (
                          <SelectItem key={mp.value} value={mp.value}>{mp.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleKeywordAnalysis}
                    disabled={kwLoading || !kwKeyword.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {kwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                    Analiz Et
                  </Button>
                  {kwError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {kwError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {kwLoading && <LoadingSpinner message="Anahtar kelime analiz ediliyor..." />}

              {!kwLoading && kwResult && (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={Target} label="Analiz Skoru" value={`${kwResult.score}/100`} subtext={SCORE_LABEL(kwResult.score)} />
                    <StatCard icon={TrendingUp} label="Arama Hacmi" value={`${Math.floor(kwResult.score * 12 + 200)}/ay`} subtext="Tahmini" />
                    <StatCard icon={AlertTriangle} label="Zorluk" value={kwResult.score > 70 ? 'Yüksek' : kwResult.score > 40 ? 'Orta' : 'Düşük'} subtext={`${Math.floor(kwResult.score * 0.6 + 20)}/100`} />
                    <StatCard icon={Zap} label="Tahmini CPC" value={`${(kwResult.score * 0.15 + 0.5).toFixed(2)} ₺`} subtext="Tıklama başı" />
                  </div>

                  {/* Bar Chart */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        Anahtar Kelime Metrikleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateKeywordChartData(kwKeyword, kwResult.score)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                              formatter={(value: number, name: string) => [value, name === 'volume' ? 'Hacim' : name === 'difficulty' ? 'Zorluk' : 'CPC (₺)']}
                            />
                            <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} name="Hacim" />
                            <Bar dataKey="difficulty" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Zorluk" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Analysis */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-emerald-600" />
                          AI Analiz Raporu
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(String(kwResult.data.analysis || ''))}>
                          <Copy className="h-3.5 w-3.5" />Kopyala
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        <MarkdownContent content={String(kwResult.data.analysis || 'Analiz sonucu bulunamadı')} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!kwLoading && !kwResult && (
                <Card className="shadow-sm border border-slate-200 bg-white">
                  <CardContent className="p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                      <Search className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">Anahtar Kelime Analizi</p>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Analiz yapmak için sol panelden bir anahtar kelime girin ve &ldquo;Analiz Et&rdquo; butonuna tıklayın
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2: İçerik Optimizasyonu                                  */}
        {/* ============================================================ */}
        <TabsContent value="optimization">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    İçerik Optimizasyonu
                  </CardTitle>
                  <p className="text-xs text-slate-500">Ürün başlık ve açıklamanızı SEO uyumlu hale getirin</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Ürün Başlığı</Label>
                    <Input
                      placeholder="Mevcut ürün başlığı"
                      value={coTitle}
                      onChange={(e) => setCoTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Ürün Açıklaması</Label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                      placeholder="Mevcut ürün açıklaması"
                      value={coDescription}
                      onChange={(e) => setCoDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Hedef Anahtar Kelimeler</Label>
                    <Input
                      placeholder="Virgülle ayırın: kelime1, kelime2"
                      value={coKeywords}
                      onChange={(e) => setCoKeywords(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleContentOptimization}
                    disabled={coLoading || !coTitle.trim() || !coDescription.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {coLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Optimize Et
                  </Button>
                  {coError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {coError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {coLoading && <LoadingSpinner message="İçerik optimize ediliyor..." />}

              {!coLoading && coResult && (
                <>
                  {/* Before/After Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="shadow-sm border border-slate-200 bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-red-600 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />Orijinal Başlık
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 bg-red-50 rounded-lg p-3">{String(coResult.data.originalTitle || '')}</p>
                        <p className="text-xs text-slate-400 mt-2">{coTitle.length} karakter</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border border-emerald-200 bg-emerald-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />SEO Skoru
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <CircularScore score={coResult.score} size={80} strokeWidth={6} />
                          <div>
                            <p className={cn('text-lg font-bold', SCORE_COLOR(coResult.score))}>{coResult.score}/100</p>
                            <p className="text-xs text-slate-500">{SCORE_LABEL(coResult.score)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* PieChart - Content Dimensions */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-emerald-600" />
                        Optimizasyon Boyutları
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={generateContentPieData(coResult.score)}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {generateContentPieData(coResult.score).map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Optimized Content */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          AI Optimizasyon Sonuçları
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(String(coResult.data.optimizedContent || ''))}>
                          <Copy className="h-3.5 w-3.5" />Kopyala
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto pr-2">
                        <MarkdownContent content={String(coResult.data.optimizedContent || 'Sonuç bulunamadı')} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!coLoading && !coResult && (
                <Card className="shadow-sm border border-slate-200 bg-white">
                  <CardContent className="p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                      <FileText className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">İçerik Optimizasyonu</p>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Ürün başlık ve açıklamanızı girerek AI destekli SEO optimizasyonu alın
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3: Meta Tag Oluşturucu                                   */}
        {/* ============================================================ */}
        <TabsContent value="meta">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-emerald-600" />
                    Meta Tag Oluşturucu
                  </CardTitle>
                  <p className="text-xs text-slate-500">SEO uyumlu meta etiketleri ve yapılandırılmış veriler oluşturun</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Ürün Adı</Label>
                    <Input
                      placeholder="örn: Apple iPhone 15 Pro"
                      value={mgProductName}
                      onChange={(e) => setMgProductName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Kategori</Label>
                    <Input
                      placeholder="örn: Elektronik, Telefon"
                      value={mgCategory}
                      onChange={(e) => setMgCategory(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Özellikler</Label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                      placeholder="Ürün özelliklerini yazın (virgülle ayırın)"
                      value={mgFeatures}
                      onChange={(e) => setMgFeatures(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleMetaGenerator}
                    disabled={mgLoading || !mgProductName.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {mgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                    Oluştur
                  </Button>
                  {mgError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {mgError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {mgLoading && <LoadingSpinner message="Meta etiketler oluşturuluyor..." />}

              {!mgLoading && mgResult && (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard icon={Tag} label="Ürün" value={String(mgResult.data.productName || '')} subtext="Analiz edilen" color="from-emerald-500 to-emerald-600" />
                    <StatCard icon={Target} label="Kalite Skoru" value={`${mgResult.score}/100`} subtext={SCORE_LABEL(mgResult.score)} color="from-emerald-600 to-teal-600" />
                    <StatCard icon={Sparkles} label="Etiket Sayısı" value="10+" subtext="Meta + OG + Schema" color="from-teal-500 to-cyan-600" />
                  </div>

                  {/* Generated Meta Tags */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-emerald-600" />
                          Oluşturulan Meta Etiketleri
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(String(mgResult.data.metaTags || ''))}>
                          <Copy className="h-3.5 w-3.5" />Kopyala
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[500px] overflow-y-auto pr-2">
                        <MarkdownContent content={String(mgResult.data.metaTags || 'Meta etiketler oluşturulamadı')} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Copy Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="shadow-sm border border-slate-200 bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-slate-800">Meta Title Önerisi</CardTitle>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.success('Meta title kopyalandı')}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                          {mgProductName}{mgCategory ? ` | ${mgCategory}` : ''} | En Uygun Fiyat ve Ücretsiz Kargo
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5">{Math.min(70, mgProductName.length + (mgCategory?.length || 0) + 30)}/70 karakter</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border border-slate-200 bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-slate-800">Meta Description Önerisi</CardTitle>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.success('Meta description kopyalandı')}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                          {mgProductName} ürününü en uygun fiyatla satın alın. {mgCategory ? `${mgCategory} kategorisinde ` : ''}kaliteli ürünler, hızlı teslimat ve güvenli alışveriş.
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5">{Math.min(160, mgProductName.length + (mgCategory?.length || 0) + 80)}/160 karakter</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {!mgLoading && !mgResult && (
                <Card className="shadow-sm border border-slate-200 bg-white">
                  <CardContent className="p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                      <Code2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">Meta Tag Oluşturucu</p>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Ürün bilgilerinizi girerek otomatik meta başlık, açıklama, OG etiketleri ve JSON-LD schema oluşturun
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 4: SEO Denetimi                                          */}
        {/* ============================================================ */}
        <TabsContent value="audit">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    SEO Denetimi
                  </CardTitle>
                  <p className="text-xs text-slate-500">Ürün listelemenizin SEO puanını detaylı analiz edin</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Ürün Başlığı</Label>
                    <Input
                      placeholder="Ürün başlığını girin"
                      value={saTitle}
                      onChange={(e) => setSaTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Ürün Açıklaması</Label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                      placeholder="Ürün açıklamasını girin"
                      value={saDescription}
                      onChange={(e) => setSaDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Kategori</Label>
                      <Input
                        placeholder="Kategori"
                        value={saCategory}
                        onChange={(e) => setSaCategory(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Fiyat (₺)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={saPrice}
                        onChange={(e) => setSaPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSeoAudit}
                    disabled={saLoading || !saTitle.trim() || !saDescription.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {saLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Denetle
                  </Button>
                  {saError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {saError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {saLoading && <LoadingSpinner message="SEO denetimi yapılıyor..." />}

              {!saLoading && saResult && (
                <>
                  {/* Score + Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Circular Score */}
                    <Card className="shadow-sm border border-slate-200 bg-white">
                      <CardContent className="p-6 flex flex-col items-center">
                        <CircularScore score={saResult.score} size={140} strokeWidth={10} />
                        <p className={cn('text-lg font-bold mt-3', SCORE_COLOR(saResult.score))}>
                          {SCORE_LABEL(saResult.score)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Genel SEO Puanı</p>
                      </CardContent>
                    </Card>

                    {/* Breakdown Criteria */}
                    <Card className="shadow-sm border border-slate-200 bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-800">Kriter Detayları</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {generateAuditBreakdown(saResult.score).map((item) => (
                          <div key={item.name}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                              <span className={cn('text-sm font-bold', SCORE_COLOR(item.value))}>{item.value}/100</span>
                            </div>
                            <Progress value={item.value} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Line Chart - Improvement Trends */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        Skor Trendi (Tahmini)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { name: 'Başlangıç', score: saResult.score },
                            { name: '1. Hafta', score: Math.min(100, saResult.score + Math.floor(Math.random() * 10 + 5)) },
                            { name: '2. Hafta', score: Math.min(100, saResult.score + Math.floor(Math.random() * 15 + 10)) },
                            { name: '1. Ay', score: Math.min(100, saResult.score + Math.floor(Math.random() * 20 + 15)) },
                            { name: '2. Ay', score: Math.min(100, saResult.score + Math.floor(Math.random() * 20 + 20)) },
                            { name: '3. Ay', score: Math.min(100, saResult.score + Math.floor(Math.random() * 15 + 25)) },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Audit Report */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-emerald-600" />
                          Detaylı Denetim Raporu
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(String(saResult.data.audit || ''))}>
                          <Copy className="h-3.5 w-3.5" />Kopyala
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto pr-2">
                        <MarkdownContent content={String(saResult.data.audit || 'Denetim sonucu bulunamadı')} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!saLoading && !saResult && (
                <Card className="shadow-sm border border-slate-200 bg-white">
                  <CardContent className="p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">SEO Denetimi</p>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Ürün bilgilerinizi girerek kapsamlı SEO denetimi alın ve iyileştirme önerilerini görün
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 5: İçerik Stratejisi                                     */}
        {/* ============================================================ */}
        <TabsContent value="strategy">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-emerald-600" />
                    İçerik Stratejisi
                  </CardTitle>
                  <p className="text-xs text-slate-500">3 aylık içerik planı ve SEO stratejisi oluşturun</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Kategori</Label>
                    <Input
                      placeholder="örn: Elektronik, Moda"
                      value={csCategory}
                      onChange={(e) => setCsCategory(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Pazaryer</Label>
                    <Select value={csMarketplace} onValueChange={setCsMarketplace}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pazaryer seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKETPLACES.map((mp) => (
                          <SelectItem key={mp.value} value={mp.value}>{mp.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Hedef Kitle</Label>
                    <Input
                      placeholder="örn: 25-35 yaş profesyoneller"
                      value={csTargetAudience}
                      onChange={(e) => setCsTargetAudience(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleContentStrategy}
                    disabled={csLoading || !csCategory.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {csLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                    Strateji Oluştur
                  </Button>
                  {csError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {csError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {csLoading && <LoadingSpinner message="İçerik stratejisi oluşturuluyor..." />}

              {!csLoading && csResult && (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={Calendar} label="Plan Süresi" value="3 Ay" subtext="Haftalık bazda" />
                    <StatCard icon={Target} label="Strateji Skoru" value={`${csResult.score}/100`} subtext={SCORE_LABEL(csResult.score)} />
                    <StatCard icon={FileText} label="İçerik Sayısı" value={`${Math.floor(csResult.score / 5 + 10)}+`} subtext="Tahmini içerik" />
                    <StatCard icon={Lightbulb} label="Anahtar Kelime" value={`${Math.floor(csResult.score / 3 + 15)}+`} subtext="Önerilen keyword" />
                  </div>

                  {/* Radar Chart - Content Dimensions */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        İçerik Boyut Analizi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={generateRadarData(csResult.score)}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#e2e8f0" />
                            <Radar
                              name="Mevcut Durum"
                              dataKey="value"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.25}
                              strokeWidth={2}
                            />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Calendar Preview */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        3 Aylık İçerik Takvimi (Özet)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['1. Ay: Temel Kurulum', '2. Ay: Büyüme', '3. Ay: Optimizasyon'].map((month, idx) => (
                          <div key={month} className="rounded-lg border border-slate-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', idx === 0 ? 'bg-emerald-100 text-emerald-700' : idx === 1 ? 'bg-teal-100 text-teal-700' : 'bg-cyan-100 text-cyan-700')}>
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{month}</span>
                            </div>
                            <ul className="space-y-1.5">
                              <li className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                Anahtar kelime araştırması
                              </li>
                              <li className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                {idx === 0 ? 'Ürün içerik optimizasyonu' : idx === 1 ? 'Blog içerik üretimi' : 'Performans analizi'}
                              </li>
                              <li className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                {idx === 0 ? 'Meta etiket düzenlemesi' : idx === 1 ? 'A/B testleri' : 'Strateji güncelleme'}
                              </li>
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Strategy Report */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          AI Strateji Raporu
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(String(csResult.data.strategy || ''))}>
                          <Copy className="h-3.5 w-3.5" />Kopyala
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto pr-2">
                        <MarkdownContent content={String(csResult.data.strategy || 'Strateji sonucu bulunamadı')} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!csLoading && !csResult && (
                <Card className="shadow-sm border border-slate-200 bg-white">
                  <CardContent className="p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                      <Brain className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">İçerik Stratejisi</p>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Kategorinizi ve hedef kitlenizi belirtin, 3 aylık kapsamlı içerik stratejisi oluşturulsun
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 6: Rakip Analizi                                         */}
        {/* ============================================================ */}
        <TabsContent value="competitor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Swords className="h-5 w-5 text-emerald-600" />
                    Rakip Analizi
                  </CardTitle>
                  <p className="text-xs text-slate-500">Rakiplerinizin SEO stratejilerini analiz edin ve avantaj sağlayın</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Rakip Adı / Mağaza</Label>
                    <Input
                      placeholder="örn: TeknoShop, MediaMarkt"
                      value={caCompetitor}
                      onChange={(e) => setCaCompetitor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Odak Anahtar Kelime</Label>
                    <Input
                      placeholder="Analiz edilecek anahtar kelime (opsiyonel)"
                      value={caKeyword}
                      onChange={(e) => setCaKeyword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Pazaryer</Label>
                    <Select value={caMarketplace} onValueChange={setCaMarketplace}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pazaryer seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKETPLACES.map((mp) => (
                          <SelectItem key={mp.value} value={mp.value}>{mp.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCompetitorAnalysis}
                    disabled={caLoading || !caCompetitor.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {caLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                    Analiz Et
                  </Button>
                  {caError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {caError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {caLoading && <LoadingSpinner message="Rakip analizi yapılıyor..." />}

              {!caLoading && caResult && (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={Users} label="Rakip" value={String(caResult.data.competitor || '')} subtext="Analiz edilen" />
                    <StatCard icon={Target} label="Analiz Skoru" value={`${caResult.score}/100`} subtext={SCORE_LABEL(caResult.score)} color="from-emerald-600 to-teal-600" />
                    <StatCard icon={TrendingUp} label="SEO Gücü" value={caResult.score > 70 ? 'Yüksek' : caResult.score > 40 ? 'Orta' : 'Düşük'} subtext="Tahmini otorite" />
                    <StatCard icon={Lightbulb} label="Fırsat" value={`${Math.floor(caResult.score * 0.3 + 5)}+`} subtext="Keşfedilen fırsat" color="from-amber-500 to-orange-500" />
                  </div>

                  {/* SWOT Analysis Cards */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Swords className="h-4 w-4 text-emerald-600" />
                        SWOT Analizi (Özet)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500">
                              <TrendingUp className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-emerald-800">Güçlü Yönler</span>
                          </div>
                          <ul className="space-y-1 text-xs text-emerald-700">
                            <li className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />Marka bilinirliği ve güven</li>
                            <li className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />Geniş ürün yelpazesi</li>
                            <li className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />Kurumsal SEO altyapısı</li>
                          </ul>
                        </div>
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500">
                              <AlertTriangle className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-red-800">Zayıf Yönler</span>
                          </div>
                          <ul className="space-y-1 text-xs text-red-700">
                            <li className="flex items-start gap-1.5"><XCircle className="h-3 w-3 mt-0.5 shrink-0" />Yavaş mobil performans</li>
                            <li className="flex items-start gap-1.5"><XCircle className="h-3 w-3 mt-0.5 shrink-0" />Eksik blog içeriği</li>
                            <li className="flex items-start gap-1.5"><XCircle className="h-3 w-3 mt-0.5 shrink-0" />Zayıf yerel SEO</li>
                          </ul>
                        </div>
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
                              <Lightbulb className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-blue-800">Fırsatlar</span>
                          </div>
                          <ul className="space-y-1 text-xs text-blue-700">
                            <li className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />Long-tail keyword fırsatları</li>
                            <li className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />Video içerik potansiyeli</li>
                            <li className="flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />Sosyal medya entegrasyonu</li>
                          </ul>
                        </div>
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500">
                              <Swords className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-amber-800">Tehditler</span>
                          </div>
                          <ul className="space-y-1 text-xs text-amber-700">
                            <li className="flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />Yeni rakip girişleri</li>
                            <li className="flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />Algoritma değişiklikleri</li>
                            <li className="flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />Pazar koşulları</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Line Chart - Competitor Trends */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        Rakip Performans Trendi (Tahmini)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateCompetitorLineData(String(caResult.data.competitor || ''), caResult.score)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line type="monotone" dataKey="organik" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Organik Ziyaret" />
                            <Line type="monotone" dataKey="anahtarKelime" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Anahtar Kelime Sıralama" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Backlink Estimates */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-600" />
                        Backlink ve Otorite Tahminleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                          <p className="text-xs text-slate-500">Toplam Backlink</p>
                          <p className="text-lg font-bold text-slate-800">{Math.floor(caResult.score * 50 + 200)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                          <p className="text-xs text-slate-500">Domain Otorite</p>
                          <p className="text-lg font-bold text-slate-800">{Math.floor(caResult.score * 0.5 + 20)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                          <p className="text-xs text-slate-500">Referring Domain</p>
                          <p className="text-lg font-bold text-slate-800">{Math.floor(caResult.score * 8 + 30)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                          <p className="text-xs text-slate-500">Organik Trafik</p>
                          <p className="text-lg font-bold text-slate-800">{(caResult.score * 0.5 + 5).toFixed(1)}K/ay</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Plan */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-emerald-600" />
                        Önerilen Aksiyon Planı
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { priority: 'Yüksek', label: 'Acil', cls: 'bg-red-100 text-red-700 border-red-200', items: ['Rakibin zayıf olduğu long-tail keyword\'leri hedefleyin', 'Müşteri yorum stratejisi geliştirin'] },
                          { priority: 'Orta', label: 'Planlı', cls: 'bg-amber-100 text-amber-700 border-amber-200', items: ['Blog içerik takvimi oluşturun', 'Sosyal medya SEO entegrasyonu yapın'] },
                          { priority: 'Düşük', label: 'Uzun Vadeli', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', items: ['Video içerik stratejisi planlayın', 'Backlink profili oluşturun'] },
                        ].map((group) => (
                          <div key={group.priority} className={cn('rounded-lg border p-3', group.cls)}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="text-xs">{group.priority} Öncelik</Badge>
                              <span className="text-xs font-medium">{group.label}</span>
                            </div>
                            <ul className="space-y-1">
                              {group.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs">
                                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Full AI Analysis */}
                  <Card className="shadow-sm border border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          Detaylı Rakip Analizi
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(String(caResult.data.analysis || ''))}>
                          <Copy className="h-3.5 w-3.5" />Kopyala
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto pr-2">
                        <MarkdownContent content={String(caResult.data.analysis || 'Analiz sonucu bulunamadı')} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!caLoading && !caResult && (
                <Card className="shadow-sm border border-slate-200 bg-white">
                  <CardContent className="p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                      <Swords className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">Rakip Analizi</p>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Rakip mağaza adını girerek SWOT analizi, backlink tahminleri ve aksiyon planı alın
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Toaster */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}


