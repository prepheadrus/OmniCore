import TopMetrics from '../../components/dashboard/TopMetrics';
import SalesTrendsChart from '../../components/dashboard/SalesTrendsChart';
import MarketplaceDistribution from '../../components/dashboard/MarketplaceDistribution';
import StockHealth from '../../components/dashboard/StockHealth';
import SystemRecommendations from '../../components/dashboard/SystemRecommendations';
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable';
import RecentActivityPanel from '../../components/dashboard/RecentActivityPanel';
import { Calendar, ChevronDown, Activity } from 'lucide-react';

export default function Index() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.5rem] font-semibold text-slate-800 tracking-tight">Gösterge Paneli</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Tüm entegrasyonlarınızın genel görünümü</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Sistem Canlı</span>
          </div>

          <div className="flex items-center space-x-2 text-[12px] text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Son 30 Gün</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Row 1: Metric Cards */}
      <TopMetrics />

      {/* Row 2: Charts (Sales Trends & Marketplace Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SalesTrendsChart />
        </div>
        <div className="lg:col-span-2">
          <MarketplaceDistribution />
        </div>
      </div>

      {/* Row 3: Stock, AI Insights, Recent Activity & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="h-[250px]">
             <StockHealth />
          </div>
          <div className="flex-1">
             <RecentActivityPanel />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className="h-auto">
             <SystemRecommendations />
           </div>
           <div className="flex-1">
             <RecentOrdersTable />
           </div>
        </div>
      </div>
    </div>
  );
}
