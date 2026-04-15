"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MockCompetitorDataProvider, CompetitorData } from "@omnicore/pricing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnicore/ui/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";
import { Badge } from "@omnicore/ui/components/ui/badge";

const mockProducts = [
  { id: "1", name: "Pakbey Konsantre Cam Suyu", sku: "PKB-001", price: 120, strategy: "ProfitMaximizationStrategy" },
  { id: "2", name: "Lastik Parlatıcı (400 ml)", sku: "PKB-002", price: 190, strategy: "AggressiveBuyboxStrategy" },
  { id: "3", name: "Demir Tozu Sökücü", sku: "PKB-003", price: 480, strategy: "ProfitMaximizationStrategy" },
  { id: "4", name: "5'li Fırça Seti", sku: "PKB-004", price: 166, strategy: "AggressiveBuyboxStrategy" },
];

export default function RadarPage() {
  const [chartData, setChartData] = useState<CompetitorData[]>([]);

  useEffect(() => {
    // Simulate data fetching
    const data = MockCompetitorDataProvider.getMockTimeSeriesData(500); // Assume base price is 500
    setChartData(data);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Rekabet Radarı</h1>
      </div>

      {/* Chart Section */}
      <div className="w-full bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-medium mb-6">Fiyat Trend Analizi</h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₺${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="myPrice"
                name="Bizim Fiyatımız"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="competitorPrice"
                name="Rakip Fiyatı"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full bg-card text-card-foreground rounded-lg shadow-sm border border-border">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-medium mb-4">Ürün Strateji Yönetimi</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Aktif Strateji</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-muted-foreground font-mono">
                    {product.sku}
                  </Badge>
                </TableCell>
                <TableCell>₺{product.price}</TableCell>
                <TableCell>
                  <Select defaultValue={product.strategy}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Strateji Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AggressiveBuyboxStrategy">
                        Saldırgan Buybox Stratejisi
                      </SelectItem>
                      <SelectItem value="ProfitMaximizationStrategy">
                        Kâr Maksimizasyonu Stratejisi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
