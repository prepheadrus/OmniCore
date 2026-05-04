'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { FileCheck2, Download } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockReconciliationData } from './mock-data';

export default function ReconciliationClient() {
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
            <FileCheck2 className="h-5 w-5 text-slate-500" />
            Finansal Mutabakat (Reconciliation)
          </h1>
          <p className="text-sm text-slate-500">
            Pazar yerlerinden gelen hakediş raporları ile sistemdeki net kâr/kesinti beklentilerinizi karşılaştırın.
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-8">
          <Download className="h-4 w-4 mr-2 text-slate-500" />
          Rapor Yükle
        </Button>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-medium text-slate-600">Dönem</TableHead>
                <TableHead className="font-medium text-slate-600">Pazar Yeri</TableHead>
                <TableHead className="text-right font-medium text-slate-600">Beklenen Hakediş</TableHead>
                <TableHead className="text-right font-medium text-slate-600">Yatan Tutar</TableHead>
                <TableHead className="text-right font-medium text-slate-600">Fark</TableHead>
                <TableHead className="font-medium text-slate-600 pl-6">Durum</TableHead>
                <TableHead className="font-medium text-slate-600">Detay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReconciliationData.map((item) => (
                <TableRow key={item.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{item.period}</TableCell>
                  <TableCell className="text-slate-600">{item.marketplace}</TableCell>
                  <TableCell className="text-right font-medium">{item.expectedAmount}</TableCell>
                  <TableCell className="text-right text-slate-600">{item.actualAmount}</TableCell>
                  <TableCell className={`text-right font-medium ${item.status === 'mismatched' ? 'text-rose-600' : 'text-slate-600'}`}>
                    {item.discrepancy}
                  </TableCell>
                  <TableCell className="pl-6">
                    {item.status === 'matched' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Eşleşti</Badge>}
                    {item.status === 'mismatched' && <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Fark Var</Badge>}
                    {item.status === 'pending' && <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Bekliyor</Badge>}
                  </TableCell>
                  <TableCell className="text-slate-500 text-[12px]">{item.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}