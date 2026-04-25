'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { Bot, Zap, Clock, Play, GripVertical } from 'lucide-react';

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

  useEffect(() => {
    fetch('/api/automation')
      .then((r) => r.json())
      .then((d) => setRules(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

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
      setRules((items) => {
        const oldIndex = items.findIndex((r) => r.id === active.id);
        const newIndex = items.findIndex((r) => r.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Otomasyonlar</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-200 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  const activeCount = rules.filter((r) => r.isActive).length;
  const totalRuns = rules.reduce((a, b) => a + b.runCount, 0);

  return (
    <div
      className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
    >
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Otomasyon Kurallari</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Kural</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{rules.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500">
                <Play className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
        <GripVertical className="h-3.5 w-3.5" />
        <span>Sürükle Bırak ile Öncelik Sırala</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
        {rules.map((rule, index) => (
          <SortableRuleItem key={rule.id} id={rule.id}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800">{rule.name}</h3>
                    <Badge
                      className={
                        rule.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }
                    >
                      {rule.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Tetikleyici: {rule.trigger}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      Aksiyon: {rule.action}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Calisma: {rule.runCount}
                    </span>
                    {rule.lastRun && (
                      <span>Son: {new Date(rule.lastRun).toLocaleString('tr-TR')}</span>
                    )}
                  </div>
                </div>
                <Switch checked={rule.isActive} />
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
                <p className="font-semibold text-slate-800">{rules.find((r) => r.id === activeId)?.name}</p>
                <p className="text-xs text-slate-500 mt-1">Öncelik: #{rules.findIndex((r) => r.id === activeId) + 1}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
