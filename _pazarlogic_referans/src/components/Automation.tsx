'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Bot, Zap, Clock, Play, GripVertical, Plus, Pencil, Trash2, RefreshCw, PlayCircle, Search, Filter, FileSpreadsheet, Download } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  runCount: number;
  lastRun: string | null;
}

function SortableRuleItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded" aria-label="Sürükle">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function Automation() {
  const { sidebarOpen } = useAppStore();
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', trigger: '', action: '', isActive: false });
  const [editRuleId, setEditRuleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/automation')
      .then((r) => r.json())
      .then((d) => setRules(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      setRules((items) => {
        const oldIndex = items.findIndex((r) => r.id === active.id);
        const newIndex = items.findIndex((r) => r.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleNewRule = () => {
    if (!newRule.name) return;
    if (editRuleId) {
      setRules(prev => prev.map(r => r.id === editRuleId ? { ...r, name: newRule.name, trigger: newRule.trigger, action: newRule.action, isActive: newRule.isActive } : r));
    } else {
      const rule: Rule = {
        id: `new-${Date.now()}`, name: newRule.name, trigger: newRule.trigger, action: newRule.action,
        isActive: newRule.isActive, runCount: 0, lastRun: null,
      };
      setRules(prev => [rule, ...prev]);
    }
    setShowNewRule(false);
    setEditRuleId(null);
    setNewRule({ name: '', trigger: '', action: '', isActive: false });
  };

  const handleEdit = (rule: Rule) => {
    setEditRuleId(rule.id);
    setNewRule({ name: rule.name, trigger: rule.trigger, action: rule.action, isActive: rule.isActive });
    setShowNewRule(true);
  };

  const handleDelete = (rule: Rule) => {
    if (!confirm(`"${rule.name}" kuralini silmek istediginize emin misiniz?`)) return;
    setRules(prev => prev.filter(r => r.id !== rule.id));
  };

  const handleRunAll = () => {
    setRules(prev => prev.map(r => ({
      ...r,
      runCount: r.runCount + 1,
      lastRun: new Date().toISOString(),
    })));
  };

  const handleToggle = (rule: Rule) => {
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleExportExcel = () => {
    const headers = ['Kural Adi', 'Tetikleyici', 'Aksiyon', 'Durum', 'Calisma', 'Son Calisma'];
    const rows = rules.map(r => [r.name, r.trigger, r.action, r.isActive ? 'Aktif' : 'Pasif', r.runCount, r.lastRun || '-']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'otomasyon-kurallari.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRules = rules.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Otomasyonlar</h1>
        <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-24 bg-slate-200 rounded" />))}</div>
      </div>
    );
  }

  const activeCount = rules.filter((r) => r.isActive).length;
  const totalRuns = rules.reduce((a, b) => a + b.runCount, 0);

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Otomasyon Kurallari</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Kural</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{rules.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><Bot className="h-5 w-5 text-white" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif Kurallar</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500"><Zap className="h-5 w-5 text-white" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Calisma</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalRuns}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500"><Play className="h-5 w-5 text-white" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={() => { setEditRuleId(null); setNewRule({ name: '', trigger: '', action: '', isActive: false }); setShowNewRule(true); }}><Plus className="h-4 w-4 mr-1" /> Yeni Kural</Button>
        <Button size="sm" variant="outline" onClick={handleRunAll}><PlayCircle className="h-4 w-4 mr-1" /> Tumunu Calistir</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Kural adi ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <Button size="sm" variant="outline" onClick={() => { setSearch(''); setShowFilter(false); }}>Temizle</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
        <GripVertical className="h-3.5 w-3.5" />
        <span>Sürükle Birak ile Oncelik Sirala</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredRules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <SortableRuleItem key={rule.id} id={rule.id}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-800">{rule.name}</h3>
                          <Badge className={rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>{rule.isActive ? 'Aktif' : 'Pasif'}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />Tetikleyici: {rule.trigger}</span>
                          <span className="flex items-center gap-1"><Play className="h-3 w-3" />Aksiyon: {rule.action}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Calisma: {rule.runCount}</span>
                          {rule.lastRun && (<span>Son: {new Date(rule.lastRun).toLocaleString('tr-TR')}</span>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(rule)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(rule)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        <Switch checked={rule.isActive} onCheckedChange={() => handleToggle(rule)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SortableRuleItem>
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
              {activeId ? (
            <Card className="shadow-lg border-2 border-blue-300 w-96 rotate-1">
              <CardContent className="p-4">
                <p className="font-semibold text-slate-800">{filteredRules.find((r) => r.id === activeId)?.name}</p>
                <p className="text-xs text-slate-500 mt-1">Oncelik: #{filteredRules.findIndex((r) => r.id === activeId) + 1}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Rule Dialog */}
      <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editRuleId ? 'Kurali Duzenle' : 'Yeni Kural'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Kural Adi</Label><Input className="mt-1" value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="Kural adi" /></div>
            <div><Label>Kosul</Label><Input className="mt-1" value={newRule.trigger} onChange={e => setNewRule(p => ({ ...p, trigger: e.target.value }))} placeholder="ornek: Yeni siparis" /></div>
            <div><Label className="mt-2">Eylem</Label><Select value={newRule.action} onValueChange={v => setNewRule(p => ({ ...p, action: v }))}><SelectTrigger className="w-full mt-1"><SelectValue placeholder="Eylem secin" /></SelectTrigger><SelectContent><SelectItem value="E-posta">E-posta</SelectItem><SelectItem value="Bildirim">Bildirim</SelectItem><SelectItem value="Fiyat Guncelle">Fiyat Guncelle</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>Durum</Label><Switch checked={newRule.isActive} onCheckedChange={v => setNewRule(p => ({ ...p, isActive: v }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRule(false)}>Iptal</Button>
            <Button onClick={handleNewRule}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
