'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Package,
  Handshake,
  Plus,
  Search,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Eye,
  CircleDollarSign,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/textarea';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/useAppStore';

// ───────────────────── Types ─────────────────────

type Tier = 'Standard' | 'Silver' | 'Gold' | 'Platinum';
type PaymentTerm = 'COD' | 'Net15' | 'Net30' | 'Net60';
type CustomerStatus = 'Aktif' | 'Pasif' | 'Onay Bekliyor';
type OrderStatus =
  | 'Beklemede'
  | 'Onaylandı'
  | 'Hazırlanıyor'
  | 'Kargolandı'
  | 'Teslim Edildi';

interface B2BCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  taxOffice: string;
  address: string;
  city: string;
  country: string;
  tier: Tier;
  discountRate: number;
  creditLimit: number;
  usedCredit: number;
  minOrderAmount: number;
  paymentTerm: PaymentTerm;
  orderCount: number;
  totalRevenue: number;
  status: CustomerStatus;
  createdAt: string;
}

interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface B2BOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  netTotal: number;
  paymentTerm: PaymentTerm;
  dueDate: string;
  status: OrderStatus;
  createdAt: string;
  notes: string;
}

interface CustomerFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  taxOffice: string;
  address: string;
  city: string;
  country: string;
  tier: Tier;
  discountRate: number;
  creditLimit: number;
  minOrderAmount: number;
  paymentTerm: PaymentTerm;
}

interface OrderFormData {
  customerId: string;
  items: { productName: string; sku: string; quantity: number; unitPrice: number }[];
  paymentTerm: PaymentTerm;
  dueDate: string;
  notes: string;
}

// ───────────────────── Mock Data ─────────────────────

const initialCustomers: B2BCustomer[] = [
  {
    id: 'C001',
    companyName: 'Anadolu Tekstil San. Tic. A.Ş.',
    contactName: 'Mehmet Yılmaz',
    email: 'mehmet@anadolutekstil.com.tr',
    phone: '+90 212 555 0101',
    taxId: '1234567890',
    taxOffice: 'Bakırköy V.D.',
    address: 'E-5 Yanyol Cad. No:42, Ataköy',
    city: 'İstanbul',
    country: 'Türkiye',
    tier: 'Platinum',
    discountRate: 25,
    creditLimit: 500000,
    usedCredit: 387500,
    minOrderAmount: 5000,
    paymentTerm: 'Net60',
    orderCount: 156,
    totalRevenue: 4250000,
    status: 'Aktif',
    createdAt: '2021-03-15',
  },
  {
    id: 'C002',
    companyName: 'Ege Gıda Ürünleri Ltd. Şti.',
    contactName: 'Ayşe Kaya',
    email: 'ayse@egegida.com.tr',
    phone: '+90 232 555 0202',
    taxId: '2345678901',
    taxOffice: 'Konak V.D.',
    address: 'Alsancak Mah. 1453 Sok. No:12',
    city: 'İzmir',
    country: 'Türkiye',
    tier: 'Gold',
    discountRate: 20,
    creditLimit: 300000,
    usedCredit: 195000,
    minOrderAmount: 3000,
    paymentTerm: 'Net30',
    orderCount: 89,
    totalRevenue: 2180000,
    status: 'Aktif',
    createdAt: '2022-01-10',
  },
  {
    id: 'C003',
    companyName: 'Karadeniz Elektronik A.Ş.',
    contactName: 'Ali Demir',
    email: 'ali@karadenizelektronik.com.tr',
    phone: '+90 462 555 0303',
    taxId: '3456789012',
    taxOffice: 'Trabzon Merkez V.D.',
    address: 'Maraş Caddesi No:88',
    city: 'Trabzon',
    country: 'Türkiye',
    tier: 'Gold',
    discountRate: 18,
    creditLimit: 250000,
    usedCredit: 237500,
    minOrderAmount: 2000,
    paymentTerm: 'Net30',
    orderCount: 67,
    totalRevenue: 1650000,
    status: 'Aktif',
    createdAt: '2022-06-22',
  },
  {
    id: 'C004',
    companyName: 'Kapadokya Mermer Madencilik',
    contactName: 'Hasan Çelik',
    email: 'hasan@kapadokyamermer.com',
    phone: '+90 384 555 0404',
    taxId: '4567890123',
    taxOffice: 'Nevşehir V.D.',
    address: 'Endüstri Bölgesi 3. Cad. No:5',
    city: 'Nevşehir',
    country: 'Türkiye',
    tier: 'Silver',
    discountRate: 12,
    creditLimit: 150000,
    usedCredit: 45000,
    minOrderAmount: 1000,
    paymentTerm: 'Net15',
    orderCount: 34,
    totalRevenue: 720000,
    status: 'Aktif',
    createdAt: '2023-02-14',
  },
  {
    id: 'C005',
    companyName: 'Marmara İnşaat Malzemeleri',
    contactName: 'Osman Aydın',
    email: 'osman@marmarainsaat.com.tr',
    phone: '+90 216 555 0505',
    taxId: '5678901234',
    taxOffice: 'Kadıköy V.D.',
    address: 'Göztepe Mah. Bağdat Cad. No:220',
    city: 'İstanbul',
    country: 'Türkiye',
    tier: 'Silver',
    discountRate: 10,
    creditLimit: 200000,
    usedCredit: 120000,
    minOrderAmount: 1500,
    paymentTerm: 'Net30',
    orderCount: 52,
    totalRevenue: 1340000,
    status: 'Aktif',
    createdAt: '2022-09-05',
  },
  {
    id: 'C006',
    companyName: 'Akdeniz Turizm Acentesi',
    contactName: 'Fatma Şahin',
    email: 'fatma@akdenizturizm.com',
    phone: '+90 242 555 0606',
    taxId: '6789012345',
    taxOffice: 'Muratpaşa V.D.',
    address: 'Konyaaltı Cad. No:75',
    city: 'Antalya',
    country: 'Türkiye',
    tier: 'Standard',
    discountRate: 5,
    creditLimit: 50000,
    usedCredit: 22000,
    minOrderAmount: 500,
    paymentTerm: 'COD',
    orderCount: 18,
    totalRevenue: 340000,
    status: 'Aktif',
    createdAt: '2023-07-20',
  },
  {
    id: 'C007',
    companyName: 'Güneydoğu Petrol Ürünleri Ltd.',
    contactName: 'İbrahim Öztürk',
    email: 'ibrahim@gdpetrol.com.tr',
    phone: '+90 412 555 0707',
    taxId: '7890123456',
    taxOffice: 'Diyarbakır V.D.',
    address: 'Organize Sanayi Bölgesi A Blok',
    city: 'Diyarbakır',
    country: 'Türkiye',
    tier: 'Standard',
    discountRate: 5,
    creditLimit: 75000,
    usedCredit: 0,
    minOrderAmount: 750,
    paymentTerm: 'COD',
    orderCount: 8,
    totalRevenue: 185000,
    status: 'Onay Bekliyor',
    createdAt: '2024-01-12',
  },
  {
    id: 'C008',
    companyName: 'İç Anadolu Tarım Ürünleri A.Ş.',
    contactName: 'Ahmet Koç',
    email: 'ahmet@icadanadolutarim.com.tr',
    phone: '+90 332 555 0808',
    taxId: '8901234567',
    taxOffice: 'Selçuklu V.D.',
    address: 'Konya OSB 5. Sanayi Sitesi',
    city: 'Konya',
    country: 'Türkiye',
    tier: 'Gold',
    discountRate: 15,
    creditLimit: 350000,
    usedCredit: 280000,
    minOrderAmount: 2500,
    paymentTerm: 'Net60',
    orderCount: 95,
    totalRevenue: 3120000,
    status: 'Aktif',
    createdAt: '2021-11-03',
  },
  {
    id: 'C009',
    companyName: 'Trakya Mobilya Dekorasyon',
    contactName: 'Zeynep Arslan',
    email: 'zeynep@trakyamobilya.com',
    phone: '+90 284 555 0909',
    taxId: '9012345678',
    taxOffice: 'Edirne V.D.',
    address: 'Sarayiçi Mah. Cumhuriyet Cad. No:33',
    city: 'Edirne',
    country: 'Türkiye',
    tier: 'Standard',
    discountRate: 5,
    creditLimit: 60000,
    usedCredit: 60000,
    minOrderAmount: 800,
    paymentTerm: 'Net15',
    orderCount: 22,
    totalRevenue: 510000,
    status: 'Pasif',
    createdAt: '2022-04-18',
  },
  {
    id: 'C010',
    companyName: 'Ege Çelik Konstrüksiyon A.Ş.',
    contactName: 'Mustafa Yıldız',
    email: 'mustafa@egecelik.com.tr',
    phone: '+90 232 555 1010',
    taxId: '0123456789',
    taxOffice: 'Bornova V.D.',
    address: 'Bornova OSB Matbaacılar Sit. B Blok',
    city: 'İzmir',
    country: 'Türkiye',
    tier: 'Platinum',
    discountRate: 22,
    creditLimit: 450000,
    usedCredit: 180000,
    minOrderAmount: 4000,
    paymentTerm: 'Net60',
    orderCount: 112,
    totalRevenue: 3890000,
    status: 'Aktif',
    createdAt: '2021-08-25',
  },
];

const initialOrders: B2BOrder[] = [
  {
    id: 'O001',
    orderNo: 'TP-2024-0001',
    customerId: 'C001',
    customerName: 'Anadolu Tekstil San. Tic. A.Ş.',
    items: [
      { id: 'I001', productName: 'Pamuklu Kumaş (100m Rulo)', sku: 'PKM-100', quantity: 50, unitPrice: 1200, total: 60000 },
      { id: 'I002', productName: 'Polyester İplik (5kg Bobin)', sku: 'PLT-5K', quantity: 200, unitPrice: 350, total: 70000 },
    ],
    subtotal: 130000,
    discount: 32500,
    taxRate: 18,
    taxAmount: 17550,
    netTotal: 115050,
    paymentTerm: 'Net60',
    dueDate: '2024-04-15',
    status: 'Teslim Edildi',
    createdAt: '2024-02-15',
    notes: 'Acil sipariş -Express kargo ile gönderildi',
  },
  {
    id: 'O002',
    orderNo: 'TP-2024-0002',
    customerId: 'C002',
    customerName: 'Ege Gıda Ürünleri Ltd. Şti.',
    items: [
      { id: 'I003', productName: 'Zeytinyağı (5lt Tin)', sku: 'ZZY-5L', quantity: 500, unitPrice: 280, total: 140000 },
      { id: 'I004', productName: 'Domates Salçası (12kg Kutu)', sku: 'DMS-12K', quantity: 300, unitPrice: 180, total: 54000 },
    ],
    subtotal: 194000,
    discount: 38800,
    taxRate: 18,
    taxAmount: 27936,
    netTotal: 183136,
    paymentTerm: 'Net30',
    dueDate: '2024-04-10',
    status: 'Onaylandı',
    createdAt: '2024-03-10',
    notes: '',
  },
  {
    id: 'O003',
    orderNo: 'TP-2024-0003',
    customerId: 'C003',
    customerName: 'Karadeniz Elektronik A.Ş.',
    items: [
      { id: 'I005', productName: 'LED Panel (60x60cm)', sku: 'LED-6060', quantity: 150, unitPrice: 850, total: 127500 },
      { id: 'I006', productName: 'Güç Kaynağı (350W)', sku: 'GCK-350', quantity: 150, unitPrice: 420, total: 63000 },
      { id: 'I007', productName: 'Kablo Demeti (100m)', sku: 'KBL-100', quantity: 50, unitPrice: 650, total: 32500 },
    ],
    subtotal: 223000,
    discount: 40140,
    taxRate: 18,
    taxAmount: 32914.8,
    netTotal: 215774.8,
    paymentTerm: 'Net30',
    dueDate: '2024-05-05',
    status: 'Hazırlanıyor',
    createdAt: '2024-04-05',
    notes: 'Proje bazlı sipariş - Ödeme planı sözleşmeye eklenmiştir.',
  },
  {
    id: 'O004',
    orderNo: 'TP-2024-0004',
    customerId: 'C008',
    customerName: 'İç Anadolu Tarım Ürünleri A.Ş.',
    items: [
      { id: 'I008', productName: 'Gübre (25kg Çuval)', sku: 'GBR-25', quantity: 1000, unitPrice: 320, total: 320000 },
      { id: 'I009', productName: 'Tohum Seti (Paket)', sku: 'TSM-PKT', quantity: 500, unitPrice: 150, total: 75000 },
    ],
    subtotal: 395000,
    discount: 59250,
    taxRate: 18,
    taxAmount: 60435,
    netTotal: 396185,
    paymentTerm: 'Net60',
    dueDate: '2024-06-20',
    status: 'Beklemede',
    createdAt: '2024-04-20',
    notes: 'Mevsimlik sipariş - Haziran başında teslim beklenmektedir.',
  },
  {
    id: 'O005',
    orderNo: 'TP-2024-0005',
    customerId: 'C010',
    customerName: 'Ege Çelik Konstrüksiyon A.Ş.',
    items: [
      { id: 'I010', productName: 'Kutu Profil (6m)', sku: 'KPR-6M', quantity: 300, unitPrice: 450, total: 135000 },
      { id: 'I011', productName: 'Düz Sac (2mm-1250x2500mm)', sku: 'DSC-2MM', quantity: 200, unitPrice: 780, total: 156000 },
    ],
    subtotal: 291000,
    discount: 64020,
    taxRate: 18,
    taxAmount: 40856.4,
    netTotal: 267836.4,
    paymentTerm: 'Net60',
    dueDate: '2024-06-30',
    status: 'Onaylandı',
    createdAt: '2024-04-28',
    notes: '',
  },
  {
    id: 'O006',
    orderNo: 'TP-2024-0006',
    customerId: 'C005',
    customerName: 'Marmara İnşaat Malzemeleri',
    items: [
      { id: 'I012', productName: 'Çimento Torbası (50kg)', sku: 'CMT-50', quantity: 2000, unitPrice: 95, total: 190000 },
    ],
    subtotal: 190000,
    discount: 19000,
    taxRate: 18,
    taxAmount: 30660,
    netTotal: 201660,
    paymentTerm: 'Net30',
    dueDate: '2024-05-15',
    status: 'Kargolandı',
    createdAt: '2024-04-15',
    notes: 'İnşaat sahasına doğrudan teslimat.',
  },
  {
    id: 'O007',
    orderNo: 'TP-2024-0007',
    customerId: 'C004',
    customerName: 'Kapadokya Mermer Madencilik',
    items: [
      { id: 'I013', productName: 'Kesici Disk (350mm)', sku: 'KSC-350', quantity: 80, unitPrice: 550, total: 44000 },
      { id: 'I014', productName: 'Polisaj Pad (Set)', sku: 'PLJ-SET', quantity: 120, unitPrice: 280, total: 33600 },
    ],
    subtotal: 77600,
    discount: 9312,
    taxRate: 18,
    taxAmount: 12291.84,
    netTotal: 80579.84,
    paymentTerm: 'Net15',
    dueDate: '2024-05-01',
    status: 'Teslim Edildi',
    createdAt: '2024-04-16',
    notes: '',
  },
  {
    id: 'O008',
    orderNo: 'TP-2024-0008',
    customerId: 'C006',
    customerName: 'Akdeniz Turizm Acentesi',
    items: [
      { id: 'I015', productName: 'Otel Havlu Seti (6lı)', sku: 'HVL-SET6', quantity: 300, unitPrice: 220, total: 66000 },
      { id: 'I016', productName: 'Nevresim Takımı (Çift Kişilik)', sku: 'NVR-CK', quantity: 150, unitPrice: 480, total: 72000 },
    ],
    subtotal: 138000,
    discount: 6900,
    taxRate: 18,
    taxAmount: 23598,
    netTotal: 154698,
    paymentTerm: 'COD',
    dueDate: '2024-04-30',
    status: 'Beklemede',
    createdAt: '2024-04-22',
    notes: 'Yeni otel açılışı için sipariş - Ödeme nakit teslimatta.',
  },
  {
    id: 'O009',
    orderNo: 'TP-2024-0009',
    customerId: 'C001',
    customerName: 'Anadolu Tekstil San. Tic. A.Ş.',
    items: [
      { id: 'I017', productName: 'Denim Kumaş (150m Rulo)', sku: 'DNM-150', quantity: 30, unitPrice: 2800, total: 84000 },
      { id: 'I018', productName: 'Boyalı Fermuar (Metal 30cm)', sku: 'FRM-M30', quantity: 5000, unitPrice: 18, total: 90000 },
    ],
    subtotal: 174000,
    discount: 43500,
    taxRate: 18,
    taxAmount: 23490,
    netTotal: 153990,
    paymentTerm: 'Net60',
    dueDate: '2024-07-10',
    status: 'Beklemede',
    createdAt: '2024-05-10',
    notes: 'Yeni koleksiyon için ham madde siparişi.',
  },
  {
    id: 'O010',
    orderNo: 'TP-2024-0010',
    customerId: 'C009',
    customerName: 'Trakya Mobilya Dekorasyon',
    items: [
      { id: 'I019', productName: 'MDF Levha (18mm-2800x2070mm)', sku: 'MDF-18', quantity: 100, unitPrice: 420, total: 42000 },
    ],
    subtotal: 42000,
    discount: 2100,
    taxRate: 18,
    taxAmount: 7182,
    netTotal: 47082,
    paymentTerm: 'Net15',
    dueDate: '2024-04-25',
    status: 'Teslim Edildi',
    createdAt: '2024-04-10',
    notes: 'Son sipariş - Müşteri pasife alınmıştır.',
  },
];

// ───────────────────── Helpers ─────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getTierBadge(tier: Tier) {
  const map: Record<Tier, { className: string; label: string }> = {
    Standard: { className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: 'Standard' },
    Silver: { className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300', label: 'Silver' },
    Gold: { className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300', label: 'Gold' },
    Platinum: { className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300', label: 'Platinum' },
  };
  const { className, label } = map[tier];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function getPaymentTermLabel(term: PaymentTerm): string {
  const map: Record<PaymentTerm, string> = {
    COD: 'Kapıda Ödeme',
    Net15: 'Net 15 Gün',
    Net30: 'Net 30 Gün',
    Net60: 'Net 60 Gün',
  };
  return map[term];
}

function getStatusBadge(status: OrderStatus) {
  const map: Record<OrderStatus, { className: string; icon: React.ReactNode }> = {
    'Beklemede': { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', icon: <Clock className="size-3" /> },
    'Onaylandı': { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: <CheckCircle2 className="size-3" /> },
    'Hazırlanıyor': { className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: <Package className="size-3" /> },
    'Kargolandı': { className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: <Truck className="size-3" /> },
    'Teslim Edildi': { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: <CheckCircle2 className="size-3" /> },
  };
  const { className, icon } = map[status];
  return (
    <Badge variant="outline" className={`${className} gap-1`}>
      {icon}
      {status}
    </Badge>
  );
}

function getCustomerStatusBadge(status: CustomerStatus) {
  const map: Record<CustomerStatus, { className: string }> = {
    'Aktif': { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    'Pasif': { className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    'Onay Bekliyor': { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  };
  const { className } = map[status];
  return <Badge variant="outline" className={className}>{status}</Badge>;
}

function getCreditProgressColor(ratio: number): string {
  if (ratio > 90) return '[&>[data-slot=progress-indicator]]:bg-red-500';
  if (ratio >= 70) return '[&>[data-slot=progress-indicator]]:bg-yellow-500';
  return '[&>[data-slot=progress-indicator]]:bg-emerald-500';
}

function getEmptyCustomerForm(): CustomerFormData {
  return {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    taxId: '',
    taxOffice: '',
    address: '',
    city: '',
    country: 'Türkiye',
    tier: 'Standard',
    discountRate: 0,
    creditLimit: 0,
    minOrderAmount: 0,
    paymentTerm: 'COD',
  };
}

function getEmptyOrderForm(): OrderFormData {
  return {
    customerId: '',
    items: [{ productName: '', sku: '', quantity: 1, unitPrice: 0 }],
    paymentTerm: 'COD',
    dueDate: '',
    notes: '',
  };
}

// ───────────────────── Component ─────────────────────

export default function B2BManagement() {
  const { sidebarOpen } = useAppStore();
  const [customers, setCustomers] = useState<B2BCustomer[]>(initialCustomers);
  const [orders, setOrders] = useState<B2BOrder[]>(initialOrders);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Customer dialog
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<B2BCustomer | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerFormData>(getEmptyCustomerForm());

  // Order dialog
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormData>(getEmptyOrderForm());

  // Order detail dialog
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<B2BOrder | null>(null);

  // ───── Customer Stats ─────
  const customerStats = useMemo(() => {
    const activeCustomers = customers.filter((c) => c.status === 'Aktif').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { total: customers.length, active: activeCustomers, totalRevenue, avgOrder };
  }, [customers]);

  // ───── Order Stats ─────
  const orderStats = useMemo(() => {
    const totalAmount = orders.reduce((sum, o) => sum + o.netTotal, 0);
    const pending = orders.filter((o) => o.status === 'Beklemede').length;
    const delivered = orders.filter((o) => o.status === 'Teslim Edildi').length;
    return { total: orders.length, totalAmount, pending, delivered };
  }, [orders]);

  // ───── Filtered Data ─────
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.taxId.includes(q)
    );
  }, [customers, customerSearch]);

  const filteredOrders = useMemo(() => {
    if (!orderSearch) return orders;
    const q = orderSearch.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [orders, orderSearch]);

  // ───── Customer Handlers ─────
  const openCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm(getEmptyCustomerForm());
    setCustomerDialogOpen(true);
  };

  const openEditCustomer = (customer: B2BCustomer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      taxId: customer.taxId,
      taxOffice: customer.taxOffice,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      tier: customer.tier,
      discountRate: customer.discountRate,
      creditLimit: customer.creditLimit,
      minOrderAmount: customer.minOrderAmount,
      paymentTerm: customer.paymentTerm,
    });
    setCustomerDialogOpen(true);
  };

  const saveCustomer = () => {
    if (!customerForm.companyName || !customerForm.contactName) return;

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? { ...c, ...customerForm }
            : c
        )
      );
    } else {
      const newCustomer: B2BCustomer = {
        id: `C${String(customers.length + 1).padStart(3, '0')}`,
        ...customerForm,
        usedCredit: 0,
        orderCount: 0,
        totalRevenue: 0,
        status: 'Onay Bekliyor',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }
    setCustomerDialogOpen(false);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCustomerStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextStatus: Record<CustomerStatus, CustomerStatus> = {
          'Aktif': 'Pasif',
          'Pasif': 'Aktif',
          'Onay Bekliyor': 'Aktif',
        };
        return { ...c, status: nextStatus[c.status] };
      })
    );
  };

  // ───── Order Handlers ─────
  const openCreateOrder = () => {
    setOrderForm(getEmptyOrderForm());
    setOrderDialogOpen(true);
  };

  const updateOrderItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setOrderForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addOrderItem = () => {
    setOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { productName: '', sku: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeOrderItem = (index: number) => {
    if (orderForm.items.length <= 1) return;
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const saveOrder = () => {
    if (!orderForm.customerId || !orderForm.dueDate) return;
    const customer = customers.find((c) => c.id === orderForm.customerId);
    if (!customer) return;

    const items: OrderItem[] = orderForm.items
      .filter((i) => i.productName)
      .map((i, idx) => ({
        id: `I${String(Date.now())}${idx}`,
        productName: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.quantity * i.unitPrice,
      }));

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discount = subtotal * (customer.discountRate / 100);
    const taxRate = 18;
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const netTotal = subtotal - discount + taxAmount;

    const newOrder: B2BOrder = {
      id: `O${String(orders.length + 1).padStart(3, '0')}`,
      orderNo: `TP-2024-${String(orders.length + 1).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.companyName,
      items,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      netTotal,
      paymentTerm: orderForm.paymentTerm,
      dueDate: orderForm.dueDate,
      status: 'Beklemede',
      createdAt: new Date().toISOString().split('T')[0],
      notes: orderForm.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderDialogOpen(false);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const openOrderDetail = (order: B2BOrder) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const getOrderSubtotalPreview = () => {
    return orderForm.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  };

  const selectedCustomerForOrder = customers.find(
    (c) => c.id === orderForm.customerId
  );
  const orderDiscountPreview =
    getOrderSubtotalPreview() * ((selectedCustomerForOrder?.discountRate ?? 0) / 100);
  const orderTaxPreview =
    (getOrderSubtotalPreview() - orderDiscountPreview) * 0.18;
  const orderNetPreview =
    getOrderSubtotalPreview() - orderDiscountPreview + orderTaxPreview;

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-background transition-all`}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* ───── Page Header ───── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
              <Handshake className="size-7 text-emerald-600" />
              B2B Toptan Yönetimi
            </h1>
            <p className="text-sm text-muted-foreground">
              Toptan müşterilerinizi ve siparişlerinizi tek ekrandan yönetin
            </p>
          </div>
          <Badge variant="outline" className="w-fit gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Building2 className="size-3.5" />
            PazarLogic B2B
          </Badge>
        </div>

        <Separator />

        {/* ───── Tabs ───── */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-2">
            <TabsTrigger value="customers" className="gap-1.5">
              <Users className="size-4" />
              <span className="hidden sm:inline">Toptan Müşteriler</span>
              <span className="sm:hidden">Müşteriler</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <FileText className="size-4" />
              <span className="hidden sm:inline">Toptan Siparişler</span>
              <span className="sm:hidden">Siparişler</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════ TAB 1: CUSTOMERS ═══════════════ */}
          <TabsContent value="customers" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Building2 className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
                    <p className="text-2xl font-bold">{customerStats.total}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
                    <Users className="size-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aktif Müşteriler</p>
                    <p className="text-2xl font-bold">{customerStats.active}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <TrendingUp className="size-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Ciro</p>
                    <p className="text-lg font-bold">{formatCurrency(customerStats.totalRevenue)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                    <CircleDollarSign className="size-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ort. Sipariş Tutarı</p>
                    <p className="text-lg font-bold">{formatCurrency(customerStats.avgOrder)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Table */}
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Toptan Müşteriler</CardTitle>
                    <CardDescription>Tüm B2B müşteri kayıtlarını görüntüleyin ve yönetin</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Müşteri ara..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-48 pl-9 sm:w-64"
                      />
                    </div>
                    <Button onClick={openCreateCustomer} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="size-4" />
                      Yeni Müşteri
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Firma Adı</TableHead>
                        <TableHead className="hidden md:table-cell">İletişim</TableHead>
                        <TableHead>Fiyat Tier</TableHead>
                        <TableHead className="hidden lg:table-cell">Kredi Limiti</TableHead>
                        <TableHead className="hidden sm:table-cell">Kullanılan Kredi</TableHead>
                        <TableHead className="hidden lg:table-cell">Ödeme Koşulu</TableHead>
                        <TableHead className="hidden md:table-cell">Sipariş</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => {
                        const creditRatio = customer.creditLimit > 0
                          ? (customer.usedCredit / customer.creditLimit) * 100
                          : 0;
                        return (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{customer.companyName}</p>
                                <p className="text-xs text-muted-foreground">{customer.city}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="size-3" />
                                  {customer.phone}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="size-3" />
                                  {customer.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getTierBadge(customer.tier)}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">
                              {formatCurrency(customer.creditLimit)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="w-28 space-y-1">
                                <Progress
                                  value={creditRatio}
                                  className={`h-2 ${getCreditProgressColor(creditRatio)}`}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(customer.usedCredit)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">
                              {getPaymentTermLabel(customer.paymentTerm)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm font-medium">
                              {customer.orderCount}
                            </TableCell>
                            <TableCell>{getCustomerStatusBadge(customer.status)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditCustomer(customer)}>
                                    <Edit3 className="mr-2 size-4" />
                                    Düzenle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleCustomerStatus(customer.id)}>
                                    <Switch className="mr-2" checked={customer.status === 'Aktif'} />
                                    {customer.status === 'Aktif' ? 'Pasife Al' : 'Aktife Al'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteCustomer(customer.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Sil
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB 2: ORDERS ═══════════════ */}
          <TabsContent value="orders" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <FileText className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Sipariş</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <CircleDollarSign className="size-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                    <p className="text-lg font-bold">{formatCurrency(orderStats.totalAmount)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                    <Clock className="size-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bekleyen Sipariş</p>
                    <p className="text-2xl font-bold">{orderStats.pending}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
                    <Truck className="size-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teslim Edildi</p>
                    <p className="text-2xl font-bold">{orderStats.delivered}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Table */}
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Toptan Siparişler</CardTitle>
                    <CardDescription>Tüm toptan siparişlerinizi takip edin ve yönetin</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Sipariş ara..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-48 pl-9 sm:w-64"
                      />
                    </div>
                    <Button onClick={openCreateOrder} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="size-4" />
                      Yeni Sipariş
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sipariş No</TableHead>
                        <TableHead>Müşteri / Firma</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead className="hidden sm:table-cell">İndirim</TableHead>
                        <TableHead className="hidden md:table-cell">KDV</TableHead>
                        <TableHead>Net Tutar</TableHead>
                        <TableHead className="hidden lg:table-cell">Ödeme</TableHead>
                        <TableHead className="hidden lg:table-cell">Vade</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm font-medium">
                            {order.orderNo}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCurrency(order.subtotal)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-red-500">
                            -{formatCurrency(order.discount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            %{order.taxRate} ({formatCurrency(order.taxAmount)})
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {formatCurrency(order.netTotal)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {getPaymentTermLabel(order.paymentTerm)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {order.dueDate}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openOrderDetail(order)}>
                                  <Eye className="mr-2 size-4" />
                                  Detay
                                </DropdownMenuItem>
                                {order.status === 'Beklemede' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Onaylandı')}>
                                    <CheckCircle2 className="mr-2 size-4" />
                                    Onayla
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'Onaylandı' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Hazırlanıyor')}>
                                    <Package className="mr-2 size-4" />
                                    Hazırlanıyor
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'Hazırlanıyor' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Kargolandı')}>
                                    <Truck className="mr-2 size-4" />
                                    Kargola
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'Kargolandı' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Teslim Edildi')}>
                                    <CheckCircle2 className="mr-2 size-4" />
                                    Teslim Edildi
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ═══════════════ CUSTOMER DIALOG ═══════════════ */}
        <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Toptan Müşteri'}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? 'Müşteri bilgilerini güncelleyin.'
                  : 'Yeni bir toptan müşteri kaydı oluşturun.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {/* Company Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Firma Adı *</Label>
                  <Input
                    id="companyName"
                    placeholder="Firma ünvanı"
                    value={customerForm.companyName}
                    onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Yetkili Kişi *</Label>
                  <Input
                    id="contactName"
                    placeholder="Ad Soyad"
                    value={customerForm.contactName}
                    onChange={(e) => setCustomerForm({ ...customerForm, contactName: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@firma.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    placeholder="+90 212 555 0000"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Tax Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Vergi No</Label>
                  <Input
                    id="taxId"
                    placeholder="Vergi numarası"
                    value={customerForm.taxId}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                  <Input
                    id="taxOffice"
                    placeholder="Vergi dairesi"
                    value={customerForm.taxOffice}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxOffice: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  placeholder="Açık adres"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    placeholder="Şehir"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Ülke</Label>
                  <Input
                    id="country"
                    placeholder="Ülke"
                    value={customerForm.country}
                    onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fiyat Tier</Label>
                  <Select
                    value={customerForm.tier}
                    onValueChange={(v) => setCustomerForm({ ...customerForm, tier: v as Tier })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Business Terms */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="discountRate">İndirim Oranı (%)</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    min={0}
                    max={50}
                    value={customerForm.discountRate}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, discountRate: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Kredi Limiti (₺)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    min={0}
                    value={customerForm.creditLimit}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Min. Sipariş (₺)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    min={0}
                    value={customerForm.minOrderAmount}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, minOrderAmount: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ödeme Koşulları</Label>
                  <Select
                    value={customerForm.paymentTerm}
                    onValueChange={(v) =>
                      setCustomerForm({ ...customerForm, paymentTerm: v as PaymentTerm })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">Kapıda Ödeme</SelectItem>
                      <SelectItem value="Net15">Net 15 Gün</SelectItem>
                      <SelectItem value="Net30">Net 30 Gün</SelectItem>
                      <SelectItem value="Net60">Net 60 Gün</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={saveCustomer}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!customerForm.companyName || !customerForm.contactName}
              >
                {editingCustomer ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ CREATE ORDER DIALOG ═══════════════ */}
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Yeni Toptan Sipariş</DialogTitle>
              <DialogDescription>
                Müşteri seçin, ürün ekleyin ve sipariş detaylarını belirleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {/* Customer & Payment */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Müşteri *</Label>
                  <Select
                    value={orderForm.customerId}
                    onValueChange={(v) => setOrderForm({ ...orderForm, customerId: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers
                        .filter((c) => c.status === 'Aktif')
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.companyName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ödeme Koşulları</Label>
                  <Select
                    value={orderForm.paymentTerm}
                    onValueChange={(v) =>
                      setOrderForm({ ...orderForm, paymentTerm: v as PaymentTerm })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">Kapıda Ödeme</SelectItem>
                      <SelectItem value="Net15">Net 15 Gün</SelectItem>
                      <SelectItem value="Net30">Net 30 Gün</SelectItem>
                      <SelectItem value="Net60">Net 60 Gün</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Vade Tarihi *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={orderForm.dueDate}
                  onChange={(e) => setOrderForm({ ...orderForm, dueDate: e.target.value })}
                />
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Sipariş Kalemleri</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOrderItem}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    Kalem Ekle
                  </Button>
                </div>

                <div className="space-y-3">
                  {orderForm.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-6"
                    >
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">Ürün Adı</Label>
                        <Input
                          placeholder="Ürün adı"
                          value={item.productName}
                          onChange={(e) => updateOrderItem(index, 'productName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">SKU</Label>
                        <Input
                          placeholder="SKU"
                          value={item.sku}
                          onChange={(e) => updateOrderItem(index, 'sku', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Miktar</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Birim Fiyat (₺)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(index, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-end">
                        {orderForm.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => removeOrderItem(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNotes">Notlar</Label>
                <Textarea
                  id="orderNotes"
                  placeholder="Siparişle ilgili notlar..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                />
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 font-semibold text-sm">Sipariş Özeti</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span className="font-medium">{formatCurrency(getOrderSubtotalPreview())}</span>
                  </div>
                  {selectedCustomerForOrder && (
                    <div className="flex justify-between text-red-500">
                      <span>İndirim (%{selectedCustomerForOrder.discountRate})</span>
                      <span>-{formatCurrency(orderDiscountPreview)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KDV (%18)</span>
                    <span>{formatCurrency(orderTaxPreview)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Net Tutar</span>
                    <span className="text-emerald-600">{formatCurrency(orderNetPreview)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={saveOrder}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!orderForm.customerId || !orderForm.dueDate}
              >
                Sipariş Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ ORDER DETAIL DIALOG ═══════════════ */}
        <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-emerald-600" />
                    {selectedOrder.orderNo}
                  </DialogTitle>
                  <DialogDescription>
                    Sipariş detayları ve ürün kalemleri
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  {/* Order Info */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Müşteri</p>
                      <p className="font-medium text-sm">{selectedOrder.customerName}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Durum</p>
                      <div className="mt-0.5">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Ödeme Koşulu</p>
                      <p className="font-medium text-sm">{getPaymentTermLabel(selectedOrder.paymentTerm)}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Vade Tarihi</p>
                      <p className="font-medium text-sm">{selectedOrder.dueDate}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="rounded-lg border">
                    <div className="border-b px-4 py-2">
                      <p className="font-semibold text-sm">Ürün Kalemleri</p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ürün</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Miktar</TableHead>
                          <TableHead className="text-right">Birim Fiyat</TableHead>
                          <TableHead className="text-right">Toplam</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-sm">{item.productName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.sku}</TableCell>
                            <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-medium text-sm">
                              {formatCurrency(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ara Toplam</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>İndirim</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">KDV (%{selectedOrder.taxRate})</span>
                        <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold">
                        <span>Net Tutar</span>
                        <span className="text-emerald-600">
                          {formatCurrency(selectedOrder.netTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" />
                        <div>
                          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Not</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">{selectedOrder.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOrderDetailOpen(false)}>
                    Kapat
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
