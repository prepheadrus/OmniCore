'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Input } from '@omnicore/ui/components/ui/input';
import { Button } from '@omnicore/ui/components/ui/button';
import { Search, Download, Users, Star, ShoppingBag, Plus } from 'lucide-react';

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
}

const initialCustomers: Customer[] = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', phone: '555-0101', city: 'İstanbul', segment: 'vip', loyaltyScore: 95, totalOrders: 12, totalSpent: 4500 },
  { id: '2', name: 'Ayşe Kaya', email: 'ayse@example.com', phone: '555-0102', city: 'Ankara', segment: 'regular', loyaltyScore: 60, totalOrders: 5, totalSpent: 1200 },
  { id: '3', name: 'Mehmet Demir', email: 'mehmet@example.com', phone: '555-0103', city: 'İzmir', segment: 'new', loyaltyScore: 20, totalOrders: 1, totalSpent: 300 },
  { id: '4', name: 'Fatma Çelik', email: 'fatma@example.com', phone: '555-0104', city: 'Bursa', segment: 'vip', loyaltyScore: 85, totalOrders: 8, totalSpent: 3200 },
  { id: '5', name: 'Can Özkan', email: 'can@example.com', phone: '555-0105', city: 'Antalya', segment: 'risky', loyaltyScore: 10, totalOrders: 2, totalSpent: 150 },
];

const segMap: Record<string, { label: string; cls: string }> = {
  vip: { label: 'VIP', cls: 'bg-amber-100 text-amber-800' },
  regular: { label: 'Düzenli', cls: 'bg-blue-100 text-blue-800' },
  new: { label: 'Yeni', cls: 'bg-emerald-100 text-emerald-800' },
  risky: { label: 'Riskli', cls: 'bg-red-100 text-red-800' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export function CustomersList() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) : true
  );

  const totalSpent = customers.reduce((a, b) => a + b.totalSpent, 0);
  const avgLoyalty = customers.length > 0 ? Math.round(customers.reduce((a, b) => a + b.loyaltyScore, 0) / customers.length) : 0;
  const vipCount = customers.filter((c) => c.segment === 'vip').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Toplam Müşteri</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{customers.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-500">VIP Müşteriler</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{vipCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Ortalama Sadakat</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{avgLoyalty} Puan</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Toplam Yaşam Boyu Değer</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{fmt(totalSpent)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 rounded-t-md">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="İsim veya e-posta ara..."
              className="pl-8 h-8 text-[13px] border-slate-200 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-8 text-[13px] border-slate-200">
              <Download className="h-4 w-4 mr-2" /> Dışa Aktar
            </Button>
            <Button size="sm" className="h-8 text-[13px] bg-slate-800 hover:bg-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Yeni Müşteri
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Müşteri</th>
                <th className="py-3 px-4">İletişim</th>
                <th className="py-3 px-4">Şehir</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4 text-right">Sipariş / Harcama</th>
                <th className="py-3 px-4 text-right">Sadakat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const segInfo = segMap[customer.segment] || segMap.regular;
                return (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{customer.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div>{customer.email}</div>
                      <div className="text-[11px] mt-0.5">{customer.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{customer.city}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${segInfo.cls} border-0 rounded-md font-medium px-2 py-0.5 shadow-none`}>
                        {segInfo.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-medium text-slate-800">{customer.totalOrders} Sip.</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{fmt(customer.totalSpent)}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-slate-800">{customer.loyaltyScore}</span>
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Müşteri bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-200 text-[12px] text-slate-500 flex justify-between items-center bg-slate-50/50 rounded-b-md">
          <span>Toplam {filtered.length} müşteri gösteriliyor.</span>
        </div>
      </Card>
    </div>
  );
}
