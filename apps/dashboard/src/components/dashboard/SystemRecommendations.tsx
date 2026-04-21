import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function SystemRecommendations() {
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-4 h-4 text-slate-600" />
        <h3 className="text-[13px] font-semibold text-slate-800">Sistem Önerileri</h3>
      </div>

      <div className="text-[12px] text-slate-700 leading-relaxed space-y-3">
        <div className="bg-white p-3 rounded border border-slate-100 border-l-2 border-l-amber-500 shadow-sm">
          <strong className="block text-amber-700 mb-1">Stok Riski</strong>
          Stokta kalmama riski yüksek: <span className="font-medium">iPhone 15 Pro Max (256GB - Naturel Titanyum)</span>. Tahmini tükenme: 2 gün.
        </div>

        <div className="bg-white p-3 rounded border border-slate-100 shadow-sm text-slate-600">
          Son 24 saatte B2B portalında %15 trafik artışı gözlemlendi. Sunucu yükü normal.
        </div>
      </div>
    </div>
  );
}
