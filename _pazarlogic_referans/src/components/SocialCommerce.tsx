'use client';

import React, { useState } from 'react';
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Instagram,
  Facebook,
  Share2,
  ShoppingBag,
  Eye,
  MousePointer,
  TrendingUp,
  Plus,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Package,
  CircleDollarSign,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// ─── Types ───────────────────────────────────────────────────────────────────

type Platform = 'Instagram' | 'Facebook' | 'TikTok' | 'Pinterest';
type PlatformType = 'Shop' | 'Katalog' | 'Story' | 'Post' | 'Reels';
type ListingStatus = 'Aktif' | 'Taslak' | 'Duraklatıldı' | 'Süre Doldu';

interface SocialListing {
  id: string;
  product: string;
  title: string;
  platform: Platform;
  platformType: PlatformType;
  price: number;
  salePrice?: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  status: ListingStatus;
  stockSync: boolean;
  category: string;
  tags: string[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockListings: SocialListing[] = [
  {
    id: '1',
    product: 'Deri Ceket',
    title: 'Premium İtalyan Deri Ceket',
    platform: 'Instagram',
    platformType: 'Shop',
    price: 4999,
    salePrice: 3999,
    impressions: 45200,
    clicks: 3200,
    conversions: 128,
    revenue: 511872,
    status: 'Aktif',
    stockSync: true,
    category: 'Giyim',
    tags: ['deri', 'ceket', 'premium', 'kış'],
  },
  {
    id: '2',
    product: 'Kablosuz Kulaklık',
    title: 'ProSound ANC Kulaklık',
    platform: 'Instagram',
    platformType: 'Reels',
    price: 1299,
    impressions: 89300,
    clicks: 6750,
    conversions: 340,
    revenue: 441660,
    status: 'Aktif',
    stockSync: true,
    category: 'Elektronik',
    tags: ['kulaklık', 'kablosuz', 'ANC'],
  },
  {
    id: '3',
    product: 'Organik Cilt Bakımı Seti',
    title: 'Doğal Güzellik: 5 Parça Cilt Bakım Seti',
    platform: 'Instagram',
    platformType: 'Story',
    price: 899,
    impressions: 23400,
    clicks: 1560,
    conversions: 89,
    revenue: 80011,
    status: 'Aktif',
    stockSync: false,
    category: 'Güzellik',
    tags: ['organik', 'cilt bakımı', 'set'],
  },
  {
    id: '4',
    product: 'Akıllı Saat',
    title: 'FitPro X Akıllı Saat - Spor Serisi',
    platform: 'Facebook',
    platformType: 'Katalog',
    price: 2499,
    impressions: 67800,
    clicks: 4520,
    conversions: 203,
    revenue: 507297,
    status: 'Aktif',
    stockSync: true,
    category: 'Elektronik',
    tags: ['akıllı saat', 'spor', 'fitness'],
  },
  {
    id: '5',
    product: 'Dekoratif Yastık Seti',
    title: 'Bohem Tarz 4 Parça Yastık Seti',
    platform: 'Facebook',
    platformType: 'Post',
    price: 599,
    impressions: 34500,
    clicks: 2100,
    conversions: 95,
    revenue: 56905,
    status: 'Aktif',
    stockSync: true,
    category: 'Ev & Yaşam',
    tags: ['dekorasyon', 'yastık', 'bohem'],
  },
  {
    id: '6',
    product: 'Yoga Matı',
    title: 'ProGrip Kalın Yoga Matı - Mor',
    platform: 'Facebook',
    platformType: 'Katalog',
    price: 349,
    impressions: 18900,
    clicks: 980,
    conversions: 42,
    revenue: 14658,
    status: 'Taslak',
    stockSync: false,
    category: 'Spor',
    tags: ['yoga', 'mat', 'spor'],
  },
  {
    id: '7',
    product: 'Kadın Sneaker',
    title: 'UrbanStep Rahat Günlük Sneaker',
    platform: 'TikTok',
    platformType: 'Shop',
    price: 899,
    salePrice: 699,
    impressions: 124500,
    clicks: 12300,
    conversions: 678,
    revenue: 473922,
    status: 'Aktif',
    stockSync: true,
    category: 'Giyim',
    tags: ['sneaker', 'ayakkabı', 'günlük'],
  },
  {
    id: '8',
    product: 'Makyaj Paleti',
    title: 'GlowUp 36 Renk Göz Farı Paleti',
    platform: 'TikTok',
    platformType: 'Reels',
    price: 449,
    impressions: 98700,
    clicks: 8900,
    conversions: 456,
    revenue: 204744,
    status: 'Aktif',
    stockSync: true,
    category: 'Güzellik',
    tags: ['makyaj', 'göz farı', 'palet'],
  },
  {
    id: '9',
    product: 'Bluetooth Hoparlör',
    title: 'BassWave Portatif Bluetooth Hoparlör',
    platform: 'TikTok',
    platformType: 'Shop',
    price: 799,
    impressions: 56200,
    clicks: 4300,
    conversions: 198,
    revenue: 158202,
    status: 'Aktif',
    stockSync: true,
    category: 'Elektronik',
    tags: ['hoparlör', 'bluetooth', 'portatif'],
  },
  {
    id: '10',
    product: 'El Yapımı Seramik Vazo',
    title: 'Anadolu Seramik El Yapımı Vazo',
    platform: 'Pinterest',
    platformType: 'Post',
    price: 1299,
    impressions: 28700,
    clicks: 3200,
    conversions: 67,
    revenue: 87033,
    status: 'Aktif',
    stockSync: false,
    category: 'Ev & Yaşam',
    tags: ['seramik', 'vazo', 'el yapımı', 'dekorasyon'],
  },
  {
    id: '11',
    product: 'Minimalist Masa Lambası',
    title: 'LED Taşınabilir Masa Lambası',
    platform: 'Pinterest',
    platformType: 'Post',
    price: 649,
    impressions: 42100,
    clicks: 3800,
    conversions: 112,
    revenue: 72688,
    status: 'Aktif',
    stockSync: true,
    category: 'Ev & Yaşam',
    tags: ['lamba', 'LED', 'minimalist'],
  },
  {
    id: '12',
    product: 'Koşu Ayakkabısı',
    title: 'SpeedRunner Pro Koşu Ayakkabısı',
    platform: 'Instagram',
    platformType: 'Shop',
    price: 1599,
    impressions: 37800,
    clicks: 2900,
    conversions: 145,
    revenue: 231855,
    status: 'Duraklatıldı',
    stockSync: false,
    category: 'Spor',
    tags: ['koşu', 'ayakkabı', 'spor'],
  },
  {
    id: '13',
    product: 'Güneş Gözlüğü',
    title: 'Polarized Premium Güneş Gözlüğü',
    platform: 'TikTok',
    platformType: 'Shop',
    price: 599,
    salePrice: 449,
    impressions: 71200,
    clicks: 5600,
    conversions: 287,
    revenue: 128863,
    status: 'Aktif',
    stockSync: true,
    category: 'Aksesuar',
    tags: ['güneş gözlüğü', 'polarized', 'premium'],
  },
  {
    id: '14',
    product: 'Aromaterapi Diffuser',
    title: 'ZenAroma Ultrasonik Aromaterapi Diffuser',
    platform: 'Facebook',
    platformType: 'Katalog',
    price: 549,
    impressions: 22600,
    clicks: 1450,
    conversions: 58,
    revenue: 31842,
    status: 'Süre Doldu',
    stockSync: false,
    category: 'Ev & Yaşam',
    tags: ['aromaterapi', 'diffuser', 'yağ'],
  },
  {
    id: '15',
    product: 'Keto Protein Tozu',
    title: 'FitFuel Keto Dostu Protein Tozu - Çilek',
    platform: 'Pinterest',
    platformType: 'Post',
    price: 399,
    impressions: 19400,
    clicks: 1200,
    conversions: 48,
    revenue: 19152,
    status: 'Taslak',
    stockSync: false,
    category: 'Sağlık',
    tags: ['keto', 'protein', 'sağlık', 'çilek'],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}

function getStatusBadge(status: ListingStatus) {
  switch (status) {
    case 'Aktif':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          <CheckCircle2 className="size-3" />
          {status}
        </Badge>
      );
    case 'Taslak':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          <Clock className="size-3" />
          {status}
        </Badge>
      );
    case 'Duraklatıldı':
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
          <XCircle className="size-3" />
          {status}
        </Badge>
      );
    case 'Süre Doldu':
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
          <Clock className="size-3" />
          {status}
        </Badge>
      );
  }
}

function getPlatformTypeBadge(type: PlatformType) {
  const colorMap: Record<PlatformType, string> = {
    Shop: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Katalog: 'bg-violet-100 text-violet-700 border-violet-200',
    Story: 'bg-pink-100 text-pink-700 border-pink-200',
    Post: 'bg-sky-100 text-sky-700 border-sky-200',
    Reels: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <Badge className={`${colorMap[type]} hover:${colorMap[type]}`}>
      {type}
    </Badge>
  );
}

function getPlatformIcon(platform: Platform, className = 'size-5') {
  switch (platform) {
    case 'Instagram':
      return <Instagram className={`${className} text-pink-500`} />;
    case 'Facebook':
      return <Facebook className={`${className} text-blue-600`} />;
    case 'TikTok':
      return (
        <svg className={`${className}`} viewBox="0 0 24 24" fill="none">
          <path
            d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15a6.34 6.34 0 0010.86 4.42V13.2a8.16 8.16 0 005.58 2.17V11.9a4.84 4.84 0 01-3.77-1.78V6.69h3.77z"
            fill="currentColor"
          />
        </svg>
      );
    case 'Pinterest':
      return (
        <svg className={`${className} text-red-600`} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function getPlatformColor(platform: Platform): string {
  switch (platform) {
    case 'Instagram':
      return 'from-pink-500 to-purple-500';
    case 'Facebook':
      return 'from-blue-500 to-blue-700';
    case 'TikTok':
      return 'from-slate-800 to-slate-900';
    case 'Pinterest':
      return 'from-red-500 to-red-700';
  }
}

function getConversionRate(clicks: number, conversions: number): number {
  if (clicks === 0) return 0;
  return (conversions / clicks) * 100;
}

// ─── Platform Stats Component ────────────────────────────────────────────────

function PlatformStats({ listings }: { listings: SocialListing[] }) {
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'Aktif').length;
  const totalClicks = listings.reduce((acc, l) => acc + l.clicks, 0);
  const totalConversions = listings.reduce((acc, l) => acc + l.conversions, 0);
  const totalRevenue = listings.reduce((acc, l) => acc + l.revenue, 0);
  const avgConversionRate =
    totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const stats = [
    {
      label: 'Listeleme Sayısı',
      value: totalListings,
      sub: `${activeListings} aktif`,
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'Toplam Tıklama',
      value: formatNumber(totalClicks),
      sub: 'Son 30 gün',
      icon: MousePointer,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Dönüşüm Oranı',
      value: `%${avgConversionRate.toFixed(1)}`,
      sub: `${formatNumber(totalConversions)} dönüşüm`,
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-100',
    },
    {
      label: 'Toplam Ciro',
      value: formatCurrency(totalRevenue),
      sub: 'Son 30 gün',
      icon: CircleDollarSign,
      color: 'text-violet-600 bg-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`rounded-lg p-2.5 ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold truncate">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Create Listing Dialog Component ─────────────────────────────────────────

function CreateListingDialog({
  platform,
}: {
  platform: Platform;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    platformType: '' as PlatformType | '',
    title: '',
    description: '',
    price: '',
    salePrice: '',
    tags: '',
    category: '',
    stockSync: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setOpen(false);
    setFormData({
      product: '',
      platformType: '',
      title: '',
      description: '',
      price: '',
      salePrice: '',
      tags: '',
      category: '',
      stockSync: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="size-4" />
          Yeni Listeleme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon(platform, 'size-5')}
            Yeni {platform} Listeleme Oluştur
          </DialogTitle>
          <DialogDescription>
            {platform} platformunda yeni bir ürün listelemesi oluşturun. Tüm alanları
            doldurduktan sonra kaydedebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Ürün Seçimi */}
          <div className="grid gap-2">
            <Label htmlFor="product">Ürün Seçimi</Label>
            <Select
              value={formData.product}
              onValueChange={(v) => handleInputChange('product', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ürün seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deri-ceket">Deri Ceket</SelectItem>
                <SelectItem value="kablosuz-kulaklik">Kablosuz Kulaklık</SelectItem>
                <SelectItem value="akilli-saat">Akıllı Saat</SelectItem>
                <SelectItem value="sneaker">Kadın Sneaker</SelectItem>
                <SelectItem value="makayaj-paleti">Makyaj Paleti</SelectItem>
                <SelectItem value="yoga-mati">Yoga Matı</SelectItem>
                <SelectItem value="kosu-ayakkabisi">Koşu Ayakkabısı</SelectItem>
                <SelectItem value="gunluk-gozluk">Güneş Gözlüğü</SelectItem>
                <SelectItem value="vazo">El Yapımı Seramik Vazo</SelectItem>
                <SelectItem value="protein-tozu">Keto Protein Tozu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Tipi */}
          <div className="grid gap-2">
            <Label htmlFor="platformType">Platform Tipi</Label>
            <Select
              value={formData.platformType}
              onValueChange={(v) => handleInputChange('platformType', v as PlatformType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Platform tipi seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shop">Shop</SelectItem>
                <SelectItem value="Katalog">Katalog</SelectItem>
                <SelectItem value="Story">Story</SelectItem>
                <SelectItem value="Reels">Reels</SelectItem>
                <SelectItem value="Post">Post</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Başlık ve Açıklama */}
          <div className="grid gap-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              placeholder="Ürün başlığı girin..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              placeholder="Ürün açıklaması girin..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Fiyatlar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Fiyat (₺)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salePrice">İndirimli Fiyat (₺)</Label>
              <Input
                id="salePrice"
                type="number"
                placeholder="Opsiyonel"
                value={formData.salePrice}
                onChange={(e) => handleInputChange('salePrice', e.target.value)}
              />
            </div>
          </div>

          {/* Etiketler */}
          <div className="grid gap-2">
            <Label htmlFor="tags" className="flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Etiketler
            </Label>
            <Input
              id="tags"
              placeholder="Virgülle ayırın: moda, yaz, indirim..."
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Birden fazla etiket girin, her birini virgülle ayırın
            </p>
          </div>

          {/* Kategori */}
          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => handleInputChange('category', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategori seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Giyim">Giyim</SelectItem>
                <SelectItem value="Elektronik">Elektronik</SelectItem>
                <SelectItem value="Güzellik">Güzellik</SelectItem>
                <SelectItem value="Ev & Yaşam">Ev &amp; Yaşam</SelectItem>
                <SelectItem value="Spor">Spor</SelectItem>
                <SelectItem value="Aksesuar">Aksesuar</SelectItem>
                <SelectItem value="Sağlık">Sağlık</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Görsel Seçimi */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
              <ImageIcon className="size-3.5" />
              Görsel Seçimi
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex-1 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <ImageIcon className="size-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Görsel yüklemek için tıklayın veya sürükleyin
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stok Senkronizasyonu */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stok Senkronizasyonu</Label>
              <p className="text-xs text-muted-foreground">
                Platform stoku otomatik mağaza stoğuyla senkronize et
              </p>
            </div>
            <Switch
              checked={formData.stockSync}
              onCheckedChange={(v) => handleInputChange('stockSync', v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Listeleme Oluştur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Platform Listing Table Component ────────────────────────────────────────

function PlatformListingTable({
  platform,
  listings,
}: {
  platform: Platform;
  listings: SocialListing[];
}) {
  const [listingsState, setListingsState] = useState(listings);

  const toggleStockSync = (id: string) => {
    setListingsState((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stockSync: !l.stockSync } : l))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{platform} Ürün Listesi</h3>
          <Badge variant="secondary">{listingsState.length} ürün</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Yenile
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="size-3.5" />
            Platforma Git
          </Button>
          <CreateListingDialog platform={platform} />
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-4">Ürün</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Platform Tipi</TableHead>
                  <TableHead className="text-right">Fiyat</TableHead>
                  <TableHead className="text-right">Etkileşim</TableHead>
                  <TableHead className="text-right">Tıklama</TableHead>
                  <TableHead className="text-right">Dönüşüm</TableHead>
                  <TableHead className="text-right">Ciro</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-center">Stok Senkron</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listingsState.map((listing) => (
                  <TableRow key={listing.id} className="group">
                    <TableCell className="pl-4 font-medium">
                      {listing.product}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {listing.title}
                    </TableCell>
                    <TableCell>{getPlatformTypeBadge(listing.platformType)}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        {listing.salePrice ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-emerald-600">
                              {formatCurrency(listing.salePrice)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(listing.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold">
                            {formatCurrency(listing.price)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="size-3.5" />
                        {formatNumber(listing.impressions)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <MousePointer className="size-3.5" />
                        {formatNumber(listing.clicks)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(listing.conversions)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(listing.revenue)}
                    </TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={listing.stockSync}
                        onCheckedChange={() => toggleStockSync(listing.id)}
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Overview Tab Component ──────────────────────────────────────────────────

function OverviewTab({ allListings }: { allListings: SocialListing[] }) {
  const platforms: Platform[] = ['Instagram', 'Facebook', 'TikTok', 'Pinterest'];

  // Summary stats
  const totalListings = allListings.length;
  const activeListings = allListings.filter((l) => l.status === 'Aktif').length;
  const totalInteractions = allListings.reduce((acc, l) => acc + l.impressions, 0);
  const totalRevenue = allListings.reduce((acc, l) => acc + l.revenue, 0);

  const summaryCards = [
    {
      label: 'Toplam Listeleme',
      value: totalListings,
      change: '+3',
      up: true,
      icon: Package,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Aktif Listeleme',
      value: activeListings,
      change: `${((activeListings / totalListings) * 100).toFixed(0)}%`,
      up: true,
      icon: Zap,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Toplam Etkileşim',
      value: formatNumber(totalInteractions),
      change: '+12.5%',
      up: true,
      icon: Eye,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Toplam Ciro',
      value: formatCurrency(totalRevenue),
      change: '+8.3%',
      up: true,
      icon: CircleDollarSign,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  // Platform breakdown
  const platformData = platforms.map((platform) => {
    const platformListings = allListings.filter((l) => l.platform === platform);
    const revenue = platformListings.reduce((acc, l) => acc + l.revenue, 0);
    const clicks = platformListings.reduce((acc, l) => acc + l.clicks, 0);
    const conversions = platformListings.reduce((acc, l) => acc + l.conversions, 0);
    const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    return {
      platform,
      listingCount: platformListings.length,
      revenue,
      convRate,
      clicks,
    };
  });

  const maxRevenue = Math.max(...platformData.map((p) => p.revenue));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <card.icon className="size-5" />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    card.up ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {card.up ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {card.change}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Dağılımı</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformData.map((data) => (
            <Card key={data.platform} className="shadow-sm overflow-hidden">
              <div
                className={`h-1.5 bg-gradient-to-r ${getPlatformColor(
                  data.platform
                )}`}
              />
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  {getPlatformIcon(data.platform)}
                  <div>
                    <p className="font-semibold">{data.platform}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.listingCount} listeleme
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ciro</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tıklama</span>
                    <span className="text-sm font-semibold">
                      {formatNumber(data.clicks)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dönüşüm</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      %{data.convRate.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Comparison */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-5 text-emerald-600" />
            Platform Performans Karşılaştırması
          </CardTitle>
          <CardDescription>
            Ciro bazında platform performans karşılaştırması
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-5">
            {platformData.map((data) => (
              <div key={data.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(data.platform, 'size-4')}
                    <span className="text-sm font-medium">{data.platform}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(data.revenue)}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getPlatformColor(
                      data.platform
                    )} transition-all duration-700`}
                    style={{
                      width: `${maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Overview Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-5 text-emerald-600" />
            Tüm Listeleme Özeti
          </CardTitle>
          <CardDescription>
            Tüm platformlardaki aktif ürün listeleriniz
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-80">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-4">Ürün</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead className="text-right">Fiyat</TableHead>
                  <TableHead className="text-right">Etkileşim</TableHead>
                  <TableHead className="text-right">Ciro</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="pl-4 font-medium">
                      {listing.product}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getPlatformIcon(listing.platform, 'size-3.5')}
                        <span className="text-sm">{listing.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPlatformTypeBadge(listing.platformType)}</TableCell>
                    <TableCell className="text-right">
                      {listing.salePrice ? (
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatCurrency(listing.salePrice)}
                        </span>
                      ) : (
                        <span className="text-sm">
                          {formatCurrency(listing.price)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(listing.impressions)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(listing.revenue)}
                    </TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SocialCommerce() {
  const { sidebarOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState('genel');

  const getListingsByPlatform = (platform: Platform) =>
    mockListings.filter((l) => l.platform === platform);

  const platforms: Platform[] = ['Instagram', 'Facebook', 'TikTok', 'Pinterest'];

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50/80 p-6 transition-all`}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Share2 className="size-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Sosyal Ticaret
                </h1>
                <p className="text-sm text-muted-foreground">
                  Platformlar arası ürün listeleme ve performans takibi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <BarChart3 className="size-3.5" />
                Raporlar
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Senkronize Et
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="genel" className="gap-1.5">
              <BarChart3 className="size-4" />
              Genel Bakış
            </TabsTrigger>
            {platforms.map((platform) => (
              <TabsTrigger
                key={platform}
                value={platform.toLowerCase()}
                className="gap-1.5"
              >
                {getPlatformIcon(platform, 'size-4')}
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Genel Bakış */}
          <TabsContent value="genel">
            <OverviewTab allListings={mockListings} />
          </TabsContent>

          {/* Instagram */}
          <TabsContent value="instagram">
            <div className="space-y-6">
              <PlatformStats listings={getListingsByPlatform('Instagram')} />
              <PlatformListingTable
                platform="Instagram"
                listings={getListingsByPlatform('Instagram')}
              />
            </div>
          </TabsContent>

          {/* Facebook */}
          <TabsContent value="facebook">
            <div className="space-y-6">
              <PlatformStats listings={getListingsByPlatform('Facebook')} />
              <PlatformListingTable
                platform="Facebook"
                listings={getListingsByPlatform('Facebook')}
              />
            </div>
          </TabsContent>

          {/* TikTok */}
          <TabsContent value="tiktok">
            <div className="space-y-6">
              <PlatformStats listings={getListingsByPlatform('TikTok')} />
              <PlatformListingTable
                platform="TikTok"
                listings={getListingsByPlatform('TikTok')}
              />
            </div>
          </TabsContent>

          {/* Pinterest */}
          <TabsContent value="pinterest">
            <div className="space-y-6">
              <PlatformStats listings={getListingsByPlatform('Pinterest')} />
              <PlatformListingTable
                platform="Pinterest"
                listings={getListingsByPlatform('Pinterest')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
