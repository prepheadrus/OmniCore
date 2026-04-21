import React from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Banknote, Clock, ArrowDownToLine, ShoppingBag, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const metrics = [
  {
    title: 'Toplam Satış',
    value: '₺1.245.000',
    trend: '%12.5',
    trendType: 'up',
    trendText: 'geçen aya göre',
    icon: Banknote,
    iconColor: 'text-slate-600',
  },
  {
    title: 'Bekleyen Sipariş',
    value: '342',
    trend: '-',
    trendType: 'neutral',
    trendText: 'normal seviye',
    icon: Clock,
    iconColor: 'text-amber-600',
  },
  {
    title: 'İade Oranı',
    value: '%2.4',
    trend: '%0.3',
    trendType: 'down-good', // Down is good for returns
    trendText: 'iyileşme',
    icon: ArrowDownToLine,
    iconColor: 'text-red-700',
  },
  {
    title: 'Ort. Sepet Tutarı',
    value: '₺845',
    trend: '%4.1',
    trendType: 'up',
    trendText: 'geçen aya göre',
    icon: ShoppingBag,
    iconColor: 'text-emerald-700',
  },
];

export function TopMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        let TrendIcon = ArrowUp;
        let trendColor = 'text-emerald-700';

        if (metric.trendType === 'neutral') {
          TrendIcon = Minus;
          trendColor = 'text-slate-500';
        } else if (metric.trendType === 'down-good') {
          TrendIcon = ArrowDown;
          trendColor = 'text-emerald-700'; // Decrease in return rate is good
        } else if (metric.trendType === 'down-bad') {
          TrendIcon = ArrowDown;
          trendColor = 'text-red-600';
        }

        return (
          <Card key={index} className="shadow-sm border-slate-200/60 bg-white">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">
                  {metric.title}
                </span>
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>

              <div>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">
                  {metric.value}
                </div>
                <div className="flex items-center gap-1 text-[12px] mt-1">
                  <span className={`flex items-center font-medium ${trendColor}`}>
                    {metric.trend !== '-' && <TrendIcon className="w-3.5 h-3.5 mr-0.5" />}
                    {metric.trend}
                  </span>
                  <span className="text-slate-400">{metric.trendText}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
