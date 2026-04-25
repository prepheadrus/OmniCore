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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Shield,
  Globe,
  TrendingUp,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Calculator,
  Landmark,
  Scale,
  Percent,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';

/* ================================================================
   Types
   ================================================================ */
interface TaxRule {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  region: string;
  taxType: 'vat' | 'customs' | 'import_duty' | 'excise' | 'sales_tax';
  rate: number;
  thresholdMin: number;
  thresholdMax: number | null;
  category: string;
  hsCode: string;
  effectiveDate: string;
  expiryDate: string | null;
  status: boolean;
  notes: string;
}

/* ================================================================
   Constants
   ================================================================ */
const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
  { code: 'US', name: 'Amerika Birleşik Devletleri', flag: '🇺🇸' },
  { code: 'UK', name: 'Birleşik Krallık', flag: '🇬🇧' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
  { code: 'PL', name: 'Polonya', flag: '🇵🇱' },
  { code: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦' },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri', flag: '🇦🇪' },
];

const TAX_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  vat: { label: 'KDV', color: 'bg-blue-100 text-blue-700' },
  customs: { label: 'Gümrük', color: 'bg-orange-100 text-orange-700' },
  import_duty: { label: 'İthalat Vergisi', color: 'bg-purple-100 text-purple-700' },
  excise: { label: 'Özel Tüketim', color: 'bg-red-100 text-red-700' },
  sales_tax: { label: 'Satış Vergisi', color: 'bg-emerald-100 text-emerald-700' },
};

const CATEGORIES = [
  'Elektronik', 'Giyim', 'Ev & Yaşam', 'Kozmetik', 'Spor', 'Oyuncak',
  'Otomotiv', 'Kitap', 'Gıda', 'Sağlık', 'Mobilya', 'Takı', 'Diğer',
];

/* ================================================================
   Demo Data
   ================================================================ */
const DEMO_RULES: TaxRule[] = [
  { id: 'tx-001', name: 'Türkiye Standart KDV', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', region: 'Tüm Türkiye', taxType: 'vat', rate: 20, thresholdMin: 0, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Standart KDV oranı' },
  { id: 'tx-002', name: 'Türkiye İndirimli KDV', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', region: 'Tüm Türkiye', taxType: 'vat', rate: 10, thresholdMin: 0, thresholdMax: null, category: 'Gıda', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Temel gıda maddeleri' },
  { id: 'tx-003', name: 'Türkiye Elektronik KDV', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', region: 'Tüm Türkiye', taxType: 'vat', rate: 20, thresholdMin: 0, thresholdMax: null, category: 'Elektronik', hsCode: '8517', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Cep telefonu ve bilgisayar' },
  { id: 'tx-004', name: 'Almanya Standart KDV', country: 'Almanya', countryCode: 'DE', flag: '🇩🇪', region: 'Tüm Almanya', taxType: 'vat', rate: 19, thresholdMin: 22000, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Standart Almanya KDV' },
  { id: 'tx-005', name: 'Almanya İndirimli KDV', country: 'Almanya', countryCode: 'DE', flag: '🇩🇪', region: 'Tüm Almanya', taxType: 'vat', rate: 7, thresholdMin: 22000, thresholdMax: null, category: 'Kitap', hsCode: '4901', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Kitap ve basılı yayınlar' },
  { id: 'tx-006', name: 'Almanya Gümrük Vergisi', country: 'Almanya', countryCode: 'DE', flag: '🇩🇪', region: 'AB', taxType: 'customs', rate: 2.5, thresholdMin: 0, thresholdMax: 150, category: 'Elektronik', hsCode: '8517', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'AB ithalat gümrük vergisi' },
  { id: 'tx-007', name: 'AB İthalat Vergisi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', region: 'AB', taxType: 'import_duty', rate: 3.7, thresholdMin: 0, thresholdMax: null, category: 'Giyim', hsCode: '6203', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Tekstil ürünleri ithalat vergisi' },
  { id: 'tx-008', name: 'Fransa KDV', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', region: 'Tüm Fransa', taxType: 'vat', rate: 20, thresholdMin: 10000, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Standart Fransa KDV' },
  { id: 'tx-009', name: 'Hollanda KDV', country: 'Hollanda', countryCode: 'NL', flag: '🇳🇱', region: 'Tüm Hollanda', taxType: 'vat', rate: 21, thresholdMin: 20000, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Standart Hollanda KDV' },
  { id: 'tx-010', name: 'İngiltere KDV', country: 'Birleşik Krallık', countryCode: 'UK', flag: '🇬🇧', region: 'Tüm İngiltere', taxType: 'vat', rate: 20, thresholdMin: 90000, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'İngiltere KDV, £90K eşik' },
  { id: 'tx-011', name: 'İngiltere Özel Tüketim', country: 'Birleşik Krallık', countryCode: 'UK', flag: '🇬🇧', region: 'Tüm İngiltere', taxType: 'excise', rate: 16.67, thresholdMin: 0, thresholdMax: null, category: 'Kozmetik', hsCode: '3304', effectiveDate: '2024-01-01', expiryDate: null, status: false, notes: 'Kozmetik ürünleri özel tüketim vergisi - askıya alındı' },
  { id: 'tx-012', name: 'ABD Satış Vergisi (CA)', country: 'Amerika Birleşik Devletleri', countryCode: 'US', flag: '🇺🇸', region: 'Kaliforniya', taxType: 'sales_tax', rate: 8.25, thresholdMin: 0, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Kaliforniya eyalet satış vergisi' },
  { id: 'tx-013', name: 'İtalya KDV', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', region: 'Tüm İtalya', taxType: 'vat', rate: 22, thresholdMin: 65000, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Standart İtalya KDV' },
  { id: 'tx-014', name: 'Türkiye Özel Tüketim', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', region: 'Tüm Türkiye', taxType: 'excise', rate: 25, thresholdMin: 0, thresholdMax: null, category: 'Kozmetik', hsCode: '3304', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'Kozmetik ürünleri ÖTV' },
  { id: 'tx-015', name: 'BAE KDV', country: 'Birleşik Arap Emirlikleri', countryCode: 'AE', flag: '🇦🇪', region: 'Tüm BAE', taxType: 'vat', rate: 5, thresholdMin: 375000, thresholdMax: null, category: 'Genel', hsCode: '-', effectiveDate: '2024-01-01', expiryDate: null, status: true, notes: 'BAE KDV oranı' },
];

/* ================================================================
   Helper Functions
   ================================================================ */
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

/* ================================================================
   Skeleton
   ================================================================ */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-52 bg-slate-200 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-80 bg-slate-200 rounded-xl" />
    </div>
  );
}

/* ================================================================
   Custom Tooltip
   ================================================================ */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.name}</span>
          </span>
          <span className="font-medium text-slate-800">%{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function TaxCompliance() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Add rule form
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('TR');
  const [formRegion, setFormRegion] = useState('');
  const [formTaxType, setFormTaxType] = useState<string>('vat');
  const [formRate, setFormRate] = useState('');
  const [formThresholdMin, setFormThresholdMin] = useState('');
  const [formThresholdMax, setFormThresholdMax] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formHsCode, setFormHsCode] = useState('');
  const [formEffectiveDate, setFormEffectiveDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Calculator state
  const [calcCountry, setCalcCountry] = useState('TR');
  const [calcPrice, setCalcPrice] = useState('');
  const [calcCategory, setCalcCategory] = useState('Elektronik');

  /* ---------- load data ---------- */
  useEffect(() => {
    fetch('/api/tax-compliance')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setData(res);
        } else {
          setData(DEMO_RULES);
        }
      })
      .catch(() => setData(DEMO_RULES))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- derived data ---------- */
  const stats = useMemo(() => {
    const active = data.filter((r) => r.status).length;
    const countries = new Set(data.map((r) => r.countryCode)).size;
    const vatRules = data.filter((r) => r.taxType === 'vat' && r.status);
    const avgVat = vatRules.length > 0 ? vatRules.reduce((a, b) => a + b.rate, 0) / vatRules.length : 0;
    return { total: data.length, active, countries, avgVat };
  }, [data]);

  const filteredData = useMemo(() => {
    let items = [...data];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.hsCode.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    if (filterCountry !== 'all') {
      items = items.filter((r) => r.countryCode === filterCountry);
    }
    if (filterType !== 'all') {
      items = items.filter((r) => r.taxType === filterType);
    }
    return items;
  }, [data, searchTerm, filterCountry, filterType]);

  // Calculator
  const calcResults = useMemo(() => {
    const price = parseFloat(calcPrice) || 0;
    if (price <= 0) return null;

    const rules = data.filter((r) => r.status && r.countryCode === calcCountry);
    const vatRule = rules.find((r) => r.taxType === 'vat' && (r.category === calcCategory || r.category === 'Genel'));
    const customsRule = rules.find((r) => r.taxType === 'customs' && (r.category === calcCategory || r.category === 'Genel'));
    const importRule = rules.find((r) => r.taxType === 'import_duty' && (r.category === calcCategory || r.category === 'Genel'));
    const exciseRule = rules.find((r) => r.taxType === 'excise' && r.category === calcCategory);

    const vatAmount = vatRule ? (price * vatRule.rate) / 100 : 0;
    const customsAmount = customsRule ? (price * customsRule.rate) / 100 : 0;
    const importAmount = importRule ? (price * importRule.rate) / 100 : 0;
    const exciseAmount = exciseRule ? (price * exciseRule.rate) / 100 : 0;
    const total = price + vatAmount + customsAmount + importAmount + exciseAmount;

    return {
      basePrice: price,
      vat: { rate: vatRule?.rate || 0, amount: vatAmount },
      customs: { rate: customsRule?.rate || 0, amount: customsAmount },
      importDuty: { rate: importRule?.rate || 0, amount: importAmount },
      excise: { rate: exciseRule?.rate || 0, amount: exciseAmount },
      total,
      rules: [vatRule, customsRule, importRule, exciseRule].filter(Boolean),
    };
  }, [data, calcCountry, calcPrice, calcCategory]);

  // Country comparison chart data
  const comparisonData = useMemo(() => {
    const price = parseFloat(calcPrice) || 1000;
    const countryCodes = ['TR', 'DE', 'FR', 'NL', 'UK', 'IT', 'AE'];

    return countryCodes.map((cc) => {
      const rules = data.filter((r) => r.status && r.countryCode === cc);
      const vatRule = rules.find((r) => r.taxType === 'vat' && (r.category === calcCategory || r.category === 'Genel'));
      const customsRule = rules.find((r) => r.taxType === 'customs' && (r.category === calcCategory || r.category === 'Genel'));
      const importRule = rules.find((r) => r.taxType === 'import_duty' && (r.category === calcCategory || r.category === 'Genel'));
      const exciseRule = rules.find((r) => r.taxType === 'excise' && r.category === calcCategory);

      const vatAmt = vatRule ? (price * vatRule.rate) / 100 : 0;
      const customsAmt = customsRule ? (price * customsRule.rate) / 100 : 0;
      const importAmt = importRule ? (price * importRule.rate) / 100 : 0;
      const exciseAmt = exciseRule ? (price * exciseRule.rate) / 100 : 0;

      const country = COUNTRIES.find((c) => c.code === cc);
      return {
        name: country?.flag + ' ' + country?.name || cc,
        'KDV': vatRule?.rate || 0,
        'Gümrük': customsRule?.rate || 0,
        'İthalat': importRule?.rate || 0,
        'ÖTV': exciseRule?.rate || 0,
        'Toplam Vergi': vatAmt + customsAmt + importAmt + exciseAmt,
      };
    });
  }, [data, calcPrice, calcCategory]);

  /* ---------- handlers ---------- */
  const handleAddRule = () => {
    const country = COUNTRIES.find((c) => c.code === formCountry);
    const newRule: TaxRule = {
      id: `tx-${Date.now()}`,
      name: formName || `${country?.name} ${TAX_TYPE_CONFIG[formTaxType]?.label || formTaxType}`,
      country: country?.name || formCountry,
      countryCode: formCountry,
      flag: country?.flag || '',
      region: formRegion,
      taxType: formTaxType as TaxRule['taxType'],
      rate: parseFloat(formRate) || 0,
      thresholdMin: parseFloat(formThresholdMin) || 0,
      thresholdMax: formThresholdMax ? parseFloat(formThresholdMax) : null,
      category: formCategory,
      hsCode: formHsCode,
      effectiveDate: formEffectiveDate,
      expiryDate: formExpiryDate || null,
      status: true,
      notes: formNotes,
    };
    setData((prev) => [...prev, newRule]);
    // Reset form
    setFormName('');
    setFormCountry('TR');
    setFormRegion('');
    setFormTaxType('vat');
    setFormRate('');
    setFormThresholdMin('');
    setFormThresholdMax('');
    setFormCategory('');
    setFormHsCode('');
    setFormEffectiveDate('');
    setFormExpiryDate('');
    setFormNotes('');
  };

  const toggleRuleStatus = (id: string) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: !r.status } : r)));
  };

  const deleteRule = (id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id));
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
      {/* Professional Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-7 w-7" />
              Vergi & Gümrük Uyumluluğu
            </h1>
            <p className="text-sm text-emerald-100 mt-1">
              Ülkelere göre vergi kurallarını yönetin ve maliyet tahminlerini hesaplayın
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 hover:text-white"
              onClick={() => {
                setLoading(true);
                fetch('/api/tax-compliance')
                  .then((r) => r.json())
                  .then((res) => { if (Array.isArray(res) && res.length > 0) setData(res); })
                  .catch(() => {})
                  .finally(() => setLoading(false));
              }}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktif Kurallar</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.active}</p>
                <p className="text-xs text-slate-400 mt-1">toplam {stats.total} kural</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <Scale className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kapsanan Ülkeler</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.countries}</p>
                <p className="text-xs text-slate-400 mt-1">ülke/regülasyon</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ortalama KDV Oranı</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">%{stats.avgVat.toFixed(1)}</p>
                <p className="text-xs text-slate-400 mt-1">aktif KDV kuralları bazında</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Percent className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm">
          <TabsTrigger value="rules" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Landmark className="h-4 w-4 mr-1.5" />
            Vergi Kuralları
          </TabsTrigger>
          <TabsTrigger value="add" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Plus className="h-4 w-4 mr-1.5" />
            Kural Ekle
          </TabsTrigger>
          <TabsTrigger value="calculator" className="text-slate-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            <Calculator className="h-4 w-4 mr-1.5" />
            Vergi Hesaplayıcı
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Tax Rules ===== */}
        <TabsContent value="rules">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-emerald-600" />
                  Vergi Kuralları
                  <Badge variant="secondary" className="text-xs font-medium">{filteredData.length} kural</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Kural ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 w-56 text-sm"
                    />
                  </div>
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="h-9 w-40 text-sm">
                      <Globe className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Ülke" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Ülkeler</SelectItem>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-9 w-36 text-sm">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Vergi Tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Tipler</SelectItem>
                      <SelectItem value="vat">KDV</SelectItem>
                      <SelectItem value="customs">Gümrük</SelectItem>
                      <SelectItem value="import_duty">İthalat Vergisi</SelectItem>
                      <SelectItem value="excise">Özel Tüketim</SelectItem>
                      <SelectItem value="sales_tax">Satış Vergisi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Ülke</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Kural Adı</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Bölge</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Vergi Tipi</th>
                      <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Oran</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Kategori</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">HS Kodu</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden xl:table-cell">Yürürlük</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((rule) => {
                      const ttCfg = TAX_TYPE_CONFIG[rule.taxType];
                      return (
                        <tr key={rule.id} className={cn('border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors', !rule.status && 'opacity-50')}>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">{rule.flag}</span>
                              <span className="text-slate-700 font-medium text-xs">{rule.country}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">{rule.name}</td>
                          <td className="py-2.5 px-3 text-slate-500 text-xs">{rule.region}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 font-medium', ttCfg.color)}>
                              {ttCfg.label}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-semibold text-slate-800">%{rule.rate}</span>
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <Badge variant="secondary" className="text-[10px] h-5">{rule.category}</Badge>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-slate-500 hidden lg:table-cell">{rule.hsCode}</td>
                          <td className="py-2.5 px-3 text-xs text-slate-500 hidden xl:table-cell">{fmtDate(rule.effectiveDate)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Switch
                                checked={rule.status}
                                onCheckedChange={() => toggleRuleStatus(rule.id)}
                                className="scale-75"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                                onClick={() => deleteRule(rule.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredData.length === 0 && (
                <p className="text-sm text-slate-400 py-10 text-center">Kural bulunamadı</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Add Rule ===== */}
        <TabsContent value="add">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                Yeni Vergi Kuralı Ekle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Row 1: Name & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Kural Adı</Label>
                  <Input
                    placeholder="Örn: Türkiye Elektronik KDV"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ülke</Label>
                  <Select value={formCountry} onValueChange={setFormCountry}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Ülke seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Region & Tax Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Bölge</Label>
                  <Input
                    placeholder="Örn: Tüm Türkiye, AB, Kaliforniya"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Vergi Tipi</Label>
                  <Select value={formTaxType} onValueChange={setFormTaxType}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Vergi tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TAX_TYPE_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Rate & Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Vergi Oranı (%)</Label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Alt Eşik ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formThresholdMin}
                    onChange={(e) => setFormThresholdMin(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Üst Eşik ($)</Label>
                  <Input
                    type="number"
                    placeholder="Boş = sınır yok"
                    value={formThresholdMax}
                    onChange={(e) => setFormThresholdMax(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 4: Category & HS Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün Kategorisi</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">HS Kodu</Label>
                  <Input
                    placeholder="Örn: 8517"
                    value={formHsCode}
                    onChange={(e) => setFormHsCode(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 5: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Yürürlük Tarihi</Label>
                  <Input
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Son Geçerlilik Tarihi</Label>
                  <Input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 6: Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Notlar</Label>
                <Textarea
                  placeholder="Ek bilgiler..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="min-h-[60px] resize-none"
                  rows={2}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleAddRule}
                  disabled={!formRate || !formCountry}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Kural Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: Tax Calculator ===== */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calculator Input */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-emerald-600" />
                  Vergi Hesaplayıcı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ülke</Label>
                  <Select value={calcCountry} onValueChange={setCalcCountry}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Ülke seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün Fiyatı ($)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Ürün Kategorisi</Label>
                  <Select value={calcCategory} onValueChange={setCalcCategory}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results */}
                {calcResults && (
                  <div className="border-t border-slate-100 pt-4 space-y-3 mt-4">
                    <h4 className="text-sm font-semibold text-slate-800">Vergi Hesaplama Sonucu</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Birim Fiyat</span>
                        <span className="font-medium text-slate-800">${calcResults.basePrice.toLocaleString('tr-TR')}</span>
                      </div>
                      {calcResults.vat.rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">KDV (%{calcResults.vat.rate})</span>
                          <span className="font-medium text-red-600">+${calcResults.vat.amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {calcResults.customs.rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Gümrük (%{calcResults.customs.rate})</span>
                          <span className="font-medium text-red-600">+${calcResults.customs.amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {calcResults.importDuty.rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">İthalat Vergisi (%{calcResults.importDuty.rate})</span>
                          <span className="font-medium text-red-600">+${calcResults.importDuty.amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {calcResults.excise.rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">ÖTV (%{calcResults.excise.rate})</span>
                          <span className="font-medium text-red-600">+${calcResults.excise.amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                        <span className="font-semibold text-slate-800">Toplam</span>
                        <span className="font-bold text-emerald-600 text-base">${calcResults.total.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Country Comparison Chart */}
            <Card className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Ülke Bazlı Vergi Karşılaştırması
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={-25}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="KDV" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
                      <Bar dataKey="Gümrük" fill="#f97316" radius={[2, 2, 0, 0]} barSize={12} />
                      <Bar dataKey="İthalat" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={12} />
                      <Bar dataKey="ÖTV" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
