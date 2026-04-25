'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { Megaphone, Percent, Calendar, Tag } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  marketplace: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: string;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-800' },
  draft: { label: 'Taslak', cls: 'bg-slate-100 text-slate-700' },
  ended: { label: 'Sona Erdi', cls: 'bg-red-100 text-red-700' },
};

export default function Campaigns() {
  const { sidebarOpen } = useAppStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((d) => setCampaigns(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Kampanyalar</h1>
        <div className="animate-pulse grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  const active = campaigns.filter((c) => c.status === 'active').length;

  return (
    <div
      className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
    >
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Kampanya &amp; Indirim Yonetimi</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Kampanya</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{campaigns.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Aktif Kampanya</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Ort. Indirim</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              %
              {campaigns.length > 0
                ? Math.round(campaigns.reduce((a, b) => a + b.discount, 0) / campaigns.length)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const st = statusMap[c.status] || statusMap.draft;
          return (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  <Badge className={`${st.cls} text-xs`}>
                    {st.label}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Percent className="h-3.5 w-3.5" />
                    <span>%{c.discount} indirim</span>
                  </div>
                  {c.marketplace && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{c.marketplace}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(c.startDate).toLocaleDateString('tr-TR')} -{' '}
                      {new Date(c.endDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
