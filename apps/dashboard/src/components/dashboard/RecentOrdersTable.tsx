import React from 'react';
import Link from 'next/link';

const recentOrders = [
  {
    id: '#ORD-9021',
    customer: 'Teknoloji A.Ş.',
    channel: 'Trendyol',
    amount: '₺45,200',
    date: '10:45, Bugün',
    status: 'Tamamlandı',
    channelColor: 'bg-orange-50 text-orange-700 border-orange-100',
    statusColor: 'text-emerald-700',
    statusDot: 'bg-emerald-500'
  },
  {
    id: '#ORD-9020',
    customer: 'Zeynep Yılmaz',
    channel: 'Amazon',
    amount: '₺3,450',
    date: '09:12, Bugün',
    status: 'Kargolandı',
    channelColor: 'bg-blue-50 text-blue-700 border-blue-100',
    statusColor: 'text-amber-700',
    statusDot: 'bg-amber-500'
  },
  {
    id: '#ORD-9019',
    customer: 'Global Dağıtım',
    channel: 'B2B Portal',
    amount: '₺128,000',
    date: '18:30, Dün',
    status: 'Bekliyor',
    channelColor: 'bg-slate-100 text-slate-700 border-slate-200',
    statusColor: 'text-slate-500',
    statusDot: 'bg-slate-400'
  },
  {
    id: '#ORD-9018',
    customer: 'Ahmet Kaya',
    channel: 'Hepsiburada',
    amount: '₺1,200',
    date: '16:15, Dün',
    status: 'Tamamlandı',
    channelColor: 'bg-purple-50 text-purple-700 border-purple-100',
    statusColor: 'text-emerald-700',
    statusDot: 'bg-emerald-500'
  }
];

export default function RecentOrdersTable() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-[13px] font-semibold text-slate-800">Son Siparişler</h3>
        <Link href="/orders" className="text-[12px] text-indigo-600 font-medium hover:underline">
          Tümünü Gör
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3 text-[12px] font-medium text-slate-500">Sipariş No</th>
              <th className="px-5 py-3 text-[12px] font-medium text-slate-500">Müşteri</th>
              <th className="px-5 py-3 text-[12px] font-medium text-slate-500">Kanal</th>
              <th className="px-5 py-3 text-[12px] font-medium text-slate-500 text-right">Tutar</th>
              <th className="px-5 py-3 text-[12px] font-medium text-slate-500">Tarih</th>
              <th className="px-5 py-3 text-[12px] font-medium text-slate-500">Durum</th>
            </tr>
          </thead>
          <tbody className="text-[12px] text-slate-800 divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 font-medium">{order.id}</td>
                <td className="px-5 py-3">{order.customer}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${order.channelColor}`}>
                    {order.channel}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium">{order.amount}</td>
                <td className="px-5 py-3 text-slate-500">{order.date}</td>
                <td className="px-5 py-3">
                  <div className={`flex items-center ${order.statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${order.statusDot}`}></span>
                    {order.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
