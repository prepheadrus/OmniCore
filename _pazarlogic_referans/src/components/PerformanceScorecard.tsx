'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Shield,
  BarChart3,
  Truck,
  RotateCcw,
  Package,
  MessageSquare,
  ThumbsUp,
  ChevronRight,
  Info,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthlyScore {
  month: string;
  score: number;
}

interface Violation {
  id: string;
  type: string;
  description: string;
  date: string;
  severity: 'düşük' | 'orta' | 'yüksek';
  status: 'aktif' | 'çözüldü';
}

interface Warning {
  id: string;
  message: string;
  severity: 'info' | 'uyarı';
}

interface Recommendation {
  id: string;
  message: string;
  impact: 'yüksek' | 'orta' | 'düşük';
}

interface MarketplaceMetrics {
  zamanindaKargo: number;
  iptalOrani: number;
  iadeOrani: number;
  gecerliTakip: number;
  yanitSuresi: number;
  olumluDegerlendirme: number;
}

interface MarketplaceData {
  id: string;
  name: string;
  score: number;
  health: 'sağlıklı' | 'risk_altında' | 'kritik';
  metrics: MarketplaceMetrics;
  trend: MonthlyScore[];
  warnings: Warning[];
  recommendations: Recommendation[];
  violations: Violation[];
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const marketplaceData: MarketplaceData[] = [
  {
    id: 'trendyol',
    name: 'Trendyol',
    score: 87,
    health: 'sağlıklı',
    metrics: {
      zamanindaKargo: 96.2,
      iptalOrani: 1.1,
      iadeOrani: 3.4,
      gecerliTakip: 99.1,
      yanitSuresi: 2.4,
      olumluDegerlendirme: 94.7,
    },
    trend: [
      { month: 'Oca', score: 78 },
      { month: 'Şub', score: 81 },
      { month: 'Mar', score: 79 },
      { month: 'Nis', score: 83 },
      { month: 'May', score: 85 },
      { month: 'Haz', score: 87 },
    ],
    warnings: [
      {
        id: 'tw1',
        message:
          'İade oranı pazar ortalamasının üzerinde. İade nedenlerini analiz etmeniz önerilir.',
        severity: 'uyarı',
      },
    ],
    recommendations: [
      {
        id: 'tr1',
        message:
          'Kargo süreçlerini otomatikleştirerek zamanında kargo oranını %98\'e çıkarabilirsiniz.',
        impact: 'orta',
      },
      {
        id: 'tr2',
        message:
          'Ürün açıklamalarınızı güncelleyerek iade oranını %2\'ye düşürme potansiyeli mevcut.',
        impact: 'yüksek',
      },
    ],
    violations: [
      {
        id: 'tv1',
        type: 'Geç Teslimat',
        description: '3 adet sipariş belirlenen sürede teslim edilmedi.',
        date: '2025-05-12',
        severity: 'düşük',
        status: 'çözüldü',
      },
    ],
    lastUpdated: '2025-06-14 09:32',
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    score: 62,
    health: 'risk_altında',
    metrics: {
      zamanindaKargo: 88.5,
      iptalOrani: 3.8,
      iadeOrani: 6.2,
      gecerliTakip: 91.3,
      yanitSuresi: 8.7,
      olumluDegerlendirme: 82.1,
    },
    trend: [
      { month: 'Oca', score: 71 },
      { month: 'Şub', score: 68 },
      { month: 'Mar', score: 65 },
      { month: 'Nis', score: 63 },
      { month: 'May', score: 60 },
      { month: 'Haz', score: 62 },
    ],
    warnings: [
      {
        id: 'hw1',
        message:
          'İptal oranı %3.8 ile yüksek seviyede. Hepsiburada sınırı %2. Hesabınız risk altında.',
        severity: 'uyarı',
      },
      {
        id: 'hw2',
        message:
          'Müşteri yanıt süresi 8.7 saat. Hedeflenen süre 3 saatin altında olmalıdır.',
        severity: 'uyarı',
      },
      {
        id: 'hw3',
        message:
          'Geçerli takip oranı %91.3 — platform minimumu %95\'tir. Kargo entegrasyonunuzu kontrol edin.',
        severity: 'uyarı',
      },
    ],
    recommendations: [
      {
        id: 'hr1',
        message:
          'Stok senkronizasyonunu otomatikleştirerek iptal oranını hızla düşürebilirsiniz.',
        impact: 'yüksek',
      },
      {
        id: 'hr2',
        message:
          'Müşteri mesajları için otomatik yanıt sistemi kurarak yanıt süresini 2 saatin altına indirebilirsiniz.',
        impact: 'yüksek',
      },
      {
        id: 'hr3',
        message:
          'Kargo firması değişikliği veya ek kargo anlaşması ile zamanında teslimat oranını artırın.',
        impact: 'orta',
      },
    ],
    violations: [
      {
        id: 'hv1',
        type: 'Yüksek İptal Oranı',
        description: 'İptal oranı platform limitini aşıyor.',
        date: '2025-06-01',
        severity: 'yüksek',
        status: 'aktif',
      },
      {
        id: 'hv2',
        type: 'Geç Teslimat',
        description: '12 adet sipariş zamanında teslim edilmedi.',
        date: '2025-05-28',
        severity: 'orta',
        status: 'çözüldü',
      },
      {
        id: 'hv3',
        type: 'Eksik Takip Bilgisi',
        description: '7 siparişte takip numarası eksik veya geç girilmiş.',
        date: '2025-06-10',
        severity: 'orta',
        status: 'aktif',
      },
    ],
    lastUpdated: '2025-06-14 10:15',
  },
  {
    id: 'amazon-tr',
    name: 'Amazon TR',
    score: 91,
    health: 'sağlıklı',
    metrics: {
      zamanindaKargo: 98.4,
      iptalOrani: 0.6,
      iadeOrani: 2.1,
      gecerliTakip: 99.8,
      yanitSuresi: 1.2,
      olumluDegerlendirme: 96.3,
    },
    trend: [
      { month: 'Oca', score: 84 },
      { month: 'Şub', score: 86 },
      { month: 'Mar', score: 88 },
      { month: 'Nis', score: 89 },
      { month: 'May', score: 90 },
      { month: 'Haz', score: 91 },
    ],
    warnings: [],
    recommendations: [
      {
        id: 'ar1',
        message:
          'Performansınız mükemmel. FBA (Fulfillment by Amazon) kullanarak kargo süreçlerini daha da optimize edebilirsiniz.',
        impact: 'düşük',
      },
      {
        id: 'ar2',
        message:
          'Amazon Brand Registry ile marka korumanızı aktifleştirerek satışlarınızı artırabilirsiniz.',
        impact: 'orta',
      },
    ],
    violations: [],
    lastUpdated: '2025-06-14 08:00',
  },
  {
    id: 'etsy',
    name: 'Etsy',
    score: 45,
    health: 'kritik',
    metrics: {
      zamanindaKargo: 72.3,
      iptalOrani: 7.5,
      iadeOrani: 8.9,
      gecerliTakip: 78.4,
      yanitSuresi: 18.5,
      olumluDegerlendirme: 68.2,
    },
    trend: [
      { month: 'Oca', score: 58 },
      { month: 'Şub', score: 55 },
      { month: 'Mar', score: 52 },
      { month: 'Nis', score: 49 },
      { month: 'May', score: 47 },
      { month: 'Haz', score: 45 },
    ],
    warnings: [
      {
        id: 'ew1',
        message:
          'Hesabınız kritik seviyede! Etsy, düşük performans gösteren satıcıların hesaplarını askıya alabilir.',
        severity: 'info',
      },
      {
        id: 'ew2',
        message:
          'İptal oranı %7.5 — Etsy sınırı %4. Acil eylem gerekiyor.',
        severity: 'uyarı',
      },
      {
        id: 'ew3',
        message:
          'İade oranı %8.9 ile çok yüksek. Ürün kalitesi ve açıklamaları gözden geçirilmeli.',
        severity: 'uyarı',
      },
      {
        id: 'ew4',
        message:
          'Müşteri yanıt süresi 18.5 saat. Etsy hedefi 24 saat içinde yanıt vermektir ancak ilk mesajı 1 saat içinde yanıtlamak önerilir.',
        severity: 'uyarı',
      },
    ],
    recommendations: [
      {
        id: 'er1',
        message:
          'Stok yönetimini düzelterek iptal oranını acilen %4\'ün altına düşürün. Aksi takdirde hesap askıya alınabilir.',
        impact: 'yüksek',
      },
      {
        id: 'er2',
        message:
          'Ürün fotoğraflarını ve açıklamalarını iyileştirerek müşteri beklentilerini doğru yönetin.',
        impact: 'yüksek',
      },
      {
        id: 'er3',
        message:
          'Kargo süreçlerini yeniden yapılandırın. Uluslararası kargo için teslimat süresi tahminlerini gerçekçi yapın.',
        impact: 'yüksek',
      },
      {
        id: 'er4',
        message:
          'Müşteri mesajları için mobil bildirimleri aktifleştirin ve şablon yanıtlar hazırlayın.',
        impact: 'orta',
      },
    ],
    violations: [
      {
        id: 'ev1',
        type: 'Yüksek İptal Oranı',
        description:
          'İptal oranı Etsy limitini aşıyor. Hesap askıya alma riski var.',
        date: '2025-06-05',
        severity: 'yüksek',
        status: 'aktif',
      },
      {
        id: 'ev2',
        type: 'Düşük Değerlendirme',
        description:
          'Son 30 günde ortalama değerlendirme puanı 3.2 (hedef: 4.0+).',
        date: '2025-06-08',
        severity: 'yüksek',
        status: 'aktif',
      },
      {
        id: 'ev3',
        type: 'Geç Teslimat',
        description: '22 adet sipariş belirlenen tarihte teslim edilmedi.',
        date: '2025-06-12',
        severity: 'yüksek',
        status: 'aktif',
      },
      {
        id: 'ev4',
        type: 'Takip Bilgisi Eksik',
        description:
          '15 siparişte takip numarası girilmemiş veya geç girilmiş.',
        date: '2025-06-11',
        severity: 'orta',
        status: 'aktif',
      },
    ],
    lastUpdated: '2025-06-14 11:45',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-400';
  return 'text-red-500';
}

function getScoreBgRing(score: number): string {
  if (score >= 80) return 'text-emerald-100';
  if (score >= 50) return 'text-amber-100';
  return 'text-red-100';
}

function getHealthBadge(health: MarketplaceData['health']) {
  const map = {
    sağlıklı: {
      label: 'Sağlıklı',
      variant: 'default' as const,
      className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
      icon: <CheckCircle className="size-3.5" />,
    },
    risk_altında: {
      label: 'Risk Altında',
      variant: 'default' as const,
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      icon: <AlertTriangle className="size-3.5" />,
    },
    kritik: {
      label: 'Kritik',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
      icon: <XCircle className="size-3.5" />,
    },
  };
  return map[health];
}

function getSeverityColor(severity: string) {
  if (severity === 'yüksek')
    return 'bg-red-100 text-red-800 hover:bg-red-100';
  if (severity === 'orta')
    return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
  return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
}

function getImpactColor(impact: string) {
  if (impact === 'yüksek')
    return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  if (impact === 'orta')
    return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
  return 'bg-slate-100 text-slate-600 hover:bg-slate-100';
}

function getProgressColor(
  value: number,
  inverse: boolean = false,
): string {
  const effective = inverse ? 100 - value : value;
  if (effective >= 90) return '[&>div]:bg-emerald-500';
  if (effective >= 70) return '[&>div]:bg-amber-400';
  return '[&>div]:bg-red-500';
}

// ---------------------------------------------------------------------------
// Sub‑components
// ---------------------------------------------------------------------------

function ScoreCircle({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor =
    score >= 80
      ? '#10b981'
      : score >= 50
        ? '#f59e0b'
        : '#ef4444';
  const trackColor =
    score >= 80
      ? '#d1fae5'
      : score >= 50
        ? '#fef3c7'
        : '#fee2e2';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="12"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-bold tabular-nums ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-sm text-slate-500">/100</span>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: MarketplaceData['health'] }) {
  const info = getHealthBadge(health);
  return (
    <Badge variant={info.variant} className={`gap-1 text-sm ${info.className}`}>
      {info.icon}
      {info.label}
    </Badge>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  progressValue,
  inverse,
  tooltipText,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  progressValue?: number;
  inverse?: boolean;
  tooltipText?: string;
}) {
  const content = (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            {icon}
            <span className="text-xs font-medium uppercase tracking-wide">
              {label}
            </span>
          </div>
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums text-slate-800">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-slate-400">{unit}</span>
          )}
        </div>
        {progressValue !== undefined && (
          <div className="mt-2">
            <Progress
              value={progressValue}
              className={`h-2 ${getProgressColor(progressValue, inverse)}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!tooltipText) return content;

  return content;
}

function TrendChart({ data }: { data: MonthlyScore[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-emerald-600" />
          Performans Trendi
        </CardTitle>
        <CardDescription>Son 6 aylık performans puanı değişimi</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value} puan`, 'Performans']}
                labelFormatter={(label) => `${label} 2025`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreComparisonChart({
  data,
}: {
  data: { name: string; score: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-4 text-emerald-600" />
          Pazar Yerleri Karşılaştırma
        </CardTitle>
        <CardDescription>
          Tüm pazar yerlerindeki toplu performans puanları
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value} puan`, 'Puan']}
              />
              <Bar
                dataKey="score"
                radius={[6, 6, 0, 0]}
                fill="#10b981"
                barSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function WarningsSection({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4 text-emerald-600" />
            Uyarılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle className="size-4 shrink-0" />
            <span>Şu anda aktif uyarı bulunmamaktadır. Harika gidiyorsunuz!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-amber-500" />
          Uyarılar
          <Badge variant="outline" className="ml-auto text-xs">
            {warnings.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {warnings.map((w) => (
          <div
            key={w.id}
            className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
              w.severity === 'info'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {w.severity === 'info' ? (
              <AlertOctagon className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{w.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecommendationsSection({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4 text-emerald-600" />
          Öneriler
          <Badge variant="outline" className="ml-auto text-xs">
            {recommendations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recommendations.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            <Lightbulb className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-1 flex-col gap-1.5">
              <span>{r.message}</span>
              <Badge
                className={`w-fit text-[10px] ${getImpactColor(r.impact)}`}
              >
                Etki: {r.impact.charAt(0).toUpperCase() + r.impact.slice(1)}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ViolationsSection({ violations }: { violations: Violation[] }) {
  const activeViolations = violations.filter((v) => v.status === 'aktif');
  const resolvedViolations = violations.filter(
    (v) => v.status === 'çözüldü',
  );

  if (violations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="size-4 text-emerald-600" />
            İhlaller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            <Shield className="size-4 shrink-0" />
            <span>Hiç ihlal bulunmamaktadır. Hesabınız temiz!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertOctagon className="size-4 text-red-500" />
          İhlaller
          <div className="ml-auto flex items-center gap-2">
            {activeViolations.length > 0 && (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                {activeViolations.length} Aktif
              </Badge>
            )}
            {resolvedViolations.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {resolvedViolations.length} Çözüldü
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Toplam {violations.length} ihlal kaydı — {activeViolations.length} aktif
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Tür</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="w-[100px]">Tarih</TableHead>
                <TableHead className="w-[80px]">Şiddet</TableHead>
                <TableHead className="w-[80px]">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-sm">
                    {v.type}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {v.description}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {v.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${getSeverityColor(v.severity)}`}
                    >
                      {v.severity.charAt(0).toUpperCase() +
                        v.severity.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${
                        v.status === 'aktif'
                          ? 'bg-red-100 text-red-800 hover:bg-red-100'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {v.status === 'aktif' ? (
                        <XCircle className="mr-1 size-3" />
                      ) : (
                        <CheckCircle className="mr-1 size-3" />
                      )}
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Marketplace View
// ---------------------------------------------------------------------------

function MarketplaceView({ data }: { data: MarketplaceData }) {
  const [showAllViolations, setShowAllViolations] = useState(false);

  const trendDirection =
    data.trend.length >= 2
      ? data.trend[data.trend.length - 1].score -
        data.trend[data.trend.length - 2].score
      : 0;

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} flex flex-col gap-6 p-6 transition-all`}>
      {/* ── Top Row: Score + Summary ── */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        {/* Score Circle Card */}
        <Card className="flex items-center justify-center px-8 py-6">
          <div className="flex flex-col items-center gap-3">
            <ScoreCircle score={data.score} />
            <HealthBadge health={data.health} />
            <p className="text-xs text-slate-400">
              Son güncelleme: {data.lastUpdated}
            </p>
          </div>
        </Card>

        {/* Quick Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4 text-emerald-600" />
              {data.name} Performans Özeti
            </CardTitle>
            <CardDescription>
              {data.name} pazar yerindeki satıcı performansınızın genel görünümü
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Toplam İhlal</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {data.violations.length}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Aktif Uyarı</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {data.warnings.length}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Aylık Değişim</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold">
                  {trendDirection >= 0 ? (
                    <>
                      <ArrowUpRight className="size-5 text-emerald-500" />
                      <span className="text-emerald-600">
                        +{trendDirection}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="size-5 text-red-500" />
                      <span className="text-red-500">{trendDirection}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BarChart3 className="size-4 text-emerald-600" />
          Temel Metrikler
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={<Truck className="size-4" />}
            label="Zamanında Kargo"
            value={data.metrics.zamanindaKargo}
            unit="%"
            progressValue={data.metrics.zamanindaKargo}
            tooltipText="Siparişlerin zamanında kargoya verilme oranı. Hedef: %95+"
          />
          <MetricCard
            icon={<XCircle className="size-4" />}
            label="İptal Oranı"
            value={data.metrics.iptalOrani}
            unit="%"
            progressValue={data.metrics.iptalOrani}
            inverse
            tooltipText="Müşteri tarafından iptal edilen sipariş oranı. Düşük olması tercih edilir. Hedef: %2 altı"
          />
          <MetricCard
            icon={<RotateCcw className="size-4" />}
            label="İade Oranı"
            value={data.metrics.iadeOrani}
            unit="%"
            progressValue={data.metrics.iadeOrani}
            inverse
            tooltipText="İade edilen ürünlerin toplam siparişlere oranı. Düşük olması tercih edilir. Hedef: %3 altı"
          />
          <MetricCard
            icon={<Package className="size-4" />}
            label="Geçerli Takip"
            value={data.metrics.gecerliTakip}
            unit="%"
            progressValue={data.metrics.gecerliTakip}
            tooltipText="Kargo takip numarasının doğru ve zamanında girilme oranı. Hedef: %98+"
          />
          <MetricCard
            icon={<Clock className="size-4" />}
            label="Yanıt Süresi"
            value={data.metrics.yanitSuresi}
            unit="saat"
            progressValue={Math.max(0, 100 - data.metrics.yanitSuresi * 4)}
            tooltipText="Müşteri mesajlarına ortalama yanıt süresi. Hedef: 3 saatin altında"
          />
          <MetricCard
            icon={<Star className="size-4" />}
            label="Olumlu Değerlendirme"
            value={data.metrics.olumluDegerlendirme}
            unit="%"
            progressValue={data.metrics.olumluDegerlendirme}
            tooltipText="Müşterilerin olumlu değerlendirme oranı. Hedef: %90+"
          />
        </div>
      </div>

      {/* ── Trend Chart ── */}
      <TrendChart data={data.trend} />

      {/* ── Warnings & Recommendations ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WarningsSection warnings={data.warnings} />
        <RecommendationsSection recommendations={data.recommendations} />
      </div>

      {/* ── Violations ── */}
      <ViolationsSection violations={data.violations} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported Page Component
// ---------------------------------------------------------------------------

export default function PerformanceScorecard() {
  const { sidebarOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState('trendyol');

  const currentData = marketplaceData.find((m) => m.id === activeTab)!;

  const comparisonData = marketplaceData.map((m) => ({
    name: m.name,
    score: m.score,
  }));

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
              <Award className="size-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Satıcı Performans Kartı
              </h1>
              <p className="text-sm text-slate-500">
                Pazar yerlerindeki performansınızı takip edin ve iyileştirin
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Marketplace Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="flex-wrap">
              {marketplaceData.map((m) => {
                const healthInfo = getHealthBadge(m.health);
                return (
                  <TabsTrigger
                    key={m.id}
                    value={m.id}
                    className="gap-1.5 px-4"
                  >
                    <span
                      className={`inline-block size-2 rounded-full ${
                        m.health === 'sağlıklı'
                          ? 'bg-emerald-500'
                          : m.health === 'risk_altında'
                            ? 'bg-amber-400'
                            : 'bg-red-500'
                      }`}
                    />
                    {m.name}
                    <span
                      className={`ml-1 text-xs font-semibold ${
                        m.score >= 80
                          ? 'text-emerald-600'
                          : m.score >= 50
                            ? 'text-amber-500'
                            : 'text-red-500'
                      }`}
                    >
                      {m.score}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="size-3.5" />
              <span>
                Son güncelleme: {currentData.lastUpdated}
              </span>
            </div>
          </div>

          {/* ── Tab Content ── */}
          {marketplaceData.map((m) => (
            <TabsContent key={m.id} value={m.id}>
              <MarketplaceView data={m} />
            </TabsContent>
          ))}
        </Tabs>

        <Separator />

        {/* ── Cross‑marketplace Comparison ── */}
        <ScoreComparisonChart data={comparisonData} />

        {/* ── Footer Legend ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-emerald-500" />
            Sağlıklı (80-100)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-amber-400" />
            Risk Altında (50-79)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-red-500" />
            Kritik (0-49)
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
