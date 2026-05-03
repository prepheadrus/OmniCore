'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { Megaphone, Percent, Calendar, Tag, Plus, Pencil, Trash2, RefreshCw, Copy } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  marketplace: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: string;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-800' },
  draft: { label: 'Taslak', cls: 'bg-slate-100 text-slate-700' },
  ended: { label: 'Sona Erdi', cls: 'bg-red-100 text-red-700' },
};

export default function Campaigns() {
  const { sidebarOpen } = useAppStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', platform: '', budget: '', marketplace: '', discount: '', startDate: '', endDate: '' });
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', marketplace: '', discount: '', startDate: '', endDate: '', status: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((d) => setCampaigns(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Kampanyalar</h1>
        <div className="animate-pulse grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-slate-200 rounded" />))}</div>
      </div>
    );
  }

  const active = campaigns.filter((c) => c.status === 'active').length;

  const handleNewCampaign = () => {
    if (!newCampaign.name) return;
    const id = `new-${Date.now()}`;
    const campaign: Campaign = {
      id, name: newCampaign.name, type: newCampaign.platform || 'discount', marketplace: newCampaign.marketplace,
      discount: parseFloat(newCampaign.discount) || 0,
      startDate: newCampaign.startDate || new Date().toISOString(),
      endDate: newCampaign.endDate || new Date().toISOString(),
      status: 'draft',
    };
    setCampaigns(prev => [campaign, ...prev]);
    setShowNewCampaign(false);
    setNewCampaign({ name: '', platform: '', budget: '', marketplace: '', discount: '', startDate: '', endDate: '' });
  };

  const handleCopy = (c: Campaign) => {
    const copy = { ...c, id: `copy-${Date.now()}`, name: `${c.name} (Kopya)`, status: 'draft' as const };
    setCampaigns(prev => [copy, ...prev]);
  };

  const handleDelete = (c: Campaign) => {
    if (!confirm(`"${c.name}" kampanyasini silmek istediginize emin misiniz?`)) return;
    setCampaigns(prev => prev.filter(x => x.id !== c.id));
  };

  const handleEdit = (c: Campaign) => {
    setEditCampaign(c);
    setEditFormData({ name: c.name, marketplace: c.marketplace, discount: String(c.discount), startDate: c.startDate.split('T')[0], endDate: c.endDate.split('T')[0], status: c.status });
  };

  const handleUpdateEdit = () => {
    if (!editCampaign) return;
    setCampaigns(prev => prev.map(c => c.id === editCampaign.id ? {
      ...c,
      name: editFormData.name,
      marketplace: editFormData.marketplace,
      discount: parseFloat(editFormData.discount) || 0,
      startDate: editFormData.startDate || new Date().toISOString(),
      endDate: editFormData.endDate || new Date().toISOString(),
      status: editFormData.status,
    } : c));
    setEditCampaign(null);
  };

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Kampanya & Indirim Yonetimi</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Kampanya</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{campaigns.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><Megaphone className="h-5 w-5 text-white" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Aktif Kampanya</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Ort. Indirim</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">%{campaigns.length > 0 ? Math.round(campaigns.reduce((a, b) => a + b.discount, 0) / campaigns.length) : 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => setShowNewCampaign(true)}><Plus className="h-4 w-4 mr-1" /> Yeni Kampanya</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const st = statusMap[c.status] || statusMap.draft;
          return (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  <Badge className={`${st.cls} text-xs`}>{st.label}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Percent className="h-3.5 w-3.5" /><span>%{c.discount} indirim</span></div>
                  {c.marketplace && (<div className="flex items-center gap-2 text-slate-600"><Tag className="h-3.5 w-3.5" /><span>{c.marketplace}</span></div>)}
                  <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-3.5 w-3.5" /><span>{new Date(c.startDate).toLocaleDateString('tr-TR')} - {new Date(c.endDate).toLocaleDateString('tr-TR')}</span></div>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(c)}><Copy className="h-3.5 w-3.5 mr-1" />Kopyala</Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 ml-auto" onClick={() => handleDelete(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={!!editCampaign} onOpenChange={() => setEditCampaign(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kampanya Duzenle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Kampanya Adi</Label><Input className="mt-1" value={editFormData.name} onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))} placeholder="Kampanya adi" /></div>
            <div><Label>Pazaryeri</Label><Input className="mt-1" value={editFormData.marketplace} onChange={e => setEditFormData(p => ({ ...p, marketplace: e.target.value }))} placeholder="ornek: Trendyol" /></div>
            <div><Label>Indirim (%)</Label><Input className="mt-1" type="number" value={editFormData.discount} onChange={e => setEditFormData(p => ({ ...p, discount: e.target.value }))} placeholder="0" /></div>
            <div><Label>Durum</Label><Select value={editFormData.status} onValueChange={v => setEditFormData(p => ({ ...p, status: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Durum secin" /></SelectTrigger><SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="draft">Taslak</SelectItem><SelectItem value="ended">Sona Erdi</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Baslangic Tarihi</Label><Input className="mt-1" type="date" value={editFormData.startDate} onChange={e => setEditFormData(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div><Label>Bitis Tarihi</Label><Input className="mt-1" type="date" value={editFormData.endDate} onChange={e => setEditFormData(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCampaign(null)}>Iptal</Button>
            <Button onClick={handleUpdateEdit}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Kampanya</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Kampanya Adi</Label><Input className="mt-1" value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} placeholder="Kampanya adi" /></div>
            <div><Label>Platform</Label><Input className="mt-1" value={newCampaign.platform} onChange={e => setNewCampaign(p => ({ ...p, platform: e.target.value }))} placeholder="ornek: Trendyol, Instagram" /></div>
            <div><Label>Butce (TL)</Label><Input className="mt-1" type="number" value={newCampaign.budget} onChange={e => setNewCampaign(p => ({ ...p, budget: e.target.value }))} placeholder="0.00" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Baslangic Tarihi</Label><Input className="mt-1" type="date" value={newCampaign.startDate} onChange={e => setNewCampaign(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div><Label>Bitis Tarihi</Label><Input className="mt-1" type="date" value={newCampaign.endDate} onChange={e => setNewCampaign(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCampaign(false)}>Iptal</Button>
            <Button onClick={handleNewCampaign}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
