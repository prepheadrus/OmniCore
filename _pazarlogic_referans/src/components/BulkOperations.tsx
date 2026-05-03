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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Package,
  DollarSign,
  Archive,
  Tag,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  marketplace: string;
  status: 'Yayında' | 'Taslak' | 'Pasif';
}

type OperationType =
  | 'price'
  | 'stock'
  | 'status'
  | 'category'
  | 'marketplace'
  | 'tag';

interface OperationRecord {
  id: string;
  type: OperationType;
  label: string;
  affectedCount: number;
  status: 'Başarılı' | 'Başarısız' | 'Devam Ediyor';
  user: string;
  timestamp: Date;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const sampleProducts: Product[] = [
  { id: '1', sku: 'ELK-001', name: 'Kablosuz Bluetooth Kulaklık', price: 349.99, stock: 125, marketplace: 'Hepsiburada', status: 'Yayında' },
  { id: '2', sku: 'ELK-002', name: 'USB-C Şarj Kablosu 2m', price: 79.99, stock: 340, marketplace: 'Trendyol', status: 'Yayında' },
  { id: '3', sku: 'TEL-001', name: 'Akıllı Telefon Kılıfı Silikon', price: 49.99, stock: 0, marketplace: 'Hepsiburada', status: 'Pasif' },
  { id: '4', sku: 'KOM-001', name: 'Mekanik Gaming Klavye RGB', price: 899.99, stock: 45, marketplace: 'Trendyol', status: 'Yayında' },
  { id: '5', sku: 'ELK-003', name: 'Bluetooth Hoparlör Portatif', price: 249.99, stock: 88, marketplace: 'Amazon TR', status: 'Yayında' },
  { id: '6', sku: 'BIL-001', name: '15.6" Laptop Çantası Sırt Çantası', price: 199.99, stock: 210, marketplace: 'Hepsiburada', status: 'Yayında' },
  { id: '7', sku: 'TEL-002', name: 'Temperli Cam Ekran Koruyucu', price: 29.99, stock: 560, marketplace: 'Trendyol', status: 'Yayında' },
  { id: '8', sku: 'ELK-004', name: 'Gaming Fare Ergonomik 7200 DPI', price: 179.99, stock: 72, marketplace: 'Amazon TR', status: 'Taslak' },
  { id: '9', sku: 'KOM-002', name: 'Webcam 1080p Full HD Mikrofonlu', price: 449.99, stock: 33, marketplace: 'Hepsiburada', status: 'Yayında' },
  { id: '10', sku: 'ELK-005', name: 'Powerbank 20000mAh Hızlı Şarj', price: 319.99, stock: 0, marketplace: 'Trendyol', status: 'Pasif' },
  { id: '11', sku: 'AKS-001', name: 'Ayarlanabilir Laptop Standı Alüminyum', price: 149.99, stock: 95, marketplace: 'Hepsiburada', status: 'Yayında' },
  { id: '12', sku: 'ELK-006', name: 'Kulaklık Standı LED Işıklı', price: 129.99, stock: 180, marketplace: 'Amazon TR', status: 'Yayında' },
  { id: '13', sku: 'KOM-003', name: 'Dik Duruş Monitör Kolu', price: 279.99, stock: 22, marketplace: 'Trendyol', status: 'Taslak' },
  { id: '14', sku: 'TEL-003', name: 'Telefon Tutucu Araba İçi', price: 59.99, stock: 415, marketplace: 'Hepsiburada', status: 'Yayında' },
  { id: '15', sku: 'AKS-002', name: 'USB Hub 7 Port Çoklayıcı', price: 189.99, stock: 67, marketplace: 'Trendyol', status: 'Yayında' },
];

const operationButtons: {
  type: OperationType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { type: 'price', label: 'Toplu Fiyat Güncelle', icon: <DollarSign className="h-4 w-4" />, color: 'text-emerald-600' },
  { type: 'stock', label: 'Toplu Stok Güncelle', icon: <Package className="h-4 w-4" />, color: 'text-blue-600' },
  { type: 'status', label: 'Yayınla / Kaldır', icon: <Layers className="h-4 w-4" />, color: 'text-amber-600' },
  { type: 'category', label: 'Kategori Değiştir', icon: <Tag className="h-4 w-4" />, color: 'text-purple-600' },
  { type: 'marketplace', label: 'Pazaryere Yükle', icon: <Upload className="h-4 w-4" />, color: 'text-orange-600' },
  { type: 'tag', label: 'Etiket Ekle', icon: <Archive className="h-4 w-4" />, color: 'text-rose-600' },
];

const initialHistory: OperationRecord[] = [
  { id: 'h1', type: 'price', label: 'Toplu Fiyat Güncelle', affectedCount: 12, status: 'Başarılı', user: 'Ahmet Y.', timestamp: new Date(Date.now() - 3600_000 * 2) },
  { id: 'h2', type: 'stock', label: 'Toplu Stok Güncelle', affectedCount: 5, status: 'Başarılı', user: 'Ahmet Y.', timestamp: new Date(Date.now() - 3600_000 * 5) },
  { id: 'h3', type: 'status', label: 'Yayınla / Kaldır', affectedCount: 8, status: 'Başarılı', user: 'Elif K.', timestamp: new Date(Date.now() - 3600_000 * 8) },
  { id: 'h4', type: 'marketplace', label: 'Pazaryere Yükle', affectedCount: 3, status: 'Başarısız', user: 'Ahmet Y.', timestamp: new Date(Date.now() - 3600_000 * 24) },
  { id: 'h5', type: 'category', label: 'Kategori Değiştir', affectedCount: 20, status: 'Başarılı', user: 'Elif K.', timestamp: new Date(Date.now() - 3600_000 * 48) },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: Product['status']) {
  const map: Record<Product['status'], { className: string }> = {
    'Yayında': { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
    'Taslak': { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' },
    'Pasif': { className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' },
  };
  return <Badge variant="outline" className={map[status].className}>{status}</Badge>;
}

function marketplaceBadge(marketplace: string) {
  const map: Record<string, string> = {
    'Hepsiburada': 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200',
    'Trendyol': 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
    'Amazon TR': 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200',
  };
  return <Badge variant="outline" className={map[marketplace] ?? 'bg-gray-100 text-gray-700'}>{marketplace}</Badge>;
}

function historyStatusBadge(status: OperationRecord['status']) {
  const map: Record<OperationRecord['status'], string> = {
    'Başarılı': 'bg-emerald-100 text-emerald-700',
    'Başarısız': 'bg-red-100 text-red-700',
    'Devam Ediyor': 'bg-amber-100 text-amber-700',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function formatPrice(n: number) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BulkOperations() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeOp, setActiveOp] = useState<OperationType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [history, setHistory] = useState<OperationRecord[]>(initialHistory);

  // ── Dialog form state ──
  const [priceDirection, setPriceDirection] = useState<'increase' | 'decrease'>('increase');
  const [priceValue, setPriceValue] = useState('');
  const [priceType, setPriceType] = useState<'percent' | 'fixed'>('percent');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [stockAction, setStockAction] = useState<'set' | 'add' | 'subtract'>('set');
  const [stockValue, setStockValue] = useState('');

  const [newStatus, setNewStatus] = useState<'Yayında' | 'Pasif'>('Yayında');

  const [category, setCategory] = useState('');

  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Set<string>>(new Set());

  const [tagInput, setTagInput] = useState('');

  const marketplaces = ['Hepsiburada', 'Trendyol', 'Amazon TR', 'Pazarama', 'N11'];
  const categories = [
    'Elektronik',
    'Bilgisayar & Aksesuar',
    'Telefon & Aksesuar',
    'Ev & Yaşam',
    'Spor & Outdoor',
    'Giyim & Aksesuar',
    'Oyuncak & Çocuk',
    'Otomotiv',
    'Kırtasiye',
    'Güzellik & Sağlık',
  ];

  // ── Filtered products ──
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.marketplace.toLowerCase().includes(search.toLowerCase()),
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someFilteredSelected =
    !allFilteredSelected && filtered.some((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // ── Open operation dialog ──
  const openOperation = (type: OperationType) => {
    setActiveOp(type);
    setDialogOpen(true);
  };

  // ── Apply operation ──
  const applyOperation = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const opLabel =
      operationButtons.find((b) => b.type === activeOp)?.label ?? '';

    setProducts((prev) =>
      prev.map((p) => {
        if (!selectedIds.has(p.id)) return p;
        let updated = { ...p };
        switch (activeOp) {
          case 'price': {
            const val = parseFloat(priceValue) || 0;
            if (priceType === 'percent') {
              updated.price =
                priceDirection === 'increase'
                  ? +(p.price * (1 + val / 100)).toFixed(2)
                  : +(p.price * (1 - val / 100)).toFixed(2);
            } else {
              updated.price =
                priceDirection === 'increase'
                  ? +(p.price + val).toFixed(2)
                  : +(p.price - val).toFixed(2);
            }
            if (minPrice) updated.price = Math.max(updated.price, parseFloat(minPrice));
            if (maxPrice) updated.price = Math.min(updated.price, parseFloat(maxPrice));
            updated.price = Math.max(0, +updated.price.toFixed(2));
            break;
          }
          case 'stock': {
            const val = parseInt(stockValue) || 0;
            if (stockAction === 'set') updated.stock = val;
            else if (stockAction === 'add') updated.stock = p.stock + val;
            else updated.stock = Math.max(0, p.stock - val);
            break;
          }
          case 'status':
            updated.status = newStatus;
            break;
          case 'category':
            // category is just tracked; no field on Product
            break;
          case 'marketplace':
            // marketplace assignment would happen via API
            break;
          case 'tag':
            // tagging would happen via API
            break;
        }
        return updated;
      }),
    );

    setHistory((prev) => [
      {
        id: `h${Date.now()}`,
        type: activeOp!,
        label: opLabel,
        affectedCount: count,
        status: 'Başarılı',
        user: 'Ahmet Y.',
        timestamp: new Date(),
      },
      ...prev,
    ]);

    setSelectedIds(new Set());
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setPriceDirection('increase');
    setPriceValue('');
    setPriceType('percent');
    setMinPrice('');
    setMaxPrice('');
    setStockAction('set');
    setStockValue('');
    setNewStatus('Yayında');
    setCategory('');
    setSelectedMarketplaces(new Set());
    setTagInput('');
  };

  const toggleMarketplace = (mp: string) => {
    const next = new Set(selectedMarketplaces);
    if (next.has(mp)) next.delete(mp);
    else next.add(mp);
    setSelectedMarketplaces(next);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ──────────────────────────────────────────────────────────────────────────

  const renderDialogBody = () => {
    switch (activeOp) {
      case 'price':
        return (
          <div className="space-y-4">
            {/* Artış / Azalış */}
            <div className="space-y-1.5">
              <Label>İşlem Türü</Label>
              <Select
                value={priceDirection}
                onValueChange={(v) => setPriceDirection(v as 'increase' | 'decrease')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold">↑</span> Artış
                    </span>
                  </SelectItem>
                  <SelectItem value="decrease">
                    <span className="flex items-center gap-2">
                      <span className="text-red-500 font-semibold">↓</span> Azalış
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Yüzde / Sabit Tutar */}
            <div className="space-y-1.5">
              <Label>Güncelleme Tipi</Label>
              <Select
                value={priceType}
                onValueChange={(v) => setPriceType(v as 'percent' | 'fixed')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Yüzde (%)</SelectItem>
                  <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Değer */}
            <div className="space-y-1.5">
              <Label>
                {priceType === 'percent' ? 'Yüzde Değeri' : 'Tutar (₺)'}
              </Label>
              <Input
                type="number"
                min="0"
                step={priceType === 'percent' ? '1' : '0.01'}
                placeholder={priceType === 'percent' ? 'örn: 10' : 'örn: 25.00'}
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
              />
            </div>

            {/* Min / Max Fiyat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Minimum Fiyat (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Maksimum Fiyat (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="9999.99"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'stock':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Stok İşlemi</Label>
              <Select value={stockAction} onValueChange={(v) => setStockAction(v as 'set' | 'add' | 'subtract')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Belirli Sayıya Ayarla</SelectItem>
                  <SelectItem value="add">Mevcut Stoğa Ekle (+)</SelectItem>
                  <SelectItem value="subtract">Mevcut Stoktan Çıkar (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                {stockAction === 'set'
                  ? 'Yeni Stok Adedi'
                  : stockAction === 'add'
                    ? 'Eklenecek Adet'
                    : 'Çıkarılacak Adet'}
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="örn: 100"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
              />
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Yeni Durum</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as 'Yayında' | 'Pasif')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yayında">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" /> Yayınla
                    </span>
                  </SelectItem>
                  <SelectItem value="Pasif">
                    <span className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" /> Yayından Kaldır
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Yeni Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kategori seçin…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <div className="space-y-4">
            <Label className="block">Pazaryeri Seçin (birden fazla seçebilirsiniz)</Label>
            <div className="grid grid-cols-2 gap-2">
              {marketplaces.map((mp) => (
                <button
                  key={mp}
                  type="button"
                  onClick={() => toggleMarketplace(mp)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    selectedMarketplaces.has(mp)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={selectedMarketplaces.has(mp)}
                    onCheckedChange={() => toggleMarketplace(mp)}
                    className="pointer-events-none"
                  />
                  {mp}
                </button>
              ))}
            </div>
          </div>
        );

      case 'tag':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Etiket</Label>
              <Input
                placeholder="örn: Kampanya 2025, Yeni Sezon, Fırsat Ürünü"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Virgülle ayırarak birden fazla etiket ekleyebilirsiniz.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (selectedIds.size === 0) return false;
    switch (activeOp) {
      case 'price':
        return !!priceValue && parseFloat(priceValue) > 0;
      case 'stock':
        return stockAction === 'set'
          ? stockValue !== ''
          : !!stockValue && parseInt(stockValue) > 0;
      case 'status':
        return true;
      case 'category':
        return !!category;
      case 'marketplace':
        return selectedMarketplaces.size > 0;
      case 'tag':
        return tagInput.trim().length > 0;
      default:
        return false;
    }
  };

  // ── Title for active operation dialog ──
  const dialogTitle =
    operationButtons.find((b) => b.type === activeOp)?.label ?? 'İşlem';

  // ──────────────────────────────────────────────────────────────────────────
  // Main render
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Toplu Ürün İşlemleri
          </h1>
          <p className="text-sm text-muted-foreground">
            Birden fazla ürünü aynı anda güncelleyin — zaman kazanın, verimliliği artırın.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
            <Package className="h-3 w-3" />
            {products.length} Ürün
          </Badge>
          <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
            <Check className="h-3 w-3" />
            {selectedIds.size} Seçili
          </Badge>
        </div>
      </div>

      {/* ── Operation Toolbar ──────────────────────────────────────────── */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            İşlem Seçin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {operationButtons.map((op) => (
              <Button
                key={op.type}
                variant="outline"
                className={`gap-2 transition-all duration-150 hover:shadow-sm ${
                  activeOp === op.type
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                    : 'hover:border-gray-300'
                }`}
                disabled={selectedIds.size === 0}
                onClick={() => openOperation(op.type)}
              >
                <span className={op.color}>{op.icon}</span>
                <span className="hidden sm:inline">{op.label}</span>
              </Button>
            ))}
          </div>
          {selectedIds.size === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              İşlem yapabilmek için en az bir ürün seçin.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Product Table ──────────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-5 w-5 text-emerald-600" />
              Ürün Listesi
            </CardTitle>
            <Input
              placeholder="Ürün adı, SKU veya pazaryeri ile ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/80">
                  <th className="w-12 px-4 py-3 text-center">
                    <Checkbox
                      checked={allFilteredSelected}
                      ref={(el) => {
                        if (el) {
                          (el as unknown as HTMLInputElement).indeterminate = someFilteredSelected;
                        }
                      }}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ürün Adı</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Fiyat</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Stok</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Pazaryeri</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const checked = selectedIds.has(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`border-b transition-colors duration-100 ${
                        checked
                          ? 'bg-emerald-50/60 hover:bg-emerald-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleOne(product.id)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                        {product.sku}
                      </td>
                      <td className="max-w-[260px] truncate px-4 py-2.5 font-medium text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-gray-800">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span
                          className={
                            product.stock === 0
                              ? 'font-semibold text-red-600'
                              : product.stock < 50
                                ? 'font-medium text-amber-600'
                                : 'text-gray-700'
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{marketplaceBadge(product.marketplace)}</td>
                      <td className="px-4 py-2.5">{statusBadge(product.status)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      <p>Ürün bulunamadı.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Operation History ──────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-emerald-600" />
            İşlem Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600">İşlem</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-gray-600">Etkilenen</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Durum</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Kullanıcı</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-gray-600">Zaman</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rec) => (
                  <tr key={rec.id} className="border-b last:border-0 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      <span className="flex items-center gap-2">
                        {operationButtons.find((b) => b.type === rec.type)?.icon}
                        {rec.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-gray-600">
                      <Badge variant="secondary" className="font-semibold">
                        {rec.affectedCount} ürün
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">{historyStatusBadge(rec.status)}</td>
                    <td className="px-4 py-2.5 text-gray-500">{rec.user}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                      {relativeTime(rec.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Operation Dialog ───────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="text-emerald-600">
                {operationButtons.find((b) => b.type === activeOp)?.icon}
              </span>
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span className="font-semibold">{selectedIds.size}</span> ürün bu işlemden etkilenecek.
          </div>

          {renderDialogBody()}

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              İptal
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={!isFormValid()}
              onClick={applyOperation}
            >
              <Check className="mr-2 h-4 w-4" />
              Onayla ve Uygula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
