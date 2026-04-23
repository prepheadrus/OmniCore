"use client";

import React, { useMemo, useCallback, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
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
import { createInvoice } from "./actions";
import { toast } from "sonner";

import { invoiceFormSchema, InvoiceFormValues } from "./schema";

interface InvoiceFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<InvoiceFormValues>;
}

const defaultValues: Partial<InvoiceFormValues> = {
  supplierId: "",
  type: "E_INVOICE",
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
  const [isPending, startTransition] = useTransition();
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData || defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = useCallback((data: InvoiceFormValues) => {
    startTransition(async () => {
      const result = await createInvoice(data);
      if (result.success) {
        toast.success("Fatura başarıyla kaydedildi");
        onClose();
        form.reset();
      } else {
        toast.error(result.error || "Fatura kaydedilirken bir hata oluştu");
      }
    });
  }, [onClose, form]);

  const itemsList = useMemo(() => fields.map((item, index) => {
    const isMatched = form.watch(`items.${index}.isMatched`);
    return (
      <tr key={item.id} className={!isMatched ? "bg-amber-50/30" : ""}>
        <td className="p-3 align-top">
          <Controller
            control={form.control}
            name={`items.${index}.name`}
            render={({ field }) => (
              <div className="font-medium text-slate-900">{field.value}</div>
            )}
          />
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
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 bg-white" type="button">
                      <Plus className="h-3 w-3" />
                  </Button>
              </div>
          )}
        </td>
        <td className="p-3 align-top">
          <div className="flex items-center gap-1">
            <Controller
              control={form.control}
              name={`items.${index}.quantity`}
              render={({ field, fieldState }) => (
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    className="w-12 h-7 p-1 text-center bg-slate-50 border-slate-200 text-xs"
                    {...field}
                  />
                  {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                </div>
              )}
            />
            {!isMatched && <span className="text-indigo-600 font-bold text-[10px] bg-indigo-50 px-1 rounded cursor-pointer">x12</span>}
            {isMatched && <span className="text-slate-400 font-medium text-xs">x1</span>}
          </div>
        </td>
        <td className="p-3 align-top font-medium text-slate-700">
           <Controller
              control={form.control}
              name={`items.${index}.unitPrice`}
              render={({ field, fieldState }) => (
                <div>
                  <div className="flex items-center">
                    <span className="text-xs mr-1">₺</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-20 h-7 p-1 text-right bg-slate-50 border-slate-200 text-xs"
                      {...field}
                    />
                  </div>
                  {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                </div>
              )}
            />
        </td>
        <td className="p-3 align-top">
          <Controller
            control={form.control}
            name={`items.${index}.discountPercent`}
            render={({ field, fieldState }) => (
              <div>
                <Input
                  type="number"
                  step="0.01"
                  className="w-10 h-7 p-1 text-center bg-slate-50 border-slate-200 text-xs"
                  {...field}
                  value={field.value || ""}
                />
                {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
              </div>
            )}
          />
        </td>
        <td className="p-3 align-top text-right font-semibold text-slate-900">
          <Controller
            control={form.control}
            name={`items.${index}.totalAmount`}
            render={({ field, fieldState }) => (
              <div>
                <div className="flex items-center justify-end">
                  <span className="text-xs mr-1">₺</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-20 h-7 p-1 text-right bg-slate-50 border-slate-200 text-xs"
                    {...field}
                  />
                </div>
                {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
              </div>
            )}
          />
        </td>
      </tr>
    );
  }), [fields, form]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[90vw] sm:max-w-[700px] p-0 flex flex-col bg-slate-50 border-l border-slate-200">
        <SheetHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <SheetTitle className="text-lg font-bold text-slate-800">
            {initialData ? "Alış Faturasını Düzenle" : "Yeni Alış Faturası"}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Tedarikçiden gelen fatura bilgilerini ve ürün eşleştirmelerini yapın.
          </SheetDescription>
        </SheetHeader>

          <form id="invoice-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full bg-slate-200/50 p-1 mb-4">
                <TabsTrigger value="general" className="flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="items" className="flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Ürünler <span className="ml-1.5 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold">{fields.length}</span></TabsTrigger>
                <TabsTrigger value="payment" className="flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Ödeme Planı</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Controller
                      control={form.control}
                      name="supplierId"
                      render={({ field, fieldState }) => (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase">Tedarikçi</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <SelectTrigger className="h-9 bg-white text-sm mt-1">
                              <SelectValue placeholder="Tedarikçi Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Zenith Endüstriyel A.Ş.">Zenith Endüstriyel A.Ş.</SelectItem>
                              <SelectItem value="Atlas Teknoloji Ltd.">Atlas Teknoloji Ltd.</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Controller
                      control={form.control}
                      name="documentNo"
                      render={({ field, fieldState }) => (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase">Belge No</Label>
                          <Input className="h-9 bg-white text-sm mt-1" {...field} />
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Controller
                      control={form.control}
                      name="date"
                      render={({ field, fieldState }) => (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase">Tarih</Label>
                          <Input type="date" className="h-9 bg-white text-sm mt-1" {...field} />
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field, fieldState }) => (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase">Fatura Tipi</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <SelectTrigger className="h-9 bg-white text-sm mt-1">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="E_INVOICE">e-Fatura</SelectItem>
                              <SelectItem value="E_ARCHIVE">e-Arşiv Fatura</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Controller
                      control={form.control}
                      name="currency"
                      render={({ field, fieldState }) => (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase">Para Birimi</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <SelectTrigger className="h-9 bg-white text-sm mt-1">
                              <SelectValue placeholder="Birim" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                              <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Controller
                      control={form.control}
                      name="exchangeRate"
                      render={({ field, fieldState }) => (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase">Kur</Label>
                          <Input type="number" step="0.0001" className="h-9 bg-white text-sm mt-1" {...field} />
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items" className="mt-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Ürün Kalemleri</h4>
                  <Button variant="link" className="text-[11px] text-indigo-600 font-medium p-0 h-auto flex items-center" type="button">
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
                      {itemsList}
                    </tbody>
                  </table>
                  {form.formState.errors.items?.message && (
                    <div className="p-3 text-rose-500 text-sm">{form.formState.errors.items.message}</div>
                  )}
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
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Ara Toplam</span>
                  <Controller
                    control={form.control}
                    name="subTotal"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <span className="mr-1">₺</span>
                        <Input type="number" step="0.01" className="w-24 h-7 p-1 text-right bg-transparent border-transparent font-medium text-slate-900" {...field} />
                      </div>
                    )}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Genel İskonto</span>
                  <div className="flex items-center gap-2">
                    <Controller
                      control={form.control}
                      name="generalDiscountPercent"
                      render={({ field }) => (
                        <div className="flex items-center">
                          <span className="text-[10px] text-slate-400 mr-1">%</span>
                          <Input type="number" step="0.01" className="w-12 h-6 p-0 text-center border-slate-200 bg-white text-xs" {...field} value={field.value || ""} />
                        </div>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="generalDiscountAmount"
                      render={({ field }) => (
                        <div className="flex items-center text-rose-600 font-semibold">
                          <span className="mr-1">-₺</span>
                          <Input type="number" step="0.01" className="w-20 h-6 p-0 text-right bg-transparent border-transparent text-rose-600 font-semibold" {...field} />
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">KDV Tutarı</span>
                  <Controller
                    control={form.control}
                    name="taxAmount"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <span className="mr-1">₺</span>
                        <Input type="number" step="0.01" className="w-24 h-7 p-1 text-right bg-transparent border-transparent font-medium text-slate-900" {...field} />
                      </div>
                    )}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Yuvarlama Farkı</span>
                  <Controller
                    control={form.control}
                    name="roundingDifference"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <span className="mr-1">₺</span>
                        <Input type="number" step="0.01" className="w-24 h-7 p-1 text-right bg-transparent border-transparent font-medium text-slate-900" {...field} value={field.value || ""} />
                      </div>
                    )}
                  />
                </div>
                <div className="pt-3 mt-2 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-900">GENEL TOPLAM</span>
                  <div className="text-right">
                    <Controller
                      control={form.control}
                      name="grandTotal"
                      render={({ field, fieldState }) => (
                        <div>
                          <div className="flex items-center justify-end text-indigo-600 text-xl font-bold">
                            <span className="mr-1">₺</span>
                            <Input type="number" step="0.01" className="w-32 h-8 p-0 text-right bg-transparent border-transparent text-xl font-bold text-indigo-600" {...field} />
                          </div>
                          {fieldState.error && <span className="text-[10px] text-rose-500">{fieldState.error.message}</span>}
                        </div>
                      )}
                    />
                    <div className="text-[10px] text-slate-500 font-medium mt-1">KDV DAHİL</div>
                  </div>
                </div>
              </div>
            </div>
          </form>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex gap-3 sm:justify-start">
          <Button variant="outline" className="flex-1 text-slate-600" onClick={onClose} disabled={isPending} type="button">
            İptal
          </Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" type="submit" form="invoice-form" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : "Faturayı Kaydet"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
