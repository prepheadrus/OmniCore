'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { ShoppingCart, Send } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockProcurementData } from './mock-data';

export default function AutoProcurementClient() {
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
            <ShoppingCart className="h-5 w-5 text-slate-500" />
            Otonom Satınalma (Reorder Point)
          </h1>
          <p className="text-sm text-slate-500">
            Satış hızı ve tedarik süresine göre bitmek üzere olan ürünler için otomatik satınalma önerileri.
          </p>
        </div>
        <Button size="sm" className="h-8 bg-slate-900 text-white">
          Tüm Taslakları Onayla
        </Button>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-medium text-slate-600">Ürün & Tedarikçi</TableHead>
                <TableHead className="font-medium text-slate-600">Satış Hızı</TableHead>
                <TableHead className="font-medium text-slate-600 text-rose-600">Stok Bitiş</TableHead>
                <TableHead className="font-medium text-slate-600">Önerilen Adet</TableHead>
                <TableHead className="font-medium text-slate-600">Maliyet</TableHead>
                <TableHead className="text-right font-medium text-slate-600">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProcurementData.map((item) => (
                <TableRow key={item.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.product}</span>
                      <span className="text-slate-500 text-[11px]">{item.supplier}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{item.velocity}</TableCell>
                  <TableCell className="text-rose-600 font-medium">{item.stockOutDays}</TableCell>
                  <TableCell className="font-medium">{item.suggestedQty} Adet</TableCell>
                  <TableCell className="text-slate-600">{item.totalCost}</TableCell>
                  <TableCell className="text-right">
                    {item.status === 'draft_ready' ? (
                      <Button size="sm" className="h-7 text-[12px] bg-slate-900 text-white flex items-center gap-1">
                        <Send className="h-3 w-3" /> Sipariş Geç
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sipariş Verildi</Badge>
                    )}
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