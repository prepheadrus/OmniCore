"use client";

import { useMemo } from "react";
import { CampaignData } from "./columns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Wallet, TrendingUp, Eye, MousePointerClick, Percent, Target } from "lucide-react";

interface AdvertisingDashboardProps {
  data: CampaignData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
};

export function AdvertisingDashboard({ data }: AdvertisingDashboardProps) {
  const metrics = useMemo(() => {
    let budget = 0;
    let spent = 0;
    let impressions = 0;
    let clicks = 0;
    let conversions = 0;

    data.forEach(camp => {
      budget += camp.budget;
      spent += camp.spent;
      impressions += camp.impressions;
      clicks += camp.clicks;
      conversions += camp.conversions;
    });

    const avgCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const avgRoas = spent > 0 ? (conversions * 150) / spent : 0; // Using 150 avg order value

    return { budget, spent, impressions, clicks, avgCtr, avgRoas };
  }, [data]);

  // Generate some mock trend data based on total spent
  const trendData = useMemo(() => {
    const dates = [];
    let currentSpent = metrics.spent * 0.4; // start lower
    let currentImps = metrics.impressions * 0.3;

    for (let i = 14; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const spentChange = currentSpent * (0.05 + Math.random() * 0.1);
      const impChange = currentImps * (0.05 + Math.random() * 0.1);

      currentSpent += spentChange;
      currentImps += impChange;

      dates.push({
        date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        harcama: Math.round(currentSpent / 14),
        gosterim: Math.round(currentImps / 14)
      });
    }
    return dates;
  }, [metrics]);

  const pieData = useMemo(() => {
    const types: Record<string, number> = { sponsored: 0, display: 0, video: 0, retargeting: 0 };
    data.forEach(c => {
      types[c.type] += c.spent;
    });

    return [
      { name: "Sponsored", value: types.sponsored, color: "#10b981" }, // emerald-500
      { name: "Display", value: types.display, color: "#3b82f6" },     // blue-500
      { name: "Video", value: types.video, color: "#f59e0b" },       // amber-500
      { name: "Retargeting", value: types.retargeting, color: "#ef4444" } // red-500
    ].filter(i => i.value > 0);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Adhering to Calm Design: Using soft pastel backgrounds with darker text instead of bright solid green */}
        <div className="p-4 rounded-md border border-emerald-100 bg-emerald-50/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
            <Wallet className="w-4 h-4" /> Toplam Bütçe
          </div>
          <div className="text-xl font-bold text-emerald-950">{formatCurrency(metrics.budget)}</div>
        </div>

        <div className="p-4 rounded-md border border-emerald-200 bg-emerald-100/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <TrendingUp className="w-4 h-4" /> Harcanan
          </div>
          <div className="text-xl font-bold text-emerald-950">{formatCurrency(metrics.spent)}</div>
          <div className="text-[10px] text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> %{((metrics.spent / metrics.budget) * 100 || 0).toFixed(1)} kullanım
          </div>
        </div>

        <div className="p-4 rounded-md border border-slate-200 bg-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Eye className="w-4 h-4" /> Toplam Gösterim
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.impressions.toLocaleString('tr-TR')}</div>
        </div>

        <div className="p-4 rounded-md border border-slate-200 bg-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <MousePointerClick className="w-4 h-4" /> Toplam Tıklama
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.clicks.toLocaleString('tr-TR')}</div>
        </div>

        <div className="p-4 rounded-md border border-slate-200 bg-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Percent className="w-4 h-4" /> Ortalama CTR
          </div>
          <div className="text-xl font-bold text-slate-900">%{metrics.avgCtr.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> İyi performans
          </div>
        </div>

        <div className="p-4 rounded-md border border-emerald-100 bg-emerald-50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
            <Target className="w-4 h-4" /> Ortalama ROAS
          </div>
          <div className="text-xl font-bold text-emerald-950">{metrics.avgRoas.toFixed(2)}x</div>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Mükemmel dönüşüm
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[300px]">
        {/* Trend Chart */}
        <div className="p-5 rounded-md border border-slate-200 bg-white flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Harcama Trendi</h3>
            <p className="text-xs text-slate-500">Son 14 günlük harcama ve gösterim</p>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="99%" minHeight={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'none', fontSize: '12px' }}
                  formatter={(value: any) => new Intl.NumberFormat("tr-TR").format(Number(value) || 0)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" name="Harcama (₺)" dataKey="harcama" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" name="Gösterim" dataKey="gosterim" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="p-5 rounded-md border border-slate-200 bg-white flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Performans Dağılımı</h3>
            <p className="text-xs text-slate-500">Kampanya türüne göre harcama oranı</p>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="99%" minHeight={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'none', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
