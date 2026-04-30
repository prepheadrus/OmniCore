'use client';
import React from 'react';

import { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@omnicore/ui/components/ui/select';
import { cn } from '@omnicore/ui/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { Badge } from '@omnicore/ui/components/ui/badge';
import { Button } from '@omnicore/ui/components/ui/button';
import { Input } from '@omnicore/ui/components/ui/input';
import { Label } from '@omnicore/ui/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@omnicore/ui/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@omnicore/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@omnicore/ui/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@omnicore/ui/components/ui/dialog';



import {
  Shield, AlertTriangle, Search, Eye,
  TrendingUp, Download, RefreshCw, Globe, Calendar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ViolationStatus = 'detected' | 'investigating' | 'reported' | 'resolved' | 'dismissed';
type SellerStatus = 'active' | 'investigating' | 'reported' | 'removed';

interface MapViolation {
  id: string;
  productName: string;
  sku: string;
  marketplace: string;
  seller: string;
  detectedPrice: number;
  mapPrice: number;
  deviation: number;
  severity: Severity;
  status: ViolationStatus;
  detectedAt: string;
  evidenceUrl: string;
}

interface UnauthorizedSeller {
  id: string;
  marketplace: string;
  sellerName: string;
  productsAffected: number;
  firstSeen: string;
  evidenceUrl: string;
  status: SellerStatus;
  riskLevel: Severity;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SEVERITY_CFG: Record<Severity, { label: string; badge: string; dot: string; color: string }> = {
  critical: { label: 'Kritik', badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', color: '#ef4444' },
  high: { label: 'Yüksek', badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', color: '#f97316' },
  medium: { label: 'Orta', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', color: '#f59e0b' },
  low: { label: 'Düşük', badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', color: '#3b82f6' },
};

const STATUS_CFG: Record<string, { label: string; badge: string }> = {
  detected: { label: 'Tespit Edildi', badge: 'bg-red-50 text-red-700' },
  investigating: { label: 'İnceleniyor', badge: 'bg-amber-50 text-amber-700' },
  reported: { label: 'Raporlandı', badge: 'bg-blue-50 text-blue-700' },
  resolved: { label: 'Çözüldü', badge: 'bg-emerald-50 text-emerald-700' },
  dismissed: { label: 'Reddedildi', badge: 'bg-slate-100 text-slate-600' },
  active: { label: 'Aktif', badge: 'bg-red-50 text-red-700' },
  removed: { label: 'Kaldırıldı', badge: 'bg-emerald-50 text-emerald-700' },
};

const MARKETPLACES = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'n11', 'Çiçeksepeti'];

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function relTime(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  if (s < 604800) return `${Math.floor(s / 86400)} gün önce`;
  return new Date(d).toLocaleDateString('tr-TR');
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_VIOLATIONS: MapViolation[] = [
  { id: 'mv-001', productName: 'iPhone 15 Pro Max 256GB', sku: 'APL-IP15PM-256', marketplace: 'Trendyol', seller: 'TeknoGlobal', detectedPrice: 62_999, mapPrice: 72_999, deviation: -13.7, severity: 'critical', status: 'detected', detectedAt: '2024-12-15T14:30:00Z', evidenceUrl: '#' },
  { id: 'mv-002', productName: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-256', marketplace: 'Hepsiburada', seller: 'MobileShop TR', detectedPrice: 55_499, mapPrice: 63_499, deviation: -12.6, severity: 'critical', status: 'investigating', detectedAt: '2024-12-15T11:20:00Z', evidenceUrl: '#' },
  { id: 'mv-003', productName: 'Sony WH-1000XM5', sku: 'SNY-WH1K-XM5', marketplace: 'Trendyol', seller: 'AudioMart', detectedPrice: 7_499, mapPrice: 8_999, deviation: -16.7, severity: 'critical', status: 'reported', detectedAt: '2024-12-14T18:00:00Z', evidenceUrl: '#' },
  { id: 'mv-004', productName: 'MacBook Air M3 15"', sku: 'APL-MBA-M3-15', marketplace: 'Amazon TR', seller: 'PazarDijital', detectedPrice: 49_999, mapPrice: 54_499, deviation: -8.3, severity: 'high', status: 'detected', detectedAt: '2024-12-15T09:45:00Z', evidenceUrl: '#' },
  { id: 'mv-005', productName: 'iPad Air M2 11"', sku: 'APL-IPA-M2-11', marketplace: 'n11', seller: 'DigiStore', detectedPrice: 24_999, mapPrice: 26_999, deviation: -7.4, severity: 'high', status: 'investigating', detectedAt: '2024-12-14T15:30:00Z', evidenceUrl: '#' },
  { id: 'mv-006', productName: 'Apple Watch Ultra 2', sku: 'APL-AWU2-49', marketplace: 'Hepsiburada', seller: 'SmartGear', detectedPrice: 25_499, mapPrice: 27_999, deviation: -8.9, severity: 'high', status: 'resolved', detectedAt: '2024-12-13T20:00:00Z', evidenceUrl: '#' },
  { id: 'mv-007', productName: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-BK', marketplace: 'Trendyol', seller: 'BilgisayarDünyası', detectedPrice: 2_799, mapPrice: 3_149, deviation: -11.1, severity: 'medium', status: 'detected', detectedAt: '2024-12-15T08:00:00Z', evidenceUrl: '#' },
  { id: 'mv-008', productName: 'Xiaomi 14 Ultra', sku: 'XIA-14U-512', marketplace: 'Çiçeksepeti', seller: 'CepMarket', detectedPrice: 45_999, mapPrice: 48_499, deviation: -5.2, severity: 'medium', status: 'dismissed', detectedAt: '2024-12-14T12:00:00Z', evidenceUrl: '#' },
  { id: 'mv-009', productName: 'iPhone 15 Pro Max 256GB', sku: 'APL-IP15PM-256', marketplace: 'Amazon TR', seller: 'PrimeTech', detectedPrice: 70_999, mapPrice: 72_999, deviation: -2.7, severity: 'low', status: 'detected', detectedAt: '2024-12-15T13:00:00Z', evidenceUrl: '#' },
  { id: 'mv-010', productName: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-256', marketplace: 'n11', seller: 'GSM Pazaryeri', detectedPrice: 61_499, mapPrice: 63_499, deviation: -3.1, severity: 'low', status: 'resolved', detectedAt: '2024-12-12T10:00:00Z', evidenceUrl: '#' },
  { id: 'mv-011', productName: 'MacBook Air M3 15"', sku: 'APL-MBA-M3-15', marketplace: 'Hepsiburada', seller: 'AppleStoreTR', detectedPrice: 52_499, mapPrice: 54_499, deviation: -3.7, severity: 'low', status: 'resolved', detectedAt: '2024-12-11T16:30:00Z', evidenceUrl: '#' },
];

const MOCK_SELLERS: UnauthorizedSeller[] = [
  { id: 'us-001', marketplace: 'Trendyol', sellerName: 'TeknoGlobal', productsAffected: 8, firstSeen: '2024-11-20T10:00:00Z', evidenceUrl: '#', status: 'active', riskLevel: 'critical' },
  { id: 'us-002', marketplace: 'Hepsiburada', sellerName: 'MobileShop TR', productsAffected: 5, firstSeen: '2024-12-01T08:00:00Z', evidenceUrl: '#', status: 'investigating', riskLevel: 'high' },
  { id: 'us-003', marketplace: 'Trendyol', sellerName: 'AudioMart', productsAffected: 3, firstSeen: '2024-11-15T14:00:00Z', evidenceUrl: '#', status: 'reported', riskLevel: 'high' },
  { id: 'us-004', marketplace: 'Amazon TR', sellerName: 'PazarDijital', productsAffected: 12, firstSeen: '2024-10-28T09:00:00Z', evidenceUrl: '#', status: 'active', riskLevel: 'critical' },
  { id: 'us-005', marketplace: 'n11', sellerName: 'DigiStore', productsAffected: 2, firstSeen: '2024-12-05T16:00:00Z', evidenceUrl: '#', status: 'investigating', riskLevel: 'medium' },
  { id: 'us-006', marketplace: 'Çiçeksepeti', sellerName: 'CepMarket', productsAffected: 4, firstSeen: '2024-11-10T11:00:00Z', evidenceUrl: '#', status: 'removed', riskLevel: 'medium' },
  { id: 'us-007', marketplace: 'Hepsiburada', sellerName: 'SmartGear', productsAffected: 1, firstSeen: '2024-12-08T13:00:00Z', evidenceUrl: '#', status: 'removed', riskLevel: 'low' },
];

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="h-4 w-96 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.name}</span>
          </span>
          <span className="font-medium text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span className="text-slate-700 font-medium">{entry.name}: {entry.value}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BrandProtection() {

  const [violations, setViolations] = useState<MapViolation[]>([]);
  const [sellers, setSellers] = useState<UnauthorizedSeller[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newSku, setNewSku] = useState('');
  const [newMarketplace, setNewMarketplace] = useState('');
  const [newSeller, setNewSeller] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* --- Filters --- */
  const [vSearch, setVSearch] = useState('');
  const [vSeverity, setVSeverity] = useState<string>('all');
  const [vStatus, setVStatus] = useState<string>('all');
  const [vMarketplace, setVMarketplace] = useState<string>('all');
  const [sSearch, setSSearch] = useState('');
  const [sMarketplace, setSMarketplace] = useState<string>('all');
  const [sStatus, setSStatus] = useState<string>('all');

  /* ---------- Load Data ---------- */
  useEffect(() => {
    fetch('/api/brand-protection')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res)) {
          setViolations(res);
          setSellers([]);
        } else if (res && typeof res === 'object') {
          setViolations(res.violations || MOCK_VIOLATIONS);
          setSellers(res.sellers || MOCK_SELLERS);
        } else {
          setViolations(MOCK_VIOLATIONS);
          setSellers(MOCK_SELLERS);
        }
      })
      .catch(() => {
        setViolations(MOCK_VIOLATIONS);
        setSellers(MOCK_SELLERS);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Derived ---------- */
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (vSearch.trim()) {
        const q = vSearch.toLowerCase();
        if (!v.productName.toLowerCase().includes(q) && !v.seller.toLowerCase().includes(q) && !v.sku.toLowerCase().includes(q)) return false;
      }
      if (vSeverity !== 'all' && v.severity !== vSeverity) return false;
      if (vStatus !== 'all' && v.status !== vStatus) return false;
      if (vMarketplace !== 'all' && v.marketplace !== vMarketplace) return false;
      return true;
    });
  }, [violations, vSearch, vSeverity, vStatus, vMarketplace]);

  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      if (sSearch.trim()) {
        const q = sSearch.toLowerCase();
        if (!s.sellerName.toLowerCase().includes(q)) return false;
      }
      if (sMarketplace !== 'all' && s.marketplace !== sMarketplace) return false;
      if (sStatus !== 'all' && s.status !== sStatus) return false;
      return true;
    });
  }, [sellers, sSearch, sMarketplace, sStatus]);

  const kpiStats = useMemo(() => {
    const unresolved = violations.filter((v) => v.status !== 'resolved' && v.status !== 'dismissed').length;
    const critical = violations.filter((v) => v.severity === 'critical' && v.status !== 'resolved' && v.status !== 'dismissed').length;
    const resolvedCount = violations.filter((v) => v.status === 'resolved').length;
    const avgResolutionDays = resolvedCount > 0 ? 2.3 : 0;
    return {
      total: violations.length,
      unresolved,
      critical,
      avgResolution: `${avgResolutionDays} gün`,
      totalSellers: sellers.filter((s) => s.status === 'active' || s.status === 'investigating').length,
    };
  }, [violations, sellers]);

  /* --- Chart Data --- */
  const monthlyChartData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return months.map((m) => ({
      name: m,
      İhlaller: Math.floor(Math.random() * 20) + 5,
      Çözülen: Math.floor(Math.random() * 15) + 3,
    }));
  }, []);

  const marketplacePieData = useMemo(() => {
    const counts: Record<string, number> = {};
    violations.forEach((v) => { counts[v.marketplace] = (counts[v.marketplace] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [violations]);

  const severityPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    violations.forEach((v) => { counts[SEVERITY_CFG[v.severity].label] = (counts[SEVERITY_CFG[v.severity].label] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [violations]);

  const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

  /* ---------- Handlers ---------- */
  const handleStatusChange = async (id: string, newStatus: ViolationStatus) => {
    // Optimistic UI update
    setViolations((prev) => prev.map((v) => v.id === id ? { ...v, status: newStatus } : v));

    // API Call
    try {
        await fetch(`/api/brand-protection/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
    } catch (e) {
        console.error(e);
    }
  };

  const handleNewViolationSubmit = async () => {
    if (!newSku || !newMarketplace || !newSeller || !newPrice) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/brand-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'map_violation',
          sku: newSku,
          marketplace: newMarketplace,
          seller: newSeller,
          detectedPrice: parseFloat(newPrice),
          severity: 'medium',
          status: 'detected',
          evidence: []
        }),
      });

      if (response.ok) {
        const newAlert = await response.json();
        setViolations([newAlert, ...violations]);
        setIsDialogOpen(false);
        setNewSku('');
        setNewMarketplace('');
        setNewSeller('');
        setNewPrice('');
      } else {
        alert('İhlal bildirilirken hata oluştu.');
      }
    } catch (e) {
      console.error(e);
      alert('İhlal bildirilirken ağ hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSellerStatusChange = (id: string, newStatus: SellerStatus) => {
    setSellers((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-6">
        <Skeleton />
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="p-6">

      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Marka Koruması & MAP İzleme</h1>
              <p className="text-sm text-slate-300 mt-0.5">Minimum reklam fiyatı ihlallerini tespit edin ve yetkisiz satıcıları izleyin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <RefreshCw className="h-4 w-4 mr-1" /> Tarama Başlat
            </Button>

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
      <AlertTriangle className="h-4 w-4 mr-1" /> Yeni İhlal Bildir
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Manuel İhlal Bildirimi</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" placeholder="Ürün SKU kodu..." value={newSku} onChange={(e) => setNewSku(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="marketplace">Pazaryeri</Label>
        <Input id="marketplace" placeholder="Örn: Trendyol" value={newMarketplace} onChange={(e) => setNewMarketplace(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seller">Satıcı Adı</Label>
        <Input id="seller" placeholder="İhlal yapan satıcı..." value={newSeller} onChange={(e) => setNewSeller(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Tespit Edilen Fiyat</Label>
        <Input id="price" type="number" placeholder="0.00" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
      </div>
      <Button onClick={handleNewViolationSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </div>
  </DialogContent>
</Dialog>

            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <Download className="h-4 w-4 mr-1" /> Rapor İndir
            </Button>
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Toplam Uyarı', value: kpiStats.total, icon: <AlertTriangle className="h-5 w-5 text-white" />, bg: 'bg-slate-800' },
          { label: 'Çözülmemiş', value: kpiStats.unresolved, icon: <AlertTriangle className="h-5 w-5 text-white" />, bg: 'bg-orange-500' },
          { label: 'Kritik İhlal', value: kpiStats.critical, icon: <Shield className="h-5 w-5 text-white" />, bg: 'bg-red-600' },
          { label: 'Ort. Çözüm Süresi', value: kpiStats.avgResolution, icon: <Calendar className="h-5 w-5 text-white" />, bg: 'bg-blue-500' },
          { label: 'Yetkisiz Satıcı', value: kpiStats.totalSellers, icon: <Shield className="h-5 w-5 text-white" />, bg: 'bg-violet-600' },
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
      <Tabs defaultValue="violations" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto">
          <TabsTrigger value="violations" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            MAP İhlalleri
          </TabsTrigger>
          <TabsTrigger value="sellers" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-1.5" />
            Yetkisiz Satıcılar
          </TabsTrigger>
          <TabsTrigger value="statistics" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            İstatistikler
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: MAP Violations ===== */}
        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                MAP İhlal Tespitleri
                <Badge variant="secondary" className="ml-1">{filteredViolations.length} ihlal</Badge>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Ürün, satıcı veya SKU ara..." value={vSearch} onChange={(e) => setVSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={vSeverity} onValueChange={setVSeverity}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Şiddet" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Şiddetler</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={vStatus} onValueChange={setVStatus}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Durum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="detected">Tespit Edildi</SelectItem>
                    <SelectItem value="investigating">İnceleniyor</SelectItem>
                    <SelectItem value="reported">Raporlandı</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="dismissed">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={vMarketplace} onValueChange={setVMarketplace}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Pazaryeri" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Pazaryerleri</SelectItem>
                    {MARKETPLACES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ürün</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Satıcı</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pazaryeri</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Tespit Fiyatı</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">MAP Fiyatı</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Sapma</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Şiddet</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViolations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-slate-400">İhlal bulunamadı</TableCell>
                      </TableRow>
                    ) : (
                      filteredViolations.map((v) => {
                        const sev = SEVERITY_CFG[v.severity];
                        const stat = STATUS_CFG[v.status];
                        return (
                          <TableRow key={v.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-slate-800 truncate max-w-[180px]">{v.productName}</p>
                                <p className="text-xs text-slate-400 font-mono">{v.sku}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-700">{v.seller}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{v.marketplace}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm font-semibold text-red-600">{fmt(v.detectedPrice)}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm text-slate-600">{fmt(v.mapPrice)}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className="bg-red-50 text-red-600 text-xs font-semibold">
                                %{Math.abs(v.deviation).toFixed(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs font-semibold border', sev.badge)}>
                                <span className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full', sev.dot)} />
                                {sev.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', stat.badge)}>{stat.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {v.status === 'detected' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleStatusChange(v.id, 'investigating')}>
                                      <Eye className="h-3.5 w-3.5 mr-1" /> İncele
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleStatusChange(v.id, 'reported')}>
                                      <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Raporla
                                    </Button>
                                  </>
                                )}
                                {v.status === 'investigating' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handleStatusChange(v.id, 'reported')}>
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Raporla
                                  </Button>
                                )}
                                {v.status === 'reported' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-emerald-600" onClick={() => handleStatusChange(v.id, 'resolved')}>
                                    <CheckIcon className="h-3.5 w-3.5 mr-1" /> Çözüldü
                                  </Button>
                                )}
                                {v.status !== 'dismissed' && v.status !== 'resolved' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-500" onClick={() => handleStatusChange(v.id, 'dismissed')}>
                                    <XIcon className="h-3.5 w-3.5 mr-1" /> Reddet
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Unauthorized Sellers ===== */}
        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-600" />
                Yetkisiz Satıcı Tespitleri
                <Badge variant="secondary" className="ml-1">{filteredSellers.length} satıcı</Badge>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Satıcı adı ara..." value={sSearch} onChange={(e) => setSSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={sMarketplace} onValueChange={setSMarketplace}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Pazaryeri" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Pazaryerleri</SelectItem>
                    {MARKETPLACES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sStatus} onValueChange={setSStatus}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Durum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="investigating">İnceleniyor</SelectItem>
                    <SelectItem value="reported">Raporlandı</SelectItem>
                    <SelectItem value="removed">Kaldırıldı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Satıcı</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pazaryeri</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Etkilenen Ürün</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Seviyesi</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">İlk Tespit</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kanıt</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSellers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-slate-400">Satıcı bulunamadı</TableCell>
                      </TableRow>
                    ) : (
                      filteredSellers.map((s) => {
                        const risk = SEVERITY_CFG[s.riskLevel];
                        const stat = STATUS_CFG[s.status];
                        return (
                          <TableRow key={s.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell>
                              <span className="text-sm font-medium text-slate-800">{s.sellerName}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{s.marketplace}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="text-xs font-semibold">{s.productsAffected} ürün</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs font-semibold border', risk.badge)}>
                                <span className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full', risk.dot)} />
                                {risk.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', stat.badge)}>{stat.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-slate-500">{relTime(s.firstSeen)}</span>
                            </TableCell>
                            <TableCell>
                              <a href={s.evidenceUrl} className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Görüntüle
                              </a>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {s.status === 'active' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleSellerStatusChange(s.id, 'investigating')}>
                                    <Eye className="h-3.5 w-3.5 mr-1" /> İncele
                                  </Button>
                                )}
                                {s.status === 'investigating' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handleSellerStatusChange(s.id, 'reported')}>
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Raporla
                                  </Button>
                                )}
                                {s.status === 'reported' && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-emerald-600" onClick={() => handleSellerStatusChange(s.id, 'removed')}>
                                    <CheckIcon className="h-3.5 w-3.5 mr-1" /> Kaldırıldı
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: Statistics ===== */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Monthly Violations */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-600" />
                  Aylık İhlal Trendi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="İhlaller" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="Çözülen" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart: By Marketplace */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-600" />
                  Pazaryerine Göre İhlaller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketplacePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {marketplacePieData.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart: By Severity */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Şiddete Göre Dağılım
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={true}
                      >
                        {severityPieData.map((entry, idx) => (
                          <Cell key={idx} fill={
                            entry.name === 'Kritik' ? '#ef4444' :
                            entry.name === 'Yüksek' ? '#f97316' :
                            entry.name === 'Orta' ? '#f59e0b' : '#3b82f6'
                          } />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-600" />
                  Durum Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(['detected', 'investigating', 'reported', 'resolved', 'dismissed'] as const).map((status) => {
                    const count = violations.filter((v) => v.status === status).length;
                    const pct = violations.length > 0 ? (count / violations.length) * 100 : 0;
                    const cfg = STATUS_CFG[status];
                    const barColor = status === 'detected' ? 'bg-red-400' : status === 'investigating' ? 'bg-amber-400' : status === 'reported' ? 'bg-blue-400' : status === 'resolved' ? 'bg-emerald-400' : 'bg-slate-300';
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{cfg.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{pct.toFixed(1)}%</span>
                            <Badge variant="outline" className="text-xs font-semibold min-w-[2rem] justify-center">{count}</Badge>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Inline icon components ---------- */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
