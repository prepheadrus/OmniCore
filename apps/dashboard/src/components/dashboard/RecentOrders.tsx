import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@omnicore/ui/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@omnicore/ui/components/ui/table';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Button } from '@omnicore/ui/components/ui/button';

const recentOrders = [
  {
    id: '#ORD-9482',
    customer: 'Global Teknoloji A.Ş.',
    channel: 'B2B Portal',
    channelColor: 'bg-slate-100 text-slate-700 border-slate-200',
    amount: '₺12.450',
    date: '24 Eki, 14:30',
    status: 'Tamamlandı',
    statusColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500'
  },
  {
    id: '#ORD-9481',
    customer: 'Ayşe Yılmaz',
    channel: 'Trendyol',
    channelColor: 'bg-orange-50 text-orange-700 border-orange-200',
    amount: '₺850',
    date: '24 Eki, 13:15',
    status: 'Hazırlanıyor',
    statusColor: 'text-amber-700',
    dotColor: 'bg-amber-500'
  },
  {
    id: '#ORD-9480',
    customer: 'Mehmet Demir',
    channel: 'Amazon',
    channelColor: 'bg-blue-50 text-blue-700 border-blue-200',
    amount: '₺1.200',
    date: '24 Eki, 11:45',
    status: 'Tamamlandı',
    statusColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500'
  },
  {
    id: '#ORD-9479',
    customer: 'Zeynep Kaya',
    channel: 'Hepsiburada',
    channelColor: 'bg-orange-50 text-orange-700 border-orange-200',
    amount: '₺450',
    date: '24 Eki, 10:20',
    status: 'İptal Edildi',
    statusColor: 'text-red-700',
    dotColor: 'bg-red-500'
  },
];

export function RecentOrders() {
  return (
    <Card className="shadow-sm border-slate-200/60 bg-white overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-200/40 bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-[15px] font-semibold text-slate-800">Son Siparişler</CardTitle>
        <Button variant="link" className="text-[12px] text-slate-500 font-medium hover:text-slate-800 transition-colors p-0 h-auto">Tümünü Gör</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200/40 hover:bg-transparent">
                <TableHead className="py-2.5 px-4 font-medium text-[12px] text-slate-500 w-24 h-auto">Sipariş No</TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-[12px] text-slate-500 h-auto">Müşteri</TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-[12px] text-slate-500 h-auto">Satış Kanalı</TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-[12px] text-slate-500 h-auto">Tutar</TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-[12px] text-slate-500 h-auto">Tarih</TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-[12px] text-slate-500 h-auto">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-3 px-4 font-medium text-[13px] text-slate-600">{order.id}</TableCell>
                  <TableCell className="py-3 px-4 text-[13px] text-slate-800">{order.customer}</TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge variant="outline" className={`px-1.5 py-0.5 rounded text-[11px] font-medium border ${order.channelColor}`}>
                      {order.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 font-semibold text-[13px] text-slate-800">{order.amount}</TableCell>
                  <TableCell className="py-3 px-4 text-[12px] text-slate-500">{order.date}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className={`flex items-center gap-1.5 text-[12px] font-medium ${order.statusColor}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${order.dotColor}`}></div>
                      {order.status}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
