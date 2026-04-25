import React from 'react';

export default function MarketplaceDistribution() {
  const mpData = [
    { marketplace: 'Trendyol', orders: 450, revenue: '₺450K', color: 'bg-blue-500', bgClass: 'bg-blue-50', textClass: 'text-blue-700' },
    { marketplace: 'Hepsiburada', orders: 300, revenue: '₺300K', color: 'bg-orange-500', bgClass: 'bg-orange-50', textClass: 'text-orange-700' },
    { marketplace: 'Amazon', orders: 150, revenue: '₺150K', color: 'bg-amber-500', bgClass: 'bg-amber-50', textClass: 'text-amber-700' },
    { marketplace: 'N11', orders: 100, revenue: '₺100K', color: 'bg-purple-500', bgClass: 'bg-purple-50', textClass: 'text-purple-700' },
  ];
  const maxOrders = Math.max(...mpData.map((m) => m.orders), 1);

  const statuses = [
    { key: 'pending', label: 'Beklemede', n: 120, bar: 'bg-slate-300', text: 'text-slate-700' },
    { key: 'processing', label: 'Hazırlanıyor', n: 80, bar: 'bg-blue-400', text: 'text-blue-700' },
    { key: 'shipped', label: 'Kargoda', n: 250, bar: 'bg-amber-400', text: 'text-amber-700' },
    { key: 'delivered', label: 'Teslim Edildi', n: 550, bar: 'bg-emerald-500', text: 'text-emerald-700' },
    { key: 'cancelled', label: 'İptal', n: 20, bar: 'bg-red-400', text: 'text-red-700' },
  ];
  const total = statuses.reduce((acc, curr) => acc + curr.n, 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Marketplace Orders Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Pazaryerine Göre Siparişler</h3>
        <div className="space-y-4">
          {mpData.map((m) => (
            <div key={m.marketplace}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-slate-700">{m.marketplace}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{m.revenue}</span>
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${m.bgClass} ${m.textClass}`}>
                    {m.orders}
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${m.color}`}
                  style={{ width: `${(m.orders / maxOrders) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Sipariş Durumu Dağılımı</h3>
        <div className="space-y-3">
          {statuses.map((c) => {
            const pct = total > 0 ? (c.n / total) * 100 : 0;
            return (
              <div key={c.key} className="flex items-center gap-3 py-1">
                <span className="w-24 shrink-0 text-[12px] font-medium text-slate-700">{c.label}</span>
                <div className="flex-1 h-6 bg-slate-50 rounded-md overflow-hidden relative border border-slate-100">
                  <div
                    className={`h-full rounded-md transition-all duration-700 ease-out ${c.bar}`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  >
                    <span className={`absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-semibold ${pct > 15 ? c.text : 'text-slate-500'}`}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold min-w-[2rem] text-center px-1 py-0.5 rounded border border-slate-200 ${c.text}`}>
                  {c.n}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
