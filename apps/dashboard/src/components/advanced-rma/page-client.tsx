'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@omnicore/ui/components/ui/table';
import { Button } from '@omnicore/ui/components/ui/button';
import { Undo, ShieldAlert, PackageCheck, Trash2 } from 'lucide-react';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';
import { mockRmaData } from './mock-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@omnicore/ui/components/ui/sheet';
import { Label } from '@omnicore/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@omnicore/ui/components/ui/select';
import { Textarea } from '@omnicore/ui/components/ui/textarea';

export default function AdvancedRmaClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedRma, setSelectedRma] = useState<any>(null);

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending_inspection': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">İnceleniyor</Badge>;
      case 'quarantine': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Karantina (Hasarlı)</Badge>;
      case 'restocked': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Stoka Döndü</Badge>;
      case 'scrapped': return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Hurdaya Ayrıldı</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium text-slate-900 tracking-tight flex items-center gap-2">
            <Undo className="h-5 w-5 text-slate-500" />
            İleri Ters Lojistik (RMA)
          </h1>
          <p className="text-sm text-slate-500">
            İade edilen ürünlerin depo kabulünü, kalite kontrolünü ve yeniden stoklandırma süreçlerini yönetin.
          </p>
        </div>
        <Button size="sm" className="h-8 bg-slate-900 text-white">
          Yeni İade Kabulü
        </Button>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[120px] font-medium text-slate-600">RMA No</TableHead>
                <TableHead className="font-medium text-slate-600">Sipariş / Pazar Yeri</TableHead>
                <TableHead className="font-medium text-slate-600">Ürün & Müşteri</TableHead>
                <TableHead className="font-medium text-slate-600">İade Nedeni</TableHead>
                <TableHead className="font-medium text-slate-600">Durum</TableHead>
                <TableHead className="text-right font-medium text-slate-600">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRmaData.map((item) => (
                <TableRow key={item.id} className="text-[13px] hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{item.orderNo}</span>
                      <span className="text-slate-500 text-[11px]">{item.marketplace}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="truncate w-[200px]">{item.product}</span>
                      <span className="text-slate-500 text-[11px]">{item.customer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{item.reason}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-[12px]" onClick={() => setSelectedRma(item)}>
                      Kontrol Et
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedRma} onOpenChange={() => setSelectedRma(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Kalite Kontrol Formu</SheetTitle>
            <SheetDescription>
              {selectedRma?.id} numaralı iadenin depo kabulünü gerçekleştirin.
            </SheetDescription>
          </SheetHeader>
          {selectedRma && (
            <div className="space-y-6 mt-6">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Ürün Bilgisi</Label>
                <p className="text-sm font-medium">{selectedRma.product}</p>
              </div>
              <div className="space-y-3">
                <Label>Karar</Label>
                <Select defaultValue="restock">
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seçim yapın" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Sorunsuz - Ana Stoka Ekle</SelectItem>
                    <SelectItem value="quarantine">Hasarlı - Karantinaya Al</SelectItem>
                    <SelectItem value="b_grade">B Kalite - Outlet Stoka Ekle</SelectItem>
                    <SelectItem value="scrap">Kullanılamaz - Hurdaya Ayır</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Kontrol Notları</Label>
                <Textarea placeholder="Kutu hasarlı ancak ürün sağlam..." className="resize-none" />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedRma(null)}>İptal</Button>
                <Button className="bg-slate-900 text-white">Kaydet ve Kapat</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}