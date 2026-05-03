'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Printer,
  FileSpreadsheet,
  FileDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  ToggleLeft,
  BarChart3,
  Calendar,
  ClipboardCheck,
  UserCheck,
  UserX,
  Activity,
  Lock,
  Globe,
  ChevronRight,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

/* ================================================================
   Types
   ================================================================ */
interface DataRequest {
  id: string;
  requestNo: string;
  type: 'silme' | 'erisim' | 'duzeltme' | 'itiraz';
  status: 'bekliyor' | 'isleniyor' | 'tamamlandi' | 'reddedildi';
  date: string;
  deadline: string;
  customer: string;
  email: string;
  source: string;
  details: string;
}

interface PermissionType {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  totalApprovals: number;
  totalRejections: number;
  approvalRate: number;
  lastUpdated: string;
}

interface ComplianceReport {
  id: string;
  month: string;
  totalRequests: number;
  completedOnTime: number;
  overdue: number;
  complianceRate: number;
  status: 'good' | 'warning' | 'critical';
}

/* ================================================================
   Constants
   ================================================================ */
const REQUEST_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  silme: { label: 'Silme', color: 'bg-red-100 text-red-700', icon: <FileDown className="h-3.5 w-3.5" /> },
  erisim: { label: 'Erişim', color: 'bg-blue-100 text-blue-700', icon: <Eye className="h-3.5 w-3.5" /> },
  duzeltme: { label: 'Düzeltme', color: 'bg-amber-100 text-amber-700', icon: <FileText className="h-3.5 w-3.5" /> },
  itiraz: { label: 'İtiraz', color: 'bg-purple-100 text-purple-700', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  bekliyor: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  isleniyor: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  tamamlandi: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  reddedildi: { label: 'Reddedildi', color: 'bg-red-100 text-red-700 border-red-200' },
};

/* ================================================================
   Mock Data
   ================================================================ */
const MOCK_REQUESTS: DataRequest[] = [
  { id: 'req-001', requestNo: 'KVKK-2024-0847', type: 'silme', status: 'bekliyor', date: '2025-01-15', deadline: '2025-02-15', customer: 'Ahmet Yılmaz', email: 'ahmet@email.com', source: 'Hepsiburada', details: 'Tüm kişisel verilerin silinmesi talebi' },
  { id: 'req-002', requestNo: 'KVKK-2024-0846', type: 'erisim', status: 'isleniyor', date: '2025-01-14', deadline: '2025-02-14', customer: 'Elif Demir', email: 'elif@email.com', source: 'Trendyol', details: 'Sipariş geçmişi ve adres bilgisi erişimi' },
  { id: 'req-003', requestNo: 'KVKK-2024-0845', type: 'duzeltme', status: 'tamamlandi', date: '2025-01-12', deadline: '2025-02-12', customer: 'Mehmet Kaya', email: 'mehmet@email.com', source: 'Amazon TR', details: 'Telefon numarası güncelleme talebi' },
  { id: 'req-004', requestNo: 'KVKK-2024-0844', type: 'silme', status: 'tamamlandi', date: '2025-01-10', deadline: '2025-02-10', customer: 'Ayşe Çelik', email: 'ayse@email.com', source: 'Pazarama', details: 'Hesap kapatma ve veri silme talebi' },
  { id: 'req-005', requestNo: 'KVKK-2024-0843', type: 'itiraz', status: 'isleniyor', date: '2025-01-09', deadline: '2025-02-09', customer: 'Can Öztürk', email: 'can@email.com', source: 'Hepsiburada', details: 'Veri işleme itirazı - pazarlama verileri' },
  { id: 'req-006', requestNo: 'KVKK-2024-0842', type: 'erisim', status: 'reddedildi', date: '2025-01-08', deadline: '2025-02-08', customer: 'Zeynep Arslan', email: 'zeynep@email.com', source: 'Trendyol', details: 'Şirket içi rapor verileri erişim talebi (ret)' },
  { id: 'req-007', requestNo: 'KVKK-2024-0841', type: 'duzeltme', status: 'bekliyor', date: '2025-01-16', deadline: '2025-02-16', customer: 'Burak Koç', email: 'burak@email.com', source: 'Amazon TR', details: 'Teslimat adresi düzeltme talebi' },
  { id: 'req-008', requestNo: 'KVKK-2024-0840', type: 'silme', status: 'isleniyor', date: '2025-01-07', deadline: '2025-02-07', customer: 'Selin Aydın', email: 'selin@email.com', source: 'Pazarama', details: 'Kredi kartı verilerinin silinmesi talebi' },
  { id: 'req-009', requestNo: 'KVKK-2024-0839', type: 'erisim', status: 'tamamlandi', date: '2025-01-05', deadline: '2025-02-05', customer: 'Emre Şahin', email: 'emre@email.com', source: 'Hepsiburada', details: 'Tüm kişisel verilerin kopyası talebi' },
  { id: 'req-010', requestNo: 'KVKK-2024-0838', type: 'itiraz', status: 'bekliyor', date: '2025-01-17', deadline: '2025-02-17', customer: 'Deniz Yıldız', email: 'deniz@email.com', source: 'Trendyol', details: 'Otomatik karar sistemine itiraz' },
  { id: 'req-011', requestNo: 'KVKK-2024-0837', type: 'duzeltme', status: 'tamamlandi', date: '2025-01-03', deadline: '2025-02-03', customer: 'Fatma Güneş', email: 'fatma@email.com', source: 'Amazon TR', details: 'E-posta adresi güncelleme talebi' },
  { id: 'req-012', requestNo: 'KVKK-2024-0836', type: 'silme', status: 'reddedildi', date: '2024-12-28', deadline: '2025-01-28', customer: 'Hakan Polat', email: 'hakan@email.com', source: 'Pazarama', details: 'Veri silme talebi - yasal yükümlülük nedeniyle ret' },
];

const MOCK_PERMISSIONS: PermissionType[] = [
  { id: 'perm-001', name: 'Pazarlama İzni', description: 'Kampanya, indirim ve özel teklif bildirimleri için kullanıcı onayı', enabled: true, totalApprovals: 12847, totalRejections: 4213, approvalRate: 75.3, lastUpdated: '2025-01-15' },
  { id: 'perm-002', name: 'Analitik İzni', description: 'Kullanıcı davranışı analizi ve site iyileştirmesi için çerez/analytics onayı', enabled: true, totalApprovals: 15234, totalRejections: 1826, approvalRate: 89.3, lastUpdated: '2025-01-14' },
  { id: 'perm-003', name: 'Üçüncü Taraf Paylaşımı', description: 'Kargo, ödeme ve lojistik partnerleri ile veri paylaşımı onayı', enabled: false, totalApprovals: 8934, totalRejections: 8126, approvalRate: 52.4, lastUpdated: '2025-01-13' },
  { id: 'perm-004', name: 'Konum Verisi İzni', description: 'Teslimat optimizasyonu için konum verisi kullanımı onayı', enabled: true, totalApprovals: 9456, totalRejections: 7604, approvalRate: 55.4, lastUpdated: '2025-01-12' },
  { id: 'perm-005', name: 'Profil Oluşturma İzni', description: 'Kişiselleştirilmiş ürün önerileri için kullanıcı profili oluşturma onayı', enabled: true, totalApprovals: 11203, totalRejections: 5857, approvalRate: 65.7, lastUpdated: '2025-01-11' },
];

const MOCK_REPORTS: ComplianceReport[] = [
  { id: 'rpt-001', month: 'Ocak 2025', totalRequests: 47, completedOnTime: 38, overdue: 4, complianceRate: 90.5, status: 'good' },
  { id: 'rpt-002', month: 'Aralık 2024', totalRequests: 62, completedOnTime: 49, overdue: 8, complianceRate: 79.0, status: 'warning' },
  { id: 'rpt-003', month: 'Kasım 2024', totalRequests: 53, completedOnTime: 50, overdue: 2, complianceRate: 96.2, status: 'good' },
  { id: 'rpt-004', month: 'Ekim 2024', totalRequests: 71, completedOnTime: 45, overdue: 14, complianceRate: 63.4, status: 'critical' },
  { id: 'rpt-005', month: 'Eylül 2024', totalRequests: 58, completedOnTime: 52, overdue: 3, complianceRate: 94.8, status: 'good' },
  { id: 'rpt-006', month: 'Ağustos 2024', totalRequests: 44, completedOnTime: 40, overdue: 1, complianceRate: 97.7, status: 'good' },
];

/* ================================================================
   Helper Functions
   ================================================================ */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtNumber = (n: number) =>
  new Intl.NumberFormat('tr-TR').format(n);

/* ================================================================
   Circular Progress Component
   ================================================================ */
function CircularProgress({ percentage, size = 140, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-500"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Uyum</span>
      </div>
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function KvkkCompliance() {
  const { sidebarOpen } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [requests, setRequests] = useState<DataRequest[]>(MOCK_REQUESTS);
  const [permissions, setPermissions] = useState<PermissionType[]>(MOCK_PERMISSIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  /* ---------- derived stats ---------- */
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'bekliyor').length;
    const processing = requests.filter((r) => r.status === 'isleniyor').length;
    const overdue = requests.filter((r) => {
      const deadline = new Date(r.deadline);
      const now = new Date();
      return deadline < now && r.status !== 'tamamlandi' && r.status !== 'reddedildi';
    }).length;
    const completed = requests.filter((r) => r.status === 'tamamlandi').length;
    const rejected = requests.filter((r) => r.status === 'reddedildi').length;
    const totalPermApprovals = permissions.reduce((a, b) => a + b.totalApprovals, 0);
    const totalPermRejections = permissions.reduce((a, b) => a + b.totalRejections, 0);
    return { total, pending, processing, overdue, completed, rejected, totalPermApprovals, totalPermRejections };
  }, [requests, permissions]);

  /* ---------- filtered requests ---------- */
  const filteredRequests = useMemo(() => {
    let items = [...requests];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(
        (r) =>
          r.requestNo.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.details.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      items = items.filter((r) => r.status === filterStatus);
    }
    if (filterType !== 'all') {
      items = items.filter((r) => r.type === filterType);
    }
    return items;
  }, [requests, searchTerm, filterStatus, filterType]);

  /* ---------- handlers ---------- */
  const handleTogglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleProcessRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'isleniyor' as const } : r))
    );
  };

  const handleViewRequest = (req: DataRequest) => {
    setSelectedRequest(req);
    setViewDialogOpen(true);
  };

  const handleNewRequest = () => {
    setDialogOpen(false);
  };

  const handleRefresh = () => {
    setRequests(MOCK_REQUESTS);
    setPermissions(MOCK_PERMISSIONS);
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
  };

  /* ---------- render ---------- */
  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-7 w-7" />
              KVKK & Veri Yönetimi
            </h1>
            <p className="text-sm text-emerald-100 mt-1">
              Kişisel verilerin korunması, veri talepleri ve izin yönetimi merkezi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 hover:text-white"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenile
            </Button>
            <Button
              size="sm"
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm font-semibold"
            >
              <Download className="h-4 w-4 mr-1" />
              Rapor İndir
            </Button>
          </div>
        </div>
      </div>

      {/* ==================== COMPLIANCE SCORE + STATS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Compliance Score Card */}
        <Card className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <CircularProgress percentage={78} size={130} strokeWidth={10} />
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-slate-700">Uyum Skoru</p>
              <p className="text-xs text-slate-400 mt-0.5">KVKK uyumluluk oranı</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Veri Talebi</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmtNumber(stats.total)}</p>
                <p className="text-xs text-slate-400 mt-1">bu dönem</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bekleyen Talep</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                <p className="text-xs text-slate-400 mt-1">işlem bekleniyor</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlenen Talep</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</p>
                <p className="text-xs text-slate-400 mt-1">devam ediyor</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Süre Aşımı</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                <p className="text-xs text-slate-400 mt-1">süresi geçmiş</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== TABS ==================== */}
      <Tabs defaultValue="genel" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm">
          <TabsTrigger value="genel" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="talepler" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <FileText className="h-4 w-4 mr-1.5" />
            Veri Talepleri
          </TabsTrigger>
          <TabsTrigger value="izinler" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <ToggleLeft className="h-4 w-4 mr-1.5" />
            İzin Yönetimi
          </TabsTrigger>
          <TabsTrigger value="raporlar" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <ClipboardCheck className="h-4 w-4 mr-1.5" />
            Raporlama
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB: Genel Bakış ===== */}
        <TabsContent value="genel">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Summary */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Genel Durum Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Tamamlanan</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-800">{stats.completed}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">Reddedilen</span>
                    </div>
                    <p className="text-xl font-bold text-red-800">{stats.rejected}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700">Bekleyen</span>
                    </div>
                    <p className="text-xl font-bold text-amber-800">{stats.pending}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">İşleniyor</span>
                    </div>
                    <p className="text-xl font-bold text-blue-800">{stats.processing}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">İzin Onayları</span>
                    <span className="font-semibold text-emerald-700">{fmtNumber(stats.totalPermApprovals)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">İzin Redleri</span>
                    <span className="font-semibold text-red-700">{fmtNumber(stats.totalPermRejections)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Genel Onay Oranı</span>
                    <span className="font-semibold text-slate-800">
                      {stats.totalPermApprovals + stats.totalPermRejections > 0
                        ? ((stats.totalPermApprovals / (stats.totalPermApprovals + stats.totalPermRejections)) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {requests.slice(0, 6).map((req) => {
                    const typeCfg = REQUEST_TYPE_CONFIG[req.type];
                    const statusCfg = STATUS_CONFIG[req.status];
                    return (
                      <div
                        key={req.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => handleViewRequest(req)}
                      >
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs', typeCfg.color)}>
                          {typeCfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-800">{req.requestNo}</span>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 font-medium border', statusCfg.color)}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{req.customer} — {req.source}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{fmtDate(req.date)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Alerts */}
            <Card className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Uyarılar & Bildirimler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">3 Süre Aşımı Uyarısı</p>
                      <p className="text-xs text-amber-600 mt-1">30 gün yasal süre aşımına yakın talepler mevcut</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">KVKK Ayarlar Güncellemesi</p>
                      <p className="text-xs text-blue-600 mt-1">Aydınlatma metni son güncelleme: 15 Ocak 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <Lock className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Veri Şifreleme Aktif</p>
                      <p className="text-xs text-emerald-600 mt-1">Tüm kişisel veriler AES-256 ile şifrelenmektedir</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB: Veri Talepleri ===== */}
        <TabsContent value="talepler">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Veri Talepleri
                    <Badge variant="secondary" className="text-xs font-medium">{filteredRequests.length} talep</Badge>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Yeni Talep
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-slate-800">Yeni Veri Talebi Oluştur</DialogTitle>
                          <DialogDescription>KVKK kapsamında yeni bir veri talebi oluşturun</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Müşteri Adı</Label>
                            <Input placeholder="Ad Soyad girin" className="h-9" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">E-posta</Label>
                            <Input placeholder="ornek@email.com" type="email" className="h-9" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Talep Türü</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(REQUEST_TYPE_CONFIG).map(([key, cfg]) => (
                                <Button key={key} variant="outline" size="sm" className={cn('text-xs justify-start gap-1.5', key === 'erisim' && 'border-emerald-300 bg-emerald-50 text-emerald-700')}>
                                  {cfg.icon}
                                  {cfg.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Açıklama</Label>
                            <Input placeholder="Talep detaylarını yazın..." className="h-9" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleNewRequest}>
                            Oluştur
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="text-slate-600">
                      <Filter className="h-4 w-4 mr-1" />
                      Filtrele
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600">
                      <Download className="h-4 w-4 mr-1" />
                      Dışa Aktar
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600">
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600">
                      <Printer className="h-4 w-4 mr-1" />
                      Yazdır
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Yenile
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Talep ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 w-56 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {['all', 'bekliyor', 'isleniyor', 'tamamlandi', 'reddedildi'].map((status) => {
                      const cfg = status !== 'all' ? STATUS_CONFIG[status] : null;
                      return (
                        <Button
                          key={status}
                          variant={filterStatus === status ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'text-xs h-8',
                            filterStatus === status
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'text-slate-600'
                          )}
                          onClick={() => setFilterStatus(status)}
                        >
                          {status === 'all' ? 'Tümü' : cfg?.label}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-slate-400 mr-1">Tür:</span>
                    {['all', 'silme', 'erisim', 'duzeltme', 'itiraz'].map((type) => {
                      const cfg = type !== 'all' ? REQUEST_TYPE_CONFIG[type] : null;
                      return (
                        <Button
                          key={type}
                          variant={filterType === type ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'text-xs h-8',
                            filterType === type
                              ? 'bg-slate-800 hover:bg-slate-900 text-white'
                              : 'text-slate-600'
                          )}
                          onClick={() => setFilterType(type)}
                        >
                          {type === 'all' ? 'Tümü' : cfg?.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Talep No</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Tür</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Durum</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Tarih</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Müşteri</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden xl:table-cell">Kaynak</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => {
                      const typeCfg = REQUEST_TYPE_CONFIG[req.type];
                      const statusCfg = STATUS_CONFIG[req.status];
                      return (
                        <tr key={req.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs font-semibold text-slate-700">{req.requestNo}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 font-medium border', typeCfg.color)}>
                              {typeCfg.icon}
                              <span className="ml-1">{typeCfg.label}</span>
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 font-medium border', statusCfg.color)}>
                              {statusCfg.label}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-slate-500 hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {fmtDate(req.date)}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500">
                                {req.customer.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-700">{req.customer}</p>
                                <p className="text-[10px] text-slate-400">{req.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 hidden xl:table-cell">
                            <Badge variant="secondary" className="text-[10px] h-5">{req.source}</Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {req.status === 'bekliyor' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => handleProcessRequest(req.id)}
                                  title="İşle"
                                >
                                  <Activity className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => handleViewRequest(req)}
                                title="Görüntüle"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                title="İndir"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredRequests.length === 0 && (
                <div className="py-10 text-center">
                  <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Talep bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB: İzin Yönetimi ===== */}
        <TabsContent value="izinler">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Permission Stats */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    İzin İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">Toplam Onay</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800">{fmtNumber(stats.totalPermApprovals)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <UserX className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">Toplam Ret</span>
                    </div>
                    <p className="text-2xl font-bold text-red-800">{fmtNumber(stats.totalPermRejections)}</p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Onay Oranı</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {stats.totalPermApprovals + stats.totalPermRejections > 0
                          ? ((stats.totalPermApprovals / (stats.totalPermApprovals + stats.totalPermRejections)) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.totalPermApprovals + stats.totalPermRejections > 0
                            ? (stats.totalPermApprovals / (stats.totalPermApprovals + stats.totalPermRejections)) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permission Cards */}
            <div className="lg:col-span-2 space-y-4">
              {permissions.map((perm) => (
                <Card
                  key={perm.id}
                  className={cn(
                    'bg-white rounded-xl shadow-sm border transition-all',
                    perm.enabled ? 'border-slate-200' : 'border-slate-200 opacity-75'
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-slate-800">{perm.name}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0 h-5 font-medium border',
                              perm.enabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            )}
                          >
                            {perm.enabled ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{perm.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="font-medium">{fmtNumber(perm.totalApprovals)} Onay</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-500">
                            <UserX className="h-3.5 w-3.5" />
                            <span className="font-medium">{fmtNumber(perm.totalRejections)} Ret</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Globe className="h-3.5 w-3.5" />
                            <span>Son: {fmtDate(perm.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <Switch
                          checked={perm.enabled}
                          onCheckedChange={() => handleTogglePermission(perm.id)}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-800">%{perm.approvalRate}</p>
                          <p className="text-[10px] text-slate-400">onay oranı</p>
                        </div>
                      </div>
                    </div>
                    {/* Approval bar */}
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={cn('h-1.5 rounded-full transition-all duration-500', perm.enabled ? 'bg-emerald-500' : 'bg-slate-400')}
                        style={{ width: `${perm.approvalRate}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ===== TAB: Raporlama ===== */}
        <TabsContent value="raporlar">
          <div className="space-y-6">
            {/* Report Summary */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                    Aylık Uyum Raporları
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-slate-600">
                      <Download className="h-4 w-4 mr-1" />
                      Tüm Raporları İndir
                    </Button>
                    <Button variant="outline" size="sm" className="text-slate-600">
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel&apos;e Aktar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Dönem</th>
                        <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Toplam Talep</th>
                        <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Zamanında</th>
                        <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Süre Aşımı</th>
                        <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Uyum Oranı</th>
                        <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Durum</th>
                        <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">İndir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_REPORTS.map((report) => {
                        const statusStyles: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                          good: { label: 'İyi', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> },
                          warning: { label: 'Uyarı', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> },
                          critical: { label: 'Kritik', color: 'bg-red-100 text-red-700 border-red-200', icon: <ShieldAlert className="h-3.5 w-3.5 text-red-600" /> },
                        };
                        const s = statusStyles[report.status];
                        return (
                          <tr key={report.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-700">{report.month}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-semibold text-slate-800">{report.totalRequests}</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="text-emerald-600 font-medium">{report.completedOnTime}</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={cn('font-medium', report.overdue > 5 ? 'text-red-600' : report.overdue > 0 ? 'text-amber-600' : 'text-slate-500')}>
                                {report.overdue}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 bg-slate-100 rounded-full h-2">
                                  <div
                                    className={cn(
                                      'h-2 rounded-full',
                                      report.complianceRate >= 90 ? 'bg-emerald-500' :
                                      report.complianceRate >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${report.complianceRate}%` }}
                                  />
                                </div>
                                <span className={cn(
                                  'text-xs font-bold',
                                  report.complianceRate >= 90 ? 'text-emerald-700' :
                                  report.complianceRate >= 70 ? 'text-amber-700' : 'text-red-700'
                                )}>
                                  %{report.complianceRate}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 font-medium border', s.color)}>
                                {s.icon}
                                <span className="ml-1">{s.label}</span>
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                title="Rapor İndir"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">Aydınlatma Metni Raporu</h3>
                      <p className="text-xs text-slate-500 mt-1">Tüm platformlardaki aydınlatma metinlerinin uyum durum raporu</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                      <Lock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">Veri Güvenlik Denetimi</h3>
                      <p className="text-xs text-slate-500 mt-1">Veri işleme süreçleri ve güvenlik önlemleri denetim raporu</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 shrink-0">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">İzin Yönetim Raporu</h3>
                      <p className="text-xs text-slate-500 mt-1">Tüm izin türlerinin onay/ret istatistikleri ve trend analizi</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs text-purple-600 border-purple-200 hover:bg-purple-50">
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        Excel İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                      <TrendingDown className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">Süre Aşımı Analizi</h3>
                      <p className="text-xs text-slate-500 mt-1">30 günlük yasal süreyi aşan taleplerin detay analizi</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs text-amber-600 border-amber-200 hover:bg-amber-50">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 shrink-0">
                      <Globe className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">Çapraz Sınır Veri Aktarımı</h3>
                      <p className="text-xs text-slate-500 mt-1">Uluslararası veri aktarım süreçlerinin uyum raporu</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs text-cyan-600 border-cyan-200 hover:bg-cyan-50">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 shrink-0">
                      <BarChart3 className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">KVKK İhlal Raporu</h3>
                      <p className="text-xs text-slate-500 mt-1">Veri ihlalleri, bildirimler ve düzeltici faaliyetler raporu</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== VIEW REQUEST DIALOG ===== */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Talep Detayı
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.requestNo}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Talep Türü</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={cn('text-xs px-2 py-0.5 font-medium border', REQUEST_TYPE_CONFIG[selectedRequest.type].color)}>
                      {REQUEST_TYPE_CONFIG[selectedRequest.type].icon}
                      <span className="ml-1">{REQUEST_TYPE_CONFIG[selectedRequest.type].label}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Durum</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={cn('text-xs px-2 py-0.5 font-medium border', STATUS_CONFIG[selectedRequest.status].color)}>
                      {STATUS_CONFIG[selectedRequest.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Müşteri</Label>
                  <p className="text-sm font-medium text-slate-700 mt-1">{selectedRequest.customer}</p>
                  <p className="text-xs text-slate-500">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kaynak</Label>
                  <p className="text-sm font-medium text-slate-700 mt-1">{selectedRequest.source}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Talep Tarihi</Label>
                  <p className="text-sm text-slate-700 mt-1">{fmtDate(selectedRequest.date)}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Son Tarih</Label>
                  <p className="text-sm text-slate-700 mt-1">{fmtDate(selectedRequest.deadline)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Açıklama</Label>
                <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded-lg p-3">{selectedRequest.details}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Kapat</Button>
            {selectedRequest?.status === 'bekliyor' && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  if (selectedRequest) {
                    handleProcessRequest(selectedRequest.id);
                    setViewDialogOpen(false);
                  }
                }}
              >
                <Activity className="h-4 w-4 mr-1" />
                İşlemi Başlat
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
