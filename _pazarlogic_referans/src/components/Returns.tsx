'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { RotateCcw, TrendingDown } from 'lucide-react';

interface ReturnItem {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  status: string;
  totalAmount: number;
  refundAmount: number;
  type: string;
  createdAt: string;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Beklemede', cls: 'bg-amber-100 text-amber-800' },
  processing: { label: 'Isleniyor', cls: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Onaylandi', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Reddedildi', cls: 'bg-red-100 text-red-800' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export default function Returns() {
  const { sidebarOpen } = useAppStore();
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/returns')
      .then((r) => r.json())
      .then((d) => setReturns(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const totalReturns = returns.length;
  const totalRefund = returns.reduce((a, b) => a + b.refundAmount, 0);
  const pending = returns.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Iade Yonetimi</h1>
        <div className="animate-pulse grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Iade & Iptal Yonetimi</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Iade</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalReturns}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                <RotateCcw className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Bekleyen</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Iade Tutari</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(totalRefund)}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Iade No</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Siparis</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Musteri</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Neden</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Tur</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Tutar</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Iade</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => {
                  const st = statusMap[r.status] || statusMap.pending;
                  return (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{r.returnNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{r.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{r.customerName}</td>
                      <td className="py-3 px-4 text-slate-500">{r.reason}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {r.type === 'full' ? 'Tam' : 'Kismi'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{fmt(r.totalAmount)}</td>
                      <td className="py-3 px-4 text-right text-red-600">{fmt(r.refundAmount)}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${st.cls} text-xs`}>{st.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
