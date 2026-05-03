'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import {
  MessageCircle,
  RefreshCw,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Archive,
  Forward,
  Search,
  Package,
  User,
  Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Platform = 'Trendyol' | 'Hepsiburada' | 'Amazon TR' | 'n11' | 'Pazarama' | 'ÇiçekSepeti';
type QuestionStatus = 'bekliyor' | 'cevaplandı' | 'kapalı';

interface CustomerQuestion {
  id: string;
  platform: Platform;
  customerName: string;
  question: string;
  productName: string;
  sku: string;
  status: QuestionStatus;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PLATFORM_COLORS: Record<Platform, string> = {
  'Trendyol': 'bg-blue-100 text-blue-700 border-blue-200',
  'Hepsiburada': 'bg-orange-100 text-orange-700 border-orange-200',
  'Amazon TR': 'bg-slate-800 text-white border-slate-700',
  'n11': 'bg-purple-100 text-purple-700 border-purple-200',
  'Pazarama': 'bg-teal-100 text-teal-700 border-teal-200',
  'ÇiçekSepeti': 'bg-pink-100 text-pink-700 border-pink-200',
};

const STATUS_CONFIG: Record<QuestionStatus, { label: string; cls: string }> = {
  bekliyor: { label: 'Bekliyor', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  cevaplandı: { label: 'Cevaplandı', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  kapalı: { label: 'Kapalı', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const REPLY_TEMPLATES = [
  { id: 't1', label: 'Genel Teşekkür', text: 'Değerli müşterimiz, sorunuz için teşekkür ederiz. En kısa sürede size geri dönüş yapacağız.' },
  { id: 't2', label: 'Kargo Bilgisi', text: 'Değerli müşterimiz, kargonuz kargoya verilmiş olup tahmini teslimat süresi 1-3 iş günüdür. Takip numaranızı sipariş detaylarınızdan ulaşabilirsiniz.' },
  { id: 't3', label: 'İade Bilgisi', text: 'Değerli müşterimiz, iade talebiniz alınmıştır. Ürün elimize ulaştıktan sonra en fazla 5 iş günü içinde iade işleminiz tamamlanacaktır.' },
  { id: 't4', label: 'Ürün Detay', text: 'Değerli müşterimiz, ürün hakkında detaylı bilgi için ürün sayfamızdaki teknik özellikler bölümünü inceleyebilirsiniz. Ek sorularınız için bize yazabilirsiniz.' },
  { id: 't5', label: 'İndirim Talebi', text: 'Değerli müşterimiz, maalesef belirtilen ürün için şu an aktif bir indirim kampanyamız bulunmamaktadır. Ancak kampanya dönemlerini takip etmenizi öneririz.' },
];

const ITEMS_PER_PAGE = 6;

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

function generateMockData(): CustomerQuestion[] {
  return [
    {
      id: 'ms-001',
      platform: 'Trendyol',
      customerName: 'Ayşe Kaya',
      question: 'Bu ürünün XL bedeni ne zaman stoka gelecek? Renk seçenekleri var mı?',
      productName: 'Premium Pamuklu Tişört',
      sku: 'TKT-SHIRT-001',
      status: 'bekliyor',
      createdAt: '2025-01-15T10:30:00Z',
    },
    {
      id: 'ms-002',
      platform: 'Hepsiburada',
      customerName: 'Mehmet Yılmaz',
      question: 'Kargom 5 gündür hareket etmiyor, takip numaramı paylaşıyorum ama bir gelişme yok.',
      productName: 'Bluetooth Kulaklık Pro Max',
      sku: 'HB-BT-HEAD-042',
      status: 'bekliyor',
      createdAt: '2025-01-15T09:15:00Z',
    },
    {
      id: 'ms-003',
      platform: 'Amazon TR',
      customerName: 'Zeynep Arslan',
      question: 'Ürün orijinal mi? Garanti süresi ne kadar? Yetkili servis nerelerde?',
      productName: 'Sony WH-1000XM5 Kulaklık',
      sku: 'AMZ-SNY-WH1000',
      status: 'cevaplandı',
      createdAt: '2025-01-14T14:20:00Z',
      reply: 'Değerli müşterimiz, ürünümüz %100 orijinal olup 2 yıl yetkili garanti kapsamındadır. Tüm il merkezlerinde yetkili servisimiz bulunmaktadır.',
      repliedAt: '2025-01-14T15:45:00Z',
    },
    {
      id: 'ms-004',
      platform: 'n11',
      customerName: 'Ali Demir',
      question: 'Bu telefonu ödeme koşulsuz iade edebilir miyim? İade süreci nasıl işliyor?',
      productName: 'Samsung Galaxy S24 Ultra',
      sku: 'N11-SAM-S24U-256',
      status: 'cevaplandı',
      createdAt: '2025-01-14T11:00:00Z',
      reply: 'Değerli müşterimiz, 14 gün içinde koşulsuz iade hakkınız bulunmaktadır. Ürün hasarsız ve orijinal ambalajında olması kaydıyla iade sürecini başlatabilirsiniz.',
      repliedAt: '2025-01-14T12:30:00Z',
    },
    {
      id: 'ms-005',
      platform: 'Trendyol',
      customerName: 'Fatma Öztürk',
      question: 'Aldığım ürün defolu çıktı. Değişim yapmak istiyorum, nasıl başvurabilirim?',
      productName: 'Deri El Çantası Siyah',
      sku: 'TKT-BAG-LTH-077',
      status: 'bekliyor',
      createdAt: '2025-01-15T08:45:00Z',
    },
    {
      id: 'ms-006',
      platform: 'ÇiçekSepeti',
      customerName: 'Hasan Çelik',
      question: 'Hediye paketi seçeneği var mı? Farklı bir adrese gönderim yapabilir miyim?',
      productName: 'Parfüm Seti Premium',
      sku: 'CS-PERF-SET-012',
      status: 'cevaplandı',
      createdAt: '2025-01-13T16:30:00Z',
      reply: 'Değerli müşterimiz, hediye paketi seçeneğimiz mevcuttur. Sipariş adresinizden farklı bir adrese gönderim yapabilirsiniz. Sipariş notunuzda belirtmeniz yeterli.',
      repliedAt: '2025-01-13T17:00:00Z',
    },
    {
      id: 'ms-007',
      platform: 'Hepsiburada',
      customerName: 'Elif Şahin',
      question: 'Bu bilgisayar FIFA 25 ve Valorant oynatır mı? Ekran kartı performansı nasıl?',
      productName: 'ASUS TUF Gaming Laptop',
      sku: 'HB-ASUS-TUF-4060',
      status: 'bekliyor',
      createdAt: '2025-01-15T11:20:00Z',
    },
    {
      id: 'ms-008',
      platform: 'Pazarama',
      customerName: 'Burak Aydın',
      question: 'Toplu sipariş için toptan fiyat verir misiniz? 50 adet almayı planlıyorum.',
      productName: 'Termos Bardak 500ml',
      sku: 'PZ-THR-500-020',
      status: 'bekliyor',
      createdAt: '2025-01-15T07:30:00Z',
    },
    {
      id: 'ms-009',
      platform: 'Amazon TR',
      customerName: 'Selin Koç',
      question: 'Ürünün Türkçe kullanım kılavuzu var mı? Uygulama desteği sunuyor musunuz?',
      productName: 'Akıllı Bileklik Ultra',
      sku: 'AMZ-SB-ULT-003',
      status: 'kapalı',
      createdAt: '2025-01-10T09:00:00Z',
      reply: 'Değerli müşterimiz, ürün kutusunda Türkçe kullanım kılavuzu mevcuttur. Ayrıca iOS ve Android için uyumlu uygulamamız bulunmaktadır.',
      repliedAt: '2025-01-10T10:15:00Z',
    },
    {
      id: 'ms-010',
      platform: 'Trendyol',
      customerName: 'Murat Yıldız',
      question: 'İptal edilen siparişim neden henüz iade edilmedi? 10 gün oldu.',
      productName: 'Kablosuz Mouse Ergonomik',
      sku: 'TKT-MS-ERG-055',
      status: 'cevaplandı',
      createdAt: '2025-01-12T13:00:00Z',
      reply: 'Değerli müşterimiz, iade işleminiz banka tarafından işleme alınmıştır. 3-5 iş günü içinde hesabınıza yansıyacaktır.',
      repliedAt: '2025-01-12T14:30:00Z',
    },
    {
      id: 'ms-011',
      platform: 'n11',
      customerName: 'Deniz Erdoğan',
      question: 'Aynı gün kargo seçeneğiniz var mı? Saat kaçına kadar versem aynı gün gider?',
      productName: 'Ev Dekor Ayna Seti',
      sku: 'N11-DEC-MRR-088',
      status: 'bekliyor',
      createdAt: '2025-01-15T12:00:00Z',
    },
    {
      id: 'ms-012',
      platform: 'Hepsiburada',
      customerName: 'Gizem Polat',
      question: 'Bu ürünü taksit ile alabilir miyim? 12 taksit imkanı sunuyor musunuz?',
      productName: 'Robot Süpürge Pro X1',
      sku: 'HB-RBT-VAC-010',
      status: 'cevaplandı',
      createdAt: '2025-01-13T10:45:00Z',
      reply: 'Değerli müşterimiz, ürünümüz 12 aya varan taksit seçenekleriyle satılmaktadır. Ödeme sayfasında kredi kartınıza uygun taksit seçeneklerini görebilirsiniz.',
      repliedAt: '2025-01-13T11:20:00Z',
    },
    {
      id: 'ms-013',
      platform: 'ÇiçekSepeti',
      customerName: 'Emre Güneş',
      question: 'Ürünün montajı yapılıyor mu? Servis hizmeti dahil mi?',
      productName: 'Duvar Rafı Modüler Set',
      sku: 'CS-SHF-MOD-033',
      status: 'kapalı',
      createdAt: '2025-01-08T15:30:00Z',
      reply: 'Değerli müşterimiz, ürünün montajı için adım adım kurulum rehberi kutu içindedir. Ücretsiz kurulum desteği sadece belirli şehirlerimizde mevcuttur.',
      repliedAt: '2025-01-08T16:45:00Z',
    },
    {
      id: 'ms-014',
      platform: 'Pazarama',
      customerName: 'Naz Avcı',
      question: 'Ürünün batarya ömrü ne kadar? Değiştirilebilir batarya mı?',
      productName: 'Taşınabilir Bluetooth Hoparlör',
      sku: 'PZ-SPK-BT-015',
      status: 'bekliyor',
      createdAt: '2025-01-15T13:10:00Z',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relTime(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  if (s < 172800) return 'Dün';
  return `${Math.floor(s / 86400)} gün önce`;
}

function exportToCSV(data: CustomerQuestion[], filename: string) {
  const headers = [
    'ID',
    'Platform',
    'Müşteri',
    'Soru',
    'Ürün',
    'SKU',
    'Durum',
    'Tarih',
    'Cevap',
    'Cevap Tarihi',
  ];
  const rows = data.map((r) => [
    r.id,
    r.platform,
    r.customerName,
    r.question,
    r.productName,
    r.sku,
    STATUS_CONFIG[r.status].label,
    formatDate(r.createdAt),
    r.reply || '',
    r.repliedAt ? formatDate(r.repliedAt) : '',
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
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CustomerQuestions() {
  const { sidebarOpen } = useAppStore();

  /* ---------- State ---------- */
  const [questions, setQuestions] = useState<CustomerQuestion[]>(() => generateMockData());
  const [showFilter, setShowFilter] = useState(false);
  const [replyTarget, setReplyTarget] = useState<CustomerQuestion | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  /* Filters */
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);

  /* Active Tab */
  const [activeTab, setActiveTab] = useState('all');

  /* ---------- Handlers ---------- */
  const handleRefresh = useCallback(() => {
    setQuestions(generateMockData());
    setFilterPlatform('all');
    setFilterStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterSearch('');
    setCurrentPage(1);
  }, []);

  const handleExportCSV = () => exportToCSV(filteredQuestions, 'musteri-sorulari.csv');
  const handleExportExcel = () => exportToCSV(filteredQuestions, 'musteri-sorulari.xlsx');
  const handlePrint = () => window.print();

  const handleReply = () => {
    if (!replyTarget || !replyText.trim()) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === replyTarget.id
          ? {
              ...q,
              status: 'cevaplandı' as QuestionStatus,
              reply: replyText.trim(),
              repliedAt: new Date().toISOString(),
            }
          : q
      )
    );
    setReplyTarget(null);
    setReplyText('');
    setShowTemplates(false);
  };

  const handleClose = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: 'kapalı' as QuestionStatus } : q
      )
    );
  };

  const handleForward = (q: CustomerQuestion) => {
    alert(`"${q.id}" numaralı soru ilgili departmana yönlendirildi.`);
  };

  const openReplyDialog = (q: CustomerQuestion) => {
    setReplyTarget(q);
    setReplyText('');
    setShowTemplates(false);
  };

  const applyTemplate = (text: string) => {
    setReplyText(text);
    setShowTemplates(false);
  };

  /* ---------- Derived ---------- */
  const filteredQuestions = (() => {
    let result = [...questions];

    // Tab filter
    if (activeTab === 'pending') {
      result = result.filter((q) => q.status === 'bekliyor');
    } else if (activeTab === 'replied') {
      result = result.filter((q) => q.status === 'cevaplandı');
    }

    // Platform filter
    if (filterPlatform !== 'all') {
      result = result.filter((q) => q.platform === filterPlatform);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((q) => q.status === filterStatus);
    }

    // Date range
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((q) => new Date(q.createdAt) >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((q) => new Date(q.createdAt) <= to);
    }

    // Search
    if (filterSearch.trim()) {
      const searchQ = filterSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.customerName.toLowerCase().includes(searchQ) ||
          item.question.toLowerCase().includes(searchQ) ||
          item.productName.toLowerCase().includes(searchQ) ||
          item.sku.toLowerCase().includes(searchQ)
      );
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  })();

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = (() => {
    const total = questions.length;
    const pending = questions.filter((q) => q.status === 'bekliyor').length;
    const replied = questions.filter((q) => q.status === 'cevaplandı').length;
    // Average response time in hours (mock calculation)
    const repliedItems = questions.filter((q) => q.repliedAt);
    const avgHours =
      repliedItems.length > 0
        ? repliedItems.reduce((acc, q) => {
            const diff =
              (new Date(q.repliedAt!).getTime() - new Date(q.createdAt).getTime()) /
              (1000 * 60 * 60);
            return acc + diff;
          }, 0) / repliedItems.length
        : 0;
    return { total, pending, replied, avgHours: Math.round(avgHours * 10) / 10 };
  })();

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  /* ---------- Render ---------- */
  return (
    <div
      className={`min-h-screen bg-slate-50 p-4 sm:p-6 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-16'
      }`}
    >
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 sm:p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Müşteri Soruları</h1>
              <p className="text-sm text-emerald-100 mt-0.5">
                Tüm pazaryerlerinden gelen soruları tek panelden yönetin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 px-3 py-1">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {stats.pending} bekleyen
            </Badge>
          </div>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Toplam Soru
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Bekleyen
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Cevaplanan
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600">{stats.replied}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Ort. Cevap Süresi
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
                <Send className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.avgHours} <span className="text-sm font-normal text-slate-500">saat</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Yenile
        </Button>
        <Button
          size="sm"
          variant={showFilter ? 'default' : 'outline'}
          onClick={() => setShowFilter(!showFilter)}
          className={showFilter ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtrele
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1" />
          Dışa Aktar
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Excel İndir
        </Button>
        <Button size="sm" variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Yazdır
        </Button>
      </div>

      {/* ===== FILTER PANEL ===== */}
      {showFilter && (
        <Card className="mb-4 border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Platform</Label>
                <Select
                  value={filterPlatform}
                  onValueChange={(v) => {
                    setFilterPlatform(v);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Platformlar</SelectItem>
                    <SelectItem value="Trendyol">Trendyol</SelectItem>
                    <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                    <SelectItem value="n11">n11</SelectItem>
                    <SelectItem value="Pazarama">Pazarama</SelectItem>
                    <SelectItem value="ÇiçekSepeti">ÇiçekSepeti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Durum</Label>
                <Select
                  value={filterStatus}
                  onValueChange={(v) => {
                    setFilterStatus(v);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="bekliyor">Bekliyor</SelectItem>
                    <SelectItem value="cevaplandı">Cevaplandı</SelectItem>
                    <SelectItem value="kapalı">Kapalı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => {
                    setFilterDateFrom(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => {
                    setFilterDateTo(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Ara</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="İsim, soru, ürün, SKU..."
                    value={filterSearch}
                    onChange={(e) => {
                      setFilterSearch(e.target.value);
                      handleFilterChange();
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== TABS + QUESTION CARDS ===== */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          setCurrentPage(1);
        }}
      >
        <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto mb-4">
          <TabsTrigger
            value="all"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Tümü
            <Badge
              variant="secondary"
              className="ml-1.5 text-[10px] px-1.5 py-0 h-4"
            >
              {questions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Bekleyen
            <Badge
              variant="secondary"
              className="ml-1.5 text-[10px] px-1.5 py-0 h-4"
            >
              {stats.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="replied"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Cevaplanan
            <Badge
              variant="secondary"
              className="ml-1.5 text-[10px] px-1.5 py-0 h-4"
            >
              {stats.replied}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Single content for all tabs — filtering is handled in derived state */}
        <TabsContent value="all">
          <QuestionCardList
            questions={paginatedQuestions}
            onReply={openReplyDialog}
            onClose={handleClose}
            onForward={handleForward}
          />
        </TabsContent>
        <TabsContent value="pending">
          <QuestionCardList
            questions={paginatedQuestions}
            onReply={openReplyDialog}
            onClose={handleClose}
            onForward={handleForward}
          />
        </TabsContent>
        <TabsContent value="replied">
          <QuestionCardList
            questions={paginatedQuestions}
            onReply={openReplyDialog}
            onClose={handleClose}
            onForward={handleForward}
          />
        </TabsContent>
      </Tabs>

      {/* ===== PAGINATION ===== */}
      <div className="flex items-center justify-between mt-4 bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <p className="text-sm text-slate-500">
          Toplam{' '}
          <span className="font-semibold text-slate-700">
            {filteredQuestions.length}
          </span>{' '}
          sorudan{' '}
          <span className="font-semibold text-slate-700">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
          </span>
          –
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredQuestions.length)}
          </span>{' '}
          arası gösteriliyor
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 p-0 text-xs ${
                currentPage === page
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ===== REPLY DIALOG ===== */}
      <Dialog
        open={!!replyTarget}
        onOpenChange={(open) => {
          if (!open) {
            setReplyTarget(null);
            setReplyText('');
            setShowTemplates(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Send className="h-5 w-5 text-emerald-600" />
              Müşteri Sorusunu Yanıtla
            </DialogTitle>
          </DialogHeader>

          {replyTarget && (
            <div className="space-y-4">
              {/* Question summary */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={`text-xs border ${PLATFORM_COLORS[replyTarget.platform]}`}
                  >
                    {replyTarget.platform}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {replyTarget.sku}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-1">
                  <User className="inline h-3.5 w-3.5 mr-1" />
                  {replyTarget.customerName}
                </p>
                <p className="text-sm text-slate-500 mb-1">
                  <Package className="inline h-3.5 w-3.5 mr-1" />
                  {replyTarget.productName}
                </p>
                <p className="text-sm font-medium text-slate-800 bg-white rounded-md p-2 mt-2 border border-slate-100">
                  &ldquo;{replyTarget.question}&rdquo;
                </p>
                <p className="text-xs text-slate-400 mt-1.5">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {formatDate(replyTarget.createdAt)}
                </p>
              </div>

              {/* Reply textarea */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Yanıtınız</Label>
                <Textarea
                  placeholder="Müşteriye yanıtınızı yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Hızlı Şablonlar
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    {showTemplates ? 'Gizle' : 'Göster'}
                  </Button>
                </div>
                {showTemplates && (
                  <div className="grid grid-cols-1 gap-1.5">
                    {REPLY_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t.text)}
                        className="text-left text-xs rounded-lg border border-slate-200 px-3 py-2 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                      >
                        <span className="font-medium text-slate-700">{t.label}</span>
                        <span className="text-slate-400 ml-2 truncate max-w-[280px] inline-block align-bottom">
                          — {t.text.substring(0, 60)}...
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full sm:w-auto"
            >
              Şablon
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setReplyTarget(null);
                setReplyText('');
                setShowTemplates(false);
              }}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              İptal
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-4 w-4 mr-1" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Question Card List Sub-Component                                   */
/* ------------------------------------------------------------------ */

function QuestionCardList({
  questions,
  onReply,
  onClose,
  onForward,
}: {
  questions: CustomerQuestion[];
  onReply: (q: CustomerQuestion) => void;
  onClose: (id: string) => void;
  onForward: (q: CustomerQuestion) => void;
}) {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Soru bulunamadı</p>
          <p className="text-sm text-slate-400 mt-1">
            Filtreleri değiştirmeyi veya yeni sorular beklemeyi deneyin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {questions.map((q) => {
        const statusCfg = STATUS_CONFIG[q.status];
        const platformCls = PLATFORM_COLORS[q.platform];

        return (
          <Card
            key={q.id}
            className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
          >
            <CardContent className="p-4 flex-1 flex flex-col">
              {/* Top row: Platform badge + Status */}
              <div className="flex items-center justify-between mb-3">
                <Badge className={`text-xs border ${platformCls}`}>
                  {q.platform}
                </Badge>
                <Badge className={`text-xs border ${statusCfg.cls}`}>
                  {statusCfg.label}
                </Badge>
              </div>

              {/* Customer name */}
              <div className="flex items-center gap-1.5 mb-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">
                  {q.customerName}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  {relTime(q.createdAt)}
                </span>
              </div>

              {/* Question */}
              <p className="text-sm text-slate-700 mb-3 flex-1 leading-relaxed line-clamp-3">
                &ldquo;{q.question}&rdquo;
              </p>

              {/* Product info */}
              <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-600 truncate font-medium">
                    {q.productName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 ml-5 font-mono">
                  SKU: {q.sku}
                </p>
              </div>

              {/* Date */}
              <p className="text-[10px] text-slate-400 mb-3">
                <Calendar className="inline h-3 w-3 mr-0.5" />
                {formatDate(q.createdAt)}
              </p>

              {/* Reply preview */}
              {q.reply && (
                <div className="bg-emerald-50 rounded-lg p-2.5 mb-3 border border-emerald-100">
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    Yanıt
                  </p>
                  <p className="text-xs text-emerald-800 line-clamp-2 leading-relaxed">
                    {q.reply}
                  </p>
                  {q.repliedAt && (
                    <p className="text-[10px] text-emerald-500 mt-1">
                      {formatDate(q.repliedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                {q.status !== 'kapalı' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 flex-1"
                    onClick={() => onReply(q)}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Yanıtla
                  </Button>
                )}
                {q.status === 'bekliyor' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-slate-500 hover:bg-slate-50"
                    onClick={() => onClose(q.id)}
                    title="Kapat"
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-slate-500 hover:bg-slate-50"
                  onClick={() => onForward(q)}
                  title="Yönlendir"
                >
                  <Forward className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
