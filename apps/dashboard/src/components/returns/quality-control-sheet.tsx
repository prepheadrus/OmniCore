"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@omnicore/ui/components/ui/sheet";
import { Button } from "@omnicore/ui/components/ui/button";
import { Label } from "@omnicore/ui/components/ui/label";
import { Textarea } from "@omnicore/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";
import { ReturnOrder } from './mock-data';
import { toast } from "sonner";

interface QualityControlSheetProps {
  isOpen: boolean;
  onClose: () => void;
  returnOrder: ReturnOrder | null;
}

export function QualityControlSheet({ isOpen, onClose, returnOrder }: QualityControlSheetProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrder) return;

    // Simulate API call
    toast.success("Kalite kontrol tamamlandı", {
      description: `${returnOrder.id} numaralı iadenin depo kararı sisteme işlendi.`
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Kalite Kontrol Formu</SheetTitle>
          <SheetDescription>
            {returnOrder?.id} numaralı iadenin depo kabulünü gerçekleştirin.
          </SheetDescription>
        </SheetHeader>

        {returnOrder && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Müşteri & Sipariş</Label>
              <p className="text-sm font-medium">{returnOrder.customer} - {returnOrder.orderId}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Müşterinin İade Nedeni</Label>
              <p className="text-sm font-medium">{returnOrder.reason}</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="decision">Depo Kararı</Label>
              <Select defaultValue="restock" required>
                <SelectTrigger id="decision" className="h-9">
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
              <Label htmlFor="qc-notes">Kontrol Notları</Label>
              <Textarea
                id="qc-notes"
                placeholder="Örn: Kutu hasarlı ancak ürün sağlam..."
                className="resize-none"
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" className="bg-slate-900 text-white">
                Kaydet ve Kapat
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
