import TopMetrics from '../../components/dashboard/TopMetrics';
import SalesTrendsChart from '../../components/dashboard/SalesTrendsChart';
import MarketplaceDistribution from '../../components/dashboard/MarketplaceDistribution';
import StockHealth from '../../components/dashboard/StockHealth';
import SystemRecommendations from '../../components/dashboard/SystemRecommendations';
import RecentOrdersTable from '../../components/dashboard/RecentOrdersTable';
import { Calendar, ChevronDown } from 'lucide-react';

export default function Index() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[1.5rem] font-semibold text-slate-800 tracking-tight">Genel Bakış</h2>
        <div className="flex items-center space-x-2 text-[12px] text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Son 30 Gün</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Metric Cards */}
      <TopMetrics />

      {/* Middle Section: Charts & Operational Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendsChart />
        </div>
        <div className="flex flex-col space-y-6">
          <MarketplaceDistribution />
          <StockHealth />
        </div>
      </div>

      {/* Bottom Section: AI Insights & Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SystemRecommendations />
        </div>
        <div className="lg:col-span-3">
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
}
