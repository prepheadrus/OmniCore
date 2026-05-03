'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Play,
  Pause,
  Clock,
  DollarSign,
  ArrowUpDown,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  Activity,
  ShoppingCart,
  Eye,
  Filter,
  CalendarDays,
  CircleDot,
  Percent,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RepricingRule {
  id: string;
  name: string;
  description: string;
  marketplace: string;
  strategy: string;
  targetPosition: number;
  beatByType: 'fixed' | 'percentage';
  beatByValue: number;
  minPrice: number;
  maxPrice: number;
  costFloorEnabled: boolean;
  minMargin: number;
  roundingStrategy: string;
  schedule: string;
  productFilter: string;
  categoryFilter: string;
  isActive: boolean;
  lastRun: string;
  adjustmentCount: number;
}

interface PriceChangeLog {
  id: string;
  date: string;
  product: string;
  productSku: string;
  marketplace: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  competitorAvg: number;
  ruleName: string;
  reason: string;
}

interface RuleFormData {
  name: string;
  description: string;
  marketplace: string;
  strategy: string;
  targetPosition: number;
  beatByType: 'fixed' | 'percentage';
  beatByValue: number;
  minPrice: number;
  maxPrice: number;
  costFloorEnabled: boolean;
  minMargin: number;
  roundingStrategy: string;
  schedule: string;
  productFilter: string;
  categoryFilter: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MARKETPLACES = [
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'amazon-tr', label: 'Amazon TR' },
  { value: 'ptt-avm', label: 'PTT AVM' },
  { value: 'n11', label: 'n11' },
  { value: 'ciceksepeti', label: 'Çiçeksepeti' },
];

const STRATEGIES = [
  {
    value: 'match-lowest',
    label: 'En Düşüğe Eşitle',
    description: 'Pazardaki en düşük fiyatla eşleşir',
  },
  {
    value: 'below-lowest',
    label: 'X Altında Fiyat',
    description: 'En düşük fiyattan belirli bir miktar altında fiyat belirler',
  },
  {
    value: 'below-average',
    label: 'Ortalamanın Altına',
    description: 'Pazar ortalamasının altında fiyat belirler',
  },
  {
    value: 'buy-box',
    label: 'Buy Box Kazan',
    description: 'Buy Box kazanmaya hedefli fiyatlandırma',
  },
];

const ROUNDING_STRATEGIES = [
  { value: 'none', label: 'Yok' },
  { value: '99', label: "99'a Yuvarla" },
  { value: '50', label: "50'ye Yuvarla" },
  { value: '10', label: "10'a Yuvarla" },
];

const SCHEDULES = [
  { value: 'always', label: 'Her zaman' },
  { value: 'business-hours', label: 'İş saatları (09:00 - 18:00)' },
  { value: 'custom', label: 'Özel zamanlama' },
];

const CATEGORIES = [
  'Elektronik',
  'Giyim',
  'Ev & Yaşam',
  'Kozmetik',
  'Spor & Outdoor',
  'Oyuncak',
  'Otomotiv',
  'Kitap',
  'Saat & Aksesuar',
];

const EMPTY_FORM: RuleFormData = {
  name: '',
  description: '',
  marketplace: 'trendyol',
  strategy: 'match-lowest',
  targetPosition: 1,
  beatByType: 'fixed',
  beatByValue: 1,
  minPrice: 0,
  maxPrice: 0,
  costFloorEnabled: false,
  minMargin: 10,
  roundingStrategy: 'none',
  schedule: 'always',
  productFilter: '',
  categoryFilter: '',
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

const INITIAL_RULES: RepricingRule[] = [
  {
    id: 'r1',
    name: 'Trendyol Elektronik Agresif',
    description: 'Elektronik kategorisinde agresif fiyatlandırma stratejisi',
    marketplace: 'trendyol',
    strategy: 'match-lowest',
    targetPosition: 1,
    beatByType: 'percentage',
    beatByValue: 2,
    minPrice: 100,
    maxPrice: 15000,
    costFloorEnabled: true,
    minMargin: 15,
    roundingStrategy: '99',
    schedule: 'always',
    productFilter: 'Elektronik',
    categoryFilter: 'Elektronik',
    isActive: true,
    lastRun: '2025-01-15 14:32',
    adjustmentCount: 847,
  },
  {
    id: 'r2',
    name: 'HB Giyim Buy Box',
    description: 'Hepsiburada giyim kategorisi için Buy Box kazanma stratejisi',
    marketplace: 'hepsiburada',
    strategy: 'buy-box',
    targetPosition: 1,
    beatByType: 'fixed',
    beatByValue: 5,
    minPrice: 50,
    maxPrice: 5000,
    costFloorEnabled: true,
    minMargin: 20,
    roundingStrategy: '99',
    schedule: 'business-hours',
    productFilter: 'Giyim > Erkek',
    categoryFilter: 'Giyim',
    isActive: true,
    lastRun: '2025-01-15 14:30',
    adjustmentCount: 623,
  },
  {
    id: 'r3',
    name: 'Amazon TR Kozmetik',
    description: 'Amazon Türkiye pazarı için kozmetik ürünleri fiyatlandırması',
    marketplace: 'amazon-tr',
    strategy: 'below-average',
    targetPosition: 2,
    beatByType: 'percentage',
    beatByValue: 5,
    minPrice: 30,
    maxPrice: 2000,
    costFloorEnabled: false,
    minMargin: 10,
    roundingStrategy: '50',
    schedule: 'always',
    productFilter: '',
    categoryFilter: 'Kozmetik',
    isActive: true,
    lastRun: '2025-01-15 13:45',
    adjustmentCount: 312,
  },
  {
    id: 'r4',
    name: 'n11 Spor Malzemeleri',
    description: 'n11 spor kategorisi için ortalamanın altında fiyatlandırma',
    marketplace: 'n11',
    strategy: 'below-lowest',
    targetPosition: 1,
    beatByType: 'fixed',
    beatByValue: 3,
    minPrice: 75,
    maxPrice: 8000,
    costFloorEnabled: true,
    minMargin: 12,
    roundingStrategy: 'none',
    schedule: 'always',
    productFilter: 'Spor',
    categoryFilter: 'Spor & Outdoor',
    isActive: true,
    lastRun: '2025-01-15 14:15',
    adjustmentCount: 198,
  },
  {
    id: 'r5',
    name: 'Çiçeksepeti Ev Yaşam',
    description: 'Çiçeksepeti ev ve yaşam ürünleri için moderate strateji',
    marketplace: 'ciceksepeti',
    strategy: 'below-average',
    targetPosition: 3,
    beatByType: 'percentage',
    beatByValue: 3,
    minPrice: 40,
    maxPrice: 3000,
    costFloorEnabled: true,
    minMargin: 18,
    roundingStrategy: '99',
    schedule: 'business-hours',
    productFilter: '',
    categoryFilter: 'Ev & Yaşam',
    isActive: false,
    lastRun: '2025-01-14 09:20',
    adjustmentCount: 89,
  },
  {
    id: 'r6',
    name: 'Trendyol Oyuncak Günlük',
    description: 'Trendyol oyuncak kategorisi için günlük fiyat güncellemesi',
    marketplace: 'trendyol',
    strategy: 'buy-box',
    targetPosition: 1,
    beatByType: 'fixed',
    beatByValue: 2,
    minPrice: 25,
    maxPrice: 2500,
    costFloorEnabled: true,
    minMargin: 25,
    roundingStrategy: '99',
    schedule: 'always',
    productFilter: 'Oyuncak',
    categoryFilter: 'Oyuncak',
    isActive: true,
    lastRun: '2025-01-15 14:28',
    adjustmentCount: 456,
  },
  {
    id: 'r7',
    name: 'PTT AVM Kitap Fiyat',
    description: 'PTT AVM kitap kategorisi için düşük marj stratejisi',
    marketplace: 'ptt-avm',
    strategy: 'match-lowest',
    targetPosition: 1,
    beatByType: 'fixed',
    beatByValue: 1,
    minPrice: 10,
    maxPrice: 500,
    costFloorEnabled: false,
    minMargin: 8,
    roundingStrategy: 'none',
    schedule: 'always',
    productFilter: 'Kitap',
    categoryFilter: 'Kitap',
    isActive: false,
    lastRun: '2025-01-12 11:00',
    adjustmentCount: 42,
  },
  {
    id: 'r8',
    name: 'HB Otomotiv Aksesuar',
    description: 'Hepsiburada otomotiv kategorisi için rekabetçi fiyatlandırma',
    marketplace: 'hepsiburada',
    strategy: 'below-lowest',
    targetPosition: 2,
    beatByType: 'percentage',
    beatByValue: 4,
    minPrice: 20,
    maxPrice: 6000,
    costFloorEnabled: true,
    minMargin: 15,
    roundingStrategy: '10',
    schedule: 'custom',
    productFilter: 'Otomotiv > Aksesuar',
    categoryFilter: 'Otomotiv',
    isActive: true,
    lastRun: '2025-01-15 12:00',
    adjustmentCount: 267,
  },
];

const INITIAL_LOGS: PriceChangeLog[] = [
  {
    id: 'l1',
    date: '2025-01-15 14:32',
    product: 'iPhone 15 Pro Max 256GB',
    productSku: 'APL-IP15PM-256',
    marketplace: 'Trendyol',
    oldPrice: 74999,
    newPrice: 72499,
    changePercent: -3.33,
    competitorAvg: 73500,
    ruleName: 'Trendyol Elektronik Agresif',
    reason: 'En düşük rakip fiyatı 72.499 TL, %2 altına ayarlandı',
  },
  {
    id: 'l2',
    date: '2025-01-15 14:30',
    product: 'Samsung Galaxy S24 Ultra',
    productSku: 'SAM-S24U-256',
    marketplace: 'Trendyol',
    oldPrice: 64999,
    newPrice: 63999,
    changePercent: -1.54,
    competitorAvg: 64200,
    ruleName: 'Trendyol Elektronik Agresif',
    reason: 'Rakip fiyat düştü, yeni en düşük fiyata uyum sağlandı',
  },
  {
    id: 'l3',
    date: '2025-01-15 14:28',
    product: 'Erkek Slim Fit Gömlek',
    productSku: 'GYM-ERK-SF-001',
    marketplace: 'Hepsiburada',
    oldPrice: 349.99,
    newPrice: 299.99,
    changePercent: -14.29,
    competitorAvg: 320,
    ruleName: 'HB Giyim Buy Box',
    reason: 'Buy Box kazanmak için 5 TL altına ayarlandı',
  },
  {
    id: 'l4',
    date: '2025-01-15 14:15',
    product: 'Yoga Matı 183cm',
    productSku: 'SPR-YOG-183',
    marketplace: 'n11',
    oldPrice: 599,
    newPrice: 549,
    changePercent: -8.35,
    competitorAvg: 560,
    ruleName: 'n11 Spor Malzemeleri',
    reason: 'En düşük rakip 549 TL, 3 TL altına ayarlandı',
  },
  {
    id: 'l5',
    date: '2025-01-15 13:45',
    product: 'La Roche-Posay Effaclar Duo',
    productSku: 'KOZ-LRP-EFD-40',
    marketplace: 'Amazon TR',
    oldPrice: 899,
    newPrice: 849.5,
    changePercent: -5.5,
    competitorAvg: 870,
    ruleName: 'Amazon TR Kozmetik',
    reason: 'Ortalamanın %5 altına ayarlandı',
  },
  {
    id: 'l6',
    date: '2025-01-15 12:00',
    product: 'Oto Cam Film Seti',
    productSku: 'OTO-CAM-F01',
    marketplace: 'Hepsiburada',
    oldPrice: 1899,
    newPrice: 1799,
    changePercent: -5.27,
    competitorAvg: 1850,
    ruleName: 'HB Otomotiv Aksesuar',
    reason: 'İkinci en düşük rakip 1.849 TL, %4 altına ayarlandı',
  },
  {
    id: 'l7',
    date: '2025-01-15 11:30',
    product: 'LEGO Star Wars Set',
    productSku: 'OYN-LEG-SWS-01',
    marketplace: 'Trendyol',
    oldPrice: 4999,
    newPrice: 4899,
    changePercent: -2.0,
    competitorAvg: 4950,
    ruleName: 'Trendyol Oyuncak Günlük',
    reason: 'Buy Box koruma: 2 TL altına ayarlandı',
  },
  {
    id: 'l8',
    date: '2025-01-15 11:15',
    product: 'MacBook Air M3 13"',
    productSku: 'APL-MBA-M3-13',
    marketplace: 'Trendyol',
    oldPrice: 54999,
    newPrice: 52999,
    changePercent: -3.64,
    competitorAvg: 53500,
    ruleName: 'Trendyol Elektronik Agresif',
    reason: 'Rakip indirim yaptı, %2 altına ayarlandı',
  },
  {
    id: 'l9',
    date: '2025-01-15 10:45',
    product: 'Kadın Deri Ceket',
    productSku: 'GYM-KAD-DJ-012',
    marketplace: 'Hepsiburada',
    oldPrice: 2499.99,
    newPrice: 2399.99,
    changePercent: -4.0,
    competitorAvg: 2450,
    ruleName: 'HB Giyim Buy Box',
    reason: 'Buy Box koruma: 5 TL altına ayarlandı',
  },
  {
    id: 'l10',
    date: '2025-01-15 10:20',
    product: 'L\'Oréal Paris Şampuan',
    productSku: 'KOZ-LOP-SMP-500',
    marketplace: 'Amazon TR',
    oldPrice: 249.9,
    newPrice: 249.5,
    changePercent: -0.16,
    competitorAvg: 255,
    ruleName: 'Amazon TR Kozmetik',
    reason: 'Ortalamanın altında, 50\'ye yuvarlandı',
  },
  {
    id: 'l11',
    date: '2025-01-15 09:50',
    product: 'Koşu Ayakkabısı Erkek',
    productSku: 'SPR-KOS-ERK-42',
    marketplace: 'n11',
    oldPrice: 1899,
    newPrice: 1849,
    changePercent: -2.63,
    competitorAvg: 1870,
    ruleName: 'n11 Spor Malzemeleri',
    reason: 'En düşük rakip 1.852 TL, 3 TL altına ayarlandı',
  },
  {
    id: 'l12',
    date: '2025-01-15 09:30',
    product: 'PlayStation 5 Slim',
    productSku: 'ELK-PS5-SL-01',
    marketplace: 'Trendyol',
    oldPrice: 22999,
    newPrice: 22499,
    changePercent: -2.17,
    competitorAvg: 22700,
    ruleName: 'Trendyol Elektronik Agresif',
    reason: 'Rakip fiyat güncellemesi algılandı',
  },
  {
    id: 'l13',
    date: '2025-01-14 18:00',
    product: 'Bebek Bezi Mega Pack',
    productSku: 'COZ-BEB-BZ-MG',
    marketplace: 'Hepsiburada',
    oldPrice: 599.99,
    newPrice: 579.99,
    changePercent: -3.33,
    competitorAvg: 585,
    ruleName: 'HB Giyim Buy Box',
    reason: 'Günlük fiyat güncellemesi',
  },
  {
    id: 'l14',
    date: '2025-01-14 16:30',
    product: 'Tablet Standı Adjustable',
    productSku: 'ELK-TAB-ST-ADJ',
    marketplace: 'Trendyol',
    oldPrice: 799,
    newPrice: 749,
    changePercent: -6.26,
    competitorAvg: 770,
    ruleName: 'Trendyol Elektronik Agresif',
    reason: 'Yeni rakip giriş yaptı, fiyata uyum',
  },
  {
    id: 'l15',
    date: '2025-01-14 14:15',
    product: 'Fitness Dambıl Seti 20kg',
    productSku: 'SPR-FIT-DM-20',
    marketplace: 'n11',
    oldPrice: 2499,
    newPrice: 2399,
    changePercent: -4.0,
    competitorAvg: 2440,
    ruleName: 'n11 Spor Malzemeleri',
    reason: 'En düşük rakip 2.402 TL, 3 TL altına ayarlandı',
  },
  {
    id: 'l16',
    date: '2025-01-14 11:00',
    product: 'Oto Cam Film Seti',
    productSku: 'OTO-CAM-F01',
    marketplace: 'Hepsiburada',
    oldPrice: 1899,
    newPrice: 1849,
    changePercent: -2.63,
    competitorAvg: 1870,
    ruleName: 'HB Otomotiv Aksesuar',
    reason: 'Rakip fiyatı düştü',
  },
  {
    id: 'l17',
    date: '2025-01-14 09:20',
    product: 'Ev Tekstili Yatak Örtüsü',
    productSku: 'EVY-YTK-ORT-K',
    marketplace: 'Çiçeksepeti',
    oldPrice: 899,
    newPrice: 849.99,
    changePercent: -5.45,
    competitorAvg: 870,
    ruleName: 'Çiçeksepeti Ev Yaşam',
    reason: 'Ortalamanın %3 altına ayarlandı',
  },
  {
    id: 'l18',
    date: '2025-01-13 16:45',
    product: 'Kablosuz Kulaklık ANC',
    productSku: 'ELK-KLK-ANC-01',
    marketplace: 'Amazon TR',
    oldPrice: 3499,
    newPrice: 3349.5,
    changePercent: -4.27,
    competitorAvg: 3420,
    ruleName: 'Amazon TR Kozmetik',
    reason: 'Ortalamanın %5 altına ayarlandı',
  },
  {
    id: 'l19',
    date: '2025-01-13 14:00',
    product: 'LEGO Technic Araç Seti',
    productSku: 'OYN-LEG-TEC-02',
    marketplace: 'Trendyol',
    oldPrice: 8999,
    newPrice: 8899,
    changePercent: -1.11,
    competitorAvg: 8950,
    ruleName: 'Trendyol Oyuncak Günlük',
    reason: 'Buy Box koruma stratejisi uygulandı',
  },
  {
    id: 'l20',
    date: '2025-01-13 10:30',
    product: 'D vitamini 1000 IU',
    productSku: 'KOZ-DVM-1000',
    marketplace: 'Amazon TR',
    oldPrice: 179.9,
    newPrice: 169.5,
    changePercent: -5.78,
    competitorAvg: 175,
    ruleName: 'Amazon TR Kozmetik',
    reason: 'Ortalamanın altında yeni fiyat belirlendi',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function getStrategyLabel(value: string): string {
  return STRATEGIES.find((s) => s.value === value)?.label ?? value;
}

function getMarketplaceLabel(value: string): string {
  return MARKETPLACES.find((m) => m.value === value)?.label ?? value;
}

function getRoundingLabel(value: string): string {
  return ROUNDING_STRATEGIES.find((r) => r.value === value)?.label ?? value;
}

function getScheduleLabel(value: string): string {
  return SCHEDULES.find((s) => s.value === value)?.label ?? value;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DynamicRepricer() {
  const [rules, setRules] = useState<RepricingRule[]>(INITIAL_RULES);
  const [logs] = useState<PriceChangeLog[]>(INITIAL_LOGS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(EMPTY_FORM);
  const [logFilterMarketplace, setLogFilterMarketplace] = useState<string>('all');
  const { sidebarOpen } = useAppStore();
  const [isRunningRules, setIsRunningRules] = useState(false);

  // ── Derived data ──

  const activeRulesCount = rules.filter((r) => r.isActive).length;
  const totalAdjustments = rules.reduce((sum, r) => sum + r.adjustmentCount, 0);
  const avgPriceChange = useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((s, l) => s + Math.abs(l.changePercent), 0);
    return (sum / logs.length).toFixed(1);
  }, [logs]);

  const revenueImpact = 284750;

  // ── Handlers ──

  function openCreateDialog() {
    setEditingRuleId(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(rule: RepricingRule) {
    setEditingRuleId(rule.id);
    setFormData({
      name: rule.name,
      description: rule.description,
      marketplace: rule.marketplace,
      strategy: rule.strategy,
      targetPosition: rule.targetPosition,
      beatByType: rule.beatByType,
      beatByValue: rule.beatByValue,
      minPrice: rule.minPrice,
      maxPrice: rule.maxPrice,
      costFloorEnabled: rule.costFloorEnabled,
      minMargin: rule.minMargin,
      roundingStrategy: rule.roundingStrategy,
      schedule: rule.schedule,
      productFilter: rule.productFilter,
      categoryFilter: rule.categoryFilter,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!formData.name.trim()) return;
    if (editingRuleId) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? { ...r, ...formData, adjustmentCount: r.adjustmentCount }
            : r
        )
      );
    } else {
      const newRule: RepricingRule = {
        id: `r${Date.now()}`,
        ...formData,
        isActive: true,
        lastRun: '-',
        adjustmentCount: 0,
      };
      setRules((prev) => [...prev, newRule]);
    }
    setDialogOpen(false);
    setFormData(EMPTY_FORM);
    setEditingRuleId(null);
  }

  function handleToggleActive(ruleId: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  }

  function handleDeleteRule(ruleId: string) {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }

  async function handleRunAllRules() {
    setIsRunningRules(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRules((prev) =>
      prev.map((r) => ({
        ...r,
        lastRun: new Date().toLocaleString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '.'),
        adjustmentCount: r.isActive ? r.adjustmentCount + Math.floor(Math.random() * 50) + 10 : r.adjustmentCount,
      }))
    );
    setIsRunningRules(false);
    alert('Tüm kurallar başarıyla çalıştırıldı!');
  }

  function updateForm<K extends keyof RuleFormData>(key: K, value: RuleFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  const filteredLogs = useMemo(() => {
    if (logFilterMarketplace === 'all') return logs;
    return logs.filter((l) => l.marketplace === logFilterMarketplace);
  }, [logs, logFilterMarketplace]);

  // ── Render ──

  return (
    <TooltipProvider>
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-6">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Dinamik Fiyatlandırma Motoru
                  </h1>
                  <p className="text-sm text-slate-500">
                    Otomatik fiyat rekabet stratejisi yönetimi
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleRunAllRules} disabled={isRunningRules}>
                    <RefreshCw className={`h-4 w-4 ${isRunningRules ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isRunningRules ? 'Çalıştırılıyor...' : 'Tüm Kuralları Çalıştır'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tüm aktif kuralları manuel olarak çalıştırır</p>
                </TooltipContent>
              </Tooltip>
              <Button
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Kural</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="rules" className="gap-2">
                <Target className="h-4 w-4" />
                Fiyat Kuralları
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <Clock className="h-4 w-4" />
                Fiyat Değişim Logu
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Performans
              </TabsTrigger>
            </TabsList>

            {/* ─── TAB 1: Fiyat Kuralları ─── */}
            <TabsContent value="rules" className="mt-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <CircleDot className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Aktif Kural</p>
                      <p className="text-2xl font-bold text-slate-900">{activeRulesCount}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <ArrowUpDown className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Toplam Ayarlama</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {totalAdjustments.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Percent className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ort. Fiyat Değişimi</p>
                      <p className="text-2xl font-bold text-slate-900">-%{avgPriceChange}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Kazanç Etkisi</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        +{formatCurrency(revenueImpact)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rules Table */}
              <Card className="py-0 overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Fiyat Kuralları</CardTitle>
                      <CardDescription>
                        Toplam {rules.length} kural tanımlı, {activeRulesCount} tanesi aktif
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Activity className="h-3.5 w-3.5" />
                      Son güncelleme: 15 Ocak 2025 14:32
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ScrollArea className="max-h-[520px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="min-w-[180px]">Kural Adı</TableHead>
                          <TableHead className="min-w-[120px]">Pazar Yeri</TableHead>
                          <TableHead className="min-w-[160px]">Strateji</TableHead>
                          <TableHead className="text-right min-w-[90px]">Min Fiyat</TableHead>
                          <TableHead className="text-right min-w-[90px]">Max Fiyat</TableHead>
                          <TableHead className="min-w-[90px]">Durum</TableHead>
                          <TableHead className="min-w-[130px]">Son Çalışma</TableHead>
                          <TableHead className="text-right min-w-[100px]">Ayar. Sayısı</TableHead>
                          <TableHead className="min-w-[90px] text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{rule.name}</p>
                                <p className="text-xs text-slate-400 max-w-[200px] truncate">
                                  {rule.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal text-xs">
                                {getMarketplaceLabel(rule.marketplace)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-slate-700">
                                  {getStrategyLabel(rule.strategy)}
                                </span>
                                {rule.strategy === 'below-lowest' && (
                                  <span className="text-xs text-slate-400">
                                    {rule.beatByType === 'fixed'
                                      ? `${rule.beatByValue} TL`
                                      : `%${rule.beatByValue}`}{' '}
                                    altında
                                  </span>
                                )}
                                {rule.strategy === 'below-average' && (
                                  <span className="text-xs text-slate-400">
                                    Ortalamanın %{rule.beatByValue} altında
                                  </span>
                                )}
                                {rule.strategy === 'buy-box' && (
                                  <span className="text-xs text-slate-400">
                                    Hedef: {rule.targetPosition}. pozisyon
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-600">
                              {rule.minPrice > 0 ? formatCurrency(rule.minPrice) : '-'}
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-600">
                              {rule.maxPrice > 0 ? formatCurrency(rule.maxPrice) : 'Sınırsız'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  size="sm"
                                  checked={rule.isActive}
                                  onCheckedChange={() => handleToggleActive(rule.id)}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    rule.isActive ? 'text-emerald-600' : 'text-slate-400'
                                  }`}
                                >
                                  {rule.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">{rule.lastRun}</TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm font-semibold text-slate-700">
                                {rule.adjustmentCount.toLocaleString('tr-TR')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => openEditDialog(rule)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Düzenle</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      className="text-red-400 hover:text-red-600"
                                      onClick={() => handleDeleteRule(rule.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Sil</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── TAB 2: Fiyat Değişim Logu ─── */}
            <TabsContent value="logs" className="mt-6 space-y-4">
              {/* Filter Bar */}
              <Card className="py-0 overflow-hidden">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">Filtrele:</span>
                    </div>
                    <Select
                      value={logFilterMarketplace}
                      onValueChange={setLogFilterMarketplace}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Pazar Yeri" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Pazar Yerleri</SelectItem>
                        {MARKETPLACES.map((m) => (
                          <SelectItem key={m.value} value={m.label}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-slate-400 ml-auto">
                      {filteredLogs.length} kayıt gösteriliyor
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logs Table */}
              <Card className="py-0 overflow-hidden">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[580px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="min-w-[130px]">Tarih</TableHead>
                          <TableHead className="min-w-[200px]">Ürün</TableHead>
                          <TableHead className="min-w-[110px]">Pazar Yeri</TableHead>
                          <TableHead className="text-right min-w-[95px]">Eski Fiyat</TableHead>
                          <TableHead className="text-right min-w-[95px]">Yeni Fiyat</TableHead>
                          <TableHead className="text-right min-w-[85px]">Değişim</TableHead>
                          <TableHead className="text-right min-w-[100px]">Rakip Ort.</TableHead>
                          <TableHead className="min-w-[180px]">Kural Adı</TableHead>
                          <TableHead className="min-w-[200px]">Neden</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-300" />
                                {log.date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-slate-800 max-w-[220px] truncate">
                                  {log.product}
                                </p>
                                <p className="text-xs text-slate-400">{log.productSku}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal text-xs">
                                {log.marketplace}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-500 line-through">
                              {formatCurrency(log.oldPrice)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-slate-800">
                              {formatCurrency(log.newPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`inline-flex items-center gap-1 text-sm font-semibold ${
                                  log.changePercent < 0
                                    ? 'text-emerald-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {log.changePercent < 0 ? (
                                  <ArrowDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowUp className="h-3.5 w-3.5" />
                                )}
                                %{Math.abs(log.changePercent).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-500">
                              {formatCurrency(log.competitorAvg)}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-slate-600 max-w-[190px] truncate block">
                                {log.ruleName}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-slate-500 max-w-[220px] truncate cursor-default">
                                    {log.reason}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[300px]">
                                  <p className="text-xs">{log.reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredLogs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center text-sm text-slate-400">
                              Bu filtre için kayıt bulunamadı.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── TAB 3: Performans ─── */}
            <TabsContent value="performance" className="mt-6 space-y-6">
              {/* Performance Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Toplam Gelir Etkisi</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        +{formatCurrency(revenueImpact)}
                      </p>
                      <p className="text-xs text-emerald-500 mt-0.5">↑ Son 30 gün</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ek Satış Hacmi</p>
                      <p className="text-2xl font-bold text-slate-900">1.847</p>
                      <p className="text-xs text-blue-500 mt-0.5">↑ %23 artış</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Eye className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Buy Box Kazanma Oranı</p>
                      <p className="text-2xl font-bold text-slate-900">%78.4</p>
                      <p className="text-xs text-amber-500 mt-0.5">↑ %5.2 iyileşme</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-5">
                  <CardContent className="px-6 py-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ort. Marj</p>
                      <p className="text-2xl font-bold text-slate-900">%16.2</p>
                      <p className="text-xs text-purple-500 mt-0.5">Stabil</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marketplace Performance */}
                <Card className="py-0 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Pazar Yeri Bazlı Performans</CardTitle>
                    <CardDescription>
                      Her pazaryeri için ayarlama ve etki özeti
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {[
                        {
                          name: 'Trendyol',
                          adjustments: 1685,
                          impact: 124500,
                          buyBoxRate: 82,
                        },
                        {
                          name: 'Hepsiburada',
                          adjustments: 998,
                          impact: 89200,
                          buyBoxRate: 75,
                        },
                        {
                          name: 'n11',
                          adjustments: 412,
                          impact: 35800,
                          buyBoxRate: 68,
                        },
                        {
                          name: 'Amazon TR',
                          adjustments: 312,
                          impact: 22450,
                          buyBoxRate: 72,
                        },
                        {
                          name: 'Çiçeksepeti',
                          adjustments: 89,
                          impact: 7800,
                          buyBoxRate: 55,
                        },
                        {
                          name: 'PTT AVM',
                          adjustments: 42,
                          impact: 5000,
                          buyBoxRate: 45,
                        },
                      ].map((mp) => (
                        <div key={mp.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{mp.name}</span>
                            <span className="text-xs text-slate-400">
                              {mp.adjustments.toLocaleString('tr-TR')} ayarlama ·{' '}
                              <span className="text-emerald-600 font-medium">
                                +{formatCurrency(mp.impact)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={mp.buyBoxRate} className="h-2 flex-1" />
                            <span className="text-xs font-medium text-slate-500 w-12 text-right">
                              %{mp.buyBoxRate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-4">
                      * Bar göstergeleri Buy Box kazanma oranını temsil eder
                    </p>
                  </CardContent>
                </Card>

                {/* Revenue Impact Summary */}
                <Card className="py-0 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Gelir Etkisi Özeti</CardTitle>
                    <CardDescription>
                      Dinamik fiyatlandırmanın satışlara etkisi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-5">
                      <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Ayarlamadan Önce</p>
                            <p className="text-lg font-bold text-slate-600">
                              {formatCurrency(1850000)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Ayarlamadan Sonra</p>
                            <p className="text-lg font-bold text-emerald-600">
                              {formatCurrency(2134750)}
                            </p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Fark</span>
                          <span className="text-sm font-bold text-emerald-600">
                            +{formatCurrency(284750)} (+%15.4)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-slate-400" />
                          Strateji Bazlı Etki
                        </h4>
                        {[
                          {
                            name: 'En Düşüğe Eşitle',
                            impact: 98500,
                            pct: 34.6,
                          },
                          {
                            name: 'Buy Box Kazan',
                            impact: 112000,
                            pct: 39.3,
                          },
                          {
                            name: 'Ortalamanın Altına',
                            impact: 48250,
                            pct: 17.0,
                          },
                          {
                            name: 'X Altında Fiyat',
                            impact: 26000,
                            pct: 9.1,
                          },
                        ].map((s) => (
                          <div key={s.name} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{s.name}</span>
                            <div className="flex items-center gap-3">
                              <Progress value={s.pct} className="h-1.5 w-24" />
                              <span className="text-xs font-semibold text-emerald-600 w-20 text-right">
                                +{formatCurrency(s.impact)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-emerald-800">
                              Maliyet Tabanı Koruması
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              Son 30 günde 34 fiyat ayarlaması maliyet tabanı tarafından engellendi. 
                              Asgari marj korunarak {'>'}42.000 TL olası zarar önledi.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Price Change Chart (Simple Bar) */}
              <Card className="py-0 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base">Günlük Fiyat Ayarlama Dağılımı</CardTitle>
                  <CardDescription>
                    Son 7 günlük fiyat ayarlama aktivitesi
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {[
                      { day: '15 Ocak (Bugün)', count: 12, maxRef: 15 },
                      { day: '14 Ocak', count: 7, maxRef: 15 },
                      { day: '13 Ocak', count: 8, maxRef: 15 },
                      { day: '12 Ocak', count: 10, maxRef: 15 },
                      { day: '11 Ocak', count: 5, maxRef: 15 },
                      { day: '10 Ocak', count: 14, maxRef: 15 },
                      { day: '9 Ocak', count: 9, maxRef: 15 },
                    ].map((d) => (
                      <div key={d.day} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-36 shrink-0">{d.day}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${(d.count / d.maxRef) * 100}%`, minWidth: '2rem' }}
                          >
                            <span className="text-xs font-bold text-white">{d.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── Create/Edit Rule Dialog ─── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[620px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingRuleId ? 'Kuralı Düzenle' : 'Yeni Fiyat Kuralı Oluştur'}
              </DialogTitle>
              <DialogDescription>
                {editingRuleId
                  ? 'Mevcut fiyatlandırma kuralını güncelleyin'
                  : 'Otomatik fiyatlandırma kuralı tanımlayın'}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-5 pb-2">
                {/* Name & Description */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="rule-name">Kural Adı</Label>
                    <Input
                      id="rule-name"
                      placeholder="Örn: Trendyol Elektronik Agresif"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rule-desc">Açıklama</Label>
                    <Textarea
                      id="rule-desc"
                      placeholder="Kuralın amacını kısaca açıklayın..."
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* Marketplace */}
                <div className="space-y-1.5">
                  <Label>Pazar Yeri</Label>
                  <Select
                    value={formData.marketplace}
                    onValueChange={(v) => updateForm('marketplace', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pazar yeri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Strategy */}
                <div className="space-y-1.5">
                  <Label>Strateji</Label>
                  <Select
                    value={formData.strategy}
                    onValueChange={(v) => updateForm('strategy', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Strateji seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {STRATEGIES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex flex-col">
                            <span className="font-medium">{s.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.description}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Position (visible for buy-box and below-lowest) */}
                {(formData.strategy === 'buy-box' ||
                  formData.strategy === 'below-lowest') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="target-position">Hedef Pozisyon</Label>
                    <Select
                      value={String(formData.targetPosition)}
                      onValueChange={(v) => updateForm('targetPosition', Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 — En Düşük Fiyat</SelectItem>
                        <SelectItem value="2">2 — İkinci En Düşük</SelectItem>
                        <SelectItem value="3">3 — Üçüncü En Düşük</SelectItem>
                        <SelectItem value="4">4 — Dördüncü En Düşük</SelectItem>
                        <SelectItem value="5">5 — Beşinci En Düşük</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Beat By */}
                {(formData.strategy === 'below-lowest' ||
                  formData.strategy === 'below-average' ||
                  formData.strategy === 'buy-box') && (
                  <div className="space-y-1.5">
                    <Label>Fiyat Farkı Miktarı</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={formData.beatByType}
                        onValueChange={(v) =>
                          updateForm('beatByType', v as 'fixed' | 'percentage')
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit TL</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        className="flex-1"
                        value={formData.beatByValue}
                        onChange={(e) => updateForm('beatByValue', Number(e.target.value))}
                        min={0}
                        step={0.5}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {formData.beatByType === 'fixed'
                        ? `En düşük fiyattan ${formData.beatByValue} TL düşük fiyat belirle`
                        : `Hedef fiyattan %${formData.beatByValue} düşük fiyat belirle`}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Min/Max Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="min-price">Min Fiyat (TL)</Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="0"
                      value={formData.minPrice || ''}
                      onChange={(e) => updateForm('minPrice', Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="max-price">Max Fiyat (TL)</Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Sınırsız"
                      value={formData.maxPrice || ''}
                      onChange={(e) => updateForm('maxPrice', Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>

                <Separator />

                {/* Cost Floor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maliyet Tabanı Koruması</Label>
                      <p className="text-xs text-slate-400">
                        Maliyet + minimum marjın altına inmez
                      </p>
                    </div>
                    <Switch
                      checked={formData.costFloorEnabled}
                      onCheckedChange={(v) => updateForm('costFloorEnabled', v)}
                    />
                  </div>
                  {formData.costFloorEnabled && (
                    <div className="space-y-1.5">
                      <Label htmlFor="min-margin">Minimum Marj (%)</Label>
                      <Input
                        id="min-margin"
                        type="number"
                        value={formData.minMargin}
                        onChange={(e) => updateForm('minMargin', Number(e.target.value))}
                        min={0}
                        max={100}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Rounding */}
                <div className="space-y-1.5">
                  <Label>Yuvarlama Stratejisi</Label>
                  <Select
                    value={formData.roundingStrategy}
                    onValueChange={(v) => updateForm('roundingStrategy', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Yuvarlama seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUNDING_STRATEGIES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400">
                    {formData.roundingStrategy === '99' &&
                      'Fiyatlar 99 ile biter: Örn: 499 TL, 1.299 TL'}
                    {formData.roundingStrategy === '50' &&
                      'Fiyatlar 50 ile biter: Örn: 450 TL, 1.250 TL'}
                    {formData.roundingStrategy === '10' &&
                      'Fiyatlar 10\'un katına yuvarlanır: Örn: 500 TL, 1.300 TL'}
                    {formData.roundingStrategy === 'none' &&
                      'Yuvarlama uygulanmaz, ham fiyat kullanılır'}
                  </p>
                </div>

                {/* Schedule */}
                <div className="space-y-1.5">
                  <Label>Zamanlama</Label>
                  <Select
                    value={formData.schedule}
                    onValueChange={(v) => updateForm('schedule', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Product & Category Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="product-filter">Ürün Filtresi</Label>
                    <Input
                      id="product-filter"
                      placeholder="SKU veya ürün adı..."
                      value={formData.productFilter}
                      onChange={(e) => updateForm('productFilter', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kategori Filtresi</Label>
                    <Select
                      value={formData.categoryFilter}
                      onValueChange={(v) => updateForm('categoryFilter', v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tümü</SelectItem>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSave}
                disabled={!formData.name.trim()}
              >
                {editingRuleId ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
