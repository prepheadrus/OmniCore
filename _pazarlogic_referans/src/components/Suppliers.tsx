'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { Star, Phone, Mail, MapPin, Plus, Pencil, Trash2, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  leadTime: number;
}

function exportToCSV(data: Supplier[], filename: string) {
  const headers = ['Tedarikci', 'Iletisim', 'Telefon', 'E-posta', 'Adres', 'Puan', 'Teslimat Suresi'];
  const rows = data.map(s => [s.name, s.contact, s.phone, s.email, s.address, s.rating, s.leadTime]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Suppliers() {
  const { sidebarOpen } = useAppStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '', email: '', address: '', category: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((d) => setSuppliers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleNewSupplier = () => {
    if (!newSupplier.name) return;
    if (editId) {
      setSuppliers(prev => prev.map(s => s.id === editId ? { ...s, name: newSupplier.name, contact: newSupplier.contact, phone: newSupplier.phone, email: newSupplier.email, address: newSupplier.address } : s));
    } else {
      const id = `new-${Date.now()}`;
      const supplier: Supplier = {
        id, name: newSupplier.name, contact: newSupplier.contact,
        phone: newSupplier.phone, email: newSupplier.email, address: newSupplier.address,
        rating: 0, leadTime: 0,
      };
      setSuppliers(prev => [supplier, ...prev]);
    }
    setShowNewSupplier(false);
    setEditId(null);
    setNewSupplier({ name: '', contact: '', phone: '', email: '', address: '', category: '' });
  };

  const handleEdit = (s: Supplier) => {
    setEditId(s.id);
    setNewSupplier({ name: s.name, contact: s.contact, phone: s.phone, email: s.email, address: s.address, category: '' });
    setShowNewSupplier(true);
  };

  const handleDelete = (s: Supplier) => {
    if (!confirm(`"${s.name}" tedarikcisini silmek istediginize emin misiniz?`)) return;
    setSuppliers(prev => prev.filter(x => x.id !== s.id));
  };

  const handleExportCSV = () => exportToCSV(suppliers, 'tedarikciler.csv');
  const handleExportExcel = () => exportToCSV(suppliers, 'tedarikciler.xlsx');

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Tedarikciler</h1>
        <div className="animate-pulse grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-slate-200 rounded" />))}</div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Tedarikci Yonetimi</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => { setEditId(null); setNewSupplier({ name: '', contact: '', phone: '', email: '', address: '', category: '' }); setShowNewSupplier(true); }}><Plus className="h-4 w-4 mr-1" /> Yeni Tedarikci</Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{s.name}</h3>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{s.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{s.email}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{s.address}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Tedarikci</span>
                  <span className="text-xs font-medium">{s.contact}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Teslimat Suresi</span>
                  <Badge variant="outline" className="text-xs">{s.leadTime} gun</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 ml-auto" onClick={() => handleDelete(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Supplier Dialog */}
      <Dialog open={showNewSupplier} onOpenChange={setShowNewSupplier}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Tedarikciyi Duzenle' : 'Yeni Tedarikci'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Firma Adi</Label><Input className="mt-1" value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} placeholder="Firma adi" /></div>
            <div><Label>Yetkili Kisi</Label><Input className="mt-1" value={newSupplier.contact} onChange={e => setNewSupplier(p => ({ ...p, contact: e.target.value }))} placeholder="Yetkili kisi" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefon</Label><Input className="mt-1" value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" /></div>
              <div><Label>E-posta</Label><Input className="mt-1" type="email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} placeholder="email@ornek.com" /></div>
            </div>
            <div><Label>Adres</Label><Input className="mt-1" value={newSupplier.address} onChange={e => setNewSupplier(p => ({ ...p, address: e.target.value }))} placeholder="Adres" /></div>
            <div><Label>Kategori</Label><Input className="mt-1" value={newSupplier.category} onChange={e => setNewSupplier(p => ({ ...p, category: e.target.value }))} placeholder="ornek: Elektronik, Tekstil" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSupplier(false)}>Iptal</Button>
            <Button onClick={handleNewSupplier}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
