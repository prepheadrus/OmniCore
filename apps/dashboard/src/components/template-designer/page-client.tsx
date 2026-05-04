'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { Printer, Edit3 } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockTemplates } from './mock-data';

export default function TemplateDesignerClient() {
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

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'shipping_label': return 'Kargo Etiketi';
      case 'invoice': return 'Fatura/İrsaliye';
      case 'product_barcode': return 'Ürün Barkodu';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="h-5 w-5 text-slate-500" />
            Etiket & Fatura Şablonları
          </h1>
          <p className="text-sm text-slate-500">
            Termal yazıcılar ve A4 çıktılar için sürükle bırak şablonlar oluşturun.
          </p>
        </div>
        <Button size="sm" className="h-8 bg-slate-900 text-white">
          Yeni Şablon Tasarla
        </Button>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-medium text-slate-600">Şablon Adı</TableHead>
                <TableHead className="font-medium text-slate-600">Türü</TableHead>
                <TableHead className="font-medium text-slate-600">Yazıcı Formatı</TableHead>
                <TableHead className="font-medium text-slate-600">Son Güncelleme</TableHead>
                <TableHead className="font-medium text-slate-600">Durum</TableHead>
                <TableHead className="text-right font-medium text-slate-600">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTemplates.map((item) => (
                <TableRow key={item.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-slate-600">{getTypeLabel(item.type)}</TableCell>
                  <TableCell className="text-slate-600">{item.printerType}</TableCell>
                  <TableCell className="text-slate-500">{item.lastModified}</TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Pasif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-[12px] flex items-center gap-1 ml-auto">
                      <Edit3 className="h-3 w-3" /> Tasarla
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