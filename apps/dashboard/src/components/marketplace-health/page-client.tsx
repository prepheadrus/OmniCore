'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockHealthData } from './mock-data';

export default function MarketplaceHealthClient() {
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
            <Activity className="h-5 w-5 text-slate-500" />
            Pazar Yeri Sağlığı (Health)
          </h1>
          <p className="text-sm text-slate-500">
            Pazar yerlerindeki satıcı puanınızı (Seller Performance) ve ihlal uyarılarını yönetin.
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-8">
          Tüm İhlalleri İncele
        </Button>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[150px] font-medium text-slate-600">Pazar Yeri</TableHead>
                <TableHead className="font-medium text-slate-600">Metrik</TableHead>
                <TableHead className="font-medium text-slate-600">Durum</TableHead>
                <TableHead className="font-medium text-slate-600">Sınır</TableHead>
                <TableHead className="font-medium text-slate-600">Uyarı</TableHead>
                <TableHead className="text-right font-medium text-slate-600">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHealthData.map((item) => (
                <TableRow key={item.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell className="font-medium">{item.marketplace}</TableCell>
                  <TableCell>{item.metric}</TableCell>
                  <TableCell>
                    {item.status === 'healthy' && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex w-max items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {item.value}
                      </Badge>
                    )}
                    {item.status === 'warning' && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex w-max items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {item.value}
                      </Badge>
                    )}
                    {item.status === 'critical' && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 flex w-max items-center gap-1">
                        <XCircle className="h-3 w-3" /> {item.value}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">{item.threshold}</TableCell>
                  <TableCell className="text-slate-600">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-[12px]">Detay</Button>
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