'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Edit,
  Copy,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  Play,
  Rocket,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

/* ================================================================
   Types
   ================================================================ */
interface Task {
  id: string;
  name: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ProductLaunch {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  channels: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'prepared' | 'launched' | 'completed' | 'cancelled';
  launchDate: string;
  startDate: string;
  endDate: string;
  budget: number;
  budgetSpent: number;
  tasks: Task[];
  checklist: ChecklistItem[];
  createdAt: string;
}

/* ================================================================
   Constants
   ================================================================ */
const CHANNELS = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'n11', 'Çiçeksepeti', 'Morhipo', 'Pazarama'];

const CHANNEL_COLORS: Record<string, string> = {
  Trendyol: 'bg-blue-100 text-blue-700',
  Hepsiburada: 'bg-orange-100 text-orange-700',
  'Amazon TR': 'bg-amber-100 text-amber-700',
  n11: 'bg-purple-100 text-purple-700',
  Çiçeksepeti: 'bg-pink-100 text-pink-700',
  Morhipo: 'bg-cyan-100 text-cyan-700',
  Pazarama: 'bg-teal-100 text-teal-700',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; barColor: string; dotColor: string }> = {
  planning: { label: 'Planlama', color: 'bg-blue-100 text-blue-700 border-blue-200', barColor: 'bg-blue-500', dotColor: 'bg-blue-500' },
  prepared: { label: 'Hazırlanan', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', barColor: 'bg-yellow-500', dotColor: 'bg-yellow-500' },
  launched: { label: 'Yayında', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', barColor: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
  completed: { label: 'Tamamlandı', color: 'bg-slate-100 text-slate-600 border-slate-200', barColor: 'bg-slate-400', dotColor: 'bg-slate-400' },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700 border-red-200', barColor: 'bg-red-500', dotColor: 'bg-red-500' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Orta', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Kritik', color: 'bg-red-100 text-red-700' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

/* ================================================================
   Demo Data
   ================================================================ */
const DEMO_LAUNCHES: ProductLaunch[] = [
  {
    id: 'pl-001',
    name: 'Yaz Sezonu Elektronik Kampanyası',
    description: 'Tüm yaz sezonu için elektronik ürünlerin lansmanı',
    productIds: ['PRD-001', 'PRD-002', 'PRD-005'],
    channels: ['Trendyol', 'Hepsiburada', 'Amazon TR'],
    priority: 'high',
    status: 'launched',
    launchDate: '2025-01-15',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    budget: 50000,
    budgetSpent: 32500,
    tasks: [
      { id: 't1', name: 'Ürün fotoğrafları çekimi', assignee: 'Ayşe Y.', dueDate: '2024-12-20', completed: true },
      { id: 't2', name: 'Açıklama metinleri yazımı', assignee: 'Mehmet K.', dueDate: '2024-12-25', completed: true },
      { id: 't3', name: 'Fiyatlandırma stratejisi', assignee: 'Ali R.', dueDate: '2024-12-28', completed: true },
      { id: 't4', name: 'Stok aktarımı', assignee: 'Fatma S.', dueDate: '2025-01-05', completed: true },
      { id: 't5', name: 'Reklam kampanyası kurulumu', assignee: 'Burak T.', dueDate: '2025-01-12', completed: false },
      { id: 't6', name: 'Performans takibi', assignee: 'Zeynep A.', dueDate: '2025-01-20', completed: false },
    ],
    checklist: [
      { id: 'c1', label: 'Ürün görselleri hazır', checked: true },
      { id: 'c2', label: 'Açıklamalar hazır', checked: true },
      { id: 'c3', label: 'Fiyatlandırma ayarlandı', checked: true },
      { id: 'c4', label: 'Stok aktarıldı', checked: true },
    ],
    createdAt: '2024-12-10T08:00:00Z',
  },
  {
    id: 'pl-002',
    name: 'Kış Koleksiyonu Giyim Lansmanı',
    description: '2025 kış sezonu giyim ürünlerinin tüm platformlara lansmanı',
    productIds: ['PRD-010', 'PRD-011', 'PRD-012', 'PRD-013'],
    channels: ['Trendyol', 'Hepsiburada', 'n11', 'Morhipo'],
    priority: 'critical',
    status: 'prepared',
    launchDate: '2025-02-01',
    startDate: '2025-01-15',
    endDate: '2025-04-30',
    budget: 75000,
    budgetSpent: 28000,
    tasks: [
      { id: 't7', name: 'Katalog tasarımı', assignee: 'Selin M.', dueDate: '2025-01-10', completed: true },
      { id: 't8', name: 'Model fotoğraf çekimi', assignee: 'Emre D.', dueDate: '2025-01-15', completed: true },
      { id: 't9', name: 'Platform entegrasyon testi', assignee: 'Can B.', dueDate: '2025-01-20', completed: false },
      { id: 't10', name: 'SEO optimizasyonu', assignee: 'Deniz K.', dueDate: '2025-01-25', completed: false },
    ],
    checklist: [
      { id: 'c5', label: 'Ürün görselleri hazır', checked: true },
      { id: 'c6', label: 'Açıklamalar hazır', checked: true },
      { id: 'c7', label: 'Fiyatlandırma ayarlandı', checked: false },
      { id: 'c8', label: 'Stok aktarıldı', checked: false },
    ],
    createdAt: '2024-12-20T10:00:00Z',
  },
  {
    id: 'pl-003',
    name: 'Ev & Yaşam Yeni Ürün Serisi',
    description: 'Ev ve yaşam kategorisindeki yeni ürünlerin pazaryeri lansmanı',
    productIds: ['PRD-020', 'PRD-021'],
    channels: ['Trendyol', 'Çiçeksepeti'],
    priority: 'medium',
    status: 'planning',
    launchDate: '2025-03-01',
    startDate: '2025-02-15',
    endDate: '2025-05-31',
    budget: 25000,
    budgetSpent: 3000,
    tasks: [
      { id: 't11', name: 'Ürün araştırması', assignee: 'Gül N.', dueDate: '2025-01-30', completed: true },
      { id: 't12', name: 'Tedarikçi görüşmeleri', assignee: 'Hakan P.', dueDate: '2025-02-05', completed: false },
      { id: 't13', name: 'İçerik üretimi', assignee: 'İrem T.', dueDate: '2025-02-15', completed: false },
    ],
    checklist: [
      { id: 'c9', label: 'Ürün görselleri hazır', checked: false },
      { id: 'c10', label: 'Açıklamalar hazır', checked: false },
      { id: 'c11', label: 'Fiyatlandırma ayarlandı', checked: false },
      { id: 'c12', label: 'Stok aktarıldı', checked: false },
    ],
    createdAt: '2024-12-28T14:00:00Z',
  },
  {
    id: 'pl-004',
    name: 'Spor Malzemeleri Bahar Kampanyası',
    description: 'Spor malzemeleri kategorisi için bahar sezonu lansmanı',
    productIds: ['PRD-030', 'PRD-031', 'PRD-032'],
    channels: ['Hepsiburada', 'Amazon TR', 'n11'],
    priority: 'high',
    status: 'planning',
    launchDate: '2025-04-01',
    startDate: '2025-03-15',
    endDate: '2025-06-30',
    budget: 40000,
    budgetSpent: 0,
    tasks: [
      { id: 't14', name: 'Pazar araştırması', assignee: 'Kaan Y.', dueDate: '2025-02-15', completed: false },
      { id: 't15', name: 'Tedarik zinciri planlaması', assignee: 'Lale S.', dueDate: '2025-02-28', completed: false },
    ],
    checklist: [
      { id: 'c13', label: 'Ürün görselleri hazır', checked: false },
      { id: 'c14', label: 'Açıklamalar hazır', checked: false },
      { id: 'c15', label: 'Fiyatlandırma ayarlandı', checked: false },
      { id: 'c16', label: 'Stok aktarıldı', checked: false },
    ],
    createdAt: '2025-01-02T09:00:00Z',
  },
  {
    id: 'pl-005',
    name: 'Bahar Teknoloji Fırsatları',
    description: 'Teknoloji ürünleri için bahar indirimi lansmanı',
    productIds: ['PRD-040', 'PRD-041'],
    channels: ['Trendyol', 'Pazarama', 'Hepsiburada'],
    priority: 'medium',
    status: 'completed',
    launchDate: '2024-10-15',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    budget: 35000,
    budgetSpent: 34200,
    tasks: [
      { id: 't16', name: 'Ürün seçimi', assignee: 'Mert A.', dueDate: '2024-09-20', completed: true },
      { id: 't17', name: 'Fiyat analizi', assignee: 'Seda K.', dueDate: '2024-09-25', completed: true },
      { id: 't18', name: 'Görsel tasarım', assignee: 'Uğur T.', dueDate: '2024-09-30', completed: true },
      { id: 't19', name: 'Platform yükleme', assignee: 'Vildan B.', dueDate: '2024-10-10', completed: true },
    ],
    checklist: [
      { id: 'c17', label: 'Ürün görselleri hazır', checked: true },
      { id: 'c18', label: 'Açıklamalar hazır', checked: true },
      { id: 'c19', label: 'Fiyatlandırma ayarlandı', checked: true },
      { id: 'c20', label: 'Stok aktarıldı', checked: true },
    ],
    createdAt: '2024-09-15T08:00:00Z',
  },
  {
    id: 'pl-006',
    name: 'Mutfak Gereçleri Özel Serisi',
    description: 'Premium mutfak gereçleri için özel lansman',
    productIds: ['PRD-050'],
    channels: ['Trendyol'],
    priority: 'low',
    status: 'cancelled',
    launchDate: '2025-01-20',
    startDate: '2025-01-05',
    endDate: '2025-03-20',
    budget: 15000,
    budgetSpent: 5000,
    tasks: [
      { id: 't20', name: 'Ürün testi', assignee: 'Yusuf E.', dueDate: '2024-12-30', completed: true },
      { id: 't21', name: 'Ambalaj tasarımı', assignee: 'Aslı D.', dueDate: '2025-01-05', completed: false },
    ],
    checklist: [
      { id: 'c21', label: 'Ürün görselleri hazır', checked: true },
      { id: 'c22', label: 'Açıklamalar hazır', checked: false },
      { id: 'c23', label: 'Fiyatlandırma ayarlandı', checked: false },
      { id: 'c24', label: 'Stok aktarıldı', checked: false },
    ],
    createdAt: '2024-12-15T11:00:00Z',
  },
];

/* ================================================================
   Helper Functions
   ================================================================ */

function getTaskProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}

function getBudgetProgress(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return Math.round((spent / budget) * 100);
}

function getUpcomingDeadlines(tasks: Task[], limit: number = 3): Task[] {
  const now = new Date();
  return tasks
    .filter((t) => !t.completed && new Date(t.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit);
}

function getTimelineWidth(startDate: string, endDate: string, rangeStart: Date, rangeEnd: Date): number {
  const totalRange = rangeEnd.getTime() - rangeStart.getTime();
  if (totalRange <= 0) return 0;
  const s = Math.max(new Date(startDate).getTime(), rangeStart.getTime());
  const e = Math.min(new Date(endDate).getTime(), rangeEnd.getTime());
  return Math.max(((e - s) / totalRange) * 100, 2);
}

function getTimelineLeft(startDate: string, rangeStart: Date, rangeEnd: Date): number {
  const totalRange = rangeEnd.getTime() - rangeStart.getTime();
  if (totalRange <= 0) return 0;
  const s = Math.max(new Date(startDate).getTime(), rangeStart.getTime());
  return ((s - rangeStart.getTime()) / totalRange) * 100;
}

function daysUntil(date: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/* ================================================================
   Skeleton
   ================================================================ */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-52 bg-slate-200 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function ProductLaunchCalendar() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<ProductLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Create launch form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProductIds, setFormProductIds] = useState('');
  const [formChannels, setFormChannels] = useState<string[]>([]);
  const [formPriority, setFormPriority] = useState<string>('medium');
  const [formLaunchDate, setFormLaunchDate] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formTasks, setFormTasks] = useState<{ name: string; assignee: string; dueDate: string }[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [formChecklist, setFormChecklist] = useState<Record<string, boolean>>({
    images: false,
    descriptions: false,
    pricing: false,
    inventory: false,
  });

  /* ---------- load data ---------- */
  useEffect(() => {
    fetch('/api/product-launches')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setData(res);
        } else {
          setData(DEMO_LAUNCHES);
        }
      })
      .catch(() => setData(DEMO_LAUNCHES))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- derived data ---------- */
  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((l) => ['planning', 'prepared', 'launched'].includes(l.status)).length;
    const completed = data.filter((l) => l.status === 'completed').length;
    const totalBudget = data.reduce((a, b) => a + b.budget, 0);
    const totalSpent = data.reduce((a, b) => a + b.budgetSpent, 0);
    const upcomingDeadlines = data.reduce((acc, l) => acc + getUpcomingDeadlines(l.tasks).length, 0);
    return { total, active, completed, totalBudget, totalSpent, upcomingDeadlines };
  }, [data]);

  const filteredData = useMemo(() => {
    let items = [...data];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter((l) => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      items = items.filter((l) => l.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      items = items.filter((l) => l.priority === filterPriority);
    }
    return items;
  }, [data, searchTerm, filterStatus, filterPriority]);

  // Timeline range
  const timelineRange = useMemo(() => {
    if (data.length === 0) {
      const now = new Date();
      return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth() + 5, 0) };
    }
    const allDates = data.flatMap((l) => [new Date(l.startDate), new Date(l.endDate)]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    // Add padding
    minDate.setDate(minDate.getDate() - 15);
    maxDate.setDate(maxDate.getDate() + 15);
    return { start: minDate, end: maxDate };
  }, [data]);

  const activeLaunches = useMemo(() => data.filter((l) => ['planning', 'prepared', 'launched'].includes(l.status)), [data]);

  /* ---------- handlers ---------- */
  const handleCreateLaunch = () => {
    const newLaunch: ProductLaunch = {
      id: `pl-${Date.now()}`,
      name: formName,
      description: formDescription,
      productIds: formProductIds.split(',').map((s) => s.trim()).filter(Boolean),
      channels: formChannels,
      priority: formPriority as ProductLaunch['priority'],
      status: 'planning',
      launchDate: formLaunchDate,
      startDate: formStartDate,
      endDate: formEndDate,
      budget: parseFloat(formBudget) || 0,
      budgetSpent: 0,
      tasks: formTasks.map((t, i) => ({
        id: `t-${Date.now()}-${i}`,
        name: t.name,
        assignee: t.assignee,
        dueDate: t.dueDate,
        completed: false,
      })),
      checklist: [
        { id: 'c-new-1', label: 'Ürün görselleri hazır', checked: formChecklist.images },
        { id: 'c-new-2', label: 'Açıklamalar hazır', checked: formChecklist.descriptions },
        { id: 'c-new-3', label: 'Fiyatlandırma ayarlandı', checked: formChecklist.pricing },
        { id: 'c-new-4', label: 'Stok aktarıldı', checked: formChecklist.inventory },
      ],
      createdAt: new Date().toISOString(),
    };
    setData((prev) => [...prev, newLaunch]);
    // Reset form
    setFormName('');
    setFormDescription('');
    setFormProductIds('');
    setFormChannels([]);
    setFormPriority('medium');
    setFormLaunchDate('');
    setFormStartDate('');
    setFormEndDate('');
    setFormBudget('');
    setFormTasks([]);
    setFormChecklist({ images: false, descriptions: false, pricing: false, inventory: false });
  };

  const addFormTask = () => {
    if (!newTaskName.trim()) return;
    setFormTasks((prev) => [...prev, { name: newTaskName, assignee: newTaskAssignee, dueDate: newTaskDue }]);
    setNewTaskName('');
    setNewTaskAssignee('');
    setNewTaskDue('');
  };

  const removeFormTask = (index: number) => {
    setFormTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleChannel = (channel: string) => {
    setFormChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton />
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-blue-600" />
            Ürün Lansman Takvimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lansmanları planlayın, takip edin ve yönetin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Toplam Lansman', value: stats.total, icon: <Calendar className="h-5 w-5 text-white" />, bg: 'bg-blue-500' },
          { label: 'Aktif Lansman', value: stats.active, icon: <Play className="h-5 w-5 text-white" />, bg: 'bg-emerald-500' },
          { label: 'Tamamlanan', value: stats.completed, icon: <Check className="h-5 w-5 text-white" />, bg: 'bg-slate-500' },
          { label: 'Toplam Bütçe', value: fmt(stats.totalBudget), icon: <DollarSign className="h-5 w-5 text-white" />, bg: 'bg-amber-500' },
          { label: 'Harcanan', value: fmt(stats.totalSpent), icon: <TrendingUp className="h-5 w-5 text-white" />, bg: 'bg-violet-500' },
          { label: 'Yaklaşan Son Tarih', value: stats.upcomingDeadlines, icon: <AlertTriangle className="h-5 w-5 text-white" />, bg: 'bg-red-500' },
        ].map((s, i) => (
          <div key={i} className={cn('bg-gradient-to-br text-white rounded-xl p-4 shadow-sm', s.bg === 'bg-blue-500' ? 'from-blue-500 to-blue-600' : s.bg === 'bg-emerald-500' ? 'from-emerald-500 to-emerald-600' : s.bg === 'bg-slate-500' ? 'from-slate-500 to-slate-600' : s.bg === 'bg-amber-500' ? 'from-amber-500 to-amber-600' : s.bg === 'bg-violet-500' ? 'from-violet-500 to-violet-600' : 'from-red-500 to-red-600')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/80">{s.label}</p>
                <p className="text-lg font-bold mt-1">{s.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm">
          <TabsTrigger value="calendar" className="text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Calendar className="h-4 w-4 mr-1.5" />
            Lansman Takvimi
          </TabsTrigger>
          <TabsTrigger value="create" className="text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Plus className="h-4 w-4 mr-1.5" />
            Lansman Oluştur
          </TabsTrigger>
          <TabsTrigger value="active" className="text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Play className="h-4 w-4 mr-1.5" />
            Aktif Lansmanlar
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Launch Calendar ===== */}
        <TabsContent value="calendar">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Lansman Zaman Çizelgesi
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Lansman ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 w-56 text-sm"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 w-36 text-sm">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="planning">Planlama</SelectItem>
                      <SelectItem value="prepared">Hazırlanan</SelectItem>
                      <SelectItem value="launched">Yayında</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="cancelled">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dotColor)} />
                    <span className="text-xs text-slate-500">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <p className="text-sm text-slate-400 py-10 text-center">Lansman bulunamadı</p>
              ) : (
                <div className="space-y-0">
                  {filteredData.map((launch) => {
                    const progress = getTaskProgress(launch.tasks);
                    const budgetPct = getBudgetProgress(launch.budgetSpent, launch.budget);
                    const width = getTimelineWidth(launch.startDate, launch.endDate, timelineRange.start, timelineRange.end);
                    const left = getTimelineLeft(launch.startDate, timelineRange.start, timelineRange.end);
                    const stCfg = STATUS_CONFIG[launch.status];
                    const prCfg = PRIORITY_CONFIG[launch.priority];

                    return (
                      <div key={launch.id} className="group py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                          {/* Left info */}
                          <div className="lg:w-64 shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-slate-800 truncate">{launch.name}</h3>
                              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 shrink-0', stCfg.color)}>
                                {stCfg.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {launch.channels.slice(0, 3).map((ch) => (
                                <span key={ch} className={cn('text-[10px] px-1.5 py-0 rounded-full font-medium', CHANNEL_COLORS[ch] || 'bg-slate-100 text-slate-600')}>
                                  {ch}
                                </span>
                              ))}
                              {launch.channels.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{launch.channels.length - 3}</span>
                              )}
                            </div>
                          </div>

                          {/* Timeline bar */}
                          <div className="flex-1 min-w-0">
                            <div className="relative h-8 bg-slate-100 rounded-md overflow-hidden">
                              <div
                                className={cn('absolute top-0 h-full rounded-md transition-all duration-500', stCfg.barColor)}
                                style={{ left: `${left}%`, width: `${width}%`, opacity: 0.35 }}
                              />
                              {/* Progress fill inside the bar */}
                              <div
                                className={cn('absolute top-0 h-full rounded-md transition-all duration-700', stCfg.barColor)}
                                style={{ left: `${left}%`, width: `${(width * progress) / 100}%`, opacity: 0.7 }}
                              />
                              {/* Launch date marker */}
                              {(() => {
                                const lPos = getTimelineLeft(launch.launchDate, timelineRange.start, timelineRange.end);
                                return (
                                  <div
                                    className="absolute top-0 h-full w-0.5 bg-slate-800/30"
                                    style={{ left: `${lPos}%` }}
                                  />
                                );
                              })()}
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                              <span>{fmtDate(launch.startDate)}</span>
                              <span className="font-medium text-slate-500"> Lansman: {fmtDate(launch.launchDate)}</span>
                              <span>{fmtDate(launch.endDate)}</span>
                            </div>
                          </div>

                          {/* Right indicators */}
                          <div className="lg:w-52 shrink-0 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">İlerleme</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700">{progress}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">Bütçe</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={cn('h-full rounded-full', budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-blue-500')} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700">{budgetPct}%</span>
                              </div>
                            </div>
                            <Badge variant="outline" className={cn('text-[10px] w-fit px-1.5 py-0 h-5', prCfg.color)}>
                              {prCfg.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Create Launch ===== */}
        <TabsContent value="create">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Yeni Lansman Oluştur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Row 1: Name & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Lansman Adı</Label>
                  <Input
                    placeholder="Örn: Yaz Sezonu Kampanyası"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Açıklama</Label>
                  <Textarea
                    placeholder="Lansman hakkında kısa açıklama..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="min-h-[38px] resize-none"
                    rows={1}
                  />
                </div>
              </div>

              {/* Row 2: Product IDs & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün ID&apos;leri (virgülle ayırın)</Label>
                  <Input
                    placeholder="PRD-001, PRD-002, PRD-003"
                    value={formProductIds}
                    onChange={(e) => setFormProductIds(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Öncelik</Label>
                  <Select value={formPriority} onValueChange={setFormPriority}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Lansman Tarihi</Label>
                  <Input
                    type="date"
                    value={formLaunchDate}
                    onChange={(e) => setFormLaunchDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 4: Budget & Channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Bütçe (₺)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Hedef Kanallar</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CHANNELS.map((ch) => (
                      <label
                        key={ch}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer text-xs font-medium transition-colors',
                          formChannels.includes(ch)
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        <Checkbox
                          checked={formChannels.includes(ch)}
                          onCheckedChange={() => toggleChannel(ch)}
                          className="h-3.5 w-3.5"
                        />
                        {ch}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 5: Tasks */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Görevler</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Görev adı"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="h-9 flex-1"
                  />
                  <Input
                    placeholder="Sorumlu"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="h-9 w-36"
                  />
                  <Input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="h-9 w-40"
                  />
                  <Button type="button" onClick={addFormTask} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-9">
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </Button>
                </div>
                {formTasks.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {formTasks.map((task, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-700">{task.name}</span>
                          <span className="text-xs text-slate-400">{task.assignee}</span>
                          <span className="text-xs text-slate-400">{task.dueDate ? fmtDate(task.dueDate) : ''}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFormTask(idx)} className="h-7 w-7 p-0 text-slate-400 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Checklist */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Hazırlık Kontrol Listesi</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'images' as const, label: 'Ürün görselleri hazır' },
                    { key: 'descriptions' as const, label: 'Açıklamalar hazır' },
                    { key: 'pricing' as const, label: 'Fiyatlandırma ayarlandı' },
                    { key: 'inventory' as const, label: 'Stok aktarıldı' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formChecklist[item.key]}
                        onCheckedChange={(checked) =>
                          setFormChecklist((prev) => ({ ...prev, [item.key]: !!checked }))
                        }
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleCreateLaunch}
                  disabled={!formName.trim() || formChannels.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
                >
                  <Rocket className="h-4 w-4 mr-1.5" />
                  Lansman Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: Active Launches ===== */}
        <TabsContent value="active">
          <div className="space-y-4">
            {activeLaunches.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                <CardContent className="py-16 text-center">
                  <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Aktif lansman bulunmuyor</p>
                </CardContent>
              </Card>
            ) : (
              activeLaunches.map((launch) => {
                const progress = getTaskProgress(launch.tasks);
                const budgetPct = getBudgetProgress(launch.budgetSpent, launch.budget);
                const completedTasks = launch.tasks.filter((t) => t.completed).length;
                const upcoming = getUpcomingDeadlines(launch.tasks, 5);
                const stCfg = STATUS_CONFIG[launch.status];
                const prCfg = PRIORITY_CONFIG[launch.priority];
                const days = daysUntil(launch.launchDate);

                return (
                  <Card key={launch.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-base font-semibold text-slate-800">{launch.name}</h3>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', stCfg.color)}>
                              {stCfg.label}
                            </Badge>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', prCfg.color)}>
                              {prCfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{launch.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Lansman: {fmtDate(launch.launchDate)}
                              {days > 0 && <span className="ml-1 text-blue-600 font-medium">({days} gün)</span>}
                              {days <= 0 && days > -7 && <span className="ml-1 text-amber-600 font-medium">Bu hafta</span>}
                            </span>
                            {launch.channels.map((ch) => (
                              <span key={ch} className={cn('text-[10px] px-1.5 py-0 rounded-full font-medium', CHANNEL_COLORS[ch] || 'bg-slate-100 text-slate-600')}>
                                {ch}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress & Budget row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">Görev İlerlemesi</span>
                            <span className="text-xs font-semibold text-slate-700">{completedTasks}/{launch.tasks.length} ({progress}%)</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">Bütçe Kullanımı</span>
                            <span className="text-xs font-semibold text-slate-700">{fmt(launch.budgetSpent)} / {fmt(launch.budget)} ({budgetPct}%)</span>
                          </div>
                          <Progress value={Math.min(budgetPct, 100)} className={cn('h-2', budgetPct > 90 ? '[&>div]:bg-red-500' : budgetPct > 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500')} />
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="flex flex-wrap gap-3">
                        {launch.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-1.5">
                            {item.checked ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span className={cn('text-[11px]', item.checked ? 'text-slate-500 line-through' : 'text-slate-600 font-medium')}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Upcoming deadlines */}
                      {upcoming.length > 0 && (
                        <div className="border-t border-slate-100 pt-3">
                          <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Yaklaşan Son Tarihler
                          </p>
                          <div className="space-y-1">
                            {upcoming.map((task) => (
                              <div key={task.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-amber-50">
                                <span className="text-slate-700 font-medium">{task.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500">{task.assignee}</span>
                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-amber-700 border-amber-200">
                                    {fmtDate(task.dueDate)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
