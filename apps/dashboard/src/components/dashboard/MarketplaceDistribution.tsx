import React from 'react';

export default function MarketplaceDistribution() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex-1">
      <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Pazar Yeri Dağılımı</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-slate-800">Trendyol</span>
            <span className="font-medium text-slate-800">%45</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-slate-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-slate-800">Hepsiburada</span>
            <span className="font-medium text-slate-800">%30</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-slate-800">Amazon</span>
            <span className="font-medium text-slate-800">%15</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-slate-300 h-1.5 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-slate-800">B2B Portal</span>
            <span className="font-medium text-slate-800">%10</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-slate-200 h-1.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
