'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { Crosshair, PlusCircle } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockRecommendationData } from './mock-data';

export default function RecommendationsClient() {
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

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'cross_sell': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Çapraz Satış</Badge>;
      case 'upsell': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Üst Satış</Badge>;
      case 'bundle': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Set (Bundle)</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium text-slate-900 tracking-tight flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-slate-500" />
            Akıllı Öneri Motoru
          </h1>
          <p className="text-sm text-slate-500">
            Geçmiş satış verilerinden öğrenerek ürün bazlı Upsell, Cross-sell ve Set önerilerini yönetin.
          </p>
        </div>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-medium text-slate-600">Ana Ürün</TableHead>
                <TableHead className="font-medium text-slate-600">Önerilen Ürün / Aksiyon</TableHead>
                <TableHead className="font-medium text-slate-600">Taktik</TableHead>
                <TableHead className="font-medium text-slate-600">Güven Skoru</TableHead>
                <TableHead className="font-medium text-slate-600">Potansiyel Gelir</TableHead>
                <TableHead className="text-right font-medium text-slate-600">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecommendationData.map((item) => (
                <TableRow key={item.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell className="font-medium">{item.baseProduct}</TableCell>
                  <TableCell className="text-slate-600">{item.recommendedProduct}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">{item.confidence}</TableCell>
                  <TableCell className="text-slate-600">{item.potentialRevenue}</TableCell>
                  <TableCell className="text-right">
                    {item.status === 'active' ? (
                      <Button variant="outline" size="sm" className="h-7 text-[12px] bg-slate-50" disabled>Devrede</Button>
                    ) : (
                      <Button variant="default" size="sm" className="h-7 text-[12px] bg-slate-900 text-white flex items-center gap-1">
                        <PlusCircle className="h-3 w-3" /> Uygula
                      </Button>
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