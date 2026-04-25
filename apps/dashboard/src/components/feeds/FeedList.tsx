import React, { useState } from 'react';
import { FileCode, FileSpreadsheet, Clock, RefreshCw, Trash2 } from 'lucide-react';
import type { Feed } from './types';

interface FeedListProps {
  feeds: Feed[];
  onToggleStatus: (feed: Feed) => Promise<void>;
  onSync: (feed: Feed) => Promise<void>;
  onDelete: (feed: Feed) => Promise<void>;
  syncingId: string | null;
}

const statusConfig: Record<string, { label: string; cls: string; border: string }> = {
  active: { label: 'Aktif', cls: 'bg-emerald-50 text-emerald-700', border: 'border-l-emerald-500' },
  paused: { label: 'Duraklatıldı', cls: 'bg-amber-50 text-amber-700', border: 'border-l-amber-500' },
  inactive: { label: 'Pasif', cls: 'bg-[#f2f4f4] text-[#5f5e61]', border: 'border-l-[#adb3b4]' },
};

const formatConfig: Record<string, { label: string; cls: string; Icon: typeof FileCode }> = {
  xml: { label: 'XML', cls: 'bg-blue-50 text-blue-700', Icon: FileCode },
  csv: { label: 'CSV', cls: 'bg-emerald-50 text-emerald-700', Icon: FileSpreadsheet },
  json: { label: 'JSON', cls: 'bg-indigo-50 text-indigo-700', Icon: FileSpreadsheet },
};

const scheduleLabels: Record<string, string> = {
  manual: 'Manuel',
  '30min': '30dk',
  hourly: '1 Saat',
  daily: 'Günlük',
};

export default function FeedList({ feeds, onToggleStatus, onSync, onDelete, syncingId }: FeedListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (feeds.length === 0) {
    return (
      <div className="bg-[#ffffff] rounded-2xl p-12 shadow-[0_8px_30px_rgba(45,52,53,0.06)] flex flex-col items-center justify-center text-[#5f5e61]">
        <FileCode className="h-16 w-16 mb-4 text-[#adb3b4]" />
        <p className="text-xl font-medium text-[#2d3435]">Henüz feed eklenmedi</p>
        <p className="text-sm mt-2">Yeni bir feed eklemek için sekmeyi kullanın.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {feeds.map((feed) => {
        const st = statusConfig[feed.status] ?? statusConfig.inactive;
        const fmt = formatConfig[feed.format] ?? formatConfig.xml;
        const FmtIcon = fmt.Icon;
        const validPercent = feed.totalProducts > 0 ? Math.round((feed.validProducts / feed.totalProducts) * 100) : 0;

        return (
          <div key={feed.id} className={`group relative bg-[#ffffff] rounded-2xl shadow-[0_8px_30px_rgba(45,52,53,0.06)] border-l-4 ${st.border} overflow-hidden transition-all hover:shadow-[0_12px_40px_rgba(45,52,53,0.08)]`}>
            <div className="p-6">
              {/* Top row */}
              <div className="flex items-start justify-between mb-5">
                <h3 className="font-semibold text-[#2d3435] text-lg">{feed.name}</h3>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${fmt.cls}`}>
                    <FmtIcon className="h-3.5 w-3.5" />
                    {fmt.label}
                  </span>
                  <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-[#f2f4f4] text-[#5f5e61] ring-1 ring-inset ring-[#adb3b4]/15">
                    {scheduleLabels[feed.schedule] ?? feed.schedule}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-[#5f5e61] mb-2">
                  <span>Ürün Kalitesi</span>
                  <span className="font-semibold text-[#2d3435]">{validPercent}%</span>
                </div>
                <div className="w-full bg-[#f2f4f4] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2d3435] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${validPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="rounded-xl bg-[#f2f4f4] p-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5f5e61] mb-1">Toplam</p>
                  <p className="text-xl font-bold text-[#2d3435]">{feed.totalProducts}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 mb-1">Geçerli</p>
                  <p className="text-xl font-bold text-emerald-800">{feed.validProducts}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-red-600 mb-1">Hatalı</p>
                  <p className="text-xl font-bold text-red-700">{feed.errorProducts}</p>
                </div>
              </div>

              {/* Last import */}
              <div className="flex items-center gap-2 text-sm text-[#5f5e61] mb-6">
                <Clock className="h-4 w-4 text-[#adb3b4]" />
                <span>
                  Son import:{' '}
                  {feed.lastImport
                    ? new Date(feed.lastImport).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Henüz yapılmadı'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-5 border-t border-[#adb3b4]/15">
                <div className="flex items-center gap-3 mr-auto">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={feed.status === 'active'}
                      onChange={() => onToggleStatus(feed)}
                    />
                    <div className="w-11 h-6 bg-[#adb3b4]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-xs font-medium text-[#5f5e61]">
                    {feed.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                  </span>
                </div>

                <button
                  disabled={syncingId === feed.id}
                  onClick={() => onSync(feed)}
                  className="flex items-center gap-2 rounded-lg bg-[#ffffff] px-3 py-2 text-sm font-semibold text-[#2d3435] shadow-sm ring-1 ring-inset ring-[#adb3b4]/30 hover:bg-[#f9f9f9] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncingId === feed.id ? 'animate-spin' : ''}`} />
                  {syncingId === feed.id ? 'Senkronize...' : 'Şimdi Senkronize Et'}
                </button>

                {/* Simple Delete Confirmation - without external dialog logic to keep it simple & dependency-free */}
                {deletingId === feed.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs px-2 py-1 text-[#5f5e61] hover:text-[#2d3435]"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => {
                        onDelete(feed);
                        setDeletingId(null);
                      }}
                      className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                    >
                      Eminim, Sil
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(feed.id)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
