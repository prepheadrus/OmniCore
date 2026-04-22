"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, CheckCircle2, AlertTriangle, Plus, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@omnicore/ui/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import { Button } from "@omnicore/ui/components/ui/button";
import { Input } from "@omnicore/ui/components/ui/input";
import { Label } from "@omnicore/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";

import { invoiceFormSchema, InvoiceFormValues } from "./schema";

interface InvoiceFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<InvoiceFormValues>;
}

const defaultValues: Partial<InvoiceFormValues> = {
  supplierId: "",
  documentNo: "",
  date: new Date().toISOString().split("T")[0],
  currency: "TRY",
  exchangeRate: 1,
  items: [
    { name: "Endüstriyel Gres 5L", quantity: 10, unit: "Adet", unitPrice: 145, discountPercent: 0, totalAmount: 1450, isMatched: true, matchedSku: "SKU-9921" },
    { name: "Paslanmaz Civata M8", quantity: 50, unit: "Adet", unitPrice: 1.7, discountPercent: 5, totalAmount: 80.75, isMatched: false }
  ],
  subTotal: 2300,
  generalDiscountPercent: 5,
  taxAmount: 437,
  roundingDifference: 0,
  grandTotal: 2622,
};

export function InvoiceFormSheet({ isOpen, onClose, initialData }: InvoiceFormSheetProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData || defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: InvoiceFormValues) => {
    console.log("Invoice Data Submitted:", data);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col gap-0 p-0 border-l border-slate-200">
        <SheetHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <SheetTitle className="text-base font-semibold text-slate-900">Akıllı Fatura Kaydı</SheetTitle>
          <SheetDescription className="text-xs text-slate-500 mt-1">
            Yapay zeka destekli veri okuma
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50 space-y-6">
          {/* Dropzone Area */}
          <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 bg-indigo-50/30 text-center hover:border-indigo-400 hover:bg-indigo-50/60 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-slate-800 font-semibold text-sm">Sihirli Alan</p>
            <p className="text-xs text-slate-500 mt-1">Fatura Yüklemek İçin Sürükleyin veya Seçin</p>
            <p className="text-[10px] text-slate-400 mt-2 uppercase font-medium tracking-widest">XML • PDF • E-ARŞİV</p>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-slate-200 rounded-none h-auto p-0">
              <TabsTrigger value="details" className="text-xs font-semibold data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none rounded-none py-2 px-1">Fatura Detayı</TabsTrigger>
              <TabsTrigger value="items" className="text-xs font-medium text-slate-500 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-slate-900 data-[state=active]:shadow-none rounded-none py-2 px-1">Ürün Kalemleri</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs font-medium text-slate-500 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-slate-900 data-[state=active]:shadow-none rounded-none py-2 px-1">Ödeme</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase">Tedarikçi</Label>
                  <Select defaultValue="Zenith Endüstriyel A.Ş.">
                    <SelectTrigger className="h-9 bg-white text-sm">
                      <SelectValue placeholder="Tedarikçi Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zenith Endüstriyel A.Ş.">Zenith Endüstriyel A.Ş.</SelectItem>
                      <SelectItem value="Atlas Teknoloji Ltd.">Atlas Teknoloji Ltd.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase">Belge No</Label>
                  <Input defaultValue="INV-2023-0892" className="h-9 bg-white text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase">Tarih</Label>
                  <Input type="date" defaultValue="2024-06-12" className="h-9 bg-white text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase">Para Birimi</Label>
                  <Select defaultValue="TRY">
                    <SelectTrigger className="h-9 bg-white text-sm">
                      <SelectValue placeholder="Birim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                      <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase">Kur</Label>
                  <Input type="number" defaultValue="1.00" className="h-9 bg-white text-sm" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Ürün Kalemleri</h4>
                <Button variant="link" className="text-[11px] text-indigo-600 font-medium p-0 h-auto flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" /> Hepsini Eşleştir
                </Button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3 w-2/5">Ürün/Açıklama</th>
                      <th className="p-3">Miktar</th>
                      <th className="p-3">Birim Fiyat</th>
                      <th className="p-3">İsk %</th>
                      <th className="p-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fields.map((item, index) => {
                      const isMatched = form.watch(`items.${index}.isMatched`);
                      return (
                        <tr key={item.id} className={!isMatched ? "bg-amber-50/30" : ""}>
                          <td className="p-3 align-top">
                            <div className="font-medium text-slate-900">{form.watch(`items.${index}.name`)}</div>
                            <div className="mt-1.5 flex items-center">
                              {isMatched ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold">
                                  <CheckCircle2 className="h-3 w-3 mr-1 fill-emerald-100 text-emerald-600" />
                                  {form.watch(`items.${index}.matchedSku`)} EŞLEŞTİ
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase">
                                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                                  EŞLEŞMEDİ (YENİ KAYIT)
                                </span>
                              )}
                            </div>
                            {!isMatched && (
                                <div className="mt-2 flex gap-1 items-center">
                                    <div className="relative flex-1">
                                        <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input className="h-6 text-[10px] pl-6 py-0 bg-white" placeholder="Sistemden Seç" />
                                    </div>
                                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 bg-white">
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                          </td>
                          <td className="p-3 align-top">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                className="w-12 h-7 p-1 text-center bg-slate-50 border-slate-200 text-xs"
                                {...form.register(`items.${index}.quantity` as const)}
                              />
                              {!isMatched && <span className="text-indigo-600 font-bold text-[10px] bg-indigo-50 px-1 rounded cursor-pointer">x12</span>}
                              {isMatched && <span className="text-slate-400 font-medium text-xs">x1</span>}
                            </div>
                          </td>
                          <td className="p-3 align-top font-medium text-slate-700">
                             ₺{form.watch(`items.${index}.unitPrice`).toFixed(2)}
                          </td>
                          <td className="p-3 align-top">
                            <Input
                                type="number"
                                className="w-10 h-7 p-1 text-center bg-slate-50 border-slate-200 text-xs"
                                {...form.register(`items.${index}.discountPercent` as const)}
                              />
                          </td>
                          <td className="p-3 align-top text-right font-semibold text-slate-900">
                            ₺{form.watch(`items.${index}.totalAmount`).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="payment">
                <div className="text-sm text-slate-500 py-4 text-center">Ödeme planı ayarları yapım aşamasındadır.</div>
            </TabsContent>
          </Tabs>

          {/* Financial Summary */}
          <div className="p-4 bg-slate-100 rounded-lg space-y-3 mt-6">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Finansal Özet</h4>
            <div className="space-y-2.5 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ara Toplam</span>
                <span className="font-medium text-slate-900">₺2.300,00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Genel İskonto</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-[10px] text-slate-400 mr-1">%</span>
                    <Input className="w-10 h-6 p-0 text-center border-slate-200 bg-white text-xs" defaultValue="5" />
                  </div>
                  <span className="text-rose-600 font-semibold">-₺115,00</span>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">KDV (%20)</span>
                <span className="font-medium text-slate-900">₺437,00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Yuvarlama Farkı</span>
                <span className="font-medium text-slate-900">₺0,00</span>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-200 flex justify-between items-end">
                <span className="text-sm font-bold text-slate-900">GENEL TOPLAM</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600">₺2.622,00</div>
                  <div className="text-[10px] text-slate-500 font-medium">KDV DAHİL</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex gap-3 sm:justify-start">
          <Button variant="outline" className="flex-1 text-slate-600" onClick={onClose}>
            İptal
          </Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={form.handleSubmit(onSubmit)}>
            Faturayı Kaydet
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
