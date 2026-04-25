'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  Sparkles, FileText, Image, Type, ShieldCheck, Plus, Trash2,
  CheckCircle, XCircle, AlertTriangle, Wand2, Eye, Search,
  Settings, Tag, Layers,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContentRule {
  id: string; name: string; type: string; status: string; priority: number;
  description: string; template: string; channel: string; category: string;
  conditions: string; createdAt: string; updatedAt: string; applyCount: number;
}

interface QualityScore {
  category: string; totalProducts: number; validProducts: number; score: number;
  issues: { missing_images: number; short_title: number; missing_gtin: number; short_description: number };
}

interface Summary { totalRules: number; activeRules: number; totalApplied: number; avgQualityScore: number; }

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_LABELS: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  title_template: { label: 'Başlık Şablonu', icon: Type, color: 'bg-blue-100 text-blue-700' },
  description_template: { label: 'Açıklama Şablonu', icon: FileText, color: 'bg-purple-100 text-purple-700' },
  image_requirement: { label: 'Görsel Kuralı', icon: Image, color: 'bg-emerald-100 text-emerald-700' },
  field_validation: { label: 'Alan Doğrulama', icon: ShieldCheck, color: 'bg-amber-100 text-amber-700' },
  price_validation: { label: 'Fiyat Doğrulama', icon: Tag, color: 'bg-red-100 text-red-700' },
};

const CHANNEL_LABELS: Record<string, string> = {
  all: 'Tüm Kanallar', trendyol: 'Trendyol', hepsiburada: 'Hepsiburada', amazon: 'Amazon TR', n11: 'n11', website: 'Web Sitesi',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ContentRules() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<{ rules: ContentRule[]; qualityScores: QualityScore[]; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRule, setPreviewRule] = useState<ContentRule | null>(null);

  const [form, setForm] = useState({
    name: '', type: 'title_template', channel: 'all', category: 'Tüm Kategoriler',
    description: '', template: '', priority: 10,
  });

  const fetchRules = useCallback(async () => {
    const res = await fetch('/api/content-rules');
    if (res.ok) { const d = await res.json(); setData(d && typeof d === 'object' && !Array.isArray(d) ? d : null); }
  }, []);

  useEffect(() => { fetchRules().finally(() => setLoading(false)); }, [fetchRules]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    await fetch('/api/content-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setDialogOpen(false);
    setForm({ name: '', type: 'title_template', channel: 'all', category: 'Tüm Kategoriler', description: '', template: '', priority: 10 });
    await fetchRules();
  };

  const filteredRules = (data?.rules || []).filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    return true;
  });

  const simulatePreview = (rule: ContentRule) => {
    const samples: Record<string, Record<string, string>> = {
      title_template: { '{marka}': 'Apple', '{model}': 'iPhone 15 Pro', '{renk}': 'Siyah', '{bellek}': '256GB', '{garanti}': '2 Yıl' },
      description_template: { '{ürün_adı}': 'Apple iPhone 15 Pro', '{mağaza}': 'TeknoShop', '{özellikler}': 'A17 Pro çip, 48MP kamera, Titanium tasarım' },
      image_requirement: { 'min_images': '5', 'first_bg': 'white', 'min_width': '1000', 'min_height': '1000' },
      field_validation: { 'gtin': '8901234567890', 'barcode': '8901234567890', 'brand': 'Apple', 'warranty': '2 Yıl' },
      price_validation: { 'max_decimals': '2', 'no_currency_symbol': 'true' },
    };
    let result = rule.template;
    const vars = samples[rule.type] || {};
    Object.entries(vars).forEach(([key, value]) => { result = result.replaceAll(key, value); });
    return result;
  };

  if (loading || !data) {
    return (
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-200" />)}</div>
          <div className="h-96 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            İçerik Optimizasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ürün içeriklerinizi Channable tarzı kurallarla otomatik optimize edin</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />Yeni Kural Ekle
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium">Toplam Kural</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50"><Layers className="h-4 w-4 text-blue-600" /></div>
          </div>
          <p className="text-xl font-bold text-slate-900">{data.summary.totalRules}</p>
          <p className="text-xs text-slate-400 mt-1">{data.summary.activeRules} aktif</p>
        </CardContent></Card>

        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium">Toplam Uygulama</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50"><Wand2 className="h-4 w-4 text-emerald-600" /></div>
          </div>
          <p className="text-xl font-bold text-slate-900">{data.summary.totalApplied}</p>
          <p className="text-xs text-slate-400 mt-1">ürüne uygulandı</p>
        </CardContent></Card>

        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium">Ort. Kalite Skoru</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50"><ShieldCheck className="h-4 w-4 text-violet-600" /></div>
          </div>
          <p className={cn('text-xl font-bold', data.summary.avgQualityScore >= 90 ? 'text-emerald-600' : data.summary.avgQualityScore >= 80 ? 'text-amber-600' : 'text-red-600')}>{data.summary.avgQualityScore}/100</p>
          <Progress value={data.summary.avgQualityScore} className="mt-2 h-1.5" />
        </CardContent></Card>

        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium">Hata Oranı</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
          </div>
          <p className="text-xl font-bold text-amber-600">{100 - data.summary.avgQualityScore}%</p>
          <p className="text-xs text-slate-400 mt-1">düzeltme gerekli</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="bg-white shadow-sm border">
          <TabsTrigger value="rules" className="gap-2"><Settings className="h-4 w-4" />İçerik Kuralları</TabsTrigger>
          <TabsTrigger value="quality" className="gap-2"><ShieldCheck className="h-4 w-4" />Kalite Skorları</TabsTrigger>
        </TabsList>

        {/* Tab 1: Content Rules */}
        <TabsContent value="rules">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Kural ara..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kural Tipi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value="title_template">Başlık Şablonu</SelectItem>
                <SelectItem value="description_template">Açıklama Şablonu</SelectItem>
                <SelectItem value="image_requirement">Görsel Kuralı</SelectItem>
                <SelectItem value="field_validation">Alan Doğrulama</SelectItem>
                <SelectItem value="price_validation">Fiyat Doğrulama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {filteredRules.length === 0 ? (
              <Card className="shadow-sm"><CardContent className="p-12 text-center text-slate-400">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium">Henüz içerik kuralı tanımlanmamış</p>
                <p className="text-sm mt-1">Yukarıdaki butonla yeni kural ekleyebilirsiniz</p>
              </CardContent></Card>
            ) : (
              filteredRules.map(rule => {
                const typeInfo = TYPE_LABELS[rule.type] || TYPE_LABELS.field_validation;
                const TypeIcon = typeInfo.icon;
                return (
                  <Card key={rule.id} className={cn('shadow-sm border-l-4 transition-all', rule.status === 'active' ? 'border-l-emerald-500' : 'border-l-slate-300')}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="font-semibold text-slate-800">{rule.name}</h3>
                            <Badge className={cn('text-xs gap-1', typeInfo.color)}>
                              <TypeIcon className="h-3 w-3" />{typeInfo.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{CHANNEL_LABELS[rule.channel] || rule.channel}</Badge>
                            <Badge variant="outline" className="text-xs">#{rule.priority}</Badge>
                            {rule.status === 'active' ? (
                              <Badge className="text-xs bg-emerald-100 text-emerald-700">Aktif</Badge>
                            ) : (
                              <Badge className="text-xs bg-slate-100 text-slate-600">Duraklatıldı</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mb-3">{rule.description}</p>
                          {/* Template preview */}
                          <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 mb-3 overflow-x-auto">
                            <span className="text-slate-400">Şablon: </span>{rule.template}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Kategori: <strong className="text-slate-600">{rule.category}</strong></span>
                            <span>Uygulama: <strong className="text-slate-600">{rule.applyCount} ürün</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { setPreviewRule(rule); setPreviewOpen(true); }}>
                            <Eye className="h-3.5 w-3.5" />Önizle
                          </Button>
                          <Switch
                            checked={rule.status === 'active'}
                            onCheckedChange={() => {}}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Quality Scores */}
        <TabsContent value="quality">
          <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Kategori Bazlı İçerik Kalitesi</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-5">
                {data.qualityScores.map(qs => (
                  <div key={qs.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{qs.category}</span>
                        <Badge variant="outline" className="text-xs">{qs.validProducts}/{qs.totalProducts} geçerli</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn('text-lg font-bold', qs.score >= 90 ? 'text-emerald-600' : qs.score >= 80 ? 'text-amber-600' : 'text-red-600')}>{qs.score}/100</span>
                      </div>
                    </div>
                    <Progress value={qs.score} className={cn('h-2.5', qs.score >= 90 ? '[&>div]:bg-emerald-500' : qs.score >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500')} />
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Image className="h-3 w-3" /> Eksik görsel: <strong className="text-slate-600">{qs.issues.missing_images}</strong></span>
                      <span className="flex items-center gap-1"><Type className="h-3 w-3" /> Kısa başlık: <strong className="text-slate-600">{qs.issues.short_title}</strong></span>
                      <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Eksik GTIN: <strong className="text-slate-600">{qs.issues.missing_gtin}</strong></span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Kısa açıklama: <strong className="text-slate-600">{qs.issues.short_description}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Önizleme</DialogTitle><DialogDescription>{previewRule?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-2">Orijinal Şablon:</p>
              <code className="text-sm text-slate-700">{previewRule?.template}</code>
            </div>
            <div className="rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-4">
              <p className="text-xs text-emerald-600 mb-2 font-medium">Uygulandıktan Sonra:</p>
              <p className="text-sm text-slate-800 font-medium">{previewRule ? simulatePreview(previewRule) : ''}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Yeni İçerik Kuralı Ekle</DialogTitle><DialogDescription>Ürün içeriklerinizi otomatik optimize eden kurallar tanımlayın.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Kural Adı</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="örn: Trendyol Başlık Formatı" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Kural Tipi</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title_template">Başlık Şablonu</SelectItem>
                    <SelectItem value="description_template">Açıklama Şablonu</SelectItem>
                    <SelectItem value="image_requirement">Görsel Kuralı</SelectItem>
                    <SelectItem value="field_validation">Alan Doğrulama</SelectItem>
                    <SelectItem value="price_validation">Fiyat Doğrulama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium text-slate-700 mb-1 block">Kanal</label>
                <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kanallar</SelectItem>
                    <SelectItem value="trendyol">Trendyol</SelectItem>
                    <SelectItem value="hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="amazon">Amazon TR</SelectItem>
                    <SelectItem value="n11">n11</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Kategori</label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="örn: Elektronik" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Açıklama</label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kural ne yapar?" /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Şablon / Kural</label>
              <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] font-mono" value={form.template} onChange={e => setForm(f => ({ ...f, template: e.target.value }))} placeholder="{marka} {model} - {renk} {bellek}" />
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Öncelik</label><Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))} min={1} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button><Button onClick={handleSave} disabled={!form.name.trim()}><Plus className="h-4 w-4 mr-1" />Kaydet</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
