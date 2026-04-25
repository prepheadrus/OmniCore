'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ShoppingCart,
  AlertCircle,
  MapPin,
} from 'lucide-react';

interface DropshipOrder {
  id: string;
  orderNo: string;
  supplier: string;
  product: string;
  customer: string;
  cost: number;
  sellPrice: number;
  profit: number;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  trackingNo: string | null;
  createdAt: string;
}

interface ProfitData {
  date: string;
  kar: number;
}

const statusConfig: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Bekleyen', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  shipped: { label: 'Kargoda', cls: 'bg-blue-100 text-blue-700', icon: Truck },
  completed: { label: 'Tamamlanan', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'İptal', cls: 'bg-red-100 text-red-700', icon: XCircle },
};

const demoOrders: DropshipOrder[] = [
  { id: '1', orderNo: 'DS-2025-001', supplier: 'Shenzhen Tech', product: 'Kablosuz Kulaklık BT-500', customer: 'Ahmet Yılmaz', cost: 120, sellPrice: 349, profit: 229, status: 'completed', trackingNo: 'TR123456789', createdAt: '2025-01-05' },
  { id: '2', orderNo: 'DS-2025-002', supplier: 'Guangzhou Digital', product: 'Akıllı Saat SW-200', customer: 'Elif Demir', cost: 180, sellPrice: 499, profit: 319, status: 'shipped', trackingNo: 'TR987654321', createdAt: '2025-01-08' },
  { id: '3', orderNo: 'DS-2025-003', supplier: 'Shenzhen Tech', product: 'USB-C Hub 7in1', customer: 'Mehmet Kaya', cost: 85, sellPrice: 249, profit: 164, status: 'pending', trackingNo: null, createdAt: '2025-01-10' },
  { id: '4', orderNo: 'DS-2025-004', supplier: 'Dongguan Parts', product: 'Mekanik Klavye MK-80', customer: 'Ayşe Çelik', cost: 210, sellPrice: 599, profit: 389, status: 'completed', trackingNo: 'TR456789123', createdAt: '2025-01-03' },
  { id: '5', orderNo: 'DS-2025-005', supplier: 'Shenzhen Tech', product: 'Webcam HD Pro', customer: 'Can Öztürk', cost: 150, sellPrice: 399, profit: 249, status: 'cancelled', trackingNo: null, createdAt: '2025-01-06' },
  { id: '6', orderNo: 'DS-2025-006', supplier: 'Guangzhou Digital', product: 'Bluetooth Hoparlör BX-10', customer: 'Zeynep Arslan', cost: 95, sellPrice: 279, profit: 184, status: 'completed', trackingNo: 'TR321654987', createdAt: '2025-01-02' },
  { id: '7', orderNo: 'DS-2025-007', supplier: 'Yiwu Accessories', product: 'Tablet Kılıfı Premium', customer: 'Burak Şahin', cost: 45, sellPrice: 149, profit: 104, status: 'shipped', trackingNo: 'TR654987321', createdAt: '2025-01-09' },
  { id: '8', orderNo: 'DS-2025-008', supplier: 'Shenzhen Tech', product: 'Powerbank 20000mAh', customer: 'Deniz Koç', cost: 110, sellPrice: 329, profit: 219, status: 'pending', trackingNo: null, createdAt: '2025-01-11' },
  { id: '9', orderNo: 'DS-2025-009', supplier: 'Dongguan Parts', product: 'Gaming Mouse GM-X', customer: 'Selin Aydın', cost: 65, sellPrice: 199, profit: 134, status: 'completed', trackingNo: 'TR789321654', createdAt: '2025-01-04' },
  { id: '10', orderNo: 'DS-2025-010', supplier: 'Guangzhou Digital', product: 'Kulaklık Standı Metal', customer: 'Emre Güneş', cost: 35, sellPrice: 119, profit: 84, status: 'completed', trackingNo: 'TR159357258', createdAt: '2025-01-07' },
];

const demoProfit: ProfitData[] = [
  { date: '01 Oca', kar: 229 },
  { date: '03 Oca', kar: 618 },
  { date: '05 Oca', kar: 867 },
  { date: '07 Oca', kar: 1200 },
  { date: '09 Oca', kar: 1484 },
  { date: '11 Oca', kar: 1703 },
  { date: '13 Oca', kar: 2056 },
];

export default function Dropshipping() {
  const { sidebarOpen } = useAppStore();
  const [orders, setOrders] = useState<DropshipOrder[]>([]);
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<DropshipOrder | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formSellPrice, setFormSellPrice] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/dropshipping')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          setOrders(demoOrders);
        }
        if (Array.isArray(data?.profitData) && data.profitData.length > 0) {
          setProfitData(data.profitData);
        } else {
          setProfitData(demoProfit);
        }
      })
      .catch(() => {
        setOrders(demoOrders);
        setProfitData(demoProfit);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    const cost = parseFloat(formCost) || 0;
    const sellPrice = parseFloat(formSellPrice) || 0;
    const profit = sellPrice - cost;

    const payload = {
      supplier: formSupplier,
      product: formProduct,
      customer: formCustomer,
      cost,
      sellPrice,
    };

    fetch('/api/dropshipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.order) {
          setOrders((prev) => [data.order, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      })
      .catch(() => {
        const newOrder: DropshipOrder = {
          id: Date.now().toString(),
          orderNo: `DS-2025-${String(orders.length + 1).padStart(3, '0')}`,
          supplier: formSupplier,
          product: formProduct,
          customer: formCustomer,
          cost,
          sellPrice,
          profit,
          status: 'pending',
          trackingNo: null,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setOrders((prev) => [newOrder, ...prev]);
        setDialogOpen(false);
        resetForm();
      });
  };

  const resetForm = () => {
    setFormSupplier('');
    setFormProduct('');
    setFormCustomer('');
    setFormCost('');
    setFormSellPrice('');
  };

  const openTracking = (order: DropshipOrder) => {
    setTrackingOrder(order);
    setTrackingNo(order.trackingNo || '');
    setTrackingDialogOpen(true);
  };

  const handleShip = () => {
    if (!trackingOrder || !trackingNo) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === trackingOrder.id
          ? { ...o, status: 'shipped' as const, trackingNo }
          : o
      )
    );
    setTrackingDialogOpen(false);
    setTrackingOrder(null);
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const pending = orders.filter((o) => o.status === 'pending').length;
  const shipped = orders.filter((o) => o.status === 'shipped').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const totalProfit = orders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.profit, 0);

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Dropshipping</h1>
        <p className="mb-6 text-slate-500">Dropshipping sipariş yönetimi</p>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dropshipping</h1>
        <p className="text-slate-500 mt-1">Dropshipping siparişlerinizi yönetin, kargolayın ve kârınızı takip edin</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Sipariş</p>
              <p className="text-2xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Bekleyen</p>
              <p className="text-2xl font-bold mt-1">{pending}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/30">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Kargoda</p>
              <p className="text-2xl font-bold mt-1">{shipped}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/30">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Tamamlanan</p>
              <p className="text-2xl font-bold mt-1">{completed}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Kar</p>
              <p className="text-2xl font-bold mt-1">₺{totalProfit.toLocaleString('tr-TR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Profit Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Kümülatif Kar Trendi</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profitData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `₺${v}`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Kümülatif Kar']} />
              <Legend />
              <Area type="monotone" dataKey="kar" name="Kümülatif Kar (₺)" stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Sipariş Listesi</h2>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="shipped">Kargoda</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="cancelled">İptal</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Yeni Sipariş
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Dropship Siparişi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm text-slate-600">Tedarikçi</Label>
                    <Select value={formSupplier} onValueChange={setFormSupplier}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Tedarikçi seçin" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shenzhen Tech">Shenzhen Tech</SelectItem>
                        <SelectItem value="Guangzhou Digital">Guangzhou Digital</SelectItem>
                        <SelectItem value="Dongguan Parts">Dongguan Parts</SelectItem>
                        <SelectItem value="Yiwu Accessories">Yiwu Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Ürün</Label>
                    <Input value={formProduct} onChange={(e) => setFormProduct(e.target.value)} placeholder="Ürün adı" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Müşteri</Label>
                    <Input value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} placeholder="Müşteri adı" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-slate-600">Maliyet (₺)</Label>
                      <Input type="number" value={formCost} onChange={(e) => setFormCost(e.target.value)} placeholder="0" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Satış Fiyatı (₺)</Label>
                      <Input type="number" value={formSellPrice} onChange={(e) => setFormSellPrice(e.target.value)} placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  {formCost && formSellPrice && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-500">Tahmini Kar</p>
                      <p className={`text-xl font-bold ${(parseFloat(formSellPrice) - parseFloat(formCost)) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₺{(parseFloat(formSellPrice) - parseFloat(formCost)).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Sipariş Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Sipariş No</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Tedarikçi</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Ürün</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Müşteri</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Maliyet</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Satış</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Kar</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Durum</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-emerald-700">{order.orderNo}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{order.supplier}</td>
                    <td className="py-3 px-3 text-slate-800 max-w-[140px] truncate">{order.product}</td>
                    <td className="py-3 px-3 text-slate-600">{order.customer}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">₺{order.cost.toFixed(0)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">₺{order.sellPrice.toFixed(0)}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      <span className={order.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {order.profit >= 0 ? '+' : ''}₺{order.profit.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.cls}`}>
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'pending' && (
                          <Button size="sm" variant="outline" className="text-xs h-7"
                            onClick={() => openTracking(order)}>
                            <Truck className="h-3.5 w-3.5 mr-1" />
                            Kargola
                          </Button>
                        )}
                        {order.status === 'shipped' && order.trackingNo && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="font-mono">{order.trackingNo}</span>
                          </div>
                        )}
                        {order.status === 'completed' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                        {order.status === 'cancelled' && (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-slate-500">Toplam Ciro</p>
            <p className="text-sm font-bold text-slate-800">
              ₺{orders.reduce((s, o) => s + o.sellPrice, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Toplam Maliyet</p>
            <p className="text-sm font-bold text-slate-600">
              ₺{orders.reduce((s, o) => s + o.cost, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Toplam Brüt Kar</p>
            <p className="text-sm font-bold text-emerald-600">
              ₺{orders.reduce((s, o) => s + o.profit, 0).toLocaleString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Ort. Kar Marjı</p>
            <p className="text-sm font-bold text-emerald-600">
              {orders.length > 0
                ? ((orders.reduce((s, o) => s + o.profit, 0) / orders.reduce((s, o) => s + o.sellPrice, 0)) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sipariş bulunamadı</p>
          </div>
        )}
      </div>

      {/* Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kargola - {trackingOrder?.orderNo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm text-slate-600">Ürün</Label>
              <p className="text-sm text-slate-800 mt-1">{trackingOrder?.product}</p>
            </div>
            <div>
              <Label className="text-sm text-slate-600">Müşteri</Label>
              <p className="text-sm text-slate-800 mt-1">{trackingOrder?.customer}</p>
            </div>
            <div>
              <Label className="text-sm text-slate-600">Takip Numarası</Label>
              <Input
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="TR123456789"
                className="mt-1"
              />
            </div>
            <Button onClick={handleShip} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!trackingNo}>
              <Truck className="h-4 w-4 mr-1" />
              Kargola
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
