'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Webhook, Plus, Copy, Trash2, CheckCircle, XCircle, Globe, Key, Clock, FileText, AlertTriangle, Pencil } from 'lucide-react';

const defaultHooks = [
  { id: '1', url: 'https://api.myapp.com/webhooks/orders', events: ['order.created', 'order.shipped'], active: true, lastFired: '5 dk once' },
  { id: '2', url: 'https://api.myapp.com/webhooks/stock', events: ['stock.low', 'product.updated'], active: true, lastFired: '1 saat once' },
  { id: '3', url: 'https://api.myapp.com/webhooks/invoices', events: ['invoice.created'], active: false, lastFired: '2 gun once' },
  { id: '4', url: 'https://erp.example.com/hooks', events: ['order.created'], active: true, lastFired: '30 dk once' },
  { id: '5', url: 'https://logistics.example.com/track', events: ['shipment.delivered'], active: false, lastFired: '1 hafta once' },
];

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastFired: string;
}

export default function Webhooks() {
  const { sidebarOpen } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hooks, setHooks] = useState<WebhookItem[]>(defaultHooks as WebhookItem[]);
  const [deleteTarget, setDeleteTarget] = useState<WebhookItem | null>(null);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [editHook, setEditHook] = useState<WebhookItem | null>(null);
  const [newHook, setNewHook] = useState({ name: '', url: '', events: '' as string, secret: '' });
  const apiKey = 'pzl_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  const handleCopy = () => { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleDeleteWebhook = () => {
    if (!deleteTarget) return;
    setHooks((prev) => prev.filter((h) => h.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">API & Webhook Yonetimi</h1><p className="text-sm text-slate-500">API anahtari ve webhook yapilandirmalari</p></div>

      {/* API Key */}
      <Card className="mb-6">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Key className="h-4 w-4"/>API Anahtari</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-slate-100 rounded px-3 py-2 text-sm font-mono">{showKey ? apiKey : apiKey.slice(0, 12) + '...' + apiKey.slice(-6)}</code>
            <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>{showKey ? 'Gizle' : 'Goster'}</Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>{copied ? <CheckCircle className="h-4 w-4 text-emerald-500"/> : <Copy className="h-4 w-4"/>}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Webhook className="h-4 w-4"/>Webhook Listesi</CardTitle>
            <Button size="sm" onClick={() => { setEditHook(null); setNewHook({ name: '', url: '', events: '', secret: '' }); setShowNewWebhook(true); }}><Plus className="h-4 w-4 mr-1" /> Yeni Webhook</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hooks.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{hook.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {hook.events.map((e) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                    <span className="text-xs text-slate-400"><Clock className="h-3 w-3 inline mr-1"/>{hook.lastFired}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Switch checked={hook.active} onCheckedChange={(checked) => {
                    setHooks((prev) => prev.map((h) => h.id === hook.id ? { ...h, active: checked } : h));
                  }} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    setEditHook(hook);
                    setNewHook({ name: hook.name || '', url: hook.url, events: hook.events[0] || '', secret: hook.secret || '' });
                    setShowNewWebhook(true);
                  }}><Pencil className="h-4 w-4 text-slate-400"/></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(hook)}><Trash2 className="h-4 w-4 text-red-400"/></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/>Webhook Sil</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.url}</strong> adresini silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>İptal</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteWebhook}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New/Edit Webhook Dialog */}
      <Dialog open={showNewWebhook} onOpenChange={setShowNewWebhook}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editHook ? 'Webhook Duzenle' : 'Yeni Webhook'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Webhook Adi</Label>
              <Input className="mt-1" value={newHook.name} onChange={e => setNewHook(p => ({ ...p, name: e.target.value }))} placeholder="ornek: Siparis Webhook" />
            </div>
            <div>
              <Label>URL</Label>
              <Input className="mt-1" value={newHook.url} onChange={e => setNewHook(p => ({ ...p, url: e.target.value }))} placeholder="https://api.ornek.com/webhooks" />
            </div>
            <div>
              <Label>Etkinlikler</Label>
              <Select value={newHook.events} onValueChange={v => setNewHook(p => ({ ...p, events: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Etkinlik secin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="order.created">order.created</SelectItem>
                  <SelectItem value="order.shipped">order.shipped</SelectItem>
                  <SelectItem value="product.updated">product.updated</SelectItem>
                  <SelectItem value="stock.low">stock.low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gizli Anahtar (Secret)</Label>
              <Input className="mt-1" type="password" value={newHook.secret} onChange={e => setNewHook(p => ({ ...p, secret: e.target.value }))} placeholder="whsec_..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWebhook(false)}>Iptal</Button>
            <Button onClick={() => {
              if (!newHook.url) return;
              if (editHook) {
                setHooks(prev => prev.map(h => h.id === editHook.id ? { ...h, name: newHook.name || h.name, url: newHook.url, events: [newHook.events] } : h));
              } else {
                const newWebhook: WebhookItem = {
                  id: `new-${Date.now()}`,
                  name: newHook.name || newHook.url,
                  url: newHook.url,
                  events: [newHook.events],
                  secret: newHook.secret,
                  active: true,
                  lastFired: 'Henuz calismadi',
                };
                setHooks(prev => [...prev, newWebhook]);
              }
              setShowNewWebhook(false);
              setNewHook({ name: '', url: '', events: '', secret: '' });
              setEditHook(null);
            }}>{editHook ? 'Guncelle' : 'Olustur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Docs */}
      <Card className="mt-6">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/>API Dokumantasyonu</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg"><Globe className="h-4 w-4 text-blue-500"/><div><p className="text-sm font-medium text-slate-700">REST API</p><p className="text-xs text-slate-400">Tam API referansi</p></div></div>
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg"><Webhook className="h-4 w-4 text-emerald-500"/><div><p className="text-sm font-medium text-slate-700">Webhook Rehberi</p><p className="text-xs text-slate-400">Webhook kurulumu</p></div></div>
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg"><Key className="h-4 w-4 text-violet-500"/><div><p className="text-sm font-medium text-slate-700">Kimlik Dogrulama</p><p className="text-xs text-slate-400">Auth yapilandirmasi</p></div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
