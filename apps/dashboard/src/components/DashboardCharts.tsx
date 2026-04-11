"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Domain-agnostic mock data
const mockData = [
  {
    name: "Bluetooth Kulaklık",
    maliyet: 300,
    komisyon: 50,
    netKar: 150,
  },
  {
    name: "Pamuklu Tişört",
    maliyet: 100,
    komisyon: 20,
    netKar: 80,
  },
  {
    name: "Matara",
    maliyet: 50,
    komisyon: 10,
    netKar: 40,
  },
  {
    name: "Klavye",
    maliyet: 400,
    komisyon: 80,
    netKar: 220,
  },
];

export default function DashboardCharts() {
  return (
    <div className="w-full h-96 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Kârlılık Analizi</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={mockData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{ fill: "transparent" }} />
          <Legend />
          <Bar dataKey="maliyet" stackId="a" fill="#8884d8" name="Maliyet" />
          <Bar dataKey="komisyon" stackId="a" fill="#ffc658" name="Komisyon" />
          <Bar dataKey="netKar" stackId="a" fill="#82ca9d" name="Net Kâr" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
