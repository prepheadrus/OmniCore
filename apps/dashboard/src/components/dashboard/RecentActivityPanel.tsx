import React from 'react';
import { Clock } from 'lucide-react';

export default function RecentActivityPanel() {
  const recentActivity = [
    { id: '1', action: 'Güncelleme', entity: 'Stok Senkronizasyonu', details: 'Trendyol stokları güncellendi', time: '5 dk önce', actionColor: 'bg-amber-50 text-amber-700 border-amber-100' },
    { id: '2', action: 'Giriş', entity: 'Kullanıcı', details: 'Sisteme giriş yapıldı', time: '12 dk önce', actionColor: 'bg-blue-50 text-blue-700 border-blue-100' },
    { id: '3', action: 'Oluşturma', entity: 'Yeni Ürün', details: 'B2B portalına yeni ürün eklendi', time: '45 dk önce', actionColor: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: '4', action: 'Hata', entity: 'API Bağlantısı', details: 'Hepsiburada API zaman aşımı', time: '1 saat önce', actionColor: 'bg-red-50 text-red-700 border-red-100' },
    { id: '5', action: 'Silme', entity: 'Eski Siparişler', details: 'İptal edilen siparişler arşivlendi', time: '3 saat önce', actionColor: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <Clock className="h-4 w-4 text-slate-400" />
        <h3 className="text-[13px] font-semibold text-slate-800">Son Aktiviteler</h3>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {recentActivity.map((log) => (
          <div key={log.id} className="flex items-start gap-3 py-2 px-2 rounded hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="mt-0.5 shrink-0">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize ${log.actionColor}`}>
                {log.action}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-slate-700 truncate font-medium">
                {log.details}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {log.entity} • {log.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
