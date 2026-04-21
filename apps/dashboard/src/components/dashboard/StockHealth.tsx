import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StockHealth() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex-1 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[13px] font-semibold text-slate-800">Stok Sağlığı</h3>
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <span className="text-[12px] text-slate-500">Kritik Stok Uyarıları</span>
          <span className="text-[12px] font-bold text-red-600">3 Ürün</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[12px] text-slate-500">Ort. Stok Devir Hızı</span>
          <span className="text-[12px] font-bold text-slate-800">14.2 gün</span>
        </div>
      </div>
    </div>
  );
}
