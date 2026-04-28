'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  GitBranch,
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  Filter,
  Settings2,
  Truck,
  Printer,
  Tag,
  Mail,
  Scissors,
  Clock,
  Star,
  BarChart3,
  Search,
  Package,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Pencil,
  Shield,
  Layers,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

// ─── Types ───────────────────────────────────────────────────────────────────

type TriggerType = 'order_created' | 'payment_received' | 'shipped';

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface RuleAction {
  id: string;
  type: string;
  params: string;
}

interface SmartOrderRule {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  channels: string[];
  priority: number;
  active: boolean;
  matchCount: number;
  lastMatched: string;
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<TriggerType, string> = {
  order_created: 'Sipariş Oluşturulduğunda',
  payment_received: 'Ödeme Alındığında',
  shipped: 'Kargolandığında',
};

const TRIGGER_COLORS: Record<TriggerType, string> = {
  order_created: 'bg-blue-100 text-blue-800',
  payment_received: 'bg-emerald-100 text-emerald-800',
  shipped: 'bg-amber-100 text-amber-800',
};

const TRIGGER_ICONS: Record<TriggerType, React.ReactNode> = {
  order_created: <Package className="w-3.5 h-3.5" />,
  payment_received: <CheckCircle2 className="w-3.5 h-3.5" />,
  shipped: <Truck className="w-3.5 h-3.5" />,
};

const CONDITION_FIELDS = [
  { value: 'order_amount', label: 'Sipariş Tutarı' },
  { value: 'weight', label: 'Ağırlık' },
  { value: 'marketplace', label: 'Pazar Yeri' },
  { value: 'customer_segment', label: 'Müşteri Segmenti' },
  { value: 'shipping_city', label: 'Kargo Adresi Şehri' },
  { value: 'product_category', label: 'Ürün Kategorisi' },
  { value: 'payment_method', label: 'Ödeme Yöntemi' },
  { value: 'item_count', label: 'Ürün Adedi' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Eşittir' },
  { value: 'not_equals', label: 'Eşit Değildir' },
  { value: 'greater_than', label: 'Büyüktür' },
  { value: 'less_than', label: 'Küçüktür' },
  { value: 'contains', label: 'İçerir' },
  { value: 'between', label: 'Arasında' },
];

const ACTION_TYPES = [
  { value: 'assign_carrier', label: 'Kargoyu Ata', icon: Truck },
  { value: 'print_label', label: 'Etiket Yazdır', icon: Printer },
  { value: 'change_status', label: 'Durumu Değiştir', icon: RotateCcw },
  { value: 'send_email', label: 'E-posta Gönder', icon: Mail },
  { value: 'split_order', label: 'Siparişi Böl', icon: Scissors },
  { value: 'hold_order', label: 'Beklemeye Al', icon: Clock },
  { value: 'assign_priority', label: 'Öncelik Ata', icon: Star },
  { value: 'add_tag', label: 'Etiket Ekle', icon: Tag },
];

const CHANNELS = [
  { value: 'all', label: 'Tümü' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'etsy', label: 'Etsy' },
];

const ACTION_ICONS: Record<string, React.ReactNode> = {
  assign_carrier: <Truck className="w-4 h-4 text-sky-600" />,
  print_label: <Printer className="w-4 h-4 text-violet-600" />,
  change_status: <RotateCcw className="w-4 h-4 text-amber-600" />,
  send_email: <Mail className="w-4 h-4 text-rose-600" />,
  split_order: <Scissors className="w-4 h-4 text-orange-600" />,
  hold_order: <Clock className="w-4 h-4 text-slate-600" />,
  assign_priority: <Star className="w-4 h-4 text-yellow-500" />,
  add_tag: <Tag className="w-4 h-4 text-emerald-600" />,
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  assign_carrier: 'Kargoyu Ata',
  print_label: 'Etiket Yazdır',
  change_status: 'Durumu Değiştir',
  send_email: 'E-posta Gönder',
  split_order: 'Siparişi Böl',
  hold_order: 'Beklemeye Al',
  assign_priority: 'Öncelik Ata',
  add_tag: 'Etiket Ekle',
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialRules: SmartOrderRule[] = [
  {
    id: 'rule-001',
    name: 'Yüksek Değerli Sipariş - Aras Kargo',
    description: '5000₺ üzeri siparişlerde Aras Kargoyu otomatik atar ve sigorta etiketi ekler',
    trigger: 'order_created',
    conditions: [
      { id: 'c1', field: 'order_amount', operator: 'greater_than', value: '5000' },
    ],
    actions: [
      { id: 'a1', type: 'assign_carrier', params: 'Aras Kargo' },
      { id: 'a2', type: 'add_tag', params: 'Sigortalı Kargo' },
    ],
    channels: ['all'],
    priority: 1,
    active: true,
    matchCount: 1847,
    lastMatched: '2025-01-15T14:32:00',
    createdAt: '2024-06-12',
  },
  {
    id: 'rule-002',
    name: 'İstanbul Hızlı Kargo',
    description: 'İstanbul adresli siparişleri aynı gün teslimat kargosuna yönlendirir',
    trigger: 'payment_received',
    conditions: [
      { id: 'c2', field: 'shipping_city', operator: 'equals', value: 'İstanbul' },
      { id: 'c2b', field: 'order_amount', operator: 'less_than', value: '15000' },
    ],
    actions: [
      { id: 'a2a', type: 'assign_carrier', params: 'Yurtiçi Same Day' },
      { id: 'a2b', type: 'assign_priority', params: 'Yüksek' },
    ],
    channels: ['all'],
    priority: 2,
    active: true,
    matchCount: 5234,
    lastMatched: '2025-01-15T16:05:00',
    createdAt: '2024-05-20',
  },
  {
    id: 'rule-003',
    name: 'Otomatik Etiket + Fatura Yazdırma',
    description: '2000₺ üzeri siparişlerde kargo etiketi ve faturayı otomatik yazdırır',
    trigger: 'payment_received',
    conditions: [
      { id: 'c3', field: 'order_amount', operator: 'greater_than', value: '2000' },
    ],
    actions: [
      { id: 'a3a', type: 'print_label', params: 'Kargo Etiketi + Fatura' },
      { id: 'a3b', type: 'change_status', params: 'Kargoya Hazır' },
    ],
    channels: ['trendyol', 'hepsiburada'],
    priority: 3,
    active: true,
    matchCount: 8921,
    lastMatched: '2025-01-15T15:48:00',
    createdAt: '2024-04-08',
  },
  {
    id: 'rule-004',
    name: 'Riskli Sipariş Bekletme',
    description: '5000₺ üzeri ve yeni müşteri siparişlerini manuel onaya alır',
    trigger: 'order_created',
    conditions: [
      { id: 'c4a', field: 'order_amount', operator: 'greater_than', value: '5000' },
      { id: 'c4b', field: 'customer_segment', operator: 'equals', value: 'Yeni Müşteri' },
    ],
    actions: [
      { id: 'a4a', type: 'hold_order', params: 'Manuel Onay Bekliyor' },
      { id: 'a4b', type: 'send_email', params: 'risk-alert@pazarlogic.com' },
      { id: 'a4c', type: 'add_tag', params: 'Riskli Sipariş' },
    ],
    channels: ['all'],
    priority: 1,
    active: true,
    matchCount: 342,
    lastMatched: '2025-01-15T11:20:00',
    createdAt: '2024-07-15',
  },
  {
    id: 'rule-005',
    name: 'Trendyol Elektronik Özel Kural',
    description: 'Trendyol elektronik kategorisi siparişlerinde özel kargo ve ekstra koruma',
    trigger: 'order_created',
    conditions: [
      { id: 'c5a', field: 'marketplace', operator: 'equals', value: 'Trendyol' },
      { id: 'c5b', field: 'product_category', operator: 'equals', value: 'Elektronik' },
    ],
    actions: [
      { id: 'a5a', type: 'assign_carrier', params: 'Trendyol Express' },
      { id: 'a5b', type: 'add_tag', params: 'Kırılgan Ürün' },
    ],
    channels: ['trendyol'],
    priority: 4,
    active: true,
    matchCount: 2187,
    lastMatched: '2025-01-15T13:15:00',
    createdAt: '2024-08-01',
  },
  {
    id: 'rule-006',
    name: 'Hepsiburada Kargo Şablonu',
    description: 'Hepsiburada siparişlerinde otomatik Hepsijet kargo ataması yapar',
    trigger: 'payment_received',
    conditions: [
      { id: 'c6', field: 'marketplace', operator: 'equals', value: 'Hepsiburada' },
    ],
    actions: [
      { id: 'a6a', type: 'assign_carrier', params: 'Hepsijet' },
      { id: 'a6b', type: 'change_status', params: 'Kargoya Verildi' },
    ],
    channels: ['hepsiburada'],
    priority: 5,
    active: false,
    matchCount: 4512,
    lastMatched: '2025-01-10T09:30:00',
    createdAt: '2024-03-25',
  },
  {
    id: 'rule-007',
    name: 'Çoklu Ürün Sipariş Bölme',
    description: '5 adet üzeri siparişleri otomatik olarak ayrı kargolara böler',
    trigger: 'order_created',
    conditions: [
      { id: 'c7', field: 'item_count', operator: 'greater_than', value: '5' },
      { id: 'c7b', field: 'weight', operator: 'greater_than', value: '30' },
    ],
    actions: [
      { id: 'a7a', type: 'split_order', params: 'Ağırlık bazlı: max 20kg/coli' },
      { id: 'a7b', type: 'add_tag', params: 'Çoklu Koli' },
    ],
    channels: ['all'],
    priority: 3,
    active: true,
    matchCount: 689,
    lastMatched: '2025-01-15T10:45:00',
    createdAt: '2024-09-10',
  },
  {
    id: 'rule-008',
    name: 'Kapıda Ödeme Siparişleri',
    description: 'Kapıda ödeme siparişlerinde müşteriye bilgilendirme e-postası gönderir',
    trigger: 'payment_received',
    conditions: [
      { id: 'c8', field: 'payment_method', operator: 'equals', value: 'Kapıda Ödeme' },
    ],
    actions: [
      { id: 'a8a', type: 'send_email', params: 'Kapıda ödeme onay şablonu' },
      { id: 'a8b', type: 'add_tag', params: 'Kapıda Ödeme' },
    ],
    channels: ['all'],
    priority: 6,
    active: true,
    matchCount: 1563,
    lastMatched: '2025-01-15T14:10:00',
    createdAt: '2024-06-30',
  },
  {
    id: 'rule-009',
    name: 'Etsy Uluslararası Kargo',
    description: 'Etsy uluslararası siparişlerinde DHL Express kargosu atar',
    trigger: 'order_created',
    conditions: [
      { id: 'c9a', field: 'marketplace', operator: 'equals', value: 'Etsy' },
      { id: 'c9b', field: 'shipping_city', operator: 'not_equals', value: 'İstanbul' },
      { id: 'c9c', field: 'shipping_city', operator: 'not_equals', value: 'Ankara' },
      { id: 'c9d', field: 'shipping_city', operator: 'not_equals', value: 'İzmir' },
    ],
    actions: [
      { id: 'a9a', type: 'assign_carrier', params: 'DHL Express International' },
      { id: 'a9b', type: 'add_tag', params: 'Uluslararası Gönderi' },
      { id: 'a9c', type: 'assign_priority', params: 'Normal' },
    ],
    channels: ['etsy'],
    priority: 2,
    active: true,
    matchCount: 234,
    lastMatched: '2025-01-14T22:15:00',
    createdAt: '2024-10-05',
  },
  {
    id: 'rule-010',
    name: 'Ankara/İzmir Standart Yönlendirme',
    description: 'Ankara ve İzmir adresli siparişleri Yurtiçi Kargoya yönlendirir',
    trigger: 'payment_received',
    conditions: [
      { id: 'c10a', field: 'shipping_city', operator: 'equals', value: 'Ankara' },
    ],
    actions: [
      { id: 'a10a', type: 'assign_carrier', params: 'Yurtiçi Kargo' },
      { id: 'a10b', type: 'print_label', params: 'Standart Etiket' },
    ],
    channels: ['all'],
    priority: 7,
    active: false,
    matchCount: 3210,
    lastMatched: '2025-01-08T16:40:00',
    createdAt: '2024-11-12',
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

function getFieldLabel(fieldValue: string): string {
  return CONDITION_FIELDS.find(f => f.value === fieldValue)?.label ?? fieldValue;
}

function getOperatorLabel(opValue: string): string {
  return CONDITION_OPERATORS.find(o => o.value === opValue)?.label ?? opValue;
}

function getChannelLabel(channelValue: string): string {
  return CHANNELS.find(c => c.value === channelValue)?.label ?? channelValue;
}

function formatMatchCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatLastMatched(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} gün önce`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ─── Condition Flow Visualizer ───────────────────────────────────────────────

function ConditionFlow({ conditions }: { conditions: RuleCondition[] }) {
  if (conditions.length === 0) {
    return (
      <span className="text-xs text-slate-400 italic">
        Koşul tanımlanmamış
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
        EĞER
      </span>
      {conditions.map((cond, idx) => (
        <React.Fragment key={cond.id}>
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            {getFieldLabel(cond.field)}
          </span>
          <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
            {getOperatorLabel(cond.operator)}
          </span>
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-800">
            &ldquo;{cond.value}&rdquo;
          </span>
          {idx < conditions.length - 1 && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700">
              VE
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Action Flow Visualizer ──────────────────────────────────────────────────

function ActionFlow({ actions }: { actions: RuleAction[] }) {
  if (actions.length === 0) {
    return (
      <span className="text-xs text-slate-400 italic">
        Aksiyon tanımlanmamış
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
        SONRA
      </span>
      {actions.map((act, idx) => (
        <React.Fragment key={act.id}>
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-800">
            {ACTION_ICONS[act.type]}
            <span>{ACTION_TYPE_LABELS[act.type] ?? act.type}</span>
            {act.params && (
              <span className="text-slate-500">({act.params})</span>
            )}
          </span>
          {idx < actions.length - 1 && (
            <ArrowRight className="w-3 h-3 text-slate-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Rule Card ───────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onEdit,
  onDelete,
}: {
  rule: SmartOrderRule;
  onToggle: (id: string) => void;
  onEdit: (rule: SmartOrderRule) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="group relative overflow-hidden border transition-shadow hover:shadow-md">
      {/* Priority stripe */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
          rule.priority <= 2
            ? 'bg-emerald-500'
            : rule.priority <= 5
              ? 'bg-amber-400'
              : 'bg-slate-400'
        }`}
      />

      <CardHeader className="pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <GitBranch className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base truncate max-w-xs">
                  {rule.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={`gap-1 text-[11px] font-medium ${TRIGGER_COLORS[rule.trigger]}`}
                >
                  {TRIGGER_ICONS[rule.trigger]}
                  {TRIGGER_LABELS[rule.trigger]}
                </Badge>
                {rule.priority <= 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-[11px] text-amber-700">
                          <Shield className="w-3 h-3" />
                          Yüksek Öncelik
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Öncelik: {rule.priority}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <CardDescription className="mt-1 line-clamp-2">
                {rule.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    {rule.active ? (
                      <Play className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Pause className="w-3 h-3 text-slate-400" />
                    )}
                    <Switch
                      checked={rule.active}
                      onCheckedChange={() => onToggle(rule.id)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {rule.active ? 'Kuralı Pasifleştir' : 'Kuralı Aktifleştir'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pl-5">
        {/* Conditions Flow */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Koşullar
          </p>
          <ConditionFlow conditions={rule.conditions} />
        </div>

        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-emerald-500" />
          <Separator className="flex-1" />
        </div>

        {/* Actions Flow */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Aksiyonlar
          </p>
          <ActionFlow actions={rule.actions} />
        </div>
      </CardContent>

      <CardFooter className="justify-between pl-5 pb-5">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>
              <strong className="text-slate-800">{formatMatchCount(rule.matchCount)}</strong> eşleşme
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Son: {formatLastMatched(rule.lastMatched)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{rule.channels.map(getChannelLabel).join(', ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 p-0 text-slate-500 hover:text-slate-800"
                  onClick={() => onEdit(rule)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="sr-only">Düzenle</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Düzenle</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => onDelete(rule.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sr-only">Sil</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sil</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}

// ─── Create / Edit Dialog ────────────────────────────────────────────────────

interface RuleFormState {
  name: string;
  description: string;
  trigger: TriggerType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  channels: string[];
  priority: number;
}

const emptyForm: RuleFormState = {
  name: '',
  description: '',
  trigger: 'order_created',
  conditions: [],
  actions: [],
  channels: ['all'],
  priority: 5,
};

function RuleFormDialog({
  open,
  onOpenChange,
  editingRule,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: SmartOrderRule | null;
  onSave: (rule: SmartOrderRule) => void;
}) {
  const [form, setForm] = useState<RuleFormState>(emptyForm);
  const isEditing = editingRule !== null;

  useEffect(() => {
    if (open) {
      if (editingRule) {
        setForm({
          name: editingRule.name,
          description: editingRule.description,
          trigger: editingRule.trigger,
          conditions: [...editingRule.conditions],
          actions: [...editingRule.actions],
          channels: [...editingRule.channels],
          priority: editingRule.priority,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, editingRule]);

  const updateForm = useCallback(
    <K extends keyof RuleFormState>(key: K, val: RuleFormState[K]) => {
      setForm(prev => ({ ...prev, [key]: val }));
    },
    []
  );

  const addCondition = useCallback(() => {
    setForm(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: `new-c-${Date.now()}`,
          field: 'order_amount',
          operator: 'greater_than',
          value: '',
        },
      ],
    }));
  }, []);

  const removeCondition = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id),
    }));
  }, []);

  const updateCondition = useCallback(
    (id: string, key: keyof RuleCondition, value: string) => {
      setForm(prev => ({
        ...prev,
        conditions: prev.conditions.map(c =>
          c.id === id ? { ...c, [key]: value } : c
        ),
      }));
    },
    []
  );

  const addAction = useCallback(() => {
    setForm(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        { id: `new-a-${Date.now()}`, type: 'assign_carrier', params: '' },
      ],
    }));
  }, []);

  const removeAction = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== id),
    }));
  }, []);

  const updateAction = useCallback(
    (id: string, key: keyof RuleAction, value: string) => {
      setForm(prev => ({
        ...prev,
        actions: prev.actions.map(a =>
          a.id === id ? { ...a, [key]: value } : a
        ),
      }));
    },
    []
  );

  const handleSave = useCallback(() => {
    const saved: SmartOrderRule = {
      id: editingRule?.id ?? `rule-${Date.now()}`,
      name: form.name,
      description: form.description,
      trigger: form.trigger,
      conditions: form.conditions,
      actions: form.actions,
      channels: form.channels,
      priority: form.priority,
      active: editingRule?.active ?? true,
      matchCount: editingRule?.matchCount ?? 0,
      lastMatched: editingRule?.lastMatched ?? new Date().toISOString(),
      createdAt: editingRule?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    onSave(saved);
    onOpenChange(false);
  }, [form, editingRule, onSave, onOpenChange]);

  const isValid =
    form.name.trim().length > 0 &&
    form.conditions.length > 0 &&
    form.actions.length > 0 &&
    form.conditions.every(c => c.value.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-600" />
              {isEditing ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Mevcut kuralı güncelleyin. Değişiklikler kaydedildikten sonra aktif olacaktır.'
                : 'Sipariş otomasyon kuralı oluşturun. Koşullar ve aksiyonlar tanımlayarak siparişlerinizi otomatik yönetin.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Kural Adı</Label>
                <Input
                  id="rule-name"
                  placeholder="örn: Yüksek değerli siparişlerde X kargoyu ata"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-desc">Açıklama</Label>
                <Input
                  id="rule-desc"
                  placeholder="Kuralın ne yaptığını kısaca açıklayın"
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Trigger */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Tetikleyici
              </Label>
              <Select
                value={form.trigger}
                onValueChange={v => updateForm('trigger', v as TriggerType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Conditions Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  Koşullar
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={addCondition}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Koşul Ekle
                </Button>
              </div>

              {form.conditions.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center bg-slate-50/50">
                  <AlertCircle className="mb-2 w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Henüz koşul eklenmedi
                  </p>
                  <p className="text-xs text-slate-400">
                    En az bir koşul tanımlayın
                  </p>
                </div>
              )}

              {form.conditions.map((cond, idx) => (
                <div
                  key={cond.id}
                  className="flex items-center gap-2 rounded-lg border bg-slate-50 p-3"
                >
                  <GripVertical className="w-4 h-4 shrink-0 text-slate-400" />
                  {idx > 0 && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-blue-50 text-[10px] font-bold text-blue-700"
                    >
                      VE
                    </Badge>
                  )}
                  <Select
                    value={cond.field}
                    onValueChange={v => updateCondition(cond.id, 'field', v)}
                  >
                    <SelectTrigger className="w-[160px] shrink-0 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_FIELDS.map(f => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={cond.operator}
                    onValueChange={v => updateCondition(cond.id, 'operator', v)}
                  >
                    <SelectTrigger className="w-[130px] shrink-0 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPERATORS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1 text-xs bg-white"
                    placeholder="Değer girin..."
                    value={cond.value}
                    onChange={e =>
                      updateCondition(cond.id, 'value', e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => removeCondition(cond.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            {/* Actions Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Aksiyonlar
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={addAction}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aksiyon Ekle
                </Button>
              </div>

              {form.actions.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center bg-slate-50/50">
                  <AlertCircle className="mb-2 w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Henüz aksiyon eklenmedi
                  </p>
                  <p className="text-xs text-slate-400">
                    En az bir aksiyon tanımlayın
                  </p>
                </div>
              )}

              {form.actions.map((act, idx) => (
                <div
                  key={act.id}
                  className="flex items-center gap-2 rounded-lg border bg-slate-50 p-3"
                >
                  <GripVertical className="w-4 h-4 shrink-0 text-slate-400" />
                  {idx > 0 && (
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  )}
                  <Select
                    value={act.type}
                    onValueChange={v => updateAction(act.id, 'type', v)}
                  >
                    <SelectTrigger className="w-[180px] shrink-0 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(a => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1 text-xs bg-white"
                    placeholder="Parametre (örn: Aras Kargo)"
                    value={act.params}
                    onChange={e => updateAction(act.id, 'params', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => removeAction(act.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            {/* Channel & Priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kanal</Label>
                <Select
                  value={form.channels[0] ?? 'all'}
                  onValueChange={v => updateForm('channels', [v])}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map(ch => (
                      <SelectItem key={ch.value} value={ch.value}>
                        {ch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Öncelik (1-10)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={form.priority}
                    onChange={e =>
                      updateForm('priority', parseInt(e.target.value) || 5)
                    }
                    className="w-20 text-xs"
                  />
                  <Progress
                    value={(form.priority / 10) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-slate-500">
                    {form.priority <= 3
                      ? 'Yüksek'
                      : form.priority <= 6
                        ? 'Normal'
                        : 'Düşük'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSave}
            disabled={!isValid}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isEditing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SmartOrderRules() {
  const [rules, setRules] = useState<SmartOrderRule[]>(initialRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SmartOrderRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');

  // Stats
  const stats = useMemo(() => {
    const activeRules = rules.filter(r => r.active).length;
    const totalMatches = rules.reduce((sum, r) => sum + r.matchCount, 0);
    const autoActions = rules.filter(r => r.active).length;
    const last7DaysMatches = Math.floor(totalMatches * 0.12); // simulated
    return {
      activeRules,
      totalRules: rules.length,
      totalMatches,
      autoActions,
      last7DaysMatches,
      avgMatchPerRule: totalMatches / Math.max(rules.length, 1),
    };
  }, [rules]);

  // Filtered rules
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && r.active) ||
        (statusFilter === 'paused' && !r.active);
      const matchTrigger =
        triggerFilter === 'all' || r.trigger === triggerFilter;
      return matchSearch && matchStatus && matchTrigger;
    });
  }, [rules, searchQuery, statusFilter, triggerFilter]);

  const handleToggle = useCallback((id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, active: !r.active } : r))
    );
  }, []);

  const handleEdit = useCallback((rule: SmartOrderRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleSave = useCallback((rule: SmartOrderRule) => {
    setRules(prev => {
      const exists = prev.find(r => r.id === rule.id);
      if (exists) {
        return prev.map(r => (r.id === rule.id ? rule : r));
      }
      return [rule, ...prev];
    });
    setEditingRule(null);
  }, []);

  const handleCreateNew = useCallback(() => {
    setEditingRule(null);
    setDialogOpen(true);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 -mx-6 -mt-6 px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-emerald-100">
                  <GitBranch className="w-5 h-5 text-emerald-600" />
                </div>
                Akıllı Sipariş Kuralları
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Siparişlerinizi otomatik kurallar ile yönetin. Koşullar tanımlayın, aksiyonlar atayın ve zaman kazanın.
              </p>
            </div>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateNew}
            >
              <Plus className="w-4 h-4" />
              Yeni Kural Oluştur
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="gap-4">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 text-slate-600">
                  <CircleDot className="w-4 h-4 text-emerald-500" />
                  Aktif Kural
                </CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums text-slate-900">
                  {stats.activeRules}
                  <span className="text-base font-normal text-slate-400 ml-1">
                    /{stats.totalRules}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <Progress value={(stats.activeRules / Math.max(stats.totalRules, 1)) * 100} className="h-1.5" />
              </CardContent>
            </Card>

            <Card className="gap-4">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 text-slate-600">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  Toplam Eşleşme
                </CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums text-slate-900">
                  {formatMatchCount(stats.totalMatches)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-slate-500">
                  Ort. {formatMatchCount(Math.round(stats.avgMatchPerRule))} / kural
                </p>
              </CardContent>
            </Card>

            <Card className="gap-4">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 text-slate-600">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Otomatik İşlem
                </CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums text-slate-900">
                  {stats.autoActions}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-slate-500">
                  Aktif otomasyon kuralı
                </p>
              </CardContent>
            </Card>

            <Card className="gap-4">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 text-slate-600">
                  <RotateCcw className="w-4 h-4 text-violet-500" />
                  Son 7 Gün
                </CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums text-slate-900">
                  {formatMatchCount(stats.last7DaysMatches)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                    +12%
                  </span>
                  <span className="text-xs text-slate-500">
                    geçen haftaya göre
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Rules List */}
          <Tabs defaultValue="all-rules">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-lg border shadow-sm">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all-rules" className="gap-1.5 data-[state=active]:bg-slate-100">
                  <Layers className="w-4 h-4" />
                  Tüm Kurallar
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1.5 data-[state=active]:bg-slate-100">
                  <Play className="w-4 h-4" />
                  Aktif
                </TabsTrigger>
                <TabsTrigger value="paused" className="gap-1.5 data-[state=active]:bg-slate-100">
                  <Pause className="w-4 h-4" />
                  Pasif
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Kural ara..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-[200px] pl-8 text-xs sm:w-[240px] bg-slate-50"
                  />
                </div>
                <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                  <SelectTrigger className="w-[180px] text-xs bg-slate-50">
                    <SelectValue placeholder="Tetikleyici" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tetikleyiciler</SelectItem>
                    {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              {/* All Rules Tab */}
              <TabsContent value="all-rules" className="m-0">
                <RuleListRenderer
                  rules={filteredRules}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>

              {/* Active Tab */}
              <TabsContent value="active" className="m-0">
                <RuleListRenderer
                  rules={filteredRules.filter(r => r.active)}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>

              {/* Paused Tab */}
              <TabsContent value="paused" className="m-0">
                <RuleListRenderer
                  rules={filteredRules.filter(r => !r.active)}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </div>
          </Tabs>

          {/* Rule Form Dialog */}
          <RuleFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editingRule={editingRule}
            onSave={handleSave}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Rule List Renderer ─────────────────────────────────────────────────────

function RuleListRenderer({
  rules,
  onToggle,
  onEdit,
  onDelete,
}: {
  rules: SmartOrderRule[];
  onToggle: (id: string) => void;
  onEdit: (rule: SmartOrderRule) => void;
  onDelete: (id: string) => void;
}) {
  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center bg-slate-50">
        <GitBranch className="mb-3 w-12 h-12 text-slate-300" />
        <h3 className="text-base font-semibold text-slate-600">
          Kural bulunamadı
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Filtrelere uygun kural yok. Farklı filtreler deneyin veya yeni bir kural oluşturun.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {rules.map(rule => (
        <RuleCard
          key={rule.id}
          rule={rule}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}