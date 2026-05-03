'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import {
  Brain,
  Sparkles,
  Copy,
  RefreshCw,
  Eye,
  Check,
  X,
  Globe,
  Download,
  Filter,
  Search,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
}

interface GeneratedContent {
  id: string;
  productId: string;
  productName: string;
  type: 'description' | 'title_bullets' | 'translation';
  tone: string;
  marketplace: string;
  content: string;
  qualityScore: number;
  wordCount: number;
  status: 'draft' | 'applied' | 'failed';
  createdAt: string;
}

type Tone = 'professional' | 'casual' | 'luxury' | 'technical';

const TONE_LABELS: Record<Tone, string> = {
  professional: 'Profesyonel',
  casual: 'Samimi',
  luxury: 'Lüks',
  technical: 'Teknik',
};

const TONE_COLORS: Record<Tone, string> = {
  professional: 'bg-blue-100 text-blue-700',
  casual: 'bg-green-100 text-green-700',
  luxury: 'bg-amber-100 text-amber-700',
  technical: 'bg-violet-100 text-violet-700',
};

const MARKETPLACES = [
  'Trendyol',
  'Hepsiburada',
  'Amazon TR',
  'n11',
  'Çiçeksepeti',
  'Morhipo',
];

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'İngilizce' },
  { value: 'de', label: 'Almanca' },
  { value: 'fr', label: 'Fransızca' },
  { value: 'ar', label: 'Arapça' },
];

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_PRODUCTS: Product[] = [
  { id: 'p-001', name: 'iPhone 15 Pro Max 256GB', sku: 'APL-IP15PM-256', category: 'Telefon' },
  { id: 'p-002', name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-256', category: 'Telefon' },
  { id: 'p-003', name: 'MacBook Air M3 15"', sku: 'APL-MBA-M3-15', category: 'Bilgisayar' },
  { id: 'p-004', name: 'Sony WH-1000XM5 Kulaklık', sku: 'SNY-WH1K-XM5', category: 'Kulaklık' },
  { id: 'p-005', name: 'iPad Air M2 11"', sku: 'APL-IPA-M2-11', category: 'Tablet' },
  { id: 'p-006', name: 'Apple Watch Ultra 2', sku: 'APL-AWU2-49', category: 'Akıllı Saat' },
  { id: 'p-007', name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-BK', category: 'Aksesuar' },
  { id: 'p-008', name: 'Xiaomi 14 Ultra', sku: 'XIA-14U-512', category: 'Telefon' },
];

const MOCK_HISTORY: GeneratedContent[] = [
  {
    id: 'gc-001', productId: 'p-001', productName: 'iPhone 15 Pro Max 256GB',
    type: 'description', tone: 'professional', marketplace: 'Trendyol',
    content: 'Apple iPhone 15 Pro Max, A17 Pro çip ile sınıfının en güçlü performansını sunar...',
    qualityScore: 92, wordCount: 245, status: 'applied', createdAt: '2024-12-15T14:30:00Z',
  },
  {
    id: 'gc-002', productId: 'p-002', productName: 'Samsung Galaxy S24 Ultra',
    type: 'title_bullets', tone: 'casual', marketplace: 'Hepsiburada',
    content: 'Samsung Galaxy S24 Ultra — Hayatınızı Kolaylaştıran Yapay Zeka\n• 200MP kamera...',
    qualityScore: 87, wordCount: 180, status: 'applied', createdAt: '2024-12-15T12:00:00Z',
  },
  {
    id: 'gc-003', productId: 'p-003', productName: 'MacBook Air M3 15"',
    type: 'translation', tone: 'luxury', marketplace: 'Amazon TR',
    content: 'Experience the MacBook Air M3 15" — the perfect blend of power and elegance...',
    qualityScore: 78, wordCount: 210, status: 'draft', createdAt: '2024-12-14T18:20:00Z',
  },
  {
    id: 'gc-004', productId: 'p-004', productName: 'Sony WH-1000XM5 Kulaklık',
    type: 'description', tone: 'technical', marketplace: 'Trendyol',
    content: 'Sony WH-1000XM5, 30mm sürücü ile derin bass ve kristal netliğinde yüksek frekanslar sunar...',
    qualityScore: 95, wordCount: 310, status: 'applied', createdAt: '2024-12-14T15:45:00Z',
  },
  {
    id: 'gc-005', productId: 'p-005', productName: 'iPad Air M2 11"',
    type: 'title_bullets', tone: 'professional', marketplace: 'n11',
    content: 'Apple iPad Air M2 11" Wi-Fi 128GB\n• M2 çip ile muazzam performans...',
    qualityScore: 45, wordCount: 120, status: 'failed', createdAt: '2024-12-14T10:10:00Z',
  },
  {
    id: 'gc-006', productId: 'p-006', productName: 'Apple Watch Ultra 2',
    type: 'description', tone: 'luxury', marketplace: 'Hepsiburada',
    content: 'Apple Watch Ultra 2, macera tutkunları için tasarlandı. 49mm titanyum kasa...',
    qualityScore: 88, wordCount: 275, status: 'applied', createdAt: '2024-12-13T20:00:00Z',
  },
  {
    id: 'gc-007', productId: 'p-007', productName: 'Logitech MX Master 3S',
    type: 'translation', tone: 'casual', marketplace: 'Amazon TR',
    content: 'Logitech MX Master 3S — The mouse that adapts to you...',
    qualityScore: 72, wordCount: 155, status: 'draft', createdAt: '2024-12-13T16:30:00Z',
  },
  {
    id: 'gc-008', productId: 'p-008', productName: 'Xiaomi 14 Ultra',
    type: 'title_bullets', tone: 'technical', marketplace: 'Çiçeksepeti',
    content: 'Xiaomi 14 Ultra — Leica Optik Sistem\n• 1 inç Sony LYT-900 ana kamera...',
    qualityScore: 91, wordCount: 200, status: 'applied', createdAt: '2024-12-13T09:00:00Z',
  },
];

const MOCK_DESCRIPTIONS: Record<string, string> = {
  professional: 'Bu ürün, sektörün en yüksek standartlarını karşılayacak şekilde tasarlanmıştır. Üstün malzeme kalitesi ve özenli işçilik ile üretilen bu model, uzun ömürlü kullanım garantisi sunmaktadır. Gelişmiş teknolojisi sayesinde günlük kullanımdan profesyonel ihtiyaçlarınıza kadar her senaryoda mükemmel bir deneyim sağlar. Ürün, detaylı kalite kontrol süreçlerinden geçirilerek sizlere sunulmaktadır.',
  casual: 'Harika bir ürün ile tanışmaya hazır mısınız? Bu ürün günlük hayatınızı çok daha kolay ve eğlenceli hale getirecek! Kullanımı son derece pratik, tasarımı ise göz alıcı. Arkadaşlarınızın da hayran kalacağı bu ürünü kaçırmayın. Hem şık hem de işlevsel — tam da aradığınız şey!',
  luxury: 'Kusursuzluğun yeni tanımı. Bu eşsiz ürün, üstün zanaatkarlık ve en kaliteli malzemelerin buluştuğu bir şaheserdir. Zarif tasarımı ve benzersiz detaylarıyla, yaşam tarzınıza sofistike bir dokunuş katmaktadır. Sadece en iyisini hak edenler için özel olarak tasarlanmıştır.',
  technical: 'Bu ürün, en son teknoloji standartlarına uygun olarak üretilmiştir. Spesifikasyonlar: Gelişmiş işlemci mimarisi, optimize edilmiş güç tüketimi, yüksek çözünürlüklü sensör sistemi ve gelişmiş bağlantı protokolleri. Uyumluluk: iOS 16+, Android 12+, Windows 11, macOS Sonoma. Ölçüler: 150x70x8mm, Ağırlık: 185g. Sertifika: CE, FCC, RoHS.',
};

const MOCK_TITLE_BULLETS = `Samsung Galaxy S24 Ultra 256GB — Yapay Zeka ile Geleceği Deneyimleyin

• 200MP Ana Kamera — Leica optik ile profesyonel fotoğraf kalitesi
• Snapdragon 8 Gen 3 — Sınıfının en güçlü işlemcisi
• 6.8" Dynamic AMOLED 2X — 120Hz yenileme hızı ile akıcı ekran
• 5000mAh Batarya — All-day kullanım, 45W hızlı şarj desteği
• Galaxy AI — Akıllı çeviri, fotoğraf düzenleme ve asistan özellikleri
• S Pen Desteği — Hassas çizim ve not alma deneyimi
• IP68 Su ve Toz Dayanımı — Her koşulda güvenle kullanın
• 12GB RAM + 256GB Depolama — Yüksek performans ve geniş alan`;

const MOCK_TRANSLATION = `Experience the Samsung Galaxy S24 Ultra 256GB — powered by AI for a smarter tomorrow.

• 200MP Main Camera — Professional-grade photography with Leica optics
• Snapdragon 8 Gen 3 — The most powerful processor in its class
• 6.8" Dynamic AMOLED 2X — Fluid display with 120Hz refresh rate
• 5000mAh Battery — All-day usage with 45W fast charging support
• Galaxy AI — Smart translation, photo editing, and assistant features
• S Pen Support — Precision drawing and note-taking experience
• IP68 Water & Dust Resistance — Use confidently in any condition
• 12GB RAM + 256GB Storage — High performance and spacious storage`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function qualityBadge(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function qualityColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function typeLabel(type: string) {
  switch (type) {
    case 'description': return 'Açıklama';
    case 'title_bullets': return 'Başlık & Mermi';
    case 'translation': return 'Çeviri';
    default: return type;
  }
}

function typeBadgeColor(type: string) {
  switch (type) {
    case 'description': return 'bg-blue-100 text-blue-700';
    case 'title_bullets': return 'bg-violet-100 text-violet-700';
    case 'translation': return 'bg-teal-100 text-teal-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'applied': return 'bg-emerald-100 text-emerald-700';
    case 'draft': return 'bg-slate-100 text-slate-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'applied': return 'Uygulandı';
    case 'draft': return 'Taslak';
    case 'failed': return 'Başarısız';
    default: return status;
  }
}

function relTime(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  if (s < 604800) return `${Math.floor(s / 86400)} gün önce`;
  return new Date(d).toLocaleDateString('tr-TR');
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="h-4 w-96 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AiContentStudio() {
  const { sidebarOpen } = useAppStore();
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* --- Description Tab State --- */
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [selectedMarketplace, setMarketplace] = useState<string>('Trendyol');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [descQuality, setDescQuality] = useState(0);
  const [descWordCount, setDescWordCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState('');
  const [titleQuality, setTitleQuality] = useState(0);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  /* --- Translation Tab State --- */
  const [translateProduct, setTranslateProduct] = useState<string>('');
  const [translateSource, setTranslateSource] = useState('tr');
  const [translateTarget, setTranslateTarget] = useState('en');
  const [translatedContent, setTranslatedContent] = useState('');
  const [translateQuality, setTranslateQuality] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  /* --- History Tab State --- */
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState<string>('all');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>('all');

  /* --- Bulk Actions --- */
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  /* ---------- Load Data ---------- */
  useEffect(() => {
    fetch('/api/ai-content')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setHistory(res);
        } else {
          setHistory(MOCK_HISTORY);
        }
      })
      .catch(() => setHistory(MOCK_HISTORY))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Derived ---------- */
  const filteredHistory = history.filter((h) => {
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      if (!h.productName.toLowerCase().includes(q) && !h.content.toLowerCase().includes(q)) return false;
    }
    if (historyFilterType !== 'all' && h.type !== historyFilterType) return false;
    if (historyFilterStatus !== 'all' && h.status !== historyFilterStatus) return false;
    return true;
  });

  const summaryStats = {
    total: history.length,
    applied: history.filter((h) => h.status === 'applied').length,
    avgScore: history.length > 0 ? Math.round(history.reduce((a, b) => a + b.qualityScore, 0) / history.length) : 0,
    todayCount: history.filter((h) => {
      const today = new Date().toDateString();
      return new Date(h.createdAt).toDateString() === today;
    }).length,
  };

  /* ---------- Handlers ---------- */
  const handleGenerateDescription = async () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setIsGenerating(true);
    setGeneratedDesc('');

    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          type: 'description',
          productId: selectedProduct,
          productName: product.name,
          category: product.category,
          tone: selectedTone,
          marketplace: selectedMarketplace,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'Açıklama oluşturulamadı');
        setIsGenerating(false);
        return;
      }

      setGeneratedDesc(json.content || '');
      setDescQuality(json.qualityScore || 0);
      setDescWordCount(json.wordCount || 0);

      // Add to history
      setHistory((prev) => [
        {
          id: `gc-${Date.now()}`,
          productId: selectedProduct,
          productName: product.name,
          type: 'description',
          tone: selectedTone,
          marketplace: selectedMarketplace,
          content: json.content || '',
          qualityScore: json.qualityScore || 0,
          wordCount: json.wordCount || 0,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      toast.error('Bağlantı hatası, lütfen tekrar deneyin');
    }

    setIsGenerating(false);
  };

  const handleGenerateTitles = async () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setIsGeneratingTitles(true);
    setGeneratedTitles('');

    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          type: 'title_bullets',
          productId: selectedProduct,
          productName: product.name,
          category: product.category,
          marketplace: selectedMarketplace,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'Başlık oluşturulamadı');
        setIsGeneratingTitles(false);
        return;
      }

      setGeneratedTitles(json.content || '');
      setTitleQuality(json.qualityScore || 0);

      // Add to history
      setHistory((prev) => [
        {
          id: `gc-${Date.now()}`,
          productId: selectedProduct,
          productName: product.name,
          type: 'title_bullets',
          tone: 'professional',
          marketplace: selectedMarketplace,
          content: json.content || '',
          qualityScore: json.qualityScore || 0,
          wordCount: json.wordCount || 0,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      toast.error('Bağlantı hatası, lütfen tekrar deneyin');
    }

    setIsGeneratingTitles(false);
  };

  const handleTranslate = async () => {
    if (!translateProduct) return;
    const product = products.find((p) => p.id === translateProduct);
    if (!product) return;

    setIsTranslating(true);
    setTranslatedContent('');

    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          productId: translateProduct,
          productName: product.name,
          category: product.category,
          sourceLang: translateSource,
          targetLang: translateTarget,
          marketplace: selectedMarketplace,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'Çeviri başarısız oldu');
        setIsTranslating(false);
        return;
      }

      setTranslatedContent(json.content || '');
      setTranslateQuality(json.qualityScore || 0);

      // Add to history
      setHistory((prev) => [
        {
          id: `gc-${Date.now()}`,
          productId: translateProduct,
          productName: product.name,
          type: 'translation',
          tone: 'professional',
          marketplace: selectedMarketplace,
          content: json.content || '',
          qualityScore: json.qualityScore || 0,
          wordCount: json.wordCount || 0,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      toast.error('Bağlantı hatası, lütfen tekrar deneyin');
    }

    setIsTranslating(false);
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBulkDelete = () => {
    setHistory((prev) => prev.filter((h) => !selectedRows.has(h.id)));
    setSelectedRows(new Set());
  };

  const handleBulkApply = () => {
    setHistory((prev) => prev.map((h) => selectedRows.has(h.id) ? { ...h, status: 'applied' as const } : h));
    setSelectedRows(new Set());
  };

  /* --- Preview Dialog State --- */
  const [previewContent, setPreviewContent] = useState<{ title: string; content: string } | null>(null);

  const handleApplyContent = (type: 'description' | 'titles' | 'translation') => {
    let content = '';
    let productId = '';
    let contentType: 'description' | 'title_bullets' | 'translation' = type === 'titles' ? 'title_bullets' : type;

    if (type === 'description' && generatedDesc) {
      content = generatedDesc;
      productId = selectedProduct;
    } else if (type === 'titles' && generatedTitles) {
      content = generatedTitles;
      productId = selectedProduct;
      contentType = 'title_bullets';
    } else if (type === 'translation' && translatedContent) {
      content = translatedContent;
      productId = translateProduct;
      contentType = 'translation';
    }

    if (!content || !productId) return;

    setHistory((prev) =>
      prev.map((h) =>
        h.productId === productId && h.type === contentType
          ? { ...h, status: 'applied' as const, content, qualityScore: h.qualityScore || 85 }
          : h
      )
    );
    toast.success('İçerik başarıyla uygulandı!');
  };

  const handleViewContent = (item: GeneratedContent) => {
    setPreviewContent({ title: `${item.productName} — ${typeLabel(item.type)}`, content: item.content });
  };

  const handleReapplyContent = (item: GeneratedContent) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === item.id ? { ...h, status: 'applied' as const } : h))
    );
    toast.success('İçerik yeniden uygulandı!');
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
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI İçerik Stüdyosu</h1>
              <p className="text-sm text-violet-100 mt-0.5">Yapay zeka ile ürün içeriklerini otomatik oluşturun, çevirin ve optimize edin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              GPT-4 Destekli
            </Badge>
            <Badge className="bg-emerald-500/80 text-white border-emerald-400/30 hover:bg-emerald-500/80 px-3 py-1">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Aktif
            </Badge>
          </div>
        </div>
      </div>

      {/* ===== SUMMARY KPIs ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Toplam Üretim', value: summaryStats.total, icon: <Sparkles className="h-5 w-5 text-white" />, bg: 'bg-violet-500' },
          { label: 'Uygulanan', value: summaryStats.applied, icon: <Check className="h-5 w-5 text-white" />, bg: 'bg-emerald-500' },
          { label: 'Ort. Kalite Skoru', value: `%${summaryStats.avgScore}`, icon: <Brain className="h-5 w-5 text-white" />, bg: 'bg-amber-500' },
          { label: 'Bugün Üretilen', value: summaryStats.todayCount, icon: <Calendar className="h-5 w-5 text-white" />, bg: 'bg-rose-500' },
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
      <Tabs defaultValue="description" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto">
          <TabsTrigger value="description" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Açıklama Üretici
          </TabsTrigger>
          <TabsTrigger value="titles" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-1.5" />
            Başlık & Mermi
          </TabsTrigger>
          <TabsTrigger value="translation" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-1.5" />
            Çeviri & Yerelleştirme
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-1.5" />
            Geçmiş
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Description Generator ===== */}
        <TabsContent value="description">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Controls */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800">Açıklama Oluştur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün Seçin</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ton</Label>
                  <Select value={selectedTone} onValueChange={(v) => setSelectedTone(v as Tone)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TONE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Pazaryeri</Label>
                  <Select value={selectedMarketplace} onValueChange={setMarketplace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className={TONE_COLORS[selectedTone]}>{TONE_LABELS[selectedTone]}</Badge>
                  <Badge variant="outline" className="text-xs">{selectedMarketplace}</Badge>
                </div>
                <Button
                  onClick={handleGenerateDescription}
                  disabled={!selectedProduct || isGenerating}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-sm"
                >
                  {isGenerating ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Üretiliyor...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Açıklama Üret</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Generated Content */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800">Üretilen İçerik</CardTitle>
                  {generatedDesc && (
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs font-semibold', qualityBadge(descQuality))}>
                        Kalite: {descQuality}/100
                      </Badge>
                      <Badge variant="outline" className="text-xs">{descWordCount} kelime</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-3 py-4">
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-full" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-11/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-10/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-full" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-9/12" />
                    <p className="text-sm text-violet-500 mt-4 flex items-center gap-2">
                      <Brain className="h-4 w-4 animate-pulse" /> AI içerik üretiyor...
                    </p>
                  </div>
                ) : generatedDesc ? (
                  <div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-80 overflow-y-auto">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedDesc}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Yeniden Üret
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(generatedDesc, 'desc')}
                      >
                        {copiedId === 'desc' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copiedId === 'desc' ? 'Kopyalandı!' : 'Kopyala'}
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto" onClick={() => handleApplyContent('description')}>
                        <Check className="h-4 w-4 mr-1" /> Uygula
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Brain className="h-12 w-12 mb-3 text-slate-300" />
                    <p className="text-sm font-medium">Henüz içerik üretilmedi</p>
                    <p className="text-xs mt-1">Bir ürün seçip &quot;Açıklama Üret&quot; butonuna tıklayın</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 2: Title & Bullets ===== */}
        <TabsContent value="titles">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800">SEO Başlık & Mermi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün Seçin</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Hedef Pazaryeri</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {MARKETPLACES.map((m) => (
                      <Badge
                        key={m}
                        variant={selectedMarketplace === m ? 'default' : 'outline'}
                        className={cn('cursor-pointer justify-center text-xs py-1.5', selectedMarketplace === m ? 'bg-violet-600 text-white hover:bg-violet-700' : '')}
                        onClick={() => setMarketplace(m)}
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleGenerateTitles}
                  disabled={!selectedProduct || isGeneratingTitles}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-sm"
                >
                  {isGeneratingTitles ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Üretiliyor...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Başlık & Mermi Üret</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800">Üretilen Başlık & Mermiler</CardTitle>
                  {generatedTitles && (
                    <Badge className={cn('text-xs font-semibold', qualityBadge(titleQuality))}>
                      Kalite: {titleQuality}/100
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGeneratingTitles ? (
                  <div className="space-y-3 py-4">
                    <div className="animate-pulse h-6 bg-slate-200 rounded w-full" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-11/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-10/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-full" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-9/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-10/12" />
                    <p className="text-sm text-violet-500 mt-4 flex items-center gap-2">
                      <Brain className="h-4 w-4 animate-pulse" /> AI SEO içerik üretiyor...
                    </p>
                  </div>
                ) : generatedTitles ? (
                  <div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-96 overflow-y-auto">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedTitles}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={handleGenerateTitles} disabled={isGeneratingTitles}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Yeniden Üret
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(generatedTitles, 'titles')}>
                        {copiedId === 'titles' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copiedId === 'titles' ? 'Kopyalandı!' : 'Kopyala'}
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto" onClick={() => handleApplyContent('titles')}>
                        <Check className="h-4 w-4 mr-1" /> Uygula
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Globe className="h-12 w-12 mb-3 text-slate-300" />
                    <p className="text-sm font-medium">Henüz başlık üretilmedi</p>
                    <p className="text-xs mt-1">Bir ürün seçip pazaryeri hedefleyin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 3: Translation & Localization ===== */}
        <TabsContent value="translation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800">Çeviri & Yerelleştirme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün Seçin</Label>
                  <Select value={translateProduct} onValueChange={setTranslateProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Kaynak Dil</Label>
                    <Select value={translateSource} onValueChange={setTranslateSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Hedef Dil</Label>
                    <Select value={translateTarget} onValueChange={setTranslateTarget}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Pazaryeri Yerelleştirme</Label>
                  <Select value={selectedMarketplace} onValueChange={setMarketplace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleTranslate}
                  disabled={!translateProduct || isTranslating}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-sm"
                >
                  {isTranslating ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Çevriliyor...</>
                  ) : (
                    <><Globe className="h-4 w-4 mr-2" /> Çevir ve Yerelleştir</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800">Çeviri Sonucu</CardTitle>
                  {translatedContent && (
                    <Badge className={cn('text-xs font-semibold', qualityBadge(translateQuality))}>
                      Çeviri Kalitesi: {translateQuality}/100
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isTranslating ? (
                  <div className="space-y-3 py-4">
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-full" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-11/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-10/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-full" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-9/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-11/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-10/12" />
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-8/12" />
                    <p className="text-sm text-violet-500 mt-4 flex items-center gap-2">
                      <Globe className="h-4 w-4 animate-pulse" /> Çeviri ve yerelleştirme yapılıyor...
                    </p>
                  </div>
                ) : translatedContent ? (
                  <div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-96 overflow-y-auto">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{translatedContent}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={handleTranslate} disabled={isTranslating}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Yeniden Çevir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(translatedContent, 'trans')}>
                        {copiedId === 'trans' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copiedId === 'trans' ? 'Kopyalandı!' : 'Kopyala'}
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto" onClick={() => handleApplyContent('translation')}>
                        <Check className="h-4 w-4 mr-1" /> Uygula
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Globe className="h-12 w-12 mb-3 text-slate-300" />
                    <p className="text-sm font-medium">Henüz çeviri yapılmadı</p>
                    <p className="text-xs mt-1">Kaynak ve hedef dil seçip ürün belirleyin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 4: History ===== */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-600" />
                  İçerik Üretim Geçmişi
                  <Badge variant="secondary" className="ml-1">{filteredHistory.length} kayıt</Badge>
                </CardTitle>
                {selectedRows.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{selectedRows.size} seçili</Badge>
                    <Button variant="outline" size="sm" onClick={handleBulkApply}>
                      <Check className="h-4 w-4 mr-1" /> Toplu Uygula
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleBulkDelete}>
                      <Trash2Icon className="h-4 w-4 mr-1" /> Toplu Sil
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Ürün veya içerik ara..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={historyFilterType} onValueChange={setHistoryFilterType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tür" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value="description">Açıklama</SelectItem>
                    <SelectItem value="title_bullets">Başlık & Mermi</SelectItem>
                    <SelectItem value="translation">Çeviri</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={historyFilterStatus} onValueChange={setHistoryFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="applied">Uygulandı</SelectItem>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedRows.size === filteredHistory.length && filteredHistory.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(new Set(filteredHistory.map((h) => h.id)));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ürün</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tür</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kalite</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarih</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                          Kayıt bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((h) => (
                        <TableRow key={h.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <TableCell>
                            <input
                              type="checkbox"
                              className="rounded border-slate-300"
                              checked={selectedRows.has(h.id)}
                              onChange={(e) => {
                                const next = new Set(selectedRows);
                                if (e.target.checked) next.add(h.id);
                                else next.delete(h.id);
                                setSelectedRows(next);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-slate-800 truncate max-w-[180px]">{h.productName}</p>
                              <p className="text-xs text-slate-400">{h.marketplace} · {TONE_LABELS[h.tone as Tone] || h.tone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', typeBadgeColor(h.type))}>{typeLabel(h.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs font-semibold', qualityBadge(h.qualityScore))}>
                              {h.qualityScore}/100
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', statusBadge(h.status))}>{statusLabel(h.status)}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-500">{relTime(h.createdAt)}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Görüntüle" onClick={() => handleViewContent(h)}>
                                <Eye className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Kopyala" onClick={() => handleCopy(h.content, h.id)}>
                                {copiedId === h.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                              </Button>
                              {h.status !== 'applied' && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Yeniden Uygula" onClick={() => handleReapplyContent(h)}>
                                  <Check className="h-4 w-4 text-emerald-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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

/* ---------- Icon alias for Trash2 (inline to avoid naming conflict) ---------- */
function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
