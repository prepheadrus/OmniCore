import React from 'react';
import { Banknote, ClipboardList, Undo2, Sparkles, TrendingUp, AlertTriangle, TrendingDown, Plug, Rss } from 'lucide-react';

export default function TopMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Card 1: Toplam Satış */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Toplam Ciro</span>
          <Banknote className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">₺1.2M</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            +12.5% <span className="text-slate-500 ml-1">geçen aya göre</span>
          </div>
        </div>
      </div>

      {/* Card 2: Bekleyen Siparişler */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Bekleyen</span>
          <ClipboardList className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">342</div>
          <div className="text-[11px] text-amber-700 mt-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            45 <span className="text-slate-500 ml-1">işlem bekliyor</span>
          </div>
        </div>
      </div>

      {/* Card 3: İade Oranı */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">İade Oranı</span>
          <Undo2 className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">2.4%</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center">
            <TrendingDown className="w-3 h-3 mr-1" />
            -0.5% <span className="text-slate-500 ml-1">iyileşme</span>
          </div>
        </div>
      </div>

      {/* Card 4: Entegrasyonlar (PazarLogic) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Bağlantılar</span>
          <Plug className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">5/6</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center">
            <span className="text-red-600 mr-1">1 bağlantı</span> koptu
          </div>
        </div>
      </div>

      {/* Card 5: Aktif Feed'ler (PazarLogic) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Aktif Feed</span>
          <Rss className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">12/15</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center">
            Son senk: 5 dk önce
          </div>
        </div>
      </div>

      {/* Card 6: Yapay Zeka Tahmini */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
          <Sparkles className="w-16 h-16 text-indigo-600" />
        </div>
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-[12px] font-medium text-indigo-600 flex items-center uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Tahmini
          </span>
        </div>
        <div className="relative z-10">
          <div className="text-[10px] text-slate-500 mb-0.5">Gelecek 7 Gün</div>
          <div className="text-lg font-bold text-slate-800">₺345K-380K</div>
        </div>
      </div>
    </div>
  );
}
