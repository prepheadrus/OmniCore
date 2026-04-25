'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Layers,
  DollarSign,
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  X,
  ShoppingCart,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BundleType = 'fixed' | 'dynamic' | 'customizable';
type BundleStatus = 'active' | 'inactive' | 'draft';

interface BundleComponent {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  stock: number;
}

interface Bundle {
  id: string;
  name: string;
  sku: string;
  description: string;
  type: BundleType;
  components: BundleComponent[];
  cost: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  status: BundleStatus;
  marketplace: string;
  isActive: boolean;
  isListed: boolean;
  createdAt: string;
}

interface BundleFormData {
  name: string;
  sku: string;
  description: string;
  type: BundleType;
  components: BundleComponent[];
  sellingPrice: number;
  discountPercent: number;
  marketplace: string;
  isActive: boolean;
  isListed: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants & Helpers                                                */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const fmtNum = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

const BUNDLE_TYPE_CONFIG: Record<
  BundleType,
  { label: string; color: string; bg: string; border: string }
> = {
  fixed: {
    label: 'Sabit Paket',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
  },
  dynamic: {
    label: 'Dinamik Paket',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
  },
  customizable: {
    label: 'Özelleştirilebilir',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
  },
};

const STATUS_CONFIG: Record<
  BundleStatus,
  { label: string; cls: string }
> = {
  active: { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'Pasif', cls: 'bg-slate-100 text-slate-500' },
  draft: { label: 'Taslak', cls: 'bg-amber-100 text-amber-700' },
};

const MARKETPLACES = [
  { value: 'all', label: 'Tüm Platformlar' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'amazon-tr', label: 'Amazon TR' },
  { value: 'n11', label: 'n11' },
  { value: 'pazarama', label: 'Pazarama' },
  { value: 'cicimax', label: 'Ciceksepeti' },
];

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_BUNDLES: Bundle[] = [
  {
    id: 'b-001',
    name: 'Akıllı Telefon Başlangıç Seti',
    sku: 'PKG-PHONE-001',
    description: 'Telefon + Kılıf + Cam Koruyucu + Şarj Aleti komple set',
    type: 'fixed',
    components: [
      { id: 'c1', productName: 'Samsung Galaxy A54', sku: 'SAM-A54-BK', quantity: 1, unitCost: 8500, stock: 45 },
      { id: 'c2', productName: 'Silikon Kılıf', sku: 'CSE-SIL-A54', quantity: 1, unitCost: 85, stock: 200 },
      { id: 'c3', productName: 'Temperli Cam Koruyucu', sku: 'CAM-GLS-A54', quantity: 2, unitCost: 45, stock: 350 },
      { id: 'c4', productName: '25W Hızlı Şarj Aleti', sku: 'CHG-25W-SAM', quantity: 1, unitCost: 220, stock: 120 },
    ],
    cost: 8895,
    sellingPrice: 12499,
    discountPercent: 5,
    stock: 45,
    status: 'active',
    marketplace: 'trendyol',
    isActive: true,
    isListed: true,
    createdAt: '2024-11-15',
  },
  {
    id: 'b-002',
    name: 'Bilgisayar Çalışma Seti',
    sku: 'PKG-PC-001',
    description: 'Dizüstü Bilgisayar + Mouse + Klavye + Mouse Pad',
    type: 'fixed',
    components: [
      { id: 'c5', productName: 'Lenovo IdeaPad 3', sku: 'LEN-IP3-15', quantity: 1, unitCost: 14200, stock: 28 },
      { id: 'c6', productName: 'Kablosuz Mouse', sku: 'MSE-LOG-B221', quantity: 1, unitCost: 320, stock: 85 },
      { id: 'c7', productName: 'Mekanik Klavye', sku: 'KBD-RGB-TR', quantity: 1, unitCost: 650, stock: 42 },
      { id: 'c8', productName: 'Büyük Mouse Pad', sku: 'PAD-XL-900', quantity: 1, unitCost: 95, stock: 150 },
    ],
    cost: 15265,
    sellingPrice: 21499,
    discountPercent: 8,
    stock: 28,
    status: 'active',
    marketplace: 'hepsiburada',
    isActive: true,
    isListed: true,
    createdAt: '2024-10-22',
  },
  {
    id: 'b-003',
    name: 'Oyun Konsol Paketi',
    sku: 'PKG-GAME-001',
    description: 'PlayStation 5 + 2 Kol + 3 Oyun + Kulaklık',
    type: 'dynamic',
    components: [
      { id: 'c9', productName: 'PlayStation 5 Slim', sku: 'PS5-SLM-DISC', quantity: 1, unitCost: 18900, stock: 12 },
      { id: 'c10', productName: 'DualSense Kol', sku: 'PS5-DLS-CL', quantity: 2, unitCost: 1800, stock: 35 },
      { id: 'c11', productName: 'Kablosuz Gaming Kulaklık', sku: 'HST-PS5-7.1', quantity: 1, unitCost: 1200, stock: 20 },
    ],
    cost: 23700,
    sellingPrice: 34999,
    discountPercent: 3,
    stock: 12,
    status: 'active',
    marketplace: 'amazon-tr',
    isActive: true,
    isListed: true,
    createdAt: '2024-09-05',
  },
  {
    id: 'b-004',
    name: 'Ev Sinema Sistemi',
    sku: 'PKG-HT-001',
    description: 'Soundbar + Subwoofer + 2 Surround Hoparlör + Kablo Seti',
    type: 'customizable',
    components: [
      { id: 'c12', productName: '5.1 Soundbar', sku: 'SND-BR-510', quantity: 1, unitCost: 4200, stock: 18 },
      { id: 'c13', productName: 'Kablosuz Subwoofer', sku: 'SND-SW-WL', quantity: 1, unitCost: 2800, stock: 22 },
      { id: 'c14', productName: 'Surround Hoparlör Çifti', sku: 'SND-SR-PR', quantity: 1, unitCost: 1500, stock: 30 },
      { id: 'c15', productName: 'HDMI Kablo Seti (3 adet)', sku: 'CBL-HDMI-3P', quantity: 1, unitCost: 180, stock: 500 },
    ],
    cost: 8680,
    sellingPrice: 12999,
    discountPercent: 10,
    stock: 18,
    status: 'active',
    marketplace: 'trendyol',
    isActive: true,
    isListed: true,
    createdAt: '2024-12-01',
  },
  {
    id: 'b-005',
    name: 'Bebek Bakım Seti',
    sku: 'PKG-BABY-001',
    description: 'Bebek Bezi + Islak Mendil + Bebek Yağı + Pişik Kremi',
    type: 'fixed',
    components: [
      { id: 'c16', productName: 'Bebek Bezi (Midi 80\'li x3)', sku: 'BBY-DPR-M80', quantity: 3, unitCost: 190, stock: 300 },
      { id: 'c17', productName: 'Islak Mendil (4\'lü)', sku: 'BBY-WPR-4P', quantity: 2, unitCost: 65, stock: 450 },
      { id: 'c18', productName: 'Bebek Yağı 200ml', sku: 'BBY-OIL-200', quantity: 1, unitCost: 120, stock: 180 },
      { id: 'c19', productName: 'Pişik Kremi 100ml', sku: 'BBY-CRM-100', quantity: 1, unitCost: 95, stock: 200 },
    ],
    cost: 1070,
    sellingPrice: 1799,
    discountPercent: 12,
    stock: 300,
    status: 'active',
    marketplace: 'hepsiburada',
    isActive: true,
    isListed: true,
    createdAt: '2024-11-28',
  },
  {
    id: 'b-006',
    name: 'Fotoğraf Makinesi Başlangıç',
    sku: 'PKG-CAM-001',
    description: 'DSLR Gövde + 18-55mm Lens + Çanta + SD Kart + Tripod',
    type: 'customizable',
    components: [
      { id: 'c20', productName: 'Canon EOS 250D', sku: 'CAN-250D-BK', quantity: 1, unitCost: 16500, stock: 8 },
      { id: 'c21', productName: '18-55mm STM Lens', sku: 'CAN-LNS-1855', quantity: 1, unitCost: 4200, stock: 15 },
      { id: 'c22', productName: 'Fotoğraf Çantası', sku: 'BAG-CAN-STD', quantity: 1, unitCost: 450, stock: 60 },
      { id: 'c23', productName: '64GB SD Kart', sku: 'SD-64G-U3', quantity: 2, unitCost: 280, stock: 200 },
      { id: 'c24', productName: 'Alüminyum Tripod', sku: 'TRP-ALU-160', quantity: 1, unitCost: 750, stock: 35 },
    ],
    cost: 22760,
    sellingPrice: 31999,
    discountPercent: 0,
    stock: 8,
    status: 'inactive',
    marketplace: 'n11',
    isActive: false,
    isListed: false,
    createdAt: '2024-08-10',
  },
  {
    id: 'b-007',
    name: 'Ağırlık ve Fitness Seti',
    sku: 'PKG-FIT-001',
    description: 'Ayarlanabilir Dambıl + Yoga Matı + Direnç Bandı + Atlama İpi',
    type: 'dynamic',
    components: [
      { id: 'c25', productName: 'Ayarlanabilir Dambıl (40kg)', sku: 'FIT-DMB-40K', quantity: 1, unitCost: 3200, stock: 25 },
      { id: 'c26', productName: 'Yoga Matı 10mm', sku: 'FIT-YGM-10', quantity: 1, unitCost: 280, stock: 100 },
      { id: 'c27', productName: 'Direnç Bandı Seti (5\'li)', sku: 'FIT-RBD-5P', quantity: 1, unitCost: 150, stock: 180 },
      { id: 'c28', productName: 'Hızlı Atlama İpi', sku: 'FIT-JRP-PRO', quantity: 1, unitCost: 90, stock: 220 },
    ],
    cost: 3720,
    sellingPrice: 5499,
    discountPercent: 15,
    stock: 25,
    status: 'active',
    marketplace: 'trendyol',
    isActive: true,
    isListed: true,
    createdAt: '2024-12-10',
  },
  {
    id: 'b-008',
    name: 'Mutfak Robotu Seti',
    sku: 'PKG-KCH-001',
    description: 'Robot Süpürge + El Süpürgesi + Cam Seti + Mikrofiber Bez',
    type: 'fixed',
    components: [
      { id: 'c29', productName: 'Arzum Okka Robot', sku: 'ARZ-OKK-RBT', quantity: 1, unitCost: 5800, stock: 32 },
      { id: 'c30', productName: 'El Süpürgesi Şarjlı', sku: 'VAC-HND-CLN', quantity: 1, unitCost: 2100, stock: 18 },
      { id: 'c31', productName: 'Borosilikat Cam Set (6\'lı)', sku: 'KCH-GLS-6P', quantity: 1, unitCost: 380, stock: 75 },
      { id: 'c32', productName: 'Mikrofiber Bez Seti (10\'lu)', sku: 'KCH-MFB-10', quantity: 2, unitCost: 60, stock: 400 },
    ],
    cost: 8600,
    sellingPrice: 11999,
    discountPercent: 7,
    stock: 18,
    status: 'draft',
    marketplace: 'pazarama',
    isActive: false,
    isListed: false,
    createdAt: '2025-01-05',
  },
  {
    id: 'b-009',
    name: 'Ofis Kurulum Seti',
    sku: 'PKG-OFC-001',
    description: 'Masa + Sandalye + Masa Lambası + Kablo Düzenleyici',
    type: 'customizable',
    components: [
      { id: 'c33', productName: 'Elektrikli Masa 120cm', sku: 'OFC-DSK-120', quantity: 1, unitCost: 5400, stock: 10 },
      { id: 'c34', productName: 'Ergonomik Ofis Sandalyesi', sku: 'OFC-CHR-ERG', quantity: 1, unitCost: 3800, stock: 14 },
      { id: 'c35', productName: 'LED Masa Lambası', sku: 'OFC-LMP-LED', quantity: 1, unitCost: 420, stock: 90 },
      { id: 'c36', productName: 'Kablo Düzenleyici Seti', sku: 'OFC-CBL-ORG', quantity: 1, unitCost: 120, stock: 250 },
    ],
    cost: 9740,
    sellingPrice: 14999,
    discountPercent: 5,
    stock: 10,
    status: 'active',
    marketplace: 'amazon-tr',
    isActive: true,
    isListed: true,
    createdAt: '2024-10-15',
  },
  {
    id: 'b-010',
    name: 'Spor Giyim Kombini',
    sku: 'PKG-SPR-001',
    description: 'Eşofman Takımı + Koşu Ayakkabısı + Spor Çorap + Spor Çanta',
    type: 'dynamic',
    components: [
      { id: 'c37', productName: 'Erkek Eşofman Takımı', sku: 'SPR-ESF-TRK', quantity: 1, unitCost: 650, stock: 55 },
      { id: 'c38', productName: 'Koşu Ayakkabısı', sku: 'SPR-SHO-RUN', quantity: 1, unitCost: 1200, stock: 40 },
      { id: 'c39', productName: 'Spor Çorap (3\'lü)', sku: 'SPR-SCK-3P', quantity: 2, unitCost: 80, stock: 300 },
      { id: 'c40', productName: 'Spor Sırt Çantası', sku: 'SPR-BAG-30L', quantity: 1, unitCost: 380, stock: 70 },
    ],
    cost: 2510,
    sellingPrice: 3999,
    discountPercent: 20,
    stock: 40,
    status: 'active',
    marketplace: 'trendyol',
    isActive: true,
    isListed: true,
    createdAt: '2024-11-20',
  },
];

/* Available products for component selection (mock catalog) */
const MOCK_PRODUCT_CATALOG = [
  { id: 'cat-01', name: 'Samsung Galaxy A54', sku: 'SAM-A54-BK', cost: 8500, stock: 45 },
  { id: 'cat-02', name: 'Silikon Kılıf', sku: 'CSE-SIL-A54', cost: 85, stock: 200 },
  { id: 'cat-03', name: 'Temperli Cam Koruyucu', sku: 'CAM-GLS-A54', cost: 45, stock: 350 },
  { id: 'cat-04', name: '25W Hızlı Şarj Aleti', sku: 'CHG-25W-SAM', cost: 220, stock: 120 },
  { id: 'cat-05', name: 'Lenovo IdeaPad 3', sku: 'LEN-IP3-15', cost: 14200, stock: 28 },
  { id: 'cat-06', name: 'Kablosuz Mouse', sku: 'MSE-LOG-B221', cost: 320, stock: 85 },
  { id: 'cat-07', name: 'Mekanik Klavye', sku: 'KBD-RGB-TR', cost: 650, stock: 42 },
  { id: 'cat-08', name: 'Büyük Mouse Pad', sku: 'PAD-XL-900', cost: 95, stock: 150 },
  { id: 'cat-09', name: 'PlayStation 5 Slim', sku: 'PS5-SLM-DISC', cost: 18900, stock: 12 },
  { id: 'cat-10', name: 'DualSense Kol', sku: 'PS5-DLS-CL', cost: 1800, stock: 35 },
  { id: 'cat-11', name: 'Kablosuz Gaming Kulaklık', sku: 'HST-PS5-7.1', cost: 1200, stock: 20 },
  { id: 'cat-12', name: '5.1 Soundbar', sku: 'SND-BR-510', cost: 4200, stock: 18 },
  { id: 'cat-13', name: 'Kablosuz Subwoofer', sku: 'SND-SW-WL', cost: 2800, stock: 22 },
  { id: 'cat-14', name: 'Surround Hoparlör Çifti', sku: 'SND-SR-PR', cost: 1500, stock: 30 },
  { id: 'cat-15', name: 'HDMI Kablo Seti (3 adet)', sku: 'CBL-HDMI-3P', cost: 180, stock: 500 },
  { id: 'cat-16', name: 'Arzum Okka Robot', sku: 'ARZ-OKK-RBT', cost: 5800, stock: 32 },
  { id: 'cat-17', name: 'Elektrikli Masa 120cm', sku: 'OFC-DSK-120', cost: 5400, stock: 10 },
  { id: 'cat-18', name: 'Ergonomik Ofis Sandalyesi', sku: 'OFC-CHR-ERG', cost: 3800, stock: 14 },
  { id: 'cat-19', name: 'Ayarlanabilir Dambıl (40kg)', sku: 'FIT-DMB-40K', cost: 3200, stock: 25 },
  { id: 'cat-20', name: 'Erkek Eşofman Takımı', sku: 'SPR-ESF-TRK', cost: 650, stock: 55 },
];

const EMPTY_FORM: BundleFormData = {
  name: '',
  sku: '',
  description: '',
  type: 'fixed',
  components: [],
  sellingPrice: 0,
  discountPercent: 0,
  marketplace: 'all',
  isActive: true,
  isListed: false,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BundleManagement() {
  const { sidebarOpen } = useAppStore();

  /* State */
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* Dialog state */
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [deletingBundle, setDeletingBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState<BundleFormData>(EMPTY_FORM);
  const [expandedBundleId, setExpandedBundleId] = useState<string | null>(null);
  const [showComponentPicker, setShowComponentPicker] = useState(false);
  const [componentSearch, setComponentSearch] = useState('');

  /* Load data */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/bundles');
        if (res.ok) {
          const data = await res.json();
          setBundles(Array.isArray(data) ? data : []);
        } else {
          // Fallback to mock data
          setBundles(MOCK_BUNDLES);
        }
      } catch {
        setBundles(MOCK_BUNDLES);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* Computed */
  const filteredBundles = useMemo(() => {
    let result = [...bundles];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.sku.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((b) => b.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField as keyof Bundle] as string | number;
      let bVal: string | number = b[sortField as keyof Bundle] as string | number;
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [bundles, searchQuery, typeFilter, statusFilter, sortField, sortDir]);

  const summaryStats = useMemo(() => {
    const total = bundles.length;
    const active = bundles.filter((b) => b.isActive).length;
    const totalRevenue = bundles.reduce((sum, b) => {
      const discounted = b.sellingPrice * (1 - b.discountPercent / 100);
      return sum + discounted;
    }, 0);
    const totalCost = bundles.reduce((sum, b) => sum + b.cost, 0);
    const avgMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
    return { total, active, totalRevenue, totalCost, avgMargin };
  }, [bundles]);

  const formCost = useMemo(() => {
    return formData.components.reduce(
      (sum, c) => sum + c.unitCost * c.quantity,
      0
    );
  }, [formData.components]);

  const formDiscountedPrice = useMemo(() => {
    return formData.sellingPrice * (1 - formData.discountPercent / 100);
  }, [formData.sellingPrice, formData.discountPercent]);

  const formProfit = formDiscountedPrice - formCost;
  const formMargin = formDiscountedPrice > 0 ? (formProfit / formDiscountedPrice) * 100 : 0;

  const filteredCatalog = useMemo(() => {
    if (!componentSearch) return MOCK_PRODUCT_CATALOG;
    const q = componentSearch.toLowerCase();
    return MOCK_PRODUCT_CATALOG.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [componentSearch]);

  /* Handlers */
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const openCreateDialog = () => {
    setEditingBundle(null);
    setFormData(EMPTY_FORM);
    setShowFormDialog(true);
  };

  const openEditDialog = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      sku: bundle.sku,
      description: bundle.description,
      type: bundle.type,
      components: [...bundle.components],
      sellingPrice: bundle.sellingPrice,
      discountPercent: bundle.discountPercent,
      marketplace: bundle.marketplace,
      isActive: bundle.isActive,
      isListed: bundle.isListed,
    });
    setShowFormDialog(true);
  };

  const openDeleteDialog = (bundle: Bundle) => {
    setDeletingBundle(bundle);
    setShowDeleteDialog(true);
  };

  const handleAddComponent = (product: (typeof MOCK_PRODUCT_CATALOG)[0]) => {
    const exists = formData.components.find((c) => c.sku === product.sku);
    if (exists) {
      setFormData({
        ...formData,
        components: formData.components.map((c) =>
          c.sku === product.sku ? { ...c, quantity: c.quantity + 1 } : c
        ),
      });
    } else {
      setFormData({
        ...formData,
        components: [
          ...formData.components,
          {
            id: `comp-${Date.now()}`,
            productName: product.name,
            sku: product.sku,
            quantity: 1,
            unitCost: product.cost,
            stock: product.stock,
          },
        ],
      });
    }
    setShowComponentPicker(false);
    setComponentSearch('');
  };

  const handleRemoveComponent = (componentId: string) => {
    setFormData({
      ...formData,
      components: formData.components.filter((c) => c.id !== componentId),
    });
  };

  const handleUpdateComponentQty = (componentId: string, qty: number) => {
    if (qty < 1) return;
    setFormData({
      ...formData,
      components: formData.components.map((c) =>
        c.id === componentId ? { ...c, quantity: qty } : c
      ),
    });
  };

  const handleSave = async () => {
    try {
      if (editingBundle) {
        const res = await fetch(`/api/bundles/${editingBundle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            cost: formCost,
            stock: formData.components.length > 0
              ? Math.min(...formData.components.map((c) => Math.floor(c.stock / c.quantity)))
              : 0,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setBundles(bundles.map((b) => (b.id === editingBundle.id ? updated : b)));
        } else {
          // Update locally
          setBundles(
            bundles.map((b) =>
              b.id === editingBundle.id
                ? {
                    ...b,
                    ...formData,
                    cost: formCost,
                    stock: formData.components.length > 0
                      ? Math.min(...formData.components.map((c) => Math.floor(c.stock / c.quantity)))
                      : 0,
                    status: formData.isActive ? 'active' : 'inactive',
                  }
                : b
            )
          );
        }
      } else {
        const res = await fetch('/api/bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            cost: formCost,
            stock: formData.components.length > 0
              ? Math.min(...formData.components.map((c) => Math.floor(c.stock / c.quantity)))
              : 0,
            status: formData.isActive ? 'active' : 'draft',
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setBundles([...bundles, created]);
        } else {
          // Add locally
          const newBundle: Bundle = {
            id: `b-${Date.now()}`,
            ...formData,
            cost: formCost,
            stock: formData.components.length > 0
              ? Math.min(...formData.components.map((c) => Math.floor(c.stock / c.quantity)))
              : 0,
            status: formData.isActive ? 'active' : 'draft',
            createdAt: new Date().toISOString().slice(0, 10),
          };
          setBundles([...bundles, newBundle]);
        }
      }
      setShowFormDialog(false);
    } catch {
      // Fallback local update
      if (editingBundle) {
        setBundles(
          bundles.map((b) =>
            b.id === editingBundle.id
              ? {
                  ...b,
                  ...formData,
                  cost: formCost,
                  stock: formData.components.length > 0
                    ? Math.min(...formData.components.map((c) => Math.floor(c.stock / c.quantity)))
                    : 0,
                  status: formData.isActive ? 'active' : 'inactive',
                }
              : b
          )
        );
      } else {
        const newBundle: Bundle = {
          id: `b-${Date.now()}`,
          ...formData,
          cost: formCost,
          stock: formData.components.length > 0
            ? Math.min(...formData.components.map((c) => Math.floor(c.stock / c.quantity)))
            : 0,
          status: formData.isActive ? 'active' : 'draft',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setBundles([...bundles, newBundle]);
      }
      setShowFormDialog(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBundle) return;
    try {
      const res = await fetch(`/api/bundles/${deletingBundle.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBundles(bundles.filter((b) => b.id !== deletingBundle.id));
      } else {
        setBundles(bundles.filter((b) => b.id !== deletingBundle.id));
      }
    } catch {
      setBundles(bundles.filter((b) => b.id !== deletingBundle.id));
    }
    setShowDeleteDialog(false);
    setDeletingBundle(null);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 inline-flex">
      {sortField === field ? (
        sortDir === 'asc' ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ChevronUp className="h-3.5 w-3.5 opacity-30" />
      )}
    </span>
  );

  const renderStockBadge = (stock: number) => {
    if (stock === 0)
      return <Badge className="bg-red-100 text-red-700 text-xs border-0">Stok Yok</Badge>;
    if (stock <= 5)
      return <Badge className="bg-red-100 text-red-700 text-xs border-0">Kritik</Badge>;
    if (stock <= 15)
      return <Badge className="bg-amber-100 text-amber-700 text-xs border-0">Düşük</Badge>;
    if (stock <= 30)
      return <Badge className="bg-blue-100 text-blue-700 text-xs border-0">Normal</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 text-xs border-0">Yeterli</Badge>;
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-50 p-6 transition-all',
          sidebarOpen ? 'lg:ml-64' : 'ml-16'
        )}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-80 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="h-80 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 p-6 transition-all',
        sidebarOpen ? 'lg:ml-64' : 'ml-16'
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
              <Layers className="h-5 w-5 text-white" />
            </div>
            Paket Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ürün paketlerini ve setleri yönetin, maliyet hesaplayın
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Paket Oluştur
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">Toplam Paket</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <Package className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{summaryStats.total}</p>
            <p className="text-xs text-slate-400 mt-1">
              {summaryStats.active} aktif paket
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">Aktif Paket</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <PackageCheck className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{summaryStats.active}</p>
            <Progress
              value={(summaryStats.active / Math.max(summaryStats.total, 1)) * 100}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">Toplam Ciro</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                <DollarSign className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {fmt(summaryStats.totalRevenue)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Maliyet: {fmt(summaryStats.totalCost)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">Ort. Kar Marjı</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p
              className={cn(
                'text-xl font-bold',
                summaryStats.avgMargin >= 20
                  ? 'text-emerald-600'
                  : summaryStats.avgMargin >= 10
                    ? 'text-amber-600'
                    : 'text-red-600'
              )}
            >
              %{summaryStats.avgMargin.toFixed(1)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Kar: {fmt(summaryStats.totalRevenue - summaryStats.totalCost)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Paket adı, SKU veya açıklama ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-xs">
                    <SelectValue placeholder="Paket Tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    <SelectItem value="fixed">Sabit Paket</SelectItem>
                    <SelectItem value="dynamic">Dinamik Paket</SelectItem>
                    <SelectItem value="customizable">Özelleştirilebilir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="draft">Taslak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: List / Analytics */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-white shadow-sm border">
          <TabsTrigger value="list" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Paket Listesi ({filteredBundles.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analiz
          </TabsTrigger>
        </TabsList>

        {/* Tab: Bundle List */}
        <TabsContent value="list">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th
                          className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800"
                          onClick={() => handleSort('sku')}
                        >
                          SKU <SortIcon field="sku" />
                        </th>
                        <th
                          className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800"
                          onClick={() => handleSort('name')}
                        >
                          Paket Adı <SortIcon field="name" />
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-slate-600">Tipi</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-600">
                          Bileşen Sayısı
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800"
                          onClick={() => handleSort('cost')}
                        >
                          Maliyet <SortIcon field="cost" />
                        </th>
                        <th
                          className="text-right py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800"
                          onClick={() => handleSort('sellingPrice')}
                        >
                          Satış Fiyatı <SortIcon field="sellingPrice" />
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-slate-600">Stok</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-600">Durum</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-600">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBundles.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-12 text-slate-400"
                          >
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-base font-medium">Paket bulunamadı</p>
                            <p className="text-sm mt-1">
                              Arama kriterlerinizi değiştirmeyi deneyin
                            </p>
                          </td>
                        </tr>
                      )}
                      {filteredBundles.map((bundle) => {
                        const typeConf = BUNDLE_TYPE_CONFIG[bundle.type];
                        const statusConf = STATUS_CONFIG[bundle.status];
                        const discounted =
                          bundle.sellingPrice * (1 - bundle.discountPercent / 100);
                        const profit = discounted - bundle.cost;
                        const margin =
                          discounted > 0 ? (profit / discounted) * 100 : 0;

                        return (
                          <>
                            <tr
                              key={bundle.id}
                              className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() =>
                                setExpandedBundleId(
                                  expandedBundleId === bundle.id
                                    ? null
                                    : bundle.id
                                )
                              }
                            >
                              <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                                {bundle.sku}
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <span className="font-medium text-slate-800">
                                    {bundle.name}
                                  </span>
                                  {bundle.description && (
                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">
                                      {bundle.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge
                                  className={cn(
                                    'text-xs border-0',
                                    typeConf.bg,
                                    typeConf.color
                                  )}
                                >
                                  {typeConf.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                  <Layers className="h-3.5 w-3.5" />
                                  {bundle.components.length}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-slate-500">
                                {fmt(bundle.cost)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div>
                                  <span className="font-medium text-slate-800">
                                    {fmt(bundle.sellingPrice)}
                                  </span>
                                  {bundle.discountPercent > 0 && (
                                    <p className="text-xs text-emerald-600 font-medium">
                                      %{bundle.discountPercent} indirim →{' '}
                                      {fmt(discounted)}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {renderStockBadge(bundle.stock)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge
                                  className={cn(
                                    'text-xs border-0',
                                    statusConf.cls
                                  )}
                                >
                                  {statusConf.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="flex items-center justify-end gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600"
                                    onClick={() => openEditDialog(bundle)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                    onClick={() => openDeleteDialog(bundle)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            {/* Expanded Row - Component Details */}
                            {expandedBundleId === bundle.id && (
                              <tr key={`${bundle.id}-detail`}>
                                <td colSpan={9} className="bg-slate-50 px-4 py-4">
                                  <div className="max-w-4xl">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Layers className="h-4 w-4 text-emerald-600" />
                                      <span className="text-sm font-semibold text-slate-700">
                                        Bileşen Detayları
                                      </span>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-slate-100 border-b border-slate-200">
                                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                                              Ürün
                                            </th>
                                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                                              SKU
                                            </th>
                                            <th className="text-center py-2 px-3 font-medium text-slate-600">
                                              Adet
                                            </th>
                                            <th className="text-right py-2 px-3 font-medium text-slate-600">
                                              Birim Maliyet
                                            </th>
                                            <th className="text-right py-2 px-3 font-medium text-slate-600">
                                              Toplam
                                            </th>
                                            <th className="text-center py-2 px-3 font-medium text-slate-600">
                                              Stok
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {bundle.components.map((comp) => {
                                            const possibleStock = Math.floor(
                                              comp.stock / comp.quantity
                                            );
                                            return (
                                              <tr
                                                key={comp.id}
                                                className="border-b border-slate-100 last:border-0"
                                              >
                                                <td className="py-2 px-3 font-medium text-slate-700">
                                                  {comp.productName}
                                                </td>
                                                <td className="py-2 px-3 text-slate-500 font-mono">
                                                  {comp.sku}
                                                </td>
                                                <td className="py-2 px-3 text-center text-slate-600">
                                                  x{comp.quantity}
                                                </td>
                                                <td className="py-2 px-3 text-right text-slate-500">
                                                  {fmt(comp.unitCost)}
                                                </td>
                                                <td className="py-2 px-3 text-right font-medium text-slate-700">
                                                  {fmt(
                                                    comp.unitCost * comp.quantity
                                                  )}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                  <span
                                                    className={cn(
                                                      'text-xs font-medium',
                                                      possibleStock <= 5
                                                        ? 'text-red-600'
                                                        : possibleStock <= 15
                                                          ? 'text-amber-600'
                                                          : 'text-slate-600'
                                                    )}
                                                  >
                                                    {comp.stock} (paket: {possibleStock})
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                        <tfoot>
                                          <tr className="bg-slate-100 font-semibold">
                                            <td
                                              colSpan={4}
                                              className="py-2 px-3 text-right text-slate-700"
                                            >
                                              Toplam Maliyet:
                                            </td>
                                            <td className="py-2 px-3 text-right text-slate-800">
                                              {fmt(bundle.cost)}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <Badge
                                                className={cn(
                                                  'text-xs border-0',
                                                  bundle.stock <= 5
                                                    ? 'bg-red-100 text-red-700'
                                                    : bundle.stock <= 15
                                                      ? 'bg-amber-100 text-amber-700'
                                                      : 'bg-emerald-100 text-emerald-700'
                                                )}
                                              >
                                                Min: {bundle.stock}
                                              </Badge>
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                    <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
                                      <span>
                                        Satış: {fmt(bundle.sellingPrice)}
                                      </span>
                                      {bundle.discountPercent > 0 && (
                                        <span className="text-emerald-600 font-medium">
                                          İndirimli: {fmt(discounted)}
                                        </span>
                                      )}
                                      <span
                                        className={cn(
                                          'font-medium',
                                          margin >= 20
                                            ? 'text-emerald-600'
                                            : margin >= 10
                                              ? 'text-amber-600'
                                              : 'text-red-600'
                                        )}
                                      >
                                        Kar: {fmt(profit)} (%
                                        {margin.toFixed(1)})
                                      </span>
                                      <span>
                                        Platform:{' '}
                                        {MARKETPLACES.find(
                                          (m) => m.value === bundle.marketplace
                                        )?.label || bundle.marketplace}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bundle Type Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Paket Tipi Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(['fixed', 'dynamic', 'customizable'] as BundleType[]).map(
                    (type) => {
                      const conf = BUNDLE_TYPE_CONFIG[type];
                      const count = bundles.filter(
                        (b) => b.type === type
                      ).length;
                      const pct =
                        bundles.length > 0
                          ? (count / bundles.length) * 100
                          : 0;
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  'text-xs border-0',
                                  conf.bg,
                                  conf.color
                                )}
                              >
                                {conf.label}
                              </Badge>
                              <span className="text-sm text-slate-600">
                                {count} paket
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                              %{pct.toFixed(0)}
                            </span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Profitable Bundles */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  En Karlı Paketler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-2.5 px-4 font-medium text-slate-500 text-xs">
                          Paket
                        </th>
                        <th className="text-right py-2.5 px-4 font-medium text-slate-500 text-xs">
                          Kar
                        </th>
                        <th className="text-right py-2.5 px-4 font-medium text-slate-500 text-xs">
                          Marj
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...bundles]
                        .map((b) => {
                          const disc = b.sellingPrice * (1 - b.discountPercent / 100);
                          return {
                            ...b,
                            profit: disc - b.cost,
                            margin: disc > 0 ? ((disc - b.cost) / disc) * 100 : 0,
                          };
                        })
                        .sort((a, b) => b.profit - a.profit)
                        .slice(0, 5)
                        .map((b) => (
                          <tr
                            key={b.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-2.5 px-4 font-medium text-slate-800 max-w-[180px] truncate">
                              {b.name}
                            </td>
                            <td
                              className={cn(
                                'py-2.5 px-4 text-right font-semibold',
                                b.profit >= 0
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                              )}
                            >
                              {fmt(b.profit)}
                            </td>
                            <td
                              className={cn(
                                'py-2.5 px-4 text-right',
                                b.margin >= 20
                                  ? 'text-emerald-600'
                                  : b.margin >= 10
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                              )}
                            >
                              %{b.margin.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Pazaryeri Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MARKETPLACES.filter((m) => m.value !== 'all').map((mp) => {
                    const count = bundles.filter(
                      (b) => b.marketplace === mp.value
                    ).length;
                    if (count === 0) return null;
                    return (
                      <div
                        key={mp.value}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm text-slate-600">
                          {mp.label}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {count} paket
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Stok Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Yeterli (>30)',
                      count: bundles.filter((b) => b.stock > 30).length,
                      cls: 'bg-emerald-100 text-emerald-700',
                    },
                    {
                      label: 'Normal (16-30)',
                      count: bundles.filter(
                        (b) => b.stock > 15 && b.stock <= 30
                      ).length,
                      cls: 'bg-blue-100 text-blue-700',
                    },
                    {
                      label: 'Düşük (6-15)',
                      count: bundles.filter(
                        (b) => b.stock > 5 && b.stock <= 15
                      ).length,
                      cls: 'bg-amber-100 text-amber-700',
                    },
                    {
                      label: 'Kritik (1-5)',
                      count: bundles.filter(
                        (b) => b.stock >= 1 && b.stock <= 5
                      ).length,
                      cls: 'bg-red-100 text-red-700',
                    },
                    {
                      label: 'Stok Yok (0)',
                      count: bundles.filter((b) => b.stock === 0).length,
                      cls: 'bg-slate-200 text-slate-600',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <Badge className={cn('text-xs border-0', item.cls)}>
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBundle ? 'Paket Düzenle' : 'Yeni Paket Oluştur'}
            </DialogTitle>
            <DialogDescription>
              {editingBundle
                ? 'Paket bilgilerini güncelleyin'
                : 'Yeni bir ürün paketi tanımlayın'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-name">Paket Adı *</Label>
                <Input
                  id="bundle-name"
                  placeholder="örn: Akıllı Telefon Seti"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bundle-sku">SKU *</Label>
                <Input
                  id="bundle-sku"
                  placeholder="örn: PKG-TEL-001"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="bundle-desc">Açıklama</Label>
              <Textarea
                id="bundle-desc"
                placeholder="Paket içeriğini ve özelliklerini açıklayın..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Type & Marketplace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paket Tipi</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as BundleType })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            BUNDLE_TYPE_CONFIG.fixed.bg.replace('bg-', 'bg-')
                          )}
                        />
                        Sabit Paket
                      </div>
                    </SelectItem>
                    <SelectItem value="dynamic">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            BUNDLE_TYPE_CONFIG.dynamic.bg.replace('bg-', 'bg-')
                          )}
                        />
                        Dinamik Paket
                      </div>
                    </SelectItem>
                    <SelectItem value="customizable">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            BUNDLE_TYPE_CONFIG.customizable.bg.replace(
                              'bg-',
                              'bg-'
                            )
                          )}
                        />
                        Özelleştirilebilir
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pazaryeri</Label>
                <Select
                  value={formData.marketplace}
                  onValueChange={(v) =>
                    setFormData({ ...formData, marketplace: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETPLACES.map((mp) => (
                      <SelectItem key={mp.value} value={mp.value}>
                        {mp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Components Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  Paket Bileşenleri
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => setShowComponentPicker(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ürün Ekle
                </Button>
              </div>

              {/* Component picker dialog */}
              {showComponentPicker && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Ürün adı veya SKU ara..."
                      value={componentSearch}
                      onChange={(e) => setComponentSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setShowComponentPicker(false);
                        setComponentSearch('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-1">
                      {filteredCatalog.map((product) => {
                        const isAdded = formData.components.some(
                          (c) => c.sku === product.sku
                        );
                        return (
                          <div
                            key={product.id}
                            className={cn(
                              'flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors',
                              isAdded
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'hover:bg-emerald-100/60'
                            )}
                            onClick={() => handleAddComponent(product)}
                          >
                            <div>
                              <span className="font-medium">
                                {product.name}
                              </span>
                              <span className="ml-2 text-xs text-slate-500 font-mono">
                                {product.sku}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-slate-500">
                                {fmt(product.cost)}
                              </span>
                              {isAdded ? (
                                <Badge className="bg-emerald-200 text-emerald-800 text-xs border-0">
                                  Eklendi
                                </Badge>
                              ) : (
                                <Plus className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {filteredCatalog.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-3">
                          Ürün bulunamadı
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Component list */}
              {formData.components.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 py-8 text-center">
                  <Sparkles className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">
                    Henüz bileşen eklenmedi
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    &quot;Ürün Ekle&quot; butonuna tıklayarak başlayın
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <ScrollArea className="max-h-[220px]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-2 px-3 font-medium text-slate-500">
                            Ürün
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-slate-500">
                            Adet
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-slate-500">
                            Birim Maliyet
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-slate-500">
                            Toplam
                          </th>
                          <th className="py-2 px-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.components.map((comp) => (
                          <tr
                            key={comp.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {comp.productName}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleUpdateComponentQty(
                                      comp.id,
                                      comp.quantity - 1
                                    )
                                  }
                                  disabled={comp.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center font-medium">
                                  {comp.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleUpdateComponentQty(
                                      comp.id,
                                      comp.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </Button>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right text-slate-500">
                              {fmt(comp.unitCost)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-slate-700">
                              {fmt(comp.unitCost * comp.quantity)}
                            </td>
                            <td className="py-2 px-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                onClick={() => handleRemoveComponent(comp.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-semibold">
                          <td
                            colSpan={3}
                            className="py-2 px-3 text-right text-slate-700"
                          >
                            Toplam Maliyet:
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-600">
                            {fmt(formCost)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Fiyatlandırma
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-price">Satış Fiyatı (₺) *</Label>
                  <Input
                    id="sell-price"
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={formData.sellingPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellingPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">İndirim Oranı (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    value={formData.discountPercent || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>İndirimli Fiyat</Label>
                  <div className="h-9 rounded-md border bg-slate-50 px-3 flex items-center text-sm font-medium text-slate-700">
                    {fmt(formDiscountedPrice)}
                  </div>
                </div>
              </div>

              {/* Profit summary */}
              {formData.components.length > 0 && formData.sellingPrice > 0 && (
                <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Toplam Maliyet:</span>
                    <span className="font-medium text-slate-700">
                      {fmt(formCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">İndirimli Satış:</span>
                    <span className="font-medium text-slate-700">
                      {fmt(formDiscountedPrice)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">
                      Tahmini Kar:
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        formProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {fmt(formProfit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">
                      Kar Marjı:
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        formMargin >= 20
                          ? 'text-emerald-600'
                          : formMargin >= 10
                            ? 'text-amber-600'
                            : 'text-red-600'
                      )}
                    >
                      %{formMargin.toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(Math.max(formMargin, 0), 100)}
                    className="h-2"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aktif</Label>
                  <p className="text-xs text-slate-400">
                    Paket satışa açık olacak
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, isActive: v })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Listeli</Label>
                  <p className="text-xs text-slate-400">
                    Pazaryerinde listelenecek
                  </p>
                </div>
                <Switch
                  checked={formData.isListed}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, isListed: v })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFormDialog(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.sku || formData.components.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editingBundle ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Paket Sil
            </DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Paketi silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          {deletingBundle && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700">
                  Silinecek Paket
                </span>
              </div>
              <p className="text-sm font-medium text-red-800">
                {deletingBundle.name}
              </p>
              <p className="text-xs text-red-600 font-mono">{deletingBundle.sku}</p>
              <p className="text-xs text-red-500">
                {deletingBundle.components.length} bileşen içeren bu paket kalıcı olarak
                silinecektir.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Evet, Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
