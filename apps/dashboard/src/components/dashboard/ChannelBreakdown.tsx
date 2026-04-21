import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@omnicore/ui/components/ui/card';

const channels = [
  { name: 'Trendyol', color: 'bg-orange-500', percentage: '%45', amount: '₺560k' },
  { name: 'Hepsiburada', color: 'bg-orange-600', percentage: '%30', amount: '₺373k' },
  { name: 'Amazon', color: 'bg-amber-500', percentage: '%15', amount: '₺186k' },
  { name: 'B2B Portal', color: 'bg-slate-700', percentage: '%10', amount: '₺124k' },
];

export function ChannelBreakdown() {
  return (
    <Card className="shadow-sm border-slate-200/60 bg-white flex-1 flex flex-col">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-[15px] font-semibold text-slate-800">Kanal Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-2 flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-4">
          {channels.map((channel) => (
            <div key={channel.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${channel.color}`}></div>
                <span className="text-[13px] font-medium text-slate-700">{channel.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-slate-400">{channel.percentage}</span>
                <span className="text-[13px] font-semibold text-slate-800 w-16 text-right">{channel.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
