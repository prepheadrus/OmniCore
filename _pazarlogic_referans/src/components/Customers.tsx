'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { Users, Star, ShoppingBag, Plus, Pencil, Trash2, Download, FileSpreadsheet, Printer, RefreshCw, Filter, Search } from 'lucide-react';

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

function exportToCSV(data: Customer[], filename: string) {
  const headers = ['Musteri', 'E-posta', 'Telefon', 'Sehir', 'Segment', 'Siparis', 'Harcama', 'Sadakat'];
  const rows = data.map(c => [c.name, c.email, c.phone, c.city, c.segment, c.totalOrders, c.totalSpent, c.loyaltyScore]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Customers() {
  const { sidebarOpen } = useAppStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', city: '', address: '' });
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', city: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/customers')
      .then((r) => r.json())
      .then((d) => setCustomers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleNewCustomer = () => {
    if (!newCustomer.name) return;
    const id = `new-${Date.now()}`;
    const customer: Customer = {
      id, name: newCustomer.name, email: newCustomer.email, phone: newCustomer.phone,
      city: newCustomer.city || '-', segment: 'new', loyaltyScore: 0, totalOrders: 0, totalSpent: 0, avgOrderValue: 0, lastOrderAt: null,
    };
    setCustomers(prev => [customer, ...prev]);
    setShowNewCustomer(false);
    setNewCustomer({ name: '', email: '', phone: '', city: '', address: '' });
  };

  const handleDelete = (c: Customer) => {
    if (!confirm(`"${c.name}" musterisini silmek istediginize emin misiniz?`)) return;
    setCustomers(prev => prev.filter(x => x.id !== c.id));
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setEditFormData({ name: customer.name, email: customer.email, phone: customer.phone, city: customer.city });
  };

  const handleUpdateEdit = () => {
    if (!editCustomer) return;
    setCustomers(prev => prev.map(c => c.id === editCustomer.id ? {
      ...c,
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      city: editFormData.city,
    } : c));
    setEditCustomer(null);
  };

  const handleExportCSV = () => exportToCSV(filtered, 'musteriler.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'musteriler.xlsx');

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Musteriler</h1>
        <div className="animate-pulse grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded" />
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
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</p>
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
            <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(totalSpent)}</p>
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewCustomer(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Musteri</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Input
              placeholder="Musteri adi veya email ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md h-10"
            />
          </CardContent>
        </Card>
      )}

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
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const seg = segMap[c.segment] || segMap.new;
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.city}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${seg.cls} text-xs`}>{seg.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{c.totalOrders}</td>
                      <td className="py-3 px-4 text-right font-medium">{fmt(c.totalSpent)}</td>
                      <td className="py-3 px-4 text-right">{fmt(c.avgOrderValue)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={c.loyaltyScore > 700 ? 'text-amber-600 font-semibold' : c.loyaltyScore > 300 ? 'text-blue-600' : 'text-slate-500'}>
                          {c.loyaltyScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Musteri Duzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ad</Label>
              <Input className="mt-1" value={editFormData.name} onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))} placeholder="Musteri adi" />
            </div>
            <div>
              <Label>E-posta</Label>
              <Input className="mt-1" type="email" value={editFormData.email} onChange={e => setEditFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@ornek.com" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input className="mt-1" value={editFormData.phone} onChange={e => setEditFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" />
            </div>
            <div>
              <Label>Sehir</Label>
              <Input className="mt-1" value={editFormData.city} onChange={e => setEditFormData(p => ({ ...p, city: e.target.value }))} placeholder="ornek: Istanbul" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Musteri</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ad</Label>
              <Input className="mt-1" value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Musteri adi" />
            </div>
            <div>
              <Label>E-posta</Label>
              <Input className="mt-1" type="email" value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} placeholder="email@ornek.com" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input className="mt-1" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" />
            </div>
            <div>
              <Label>Sehir</Label>
              <Input className="mt-1" value={newCustomer.city} onChange={e => setNewCustomer(p => ({ ...p, city: e.target.value }))} placeholder="ornek: Istanbul" />
            </div>
            <div>
              <Label>Adres</Label>
              <Input className="mt-1" value={newCustomer.address} onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))} placeholder="Adres" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCustomer(false)}>Iptal</Button>
            <Button onClick={handleNewCustomer}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
