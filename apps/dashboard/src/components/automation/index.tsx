'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Zap, Clock, Play, GripVertical, CheckCircle2, AlertTriangle, Plus, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  runCount: number;
  lastRun: string | null;
}

const MOCK_RULES: Rule[] = [
  { id: 'r1', name: 'Trendyol Stok Senkronizasyonu (15 dk)', trigger: 'Her 15 dakikada bir', action: 'Trendyol mağaza stoğunu ana depo ile eşitle', isActive: true, runCount: 12450, lastRun: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 'r2', name: 'Düşük Stok Fiyat Artışı', trigger: 'Stok < 5 olduğunda', action: 'Fiyatı %10 artır (Amazon TR)', isActive: true, runCount: 840, lastRun: new Date(Date.now() - 3600000).toISOString() },
  { id: 'r3', name: 'Hafta Sonu Kampanya İndirimi', trigger: 'Cuma 18:00', action: 'Tüm kategorilerde %5 indirim uygula', isActive: false, runCount: 52, lastRun: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'r4', name: 'Yeni Ürün Feed Aktarımı', trigger: 'Yeni ürün eklendiğinde', action: 'Google Merchant Center feedine gönder', isActive: true, runCount: 312, lastRun: new Date(Date.now() - 48 * 3600000).toISOString() },
];

export default function Automation() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRules(MOCK_RULES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const moveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newRules = [...rules];
      const temp = newRules[index];
      newRules[index] = newRules[index - 1];
      newRules[index - 1] = temp;
      setRules(newRules);
    } else if (direction === 'down' && index < rules.length - 1) {
      const newRules = [...rules];
      const temp = newRules[index];
      newRules[index] = newRules[index + 1];
      newRules[index + 1] = temp;
      setRules(newRules);
    }
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="space-y-4 mt-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-md bg-slate-200" />)}
          </div>
        </div>
      </div>
    );
  }

  const activeCount = rules.filter(r => r.isActive).length;
  const totalRuns = rules.reduce((a, b) => a + b.runCount, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            Veri Otomasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Fiyat, stok ve entegrasyon otomasyonlarınızı yönetin</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Yeni Kural Ekle
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Kural</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{rules.length}</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktif Kurallar</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{activeCount}</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <Zap className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Çalışma</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{totalRuns.toLocaleString('tr-TR')}</p>
          </div>
          <div className="p-2.5 rounded-md bg-violet-50 border border-violet-100">
            <Play className="h-5 w-5 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-500">
          <RefreshCw className="h-4 w-4" />
          <span>Kurallar yukarıdan aşağıya doğru öncelik sırasına göre çalıştırılır.</span>
        </div>

        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={rule.id} className={`bg-white rounded-md border shadow-sm transition-all overflow-hidden flex items-center ${rule.isActive ? 'border-l-4 border-l-emerald-500 border-y-slate-200 border-r-slate-200' : 'border-l-4 border-l-slate-300 border-y-slate-200 border-r-slate-200'}`}>
              
              {/* Order Controls */}
              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border-r border-slate-100 self-stretch">
                <button 
                  onClick={() => moveRule(index, 'up')} 
                  disabled={index === 0} 
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                <button 
                  onClick={() => moveRule(index, 'down')} 
                  disabled={index === rules.length - 1} 
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Rule Content */}
              <div className="p-5 flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold text-base ${rule.isActive ? 'text-slate-800' : 'text-slate-500'}`}>{rule.name}</h3>
                    {rule.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Aktif</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Pasif</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 mt-3">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-slate-400 font-medium">Tetikleyici:</span> <strong className="text-slate-700">{rule.trigger}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <Play className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-slate-400 font-medium">Aksiyon:</span> <strong className="text-slate-700">{rule.action}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-400 font-medium">Çalışma:</span> <strong>{rule.runCount.toLocaleString('tr-TR')} kez</strong>
                    </span>
                    {rule.lastRun && (
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Son çalışma: {new Date(rule.lastRun).toLocaleString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Switch */}
                <div className="shrink-0 pl-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 mt-4 md:mt-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={rule.isActive} onChange={() => toggleRule(rule.id)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
