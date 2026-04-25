"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const data = [
  { name: "Pzt", amount: 150000 },
  { name: "Sal", amount: 200000 },
  { name: "Çar", amount: 120000 },
  { name: "Per", amount: 280000 },
  { name: "Cum", amount: 180000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white text-[11px] px-2 py-1 rounded shadow-md">
        ₺{payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

export default function SalesTrendsChart() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col h-[320px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[13px] font-semibold text-slate-800">Satış Trendleri</h3>
        <span className="text-[12px] text-slate-500">Satış Tutarı (₺)</span>
      </div>

      <div className="flex-1 w-full h-full border-b border-l border-slate-100">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.amount > 250000 ? "#4f46e5" : "#e2e8f0"}
                  className="hover:fill-indigo-500 transition-colors duration-300"
                />
              ))}
            </Bar>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              dy={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
