import React from 'react';
import { Link, CheckCircle, Clock } from 'lucide-react';
import type { Feed } from './types';

interface FeedStatsProps {
  feeds: Feed[];
}

export default function FeedStats({ feeds }: FeedStatsProps) {
  const activeFeeds = feeds.filter((f) => f.status === 'active').length;
  
  const lastSuccessfulImport = feeds
    .filter((f) => f.lastImport)
    .sort((a, b) => new Date(b.lastImport as string).getTime() - new Date(a.lastImport as string).getTime())[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Toplam Feed */}
      <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_8px_30px_rgba(45,52,53,0.06)] flex items-center justify-between transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-sm font-medium text-[#5f5e61] mb-1">Toplam Feed</p>
          <p className="text-3xl font-semibold text-[#2d3435]">{feeds.length}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f4f4]">
          <Link className="h-6 w-6 text-[#5f5e61]" />
        </div>
      </div>

      {/* Aktif Feed */}
      <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_8px_30px_rgba(45,52,53,0.06)] flex items-center justify-between transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-sm font-medium text-[#5f5e61] mb-1">Aktif Feed</p>
          <p className="text-3xl font-semibold text-emerald-700">{activeFeeds}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      {/* Son Başarılı Import */}
      <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_8px_30px_rgba(45,52,53,0.06)] flex items-center justify-between transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-sm font-medium text-[#5f5e61] mb-1">Son Başarılı Import</p>
          <p className="text-lg font-semibold text-[#2d3435]">
            {lastSuccessfulImport && lastSuccessfulImport.lastImport
              ? new Date(lastSuccessfulImport.lastImport).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
          <Clock className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}
