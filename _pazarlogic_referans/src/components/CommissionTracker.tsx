'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  AlertTriangle,
  CreditCard,
  Truck,
  Receipt,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const fmtPct = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n) + '%';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommissionRate {
  marketplace: string;
  category: string;
  rate: number;
  minCommission: number;
  paymentTerms: string;
  color: string;
}

interface OrderFee {
  id: string;
  orderNo: string;
  product: string;
  marketplace: string;
  salePrice: number;
  commission: number;
  shipping: number;
  serviceFee: number;
  kdv: number;
  netEarning: number;
  color: string;
}

interface MonthlyTrend {
  month: string;
  commission: number;
  shipping: number;
  deductions: number;
  total: number;
}

interface CalcResult {
  salePrice: number;
  marketplace: string;
  commission: number;
  commissionRate: number;
  shipping: number;
  serviceFee: number;
  kdv: number;
  netEarning: number;
}

/* ------------------------------------------------------------------ */
/*  Constants & Mock Data                                              */
/* ------------------------------------------------------------------ */

const MP_COLORS: Record<string, string> = {
  Trendyol: '#10b981',
  Hepsiburada: '#f97316',
  n11: '#8b5cf6',
  'Amazon TR': '#f59e0b',
  Ciceksepeti: '#ec4899',
};

const COMMISSION_RATES: CommissionRate[] = [
  { marketplace: 'Trendyol', category: 'Elektronik', rate: 12.5, minCommission: 15, paymentTerms: 'Haftalık', color: MP_COLORS.Trendyol },
  { marketplace: 'Trendyol', category: 'Moda', rate: 18.0, minCommission: 12, paymentTerms: 'Haftalık', color: MP_COLORS.Trendyol },
  { marketplace: 'Trendyol', category: 'Ev & Yaşam', rate: 15.0, minCommission: 10, paymentTerms: 'Haftalık', color: MP_COLORS.Trendyol },
  { marketplace: 'Hepsiburada', category: 'Elektronik', rate: 10.0, minCommission: 20, paymentTerms: '15 Günlük', color: MP_COLORS.Hepsiburada },
  { marketplace: 'Hepsiburada', category: 'Moda', rate: 16.5, minCommission: 14, paymentTerms: '15 Günlük', color: MP_COLORS.Hepsiburada },
  { marketplace: 'Hepsiburada', category: 'Kozmetik', rate: 20.0, minCommission: 10, paymentTerms: '15 Günlük', color: MP_COLORS.Hepsiburada },
  { marketplace: 'n11', category: 'Elektronik', rate: 14.0, minCommission: 18, paymentTerms: 'Aylık', color: MP_COLORS.n11 },
  { marketplace: 'n11', category: 'Spor', rate: 13.0, minCommission: 12, paymentTerms: 'Aylık', color: MP_COLORS.n11 },
  { marketplace: 'n11', category: 'Ev & Yaşam', rate: 11.5, minCommission: 10, paymentTerms: 'Aylık', color: MP_COLORS.n11 },
  { marketplace: 'Amazon TR', category: 'Elektronik', rate: 8.0, minCommission: 5, paymentTerms: '14 Günlük', color: MP_COLORS['Amazon TR'] },
  { marketplace: 'Amazon TR', category: 'Moda', rate: 15.0, minCommission: 8, paymentTerms: '14 Günlük', color: MP_COLORS['Amazon TR'] },
  { marketplace: 'Amazon TR', category: 'Kozmetik', rate: 12.0, minCommission: 6, paymentTerms: '14 Günlük', color: MP_COLORS['Amazon TR'] },
  { marketplace: 'Ciceksepeti', category: 'Kozmetik', rate: 22.0, minCommission: 15, paymentTerms: 'Haftalık', color: MP_COLORS.Ciceksepeti },
  { marketplace: 'Ciceksepeti', category: 'Ev & Yaşam', rate: 17.0, minCommission: 12, paymentTerms: 'Haftalık', color: MP_COLORS.Ciceksepeti },
  { marketplace: 'Ciceksepeti', category: 'Spor', rate: 19.0, minCommission: 13, paymentTerms: 'Haftalık', color: MP_COLORS.Ciceksepeti },
];

const ORDER_FEES: OrderFee[] = [
  { id: 'o1', orderNo: 'TY-2025-884721', product: 'Kablosuz Kulaklık Pro', marketplace: 'Trendyol', salePrice: 1299, commission: 162.38, shipping: 35.99, serviceFee: 18.50, kdv: 233.82, netEarning: 848.31, color: MP_COLORS.Trendyol },
  { id: 'o2', orderNo: 'HB-2025-663401', product: 'Akıllı Saat X200', marketplace: 'Hepsiburada', salePrice: 2499, commission: 249.90, shipping: 42.00, serviceFee: 25.00, kdv: 449.82, netEarning: 1732.28, color: MP_COLORS.Hepsiburada },
  { id: 'o3', orderNo: 'N11-2025-120984', product: 'Yoga Matı Premium', marketplace: 'n11', salePrice: 449, commission: 58.37, shipping: 29.99, serviceFee: 12.00, kdv: 80.82, netEarning: 267.82, color: MP_COLORS.n11 },
  { id: 'o4', orderNo: 'AZ-2025-005612', product: 'USB-C Hub 7 Port', marketplace: 'Amazon TR', salePrice: 699, commission: 55.92, shipping: 28.50, serviceFee: 10.00, kdv: 125.82, netEarning: 478.76, color: MP_COLORS['Amazon TR'] },
  { id: 'o5', orderNo: 'TY-2025-884835', product: 'Deri Cüzdan Erkek', marketplace: 'Trendyol', salePrice: 349, commission: 62.82, shipping: 32.00, serviceFee: 15.00, kdv: 62.82, netEarning: 176.36, color: MP_COLORS.Trendyol },
  { id: 'o6', orderNo: 'CS-2025-334891', product: 'Parfüm Seti 3\'lü', marketplace: 'Ciceksepeti', salePrice: 899, commission: 197.78, shipping: 38.00, serviceFee: 20.00, kdv: 161.82, netEarning: 481.40, color: MP_COLORS.Ciceksepeti },
  { id: 'o7', orderNo: 'HB-2025-663512', product: 'Bluetooth Hoparlör Mini', marketplace: 'Hepsiburada', salePrice: 599, commission: 59.90, shipping: 33.50, serviceFee: 14.00, kdv: 107.82, netEarning: 383.78, color: MP_COLORS.Hepsiburada },
  { id: 'o8', orderNo: 'TY-2025-884902', product: 'Termos 1.5L Paslanmaz', marketplace: 'Trendyol', salePrice: 189, commission: 28.35, shipping: 29.99, serviceFee: 10.00, kdv: 34.02, netEarning: 86.64, color: MP_COLORS.Trendyol },
  { id: 'o9', orderNo: 'AZ-2025-005734', product: 'Mekanik Klavye RGB', marketplace: 'Amazon TR', salePrice: 1599, commission: 191.88, shipping: 45.00, serviceFee: 22.00, kdv: 287.82, netEarning: 1052.30, color: MP_COLORS['Amazon TR'] },
  { id: 'o10', orderNo: 'N11-2025-121032', product: 'Koşu Ayakkabısı Air', marketplace: 'n11', salePrice: 1199, commission: 155.87, shipping: 39.99, serviceFee: 18.00, kdv: 215.82, netEarning: 769.32, color: MP_COLORS.n11 },
];

const MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'Oca 2024', commission: 14200, shipping: 5100, deductions: 2100, total: 21400 },
  { month: 'Şub 2024', commission: 15800, shipping: 5400, deductions: 2350, total: 23550 },
  { month: 'Mar 2024', commission: 16400, shipping: 5800, deductions: 2500, total: 24700 },
  { month: 'Nis 2024', commission: 18600, shipping: 6200, deductions: 2700, total: 27500 },
  { month: 'May 2024', commission: 17200, shipping: 5900, deductions: 2600, total: 25700 },
  { month: 'Haz 2024', commission: 19800, shipping: 6500, deductions: 2900, total: 29200 },
  { month: 'Tem 2024', commission: 21300, shipping: 7000, deductions: 3100, total: 31400 },
  { month: 'Ağu 2024', commission: 20500, shipping: 6800, deductions: 3000, total: 30300 },
  { month: 'Eyl 2024', commission: 18900, shipping: 6100, deductions: 2750, total: 27750 },
  { month: 'Eki 2024', commission: 22100, shipping: 7200, deductions: 3200, total: 32500 },
  { month: 'Kas 2024', commission: 25400, shipping: 8100, deductions: 3600, total: 37100 },
  { month: 'Ara 2024', commission: 28300, shipping: 9000, deductions: 4000, total: 41300 },
];

const CALCULATOR_MARKETPLACES = [
  { name: 'Trendyol', defaultRate: 15, defaultShipping: 35 },
  { name: 'Hepsiburada', defaultRate: 12, defaultShipping: 42 },
  { name: 'n11', defaultRate: 13, defaultShipping: 30 },
  { name: 'Amazon TR', defaultRate: 10, defaultShipping: 28 },
  { name: 'Ciceksepeti', defaultRate: 19, defaultShipping: 38 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CommissionTracker() {
  const { sidebarOpen } = useAppStore();
  const [calcPrice, setCalcPrice] = useState<string>('');
  const [calcMarketplace, setCalcMarketplace] = useState<string>('Trendyol');
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [rateFilter, setRateFilter] = useState<string>('all');

  const handleCalculate = () => {
    const price = parseFloat(calcPrice);
    if (isNaN(price) || price <= 0) return;

    const mp = CALCULATOR_MARKETPLACES.find((m) => m.name === calcMarketplace);
    if (!mp) return;

    const commission = price * (mp.defaultRate / 100);
    const shipping = mp.defaultShipping;
    const serviceFee = price > 1000 ? 22 : price > 500 ? 16 : 10;
    const kdv = price * 0.18;
    const totalDeductions = commission + shipping + serviceFee + kdv;
    const netEarning = price - totalDeductions;

    setCalcResult({
      salePrice: price,
      marketplace: mp.name,
      commission,
      commissionRate: mp.defaultRate,
      shipping,
      serviceFee,
      kdv,
      netEarning,
    });
  };

  const maxTrend = Math.max(...MONTHLY_TRENDS.map((t) => t.total), 1);

  const filteredRates = rateFilter === 'all'
    ? COMMISSION_RATES
    : COMMISSION_RATES.filter((r) => r.marketplace === rateFilter);

  const totalCommission = ORDER_FEES.reduce((s, o) => s + o.commission, 0);
  const totalShipping = ORDER_FEES.reduce((s, o) => s + o.shipping, 0);
  const totalDeductions = ORDER_FEES.reduce((s, o) => s + o.serviceFee, 0);
  const totalNet = ORDER_FEES.reduce((s, o) => s + o.netEarning, 0);

  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 p-6 transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'ml-16'
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pazaryeri Komisyon & Masraf Takibi
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Tüm pazaryeri kesintilerini izleyin, gerçek karlılığı hesaplayın
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-3 py-1">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canlı Veri
          </Badge>
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            <CreditCard className="h-3 w-3 mr-1" />
            5 Pazaryeri
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Toplam Komisyon
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">₺125.430</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-slate-500">%8.2 artış</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Toplam Kargo Ücreti
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Truck className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">₺45.200</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-slate-500">%5.1 artış</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Toplam Pazaryeri Kesintisi
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">₺18.750</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs text-slate-500">%2.3 azalış</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Net Kar
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600">₺342.180</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-slate-500">%12.7 artış</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rates" className="space-y-6">
        <TabsList className="bg-white shadow-sm border">
          <TabsTrigger value="rates" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Komisyon Oranları
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Receipt className="h-4 w-4" />
            Sipariş Masrafları
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Aylık Trend
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2">
            <Calculator className="h-4 w-4" />
            Hesaplayıcı
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1 — Komisyon Oranları                                    */}
        {/* ============================================================ */}
        <TabsContent value="rates" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Pazaryeri Komisyon Oranları
                </CardTitle>
                <Select value={rateFilter} onValueChange={setRateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pazaryeri Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Pazaryerleri</SelectItem>
                    <SelectItem value="Trendyol">Trendyol</SelectItem>
                    <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="n11">n11</SelectItem>
                    <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                    <SelectItem value="Ciceksepeti">Çiçeksepeti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Pazaryeri
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Komisyon Oranı
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Min. Komisyon
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Ödeme Koşulları
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRates.map((r, i) => (
                      <tr
                        key={`${r.marketplace}-${r.category}`}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: r.color }}
                            >
                              {r.marketplace[0]}
                            </div>
                            <span className="text-slate-800 font-medium">{r.marketplace}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{r.category}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-semibold',
                              r.rate >= 18
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : r.rate >= 14
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            )}
                          >
                            %{r.rate.toFixed(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {fmt(r.minCommission)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs text-slate-600 border-slate-200">
                            {r.paymentTerms}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2 — Sipariş Masrafları                                   */}
        {/* ============================================================ */}
        <TabsContent value="orders" className="space-y-6">
          {/* Sample Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Toplam Satış</p>
                <p className="text-lg font-bold text-slate-900">
                  {fmt(ORDER_FEES.reduce((s, o) => s + o.salePrice, 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Toplam Kesinti</p>
                <p className="text-lg font-bold text-red-600">
                  -{fmt(ORDER_FEES.reduce((s, o) => s + o.commission + o.shipping + o.serviceFee + o.kdv, 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Net Kazanç</p>
                <p className={cn(
                  'text-lg font-bold',
                  totalNet >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {fmt(totalNet)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">Ort. Kar Marjı</p>
                <p className="text-lg font-bold text-emerald-600">
                  {fmtPct(
                    (totalNet / ORDER_FEES.reduce((s, o) => s + o.salePrice, 0)) * 100
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">
                Sipariş Bazlı Masraf Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Sipariş No
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Pazaryeri
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Satış Fiyatı
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Komisyon
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Kargo
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Hizmet Bedeli
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        KDV
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Net Kazanç
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ORDER_FEES.map((order) => (
                      <tr
                        key={order.id}
                        className={cn(
                          'border-b border-slate-100 hover:bg-slate-50/80 transition-colors',
                          order.netEarning < 0 && 'bg-red-50/50 hover:bg-red-50'
                        )}
                      >
                        <td className="py-3 px-3 font-mono text-xs text-slate-600">
                          {order.orderNo}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 max-w-[160px] truncate">
                          {order.product}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded text-white text-[9px] font-bold shrink-0"
                              style={{ backgroundColor: order.color }}
                            >
                              {order.marketplace[0]}
                            </div>
                            <span className="text-xs text-slate-600">{order.marketplace}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800">
                          {fmt(order.salePrice)}
                        </td>
                        <td className="py-3 px-3 text-right text-red-500">
                          -{fmt(order.commission)}
                        </td>
                        <td className="py-3 px-3 text-right text-red-500">
                          -{fmt(order.shipping)}
                        </td>
                        <td className="py-3 px-3 text-right text-red-500">
                          -{fmt(order.serviceFee)}
                        </td>
                        <td className="py-3 px-3 text-right text-red-500">
                          -{fmt(order.kdv)}
                        </td>
                        <td
                          className={cn(
                            'py-3 px-3 text-right font-bold',
                            order.netEarning >= 0 ? 'text-emerald-600' : 'text-red-600'
                          )}
                        >
                          {fmt(order.netEarning)}
                          {order.netEarning < 0 && (
                            <AlertTriangle className="inline-block h-3 w-3 ml-1 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3 — Aylık Trend                                          */}
        {/* ============================================================ */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">
                Aylık Masraf Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MONTHLY_TRENDS.map((t, i) => {
                  const totalPct = (t.total / maxTrend) * 100;
                  const commissionPct = (t.commission / t.total) * 100;
                  const shippingPct = (t.shipping / t.total) * 100;
                  const deductionsPct = (t.deductions / t.total) * 100;

                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 w-20">
                          {t.month}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>
                            Komisyon: <strong className="text-emerald-600">{fmt(t.commission)}</strong>
                          </span>
                          <span>
                            Kargo: <strong className="text-amber-600">{fmt(t.shipping)}</strong>
                          </span>
                          <span>
                            Kesinti: <strong className="text-red-500">{fmt(t.deductions)}</strong>
                          </span>
                          <span className="font-semibold text-slate-700">
                            Toplam: {fmt(t.total)}
                          </span>
                        </div>
                      </div>
                      {/* Stacked bar */}
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-7 rounded-lg overflow-hidden bg-slate-100 flex">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500 rounded-l-lg"
                            style={{ width: `${(totalPct / 100) * commissionPct}%` }}
                            title={`Komisyon: ${fmt(t.commission)}`}
                          />
                          <div
                            className="h-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${(totalPct / 100) * shippingPct}%` }}
                            title={`Kargo: ${fmt(t.shipping)}`}
                          />
                          <div
                            className="h-full bg-red-400 transition-all duration-500 rounded-r-lg"
                            style={{ width: `${(totalPct / 100) * deductionsPct}%` }}
                            title={`Kesinti: ${fmt(t.deductions)}`}
                          />
                        </div>
                      </div>
                      {/* Percentage labels */}
                      <div className="flex gap-4 text-[10px] text-slate-400 pl-20">
                        <span>%{commissionPct.toFixed(0)} komisyon</span>
                        <span>%{shippingPct.toFixed(0)} kargo</span>
                        <span>%{deductionsPct.toFixed(0)} kesinti</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-emerald-500" />
                  <span className="text-xs text-slate-500">Komisyon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-amber-400" />
                  <span className="text-xs text-slate-500">Kargo Ücreti</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-red-400" />
                  <span className="text-xs text-slate-500">Pazaryeri Kesintisi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded bg-emerald-500" />
                  <p className="text-xs font-medium text-slate-500">En Yüksek Komisyon Ayı</p>
                </div>
                <p className="text-lg font-bold text-slate-800">
                  {MONTHLY_TRENDS.reduce((max, t) => (t.commission > max.commission ? t : max)).month}
                </p>
                <p className="text-sm text-emerald-600 font-semibold">
                  {fmt(MONTHLY_TRENDS.reduce((max, t) => (t.commission > max.commission ? t : max)).commission)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded bg-amber-400" />
                  <p className="text-xs font-medium text-slate-500">En Yüksek Kargo Ayı</p>
                </div>
                <p className="text-lg font-bold text-slate-800">
                  {MONTHLY_TRENDS.reduce((max, t) => (t.shipping > max.shipping ? t : max)).month}
                </p>
                <p className="text-sm text-amber-600 font-semibold">
                  {fmt(MONTHLY_TRENDS.reduce((max, t) => (t.shipping > max.shipping ? t : max)).shipping)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded bg-red-400" />
                  <p className="text-xs font-medium text-slate-500">En Yüksek Toplam Masraf</p>
                </div>
                <p className="text-lg font-bold text-slate-800">
                  {MONTHLY_TRENDS.reduce((max, t) => (t.total > max.total ? t : max)).month}
                </p>
                <p className="text-sm text-red-600 font-semibold">
                  {fmt(MONTHLY_TRENDS.reduce((max, t) => (t.total > max.total ? t : max)).total)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 4 — Komisyon Hesaplayıcı                                 */}
        {/* ============================================================ */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Input */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-emerald-600" />
                  Komisyon Hesaplayıcı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="salePrice" className="text-sm font-medium text-slate-700">
                    Satış Fiyatı (₺)
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    placeholder="Örn: 1299"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Pazaryeri</Label>
                  <Select value={calcMarketplace} onValueChange={setCalcMarketplace}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pazaryeri Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALCULATOR_MARKETPLACES.map((mp) => (
                        <SelectItem key={mp.name} value={mp.name}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: MP_COLORS[mp.name] }}
                            />
                            {mp.name}
                            <span className="text-xs text-slate-400">(%{mp.defaultRate})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Hesapla
                </Button>

                {/* Marketplace info cards */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pazaryeri Bilgileri
                  </p>
                  {CALCULATOR_MARKETPLACES.map((mp) => (
                    <div
                      key={mp.name}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg border transition-colors',
                        calcMarketplace === mp.name
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white text-[10px] font-bold"
                          style={{ backgroundColor: MP_COLORS[mp.name] }}
                        >
                          {mp.name[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{mp.name}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">%{mp.defaultRate}</span> komisyon ·{' '}
                        <span className="font-semibold text-slate-700">₺{mp.defaultShipping}</span> kargo
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calculator Result */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Hesaplama Sonucu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calcResult ? (
                  <div className="space-y-4">
                    {/* Sale price header */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div>
                        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                          Satış Fiyatı
                        </p>
                        <p className="text-2xl font-bold text-emerald-700">{fmt(calcResult.salePrice)}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-400" />
                          <span className="text-sm text-slate-600">Komisyon (%{calcResult.commissionRate})</span>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          -{fmt(calcResult.commission)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="text-sm text-slate-600">Kargo Ücreti</span>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          -{fmt(calcResult.shipping)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-400" />
                          <span className="text-sm text-slate-600">Hizmet Bedeli</span>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          -{fmt(calcResult.serviceFee)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          <span className="text-sm text-slate-600">KDV (%18)</span>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          -{fmt(calcResult.kdv)}
                        </span>
                      </div>
                    </div>

                    {/* Visual bar breakdown */}
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Masraf Dağılımı
                      </p>
                      <div className="h-8 rounded-lg overflow-hidden bg-slate-100 flex">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center"
                          style={{
                            width: `${(calcResult.netEarning / calcResult.salePrice) * 100}%`,
                            minWidth: '2px',
                          }}
                        >
                          <span className="text-[10px] text-white font-bold px-1">
                            {((calcResult.netEarning / calcResult.salePrice) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div
                          className="h-full bg-red-400 transition-all duration-500 flex items-center justify-center"
                          style={{
                            width: `${(calcResult.commission / calcResult.salePrice) * 100}%`,
                            minWidth: calcResult.commission > 0 ? '2px' : '0px',
                          }}
                        />
                        <div
                          className="h-full bg-amber-400 transition-all duration-500"
                          style={{
                            width: `${(calcResult.shipping / calcResult.salePrice) * 100}%`,
                          }}
                        />
                        <div
                          className="h-full bg-orange-400 transition-all duration-500"
                          style={{
                            width: `${(calcResult.serviceFee / calcResult.salePrice) * 100}%`,
                          }}
                        />
                        <div
                          className="h-full bg-slate-400 transition-all duration-500 rounded-r-lg"
                          style={{
                            width: `${(calcResult.kdv / calcResult.salePrice) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-3 rounded bg-emerald-500" /> Net Kazanç
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-3 rounded bg-red-400" /> Komisyon
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-3 rounded bg-amber-400" /> Kargo
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-3 rounded bg-orange-400" /> Hizmet Bedeli
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-3 rounded bg-slate-400" /> KDV
                        </span>
                      </div>
                    </div>

                    {/* Net earning result */}
                    <div
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border',
                        calcResult.netEarning >= 0
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-red-50 border-red-200'
                      )}
                    >
                      <div>
                        <p
                          className={cn(
                            'text-xs font-medium uppercase tracking-wider',
                            calcResult.netEarning >= 0 ? 'text-emerald-600' : 'text-red-600'
                          )}
                        >
                          Net Kazanç
                        </p>
                        <p
                          className={cn(
                            'text-2xl font-bold',
                            calcResult.netEarning >= 0 ? 'text-emerald-700' : 'text-red-700'
                          )}
                        >
                          {fmt(calcResult.netEarning)}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          calcResult.netEarning >= 0 ? 'bg-emerald-100' : 'bg-red-100'
                        )}
                      >
                        {calcResult.netEarning >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    {calcResult.netEarning < 0 && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">
                          Bu ürün bu fiyatta zarar ediyor! Fiyatı artırmayı veya maliyetleri düşürmeyi
                          değerlendirin.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                      <Calculator className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Henüz hesaplama yapılmadı</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Satış fiyatı girin ve &quot;Hesapla&quot; butonuna tıklayın
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
