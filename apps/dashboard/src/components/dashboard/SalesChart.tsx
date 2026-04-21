'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Button } from '@omnicore/ui/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const dataWeekly = [
  { name: 'Pzt', sales: 40000 },
  { name: 'Sal', sales: 65000 },
  { name: 'Çar', sales: 35000 },
  { name: 'Per', sales: 120000 },
  { name: 'Cum', sales: 85000 },
  { name: 'Cmt', sales: 50000 },
  { name: 'Paz', sales: 105000 },
];

const dataMonthly = [
  { name: 'Hafta 1', sales: 300000 },
  { name: 'Hafta 2', sales: 450000 },
  { name: 'Hafta 3', sales: 380000 },
  { name: 'Hafta 4', sales: 520000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white text-[11px] px-2 py-1 rounded shadow-md">
        <p className="font-medium">{`${label} : ₺${(payload[0].value / 1000).toFixed(0)}k`}</p>
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const data = viewMode === 'weekly' ? dataWeekly : dataMonthly;

  const yAxisTickFormatter = (value: number) => {
    if (value === 0) return '0';
    return `${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Card className="shadow-sm border-slate-200/60 h-full bg-white col-span-1 lg:col-span-2 flex flex-col">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[15px] font-semibold text-slate-800">Satış Trendi</h3>
          <div className="flex bg-slate-100 p-0.5 rounded-md">
            <Button
              variant="ghost"
              onClick={() => setViewMode('weekly')}
              className={`text-[12px] px-3 py-1 h-7 rounded-[4px] font-medium transition-colors ${
                viewMode === 'weekly' ? 'bg-white text-slate-800 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-transparent'
              }`}
            >
              Haftalık
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode('monthly')}
              className={`text-[12px] px-3 py-1 h-7 rounded-[4px] font-medium transition-colors ${
                viewMode === 'monthly' ? 'bg-white text-slate-800 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-transparent'
              }`}
            >
              Aylık
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              barSize={viewMode === 'weekly' ? 45 : 60}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={yAxisTickFormatter}
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[0, 'dataMax']}
              />
              <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
              <Bar
                dataKey="sales"
                fill="#cbd5e1"
                radius={[4, 4, 0, 0]}
                activeBar={{ fill: '#475569' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
