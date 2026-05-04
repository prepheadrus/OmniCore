'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { GitPullRequest, Settings2, Play, Pause } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockRoutingRules } from './mock-data';

export default function OrderRoutingClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium text-slate-900 tracking-tight flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-slate-500" />
            Akıllı Sipariş Yönlendirme (Order Routing)
          </h1>
          <p className="text-sm text-slate-500">
            Siparişleri müşteri adresine en yakın, stoğu uygun ve kargo maliyeti en düşük depoya otomatik yönlendirin.
          </p>
        </div>
        <Button size="sm" className="h-8 bg-slate-900 text-white">
          Yeni Kural Oluştur
        </Button>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[80px] font-medium text-slate-600">Öncelik</TableHead>
                <TableHead className="font-medium text-slate-600">Kural Adı</TableHead>
                <TableHead className="font-medium text-slate-600">Koşul</TableHead>
                <TableHead className="font-medium text-slate-600">Aksiyon (Yönlendirme)</TableHead>
                <TableHead className="font-medium text-slate-600">Eşleşen Sipariş</TableHead>
                <TableHead className="font-medium text-slate-600">Durum</TableHead>
                <TableHead className="text-right font-medium text-slate-600"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoutingRules.map((rule) => (
                <TableRow key={rule.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">#{rule.priority}</TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="text-slate-600">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{rule.condition}</code>
                  </TableCell>
                  <TableCell className="text-slate-600">{rule.action}</TableCell>
                  <TableCell className="text-slate-500">{rule.matches}</TableCell>
                  <TableCell>
                    {rule.status === 'active' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Duraklatıldı</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500">
                      {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 ml-1">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}