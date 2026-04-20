'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@omnicore/ui/components/ui/sheet';
import { Button } from '@omnicore/ui/components/ui/button';
import { Input } from '@omnicore/ui/components/ui/input';
import { Label } from '@omnicore/ui/components/ui/label';
import { Switch } from '@omnicore/ui/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@omnicore/ui/components/ui/tabs';
import { useChannel } from '../../../contexts/ChannelContext';
import { toast } from 'sonner';
import { saveSupplierAction } from '../../../app/(dashboard)/procurement/suppliers/actions';

const supplierSchema = z.object({
  name: z.string().min(1, 'Tedarikçi adı zorunludur'),
  supplierGroup: z.string().optional(),

  // General & Contact
  contactName: z.string().optional(),
  contactEmail: z
    .string()
    .email('Geçerli bir e-posta adresi girin')
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().optional(),

  // Address (UBL-TR)
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Finance & E-Transformation
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  currency: z.string().optional(),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  paymentTerms: z.number().optional(),
  eInvoiceAlias: z.string().optional(),
  naceCode: z.string().optional(),
  mersisNo: z.string().optional(),
  tradeRegistryNo: z.string().optional(),

  // Logistics & Operation
  leadTimeInDays: z.number().optional(),
  minimumOrderQuantity: z.number().optional(),
  isActive: z.boolean().optional(),
  isDropshipper: z.boolean().optional(),
  returnAddress: z.string().optional(),

  // External System & Performance
  externalSellerId: z.string().optional(),
  performanceScore: z.number().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export function SupplierFormSheet() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { selectedChannelId } = useChannel();

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      supplierGroup: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      streetAddress: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Türkiye',
      taxNumber: '',
      taxOffice: '',
      currency: 'TRY',
      iban: '',
      bankName: '',
      paymentTerms: 0,
      eInvoiceAlias: '',
      naceCode: '',
      mersisNo: '',
      tradeRegistryNo: '',
      leadTimeInDays: 1,
      minimumOrderQuantity: 1,
      isActive: true,
      isDropshipper: false,
      returnAddress: '',
      externalSellerId: '',
      performanceScore: 0,
    },
  });

  async function onSubmit(data: SupplierFormValues) {
    if (!selectedChannelId) {
      toast.error('Lütfen önce bir satış kanalı seçin.');
      return;
    }

    try {
      setIsLoading(true);
      await saveSupplierAction(data, selectedChannelId);

      toast.success('Tedarikçi başarıyla oluşturuldu');
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Yeni Tedarikçi Ekle
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Yeni Tedarikçi</SheetTitle>
          <SheetDescription>
            Sisteme yeni bir tedarikçi ekleyin. Kırmızı işaretli alanlar
            zorunludur.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="flex w-full bg-slate-200/50 p-1 rounded-md mb-6 h-auto">
              <TabsTrigger value="general" className="flex-1 text-[12px] h-auto py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-normal text-center leading-tight">Genel</TabsTrigger>
              <TabsTrigger value="finance" className="flex-1 text-[12px] h-auto py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-normal text-center leading-tight">Finans & UBL</TabsTrigger>
              <TabsTrigger value="logistics" className="flex-1 text-[12px] h-auto py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-normal text-center leading-tight">Lojistik & Operasyon</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Tedarikçi Adı *</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-[oklch(0.55_0.15_45)]">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierGroup">Tedarikçi Grubu</Label>
                <Input id="supplierGroup" {...form.register('supplierGroup')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Yetkili Kişi</Label>
                <Input id="contactName" {...form.register('contactName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">E-Posta Adresi</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...form.register('contactEmail')}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-[oklch(0.55_0.15_45)]">
                    {form.formState.errors.contactEmail.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon</Label>
                <Input id="contactPhone" {...form.register('contactPhone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Web Sitesi</Label>
                <Input id="website" {...form.register('website')} />
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi Numarası</Label>
                  <Input id="taxNumber" {...form.register('taxNumber')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                  <Input id="taxOffice" {...form.register('taxOffice')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Sokak / Bina / Kapı No</Label>
                <Input id="streetAddress" {...form.register('streetAddress')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">İl</Label>
                  <Input id="city" {...form.register('city')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input id="district" {...form.register('district')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Posta Kodu</Label>
                  <Input id="postalCode" {...form.register('postalCode')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Ülke</Label>
                  <Input id="country" {...form.register('country')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Input id="currency" {...form.register('currency')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" {...form.register('iban')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Banka Adı</Label>
                <Input id="bankName" {...form.register('bankName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Ödeme Vadesi (Gün)</Label>
                <Input id="paymentTerms" type="number" {...form.register('paymentTerms', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eInvoiceAlias">E-Fatura Posta Kutusu</Label>
                <Input id="eInvoiceAlias" {...form.register('eInvoiceAlias')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="naceCode">NACE Kodu</Label>
                <Input id="naceCode" {...form.register('naceCode')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mersisNo">MERSİS No</Label>
                  <Input id="mersisNo" {...form.register('mersisNo')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeRegistryNo">Ticaret Sicil No</Label>
                  <Input id="tradeRegistryNo" {...form.register('tradeRegistryNo')} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadTimeInDays">Tedarik Süresi (Gün)</Label>
                  <Input id="leadTimeInDays" type="number" {...form.register('leadTimeInDays', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumOrderQuantity">Minimum Sipariş Adedi</Label>
                  <Input id="minimumOrderQuantity" type="number" {...form.register('minimumOrderQuantity', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnAddress">İade/Menşei Adresi</Label>
                <Input id="returnAddress" {...form.register('returnAddress')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalSellerId">Dış Sistem ID (Opsiyonel)</Label>
                <Input id="externalSellerId" {...form.register('externalSellerId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performanceScore">Performans Puanı (1-100)</Label>
                <Input id="performanceScore" type="number" {...form.register('performanceScore', { valueAsNumber: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Aktif mi?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDropshipper"
                    checked={form.watch("isDropshipper")}
                    onCheckedChange={(checked) => form.setValue("isDropshipper", checked)}
                  />
                  <Label htmlFor="isDropshipper">Dropshipper mı?</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-6 flex justify-end space-x-2 pb-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
