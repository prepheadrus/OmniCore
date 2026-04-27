'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Percent, Calendar, Tag, Plus, Search, CheckCircle2, Clock, PauseCircle, ChevronDown, Rocket, FileText, LayoutDashboard, Target } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  marketplace: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: string;
  budget: number;
  spent: number;
  revenue: number;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Büyük Yaz İndirimi', type: 'Yüzdelik', marketplace: 'Trendyol', discount: 15, startDate: '2025-06-01T00:00:00Z', endDate: '2025-06-30T23:59:59Z', status: 'draft', budget: 50000, spent: 0, revenue: 0 },
  { id: 'c2', name: 'Elektronik Hafta Sonu', type: 'Sabit Tutar', marketplace: 'Hepsiburada', discount: 200, startDate: '2025-05-10T00:00:00Z', endDate: '2025-05-12T23:59:59Z', status: 'active', budget: 20000, spent: 4500, revenue: 35000 },
  { id: 'c3', name: 'Amazon Prime Günü', type: 'Özel Fiyat', marketplace: 'Amazon TR', discount: 25, startDate: '2025-07-15T00:00:00Z', endDate: '2025-07-16T23:59:59Z', status: 'draft', budget: 100000, spent: 0, revenue: 0 },
  { id: 'c4', name: 'Eski Sezon Tasfiyesi', type: 'Yüzdelik', marketplace: 'N11', discount: 40, startDate: '2025-01-01T00:00:00Z', endDate: '2025-01-31T23:59:59Z', status: 'ended', budget: 15000, spent: 15000, revenue: 85000 },
  { id: 'c5', name: 'Web Sitesi 10. Yıl İndirimi', type: 'Sepet İndirimi', marketplace: 'Web Sitesi', discount: 10, startDate: '2025-03-01T00:00:00Z', endDate: '2025-03-10T23:59:59Z', status: 'active', budget: 30000, spent: 12000, revenue: 145000 },
];

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  active: { label: 'Aktif', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  draft: { label: 'Taslak / Beklemede', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  ended: { label: 'Sona Erdi', cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: PauseCircle },
};

const MP_COLORS: Record<string, string> = {
  'Trendyol': '#f27a1a',
  'Hepsiburada': '#ff6000',
  'Amazon TR': '#ff9900',
  'N11': '#5c3ebf',
  'Web Sitesi': '#10b981'
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setCampaigns(MOCK_CAMPAIGNS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const active = campaigns.filter(c => c.status === 'active').length;
  const totalRevenue = campaigns.reduce((acc, curr) => acc + curr.revenue, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 rounded-md bg-slate-200" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            Kampanya & İndirim Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Pazaryerleri ve web sitesi için tüm kampanyalarınızı tek bir ekrandan planlayın ve izleyin</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Yeni Kampanya Oluştur
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Kampanya</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{campaigns.length}</p>
            <p className="text-xs text-slate-400 mt-1">Tüm zamanlar</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktif Kampanya</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{active}</p>
            <p className="text-xs text-slate-400 mt-1">Şu an devam eden</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <Rocket className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Ciro Etkisi</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{fmt(totalRevenue)}</p>
            <p className="text-xs text-slate-400 mt-1">Kampanya kaynaklı satışlar</p>
          </div>
          <div className="p-2.5 rounded-md bg-violet-50 border border-violet-100">
            <Target className="h-5 w-5 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            placeholder="Kampanya ara..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="draft">Taslak / Beklemede</option>
            <option value="ended">Sona Erdi</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-300 rounded-md bg-white">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Kampanya bulunamadı.</p>
          </div>
        ) : (
          filteredCampaigns.map((c) => {
            const st = statusMap[c.status] || statusMap.draft;
            const StatusIcon = st.icon;
            const mpColor = MP_COLORS[c.marketplace] || '#64748b';
            
            const roiPct = c.spent > 0 ? ((c.revenue - c.spent) / c.spent) * 100 : 0;
            const spendPct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;

            return (
              <div key={c.id} className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.status === 'active' ? 'bg-emerald-500' : c.status === 'draft' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                
                <div className="p-5 pl-6 border-b border-slate-100 flex flex-col h-full justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight flex-1">{c.name}</h3>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${st.cls}`}>
                        <StatusIcon className="w-3 h-3" /> {st.label}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <Tag className="h-3 w-3 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 border border-slate-200">{c.type}</span>
                          <span className="font-bold text-slate-800">{c.type === 'Yüzdelik' ? `%${c.discount}` : c.type === 'Sabit Tutar' ? `${c.discount} ₺` : 'Özel'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <Rocket className="h-3 w-3 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mpColor }} />
                          <span>{c.marketplace}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <Calendar className="h-3 w-3 text-slate-500" />
                        </div>
                        <span>{new Date(c.startDate).toLocaleDateString('tr-TR')} - {new Date(c.endDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                      <span>Bütçe Kullanımı</span>
                      <span className={spendPct > 90 ? 'text-red-500' : 'text-slate-600'}>%{Math.round(spendPct)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${spendPct > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(spendPct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Harcama: <strong className="text-slate-800">{fmt(c.spent)}</strong></span>
                      <span className="text-slate-500">Bütçe: <strong className="text-slate-800">{fmt(c.budget)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-3 pl-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ciro Etkisi</span>
                    <span className="font-bold text-slate-800">{fmt(c.revenue)}</span>
                  </div>
                  {c.spent > 0 && (
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ROI</span>
                      <span className={`font-bold ${roiPct > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {roiPct > 0 ? '+' : ''}{roiPct.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
