import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StockHealth() {
  const lowStock = [
    { id: '1', name: 'iPhone 15 Pro Max Kılıf', sku: 'IPH15-01', stock: 5, category: 'Aksesuar' },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24', stock: 2, category: 'Telefon' },
    { id: '3', name: 'Apple Watch Series 9 Kordon', sku: 'APW-09', stock: 0, category: 'Giyilebilir' },
    { id: '4', name: 'MacBook Pro M3 Adaptör', sku: 'MAC-ADP', stock: 8, category: 'Bilgisayar' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Düşük Stok Uyarıları
        </h3>
        {lowStock.length > 0 && (
          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-100">
            {lowStock.length} ürün
          </span>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Ürün Adı</th>
              <th className="py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">SKU</th>
              <th className="py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Kategori</th>
              <th className="py-2 text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider">Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lowStock.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 text-[12px] text-slate-800 font-medium max-w-[120px] truncate pr-2">
                  {p.name}
                </td>
                <td className="py-2.5 text-[11px] text-slate-500 font-mono">
                  {p.sku}
                </td>
                <td className="py-2.5 hidden sm:table-cell">
                  <span className="text-[10px] text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                    {p.category}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                      p.stock === 0
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}
                  >
                    {p.stock === 0 ? 'Tükendi' : p.stock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
