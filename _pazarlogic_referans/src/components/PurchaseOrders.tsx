'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  ShoppingCart,
  ClipboardCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  Calendar,
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface PurchaseOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNo: string;
  supplier: string;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  amount: number;
  currency: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

const statusConfig: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Bekleyen', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Onaylanan', cls: 'bg-blue-100 text-blue-700', icon: ClipboardCheck },
  received: { label: 'Teslim Edilen', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'İptal', cls: 'bg-red-100 text-red-700', icon: XCircle },
};

const demoOrders: PurchaseOrder[] = [
  {
    id: '1', poNo: 'PO-2025-001', supplier: 'Anadolu Elektronik', status: 'pending',
    amount: 125000, currency: 'TRY', expectedDate: '2025-02-01', createdAt: '2025-01-10',
    items: [{ name: 'Kablosuz Kulaklık', quantity: 500, unitPrice: 250 }],
  },
  {
    id: '2', poNo: 'PO-2025-002', supplier: 'İstanbul Teknoloji', status: 'approved',
    amount: 85000, currency: 'TRY', expectedDate: '2025-01-25', createdAt: '2025-01-08',
    items: [{ name: 'Akıllı Saat', quantity: 200, unitPrice: 425 }],
  },
  {
    id: '3', poNo: 'PO-2025-003', supplier: 'Ege Malzeme A.Ş.', status: 'received',
    amount: 45000, currency: 'TRY', expectedDate: '2025-01-15', createdAt: '2025-01-02',
    items: [{ name: 'USB Kablo Set', quantity: 1000, unitPrice: 45 }],
  },
  {
    id: '4', poNo: 'PO-2025-004', supplier: 'Karadeniz Dış Ticaret', status: 'pending',
    amount: 3200, currency: 'USD', expectedDate: '2025-02-15', createdAt: '2025-01-12',
    items: [{ name: 'Bluetooth Hoparlör', quantity: 100, unitPrice: 32 }],
  },
  {
    id: '5', poNo: 'PO-2025-005', supplier: 'Akdeniz Lojistik', status: 'cancelled',
    amount: 28000, currency: 'TRY', expectedDate: '2025-01-20', createdAt: '2025-01-05',
    items: [{ name: 'Tablet Kılıfı', quantity: 800, unitPrice: 35 }],
  },
  {
    id: '6', poNo: 'PO-2025-006', supplier: 'Doğu Anadolu Gıda', status: 'approved',
    amount: 15000, currency: 'EUR', expectedDate: '2025-02-05', createdAt: '2025-01-11',
    items: [{ name: 'Organik Çay Seti', quantity: 300, unitPrice: 50 }],
  },
  {
    id: '7', poNo: 'PO-2025-007', supplier: 'Marmara Tekstil', status: 'received',
    amount: 67500, currency: 'TRY', expectedDate: '2025-01-10', createdAt: '2024-12-28',
    items: [{ name: 'Pamuklu Tişört', quantity: 1500, unitPrice: 45 }],
  },
  {
    id: '8', poNo: 'PO-2025-008', supplier: 'Güneydoğu Petrol', status: 'pending',
    amount: 92000, currency: 'TRY', expectedDate: '2025-02-20', createdAt: '2025-01-14',
    items: [{ name: 'Endüstriyel Yağ', quantity: 200, unitPrice: 460 }],
  },
];

export default function PurchaseOrders() {
  const { sidebarOpen } = useAppStore();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formSupplier, setFormSupplier] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('TRY');
  const [formExpectedDate, setFormExpectedDate] = useState('');
  const [formItems, setFormItems] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/purchase-orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          setOrders(demoOrders);
        }
      })
      .catch(() => {
        setOrders(demoOrders);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    const payload = {
      supplier: formSupplier,
      amount: parseFloat(formAmount),
      currency: formCurrency,
      expectedDate: formExpectedDate,
      items: formItems,
    };

    fetch('/api/purchase-orders', {
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
        const newOrder: PurchaseOrder = {
          id: Date.now().toString(),
          poNo: `PO-2025-${String(orders.length + 1).padStart(3, '0')}`,
          supplier: formSupplier,
          status: 'pending',
          amount: parseFloat(formAmount) || 0,
          currency: formCurrency,
          expectedDate: formExpectedDate,
          items: [{ name: formItems || 'Genel Ürün', quantity: 1, unitPrice: parseFloat(formAmount) || 0 }],
          createdAt: new Date().toISOString(),
        };
        setOrders((prev) => [newOrder, ...prev]);
        setDialogOpen(false);
        resetForm();
      });
  };

  const resetForm = () => {
    setFormSupplier('');
    setFormAmount('');
    setFormCurrency('TRY');
    setFormExpectedDate('');
    setFormItems('');
  };

  const updateStatus = (id: string, newStatus: PurchaseOrder['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const approved = orders.filter((o) => o.status === 'approved').length;
  const received = orders.filter((o) => o.status === 'received').length;

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Satınalma Siparişleri</h1>
        <p className="mb-6 text-slate-500">Tedarikçi siparişlerinizi yönetin</p>
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
        <h1 className="text-2xl font-bold text-slate-800">Satınalma Siparişleri</h1>
        <p className="text-slate-500 mt-1">Tedarikçi siparişlerinizi oluşturun, takip edin ve yönetin</p>
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
              <p className="text-blue-100 text-sm">Onaylanan</p>
              <p className="text-2xl font-bold mt-1">{approved}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/30">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Teslim Edilen</p>
              <p className="text-2xl font-bold mt-1">{received}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Tutar</p>
              <p className="text-xl font-bold mt-1">
                ₺{totalAmount.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Sipariş Listesi</h2>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="approved">Onaylanan</SelectItem>
                <SelectItem value="received">Teslim Edilen</SelectItem>
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
                  <DialogTitle>Yeni Satınalma Siparişi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm text-slate-600">Tedarikçi</Label>
                    <Input
                      value={formSupplier}
                      onChange={(e) => setFormSupplier(e.target.value)}
                      placeholder="Tedarikçi adı"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Ürünler (JSON)</Label>
                    <Textarea
                      value={formItems}
                      onChange={(e) => setFormItems(e.target.value)}
                      placeholder='[{"name": "Ürün Adı", "quantity": 100, "unitPrice": 50}]'
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-slate-600">Tutar</Label>
                      <Input
                        type="number"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Para Birimi</Label>
                      <Select value={formCurrency} onValueChange={setFormCurrency}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Beklenen Teslim Tarihi</Label>
                    <Input
                      type="date"
                      value={formExpectedDate}
                      onChange={(e) => setFormExpectedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
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
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Sipariş No</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Tedarikçi</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Durum</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Tutar</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Para Birimi</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Beklenen Tarih</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-700">{order.poNo}</td>
                    <td className="py-3 px-4 text-slate-800">{order.supplier}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.cls}`}>
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      {order.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{order.currency}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.expectedDate).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'pending' && (
                          <Button size="sm" variant="outline" className="text-xs h-7"
                            onClick={() => updateStatus(order.id, 'approved')}>
                            Onayla
                          </Button>
                        )}
                        {order.status === 'approved' && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs h-7"
                              onClick={() => updateStatus(order.id, 'received')}>
                              Teslim Al
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-7 text-red-500"
                              onClick={() => updateStatus(order.id, 'cancelled')}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {order.status === 'received' && (
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {order.status === 'cancelled' && (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sipariş bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
