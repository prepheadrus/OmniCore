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
import { Input } from "@omnicore/ui/components/ui/input";
import { Label } from "@omnicore/ui/components/ui/label";
import { Textarea } from "@omnicore/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";
import { toast } from "sonner";

interface ReturnAcceptanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnAcceptanceSheet({ isOpen, onClose }: ReturnAcceptanceSheetProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    toast.success("İade başarıyla kaydedildi", {
      description: "Yeni iade kaydı sisteme eklendi ve ilgili süreçler başlatıldı."
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Yeni İade Kabulü</SheetTitle>
          <SheetDescription>
            Manuel olarak depoya gelen veya elden alınan bir iadeyi sisteme kaydedin.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNo">Sipariş Numarası</Label>
              <Input id="orderNo" placeholder="Örn: TR-123456789" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Müşteri Adı Soyadı</Label>
              <Input id="customerName" placeholder="Müşteri bilgisini girin" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Satış Kanalı</Label>
              <Select required defaultValue="trendyol">
                <SelectTrigger id="channel">
                  <SelectValue placeholder="Kanal seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trendyol">Trendyol</SelectItem>
                  <SelectItem value="hepsiburada">Hepsiburada</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="manuel">Manuel / Elden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">İade Nedeni</Label>
              <Select required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="İade nedeni seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Ürün Kusurlu/Hasarlı</SelectItem>
                  <SelectItem value="wrong_item">Yanlış Ürün Gönderildi</SelectItem>
                  <SelectItem value="not_as_described">Açıklamadaki Gibi Değil</SelectItem>
                  <SelectItem value="changed_mind">Vazgeçtim / Beğenmedim</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">İlk Durum (Depo Kararı)</Label>
              <Select defaultValue="INSPECTION_PENDING">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSPECTION_PENDING">İnceleniyor (Henüz karar verilmedi)</SelectItem>
                  <SelectItem value="RESTOCK">Sorunsuz - Ana Stoka Ekle</SelectItem>
                  <SelectItem value="quarantine">Hasarlı - Karantinaya Al</SelectItem>
                  <SelectItem value="DISPOSED">Kullanılamaz - Hurdaya Ayır</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ek Notlar</Label>
              <Textarea
                id="notes"
                placeholder="İade ile ilgili eklemek istediğiniz notlar..."
                className="resize-none h-24"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" className="bg-slate-900 text-white">
              Kaydet ve Oluştur
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
