'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { Users, Star, ShoppingBag } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: string;
  loyaltyScore: number;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderAt: string | null;
}

const segMap: Record<string, { label: string; cls: string }> = {
  vip: { label: 'VIP', cls: 'bg-amber-100 text-amber-800' },
  regular: { label: 'Reguler', cls: 'bg-blue-100 text-blue-800' },
  new: { label: 'Yeni', cls: 'bg-emerald-100 text-emerald-800' },
  risky: { label: 'Riskli', cls: 'bg-red-100 text-red-800' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export default function Customers() {
  const { sidebarOpen } = useAppStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((d) => setCustomers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    search
      ? c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const totalSpent = customers.reduce((a, b) => a + b.totalSpent, 0);
  const avgLoyalty =
    customers.length > 0
      ? Math.round(customers.reduce((a, b) => a + b.loyaltyScore, 0) / customers.length)
      : 0;
  const vipCount = customers.filter((c) => c.segment === 'vip').length;

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Musteriler</h1>
        <div className="animate-pulse grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
    >
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Musteri Yonetimi (CRM)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Musteri</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {customers.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">VIP Musteriler</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{vipCount}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Toplam Harcama</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {fmt(totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Ort. Sadakat Puani</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{avgLoyalty}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <Input
            placeholder="Musteri adı veya email ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md h-10"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Sehir</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Segment</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Siparis</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Harcama</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Ort. Siparis</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Sadakat</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Son Siparis</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const seg = segMap[c.segment] || segMap.new;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.city}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${seg.cls} text-xs`}>
                          {seg.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{c.totalOrders}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {fmt(c.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-right">{fmt(c.avgOrderValue)}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            c.loyaltyScore > 700
                              ? 'text-amber-600 font-semibold'
                              : c.loyaltyScore > 300
                                ? 'text-blue-600'
                                : 'text-slate-500'
                          }
                        >
                          {c.loyaltyScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {c.lastOrderAt
                          ? new Date(c.lastOrderAt).toLocaleDateString('tr-TR')
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
