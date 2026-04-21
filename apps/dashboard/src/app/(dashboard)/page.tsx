import { Calendar, Download } from 'lucide-react';
import { TopMetrics } from '../../components/dashboard/TopMetrics';
import { SalesChart } from '../../components/dashboard/SalesChart';
import { AiInsights } from '../../components/dashboard/AiInsights';
import { ChannelBreakdown } from '../../components/dashboard/ChannelBreakdown';
import { RecentOrders } from '../../components/dashboard/RecentOrders';
import { Button } from '@omnicore/ui/components/ui/button';

export default function Index() {
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = `Bugün, ${today.toLocaleDateString('tr-TR', dateOptions)}`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Genel Bakış</h2>
          <p className="text-[13px] text-slate-500 mt-1">{formattedDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-slate-200 text-slate-700 rounded-md text-[12px] font-medium hover:bg-slate-50 transition-colors shadow-sm h-8">
            <Calendar className="w-4 h-4 text-slate-500" />
            Son 30 Gün
          </Button>
          <Button variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-slate-200 text-slate-700 rounded-md text-[12px] font-medium hover:bg-slate-50 transition-colors shadow-sm h-8">
            <Download className="w-4 h-4 text-slate-500" />
            Rapor
          </Button>
        </div>
      </div>

      {/* 2. Top Metrics Grid */}
      <TopMetrics />

      {/* 3. Bento Grid Layout (Charts & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (Spans 2 cols) */}
        <SalesChart />

        {/* Right Column Stack */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <AiInsights />
          <ChannelBreakdown />
        </div>
      </div>

      {/* 4. Recent Orders Table */}
      <RecentOrders />
    </div>
  );
}
