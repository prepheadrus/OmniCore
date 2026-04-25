'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  Rss,
  Upload,
  Link,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  FileCode,
  FileSpreadsheet,
  Play,
  Pause,
  GripVertical,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Feed {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  format: string;
  status: string;
  schedule: string;
  lastImport: string | null;
  lastError: string;
  totalProducts: number;
  validProducts: number;
  errorProducts: number;
  fieldMapping: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryMapping {
  id: string;
  source: string;
  sourceCat: string;
  target: string;
  targetCat: string;
  storeId: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Constants / Maps                                                   */
/* ------------------------------------------------------------------ */

const statusConfig: Record<string, { label: string; cls: string; border: string }> = {
  active: { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', border: 'border-l-emerald-500' },
  paused: { label: 'Duraklatıldı', cls: 'bg-amber-100 text-amber-800 border-amber-300', border: 'border-l-amber-500' },
  inactive: { label: 'Pasif', cls: 'bg-slate-100 text-slate-600 border-slate-300', border: 'border-l-slate-400' },
};

const formatConfig: Record<string, { label: string; cls: string; Icon: typeof FileCode }> = {
  xml: { label: 'XML', cls: 'bg-blue-100 text-blue-700', Icon: FileCode },
  csv: { label: 'CSV', cls: 'bg-green-100 text-green-700', Icon: FileSpreadsheet },
  json: { label: 'JSON', cls: 'bg-purple-100 text-purple-700', Icon: FileSpreadsheet },
};

const scheduleLabels: Record<string, string> = {
  manual: 'Manuel',
  '30min': '30dk',
  hourly: '1 Saat',
  daily: 'Günlük',
};

const defaultMappings = [
  { source: 'title', target: 'name' },
  { source: 'price', target: 'price' },
  { source: 'category', target: 'category' },
  { source: 'description', target: 'description' },
  { source: 'image_link', target: 'images' },
  { source: 'link', target: 'url' },
  { source: 'gtin', target: 'barcode' },
  { source: 'stock', target: 'stock' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function SortableFeedItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group relative">
      <button
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded-md bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
        aria-label="Sürükle"
      >
        <GripVertical className="h-4 w-4 text-slate-500" />
      </button>
      {children}
    </div>
  );
}

export default function ProductFeeds() {
  const { sidebarOpen } = useAppStore();

  /* --- State ------------------------------------------------------ */
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // New-feed form
  const [formName, setFormName] = useState('');
  const [formSource, setFormSource] = useState('url');
  const [formUrl, setFormUrl] = useState('');
  const [formFormat, setFormFormat] = useState('xml');
  const [formSchedule, setFormSchedule] = useState('manual');

  // Category mapping form
  const [cmSource, setCmSource] = useState('');
  const [cmSourceCat, setCmSourceCat] = useState('');
  const [cmTarget, setCmTarget] = useState('');
  const [cmTargetCat, setCmTargetCat] = useState('');

  /* --- Data fetching ---------------------------------------------- */
  const fetchFeeds = useCallback(async () => {
    try {
      const res = await fetch('/api/feeds');
      if (res.ok) setFeeds(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  const fetchCategoryMappings = useCallback(async () => {
    try {
      const res = await fetch('/api/category-mappings');
      if (res.ok) setCategoryMappings(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchFeeds(), fetchCategoryMappings()]).finally(() => setLoading(false));
  }, [fetchFeeds, fetchCategoryMappings]);

  /* --- Derived stats --------------------------------------------- */
  const activeFeeds = feeds.filter((f) => f.status === 'active').length;
  const lastSuccessfulImport = feeds
    .filter((f) => f.lastImport)
    .sort((a, b) => new Date(b.lastImport!).getTime() - new Date(a.lastImport!).getTime())[0];

  /* --- Handlers --------------------------------------------------- */
  async function handleSaveFeed() {
    if (!formName.trim()) return;
    await fetch('/api/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        source: formSource,
        sourceUrl: formUrl,
        format: formFormat,
        schedule: formSchedule,
        fieldMapping: Object.fromEntries(defaultMappings.map((m) => [m.source, m.target])),
      }),
    });
    setFormName('');
    setFormUrl('');
    await fetchFeeds();
  }

  async function handleToggleStatus(feed: Feed) {
    const next = feed.status === 'active' ? 'paused' : 'active';
    await fetch('/api/feeds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: feed.id, status: next }),
    });
    await fetchFeeds();
  }

  async function handleDelete(feed: Feed) {
    // Optimistic removal – API has no DELETE, so we just filter locally
    setFeeds((prev) => prev.filter((f) => f.id !== feed.id));
  }

  async function handleSyncNow(feed: Feed) {
    setSyncingId(feed.id);
    // Simulate sync
    await new Promise((r) => setTimeout(r, 1800));
    await fetch('/api/feeds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: feed.id,
        lastImport: new Date().toISOString(),
        totalProducts: Math.floor(Math.random() * 800) + 200,
        validProducts: Math.floor(Math.random() * 600) + 180,
        errorProducts: Math.floor(Math.random() * 40),
      }),
    });
    await fetchFeeds();
    setSyncingId(null);
  }

  async function handleAddCategoryMapping() {
    if (!cmSource.trim() || !cmSourceCat.trim() || !cmTarget.trim() || !cmTargetCat.trim()) return;
    await fetch('/api/category-mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: cmSource, sourceCat: cmSourceCat, target: cmTarget, targetCat: cmTargetCat }),
    });
    setCmSource('');
    setCmSourceCat('');
    setCmTarget('');
    setCmTargetCat('');
    await fetchCategoryMappings();
  }

  /* --- DnD ------------------------------------------------------ */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setFeeds((items) => {
        const oldIndex = items.findIndex((f) => f.id === active.id);
        const newIndex = items.findIndex((f) => f.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  /* --- Loading skeleton ------------------------------------------ */
  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-96 rounded bg-slate-200" />
        </div>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- */
  /*  Render                                                         */
  /* -------------------------------------------------------------- */
  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* ==================== Header ==================== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
            <Rss className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ürün Feed Yönetimi</h1>
            <p className="text-sm text-slate-500">Tüm pazaryerlerine ürün feed'lerinizi yönetin</p>
          </div>
        </div>
      </div>

      {/* ==================== Stat Cards ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Feed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{feeds.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Link className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif Feed</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{activeFeeds}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Son Başarılı Import</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {lastSuccessfulImport
                    ? new Date(lastSuccessfulImport.lastImport!).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== Tabs ==================== */}
      <Tabs defaultValue="feeds" className="space-y-6">
        <TabsList className="bg-white shadow-sm border">
          <TabsTrigger value="feeds" className="gap-2">
            <Rss className="h-4 w-4" />
            Feed&apos;ler
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Feed Ekle
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Settings className="h-4 w-4" />
            Kategori Eşleştirme
          </TabsTrigger>
        </TabsList>

        {/* =========== TAB 1 — Feed List =========== */}
        <TabsContent value="feeds">
          {feeds.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileCode className="h-12 w-12 mb-3" />
                <p className="text-lg font-medium">Henüz feed eklenmedi</p>
                <p className="text-sm mt-1">Yeni bir feed eklemek için yukarıdaki sekmeyi kullanın.</p>
              </CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
                <GripVertical className="h-3.5 w-3.5" />
                <span>Sürükle Bırak ile Sırala</span>
              </div>
              <SortableContext items={feeds.map((f) => f.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feeds.map((feed) => {
                const st = statusConfig[feed.status] ?? statusConfig.inactive;
                const fmt = formatConfig[feed.format] ?? formatConfig.xml;
                const FmtIcon = fmt.Icon;
                const validPercent =
                  feed.totalProducts > 0 ? Math.round((feed.validProducts / feed.totalProducts) * 100) : 0;

                return (
                  <SortableFeedItem key={feed.id} id={feed.id}>
                  <Card className={cn('shadow-sm border-l-4', st.border)}>
                    <CardContent className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-800 text-base">{feed.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-xs border', st.cls)}>{st.label}</Badge>
                          <Badge className={cn('text-xs', fmt.cls)}>
                            <FmtIcon className="h-3 w-3 mr-1" />
                            {fmt.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {scheduleLabels[feed.schedule] ?? feed.schedule}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Ürün Kalitesi</span>
                          <span className="font-medium text-slate-700">{validPercent}%</span>
                        </div>
                        <Progress value={validPercent} className="h-2" />
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="rounded-lg bg-slate-50 py-2">
                          <p className="text-xs text-slate-500">Toplam Ürün</p>
                          <p className="text-lg font-bold text-slate-800">{feed.totalProducts}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 py-2">
                          <p className="text-xs text-emerald-600">Geçerli</p>
                          <p className="text-lg font-bold text-emerald-700">{feed.validProducts}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 py-2">
                          <p className="text-xs text-red-500">Hatalı</p>
                          <p className="text-lg font-bold text-red-600">{feed.errorProducts}</p>
                        </div>
                      </div>

                      {/* Last import */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Son import:{' '}
                          {feed.lastImport
                            ? new Date(feed.lastImport).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Henüz yapılmadı'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 mr-auto">
                          <Switch
                            checked={feed.status === 'active'}
                            onCheckedChange={() => handleToggleStatus(feed)}
                          />
                          <span className="text-xs text-slate-500">
                            {feed.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          disabled={syncingId === feed.id}
                          onClick={() => handleSyncNow(feed)}
                        >
                          <RefreshCw className={cn('h-3.5 w-3.5', syncingId === feed.id && 'animate-spin')} />
                          {syncingId === feed.id ? 'Senkronize ediliyor...' : 'Şimdi Senkronize Et'}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs">
                              <Trash2 className="h-3.5 w-3.5" />
                              Sil
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Feed&apos;i Sil</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-slate-600 py-4">
                              <strong>{feed.name}</strong> adlı feed&apos;i silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => {}}>
                                İptal
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(feed)}
                              >
                                Evet, Sil
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                  </SortableFeedItem>
                );
              })}
            </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <Card className="shadow-lg border-2 border-blue-300 w-80 rotate-2">
                  <CardContent className="p-4">
                    <p className="font-semibold text-slate-800">{feeds.find((f) => f.id === activeId)?.name}</p>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
            </DndContext>
          )}
        </TabsContent>

        {/* =========== TAB 2 — New Feed Form =========== */}
        <TabsContent value="add">
          <Card className="shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-blue-600" />
                Yeni Feed Ekle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Feed Adı */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Feed Adı</label>
                <Input
                  placeholder="örn: Trendyol XML Feed"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* Kaynak Türü */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kaynak Türü</label>
                <Select value={formSource} onValueChange={setFormSource}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL Upload</SelectItem>
                    <SelectItem value="upload">Dosya Yükleme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* URL (conditional) */}
              {formSource === 'url' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">URL</label>
                  <Input
                    placeholder="https://example.com/feed.xml"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Format</label>
                <Select value={formFormat} onValueChange={setFormFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Çalışma Planı */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Çalışma Planı</label>
                <Select value={formSchedule} onValueChange={setFormSchedule}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manuel</SelectItem>
                    <SelectItem value="30min">30 Dakikada Bir</SelectItem>
                    <SelectItem value="hourly">Saatlik</SelectItem>
                    <SelectItem value="daily">Günlük</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Field Mapping Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Alan Eşleştirme (Önizleme)</label>
                <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
                  {defaultMappings.map((m) => (
                    <div key={m.source} className="flex items-center gap-2 text-sm">
                      <code className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 text-xs font-mono">
                        {m.source}
                      </code>
                      <span className="text-slate-400">→</span>
                      <code className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 text-xs font-mono">
                        {m.target}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button className="gap-2" onClick={handleSaveFeed} disabled={!formName.trim()}>
                <Plus className="h-4 w-4" />
                Feed&apos;i Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========== TAB 3 — Category Mapping =========== */}
        <TabsContent value="categories">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-indigo-600" />
                Kategori Eşleştirme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mapping table */}
              {categoryMappings.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Henüz kategori eşleştirmesi yok. Aşağıdaki formu kullanarak ekleyebilirsiniz.
                </p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Kaynak (Mağaza)</th>
                        <th className="text-left px-4 py-3 font-medium">Kaynak Kategori</th>
                        <th className="text-left px-4 py-3 font-medium">Hedef (Pazaryer)</th>
                        <th className="text-left px-4 py-3 font-medium">Hedef Kategori</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categoryMappings.map((cm) => (
                        <tr key={cm.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-800 font-medium">{cm.source}</td>
                          <td className="px-4 py-3 text-slate-600">{cm.sourceCat}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium">{cm.target}</td>
                          <td className="px-4 py-3 text-slate-600">{cm.targetCat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add mapping form */}
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Eşleştirme Ekle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Kaynak (Mağaza)</label>
                    <Input
                      placeholder="örn: Benim Mağazam"
                      value={cmSource}
                      onChange={(e) => setCmSource(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Kaynak Kategori</label>
                    <Input
                      placeholder="örn: Elektronik > Telefon"
                      value={cmSourceCat}
                      onChange={(e) => setCmSourceCat(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Hedef (Pazaryer)</label>
                    <Input
                      placeholder="örn: Trendyol"
                      value={cmTarget}
                      onChange={(e) => setCmTarget(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Hedef Kategori</label>
                    <Input
                      placeholder="örn: Cep Telefonu"
                      value={cmTargetCat}
                      onChange={(e) => setCmTargetCat(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-4 gap-2"
                  disabled={!cmSource.trim() || !cmSourceCat.trim() || !cmTarget.trim() || !cmTargetCat.trim()}
                  onClick={handleAddCategoryMapping}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Eşleştirmeyi Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
