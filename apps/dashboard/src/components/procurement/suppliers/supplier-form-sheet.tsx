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
import { useChannel } from '../../../contexts/ChannelContext';
import { toast } from 'sonner';
import { saveSupplierAction } from '../../../app/(dashboard)/procurement/suppliers/actions';

const supplierSchema = z.object({
  name: z.string().min(1, 'Tedarikçi adı zorunludur'),
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  contactEmail: z
    .string()
    .email('Geçerli bir e-posta adresi girin')
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  supplierGroup: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export function SupplierFormSheet() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { selectedChannelId } = useChannel();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      taxNumber: '',
      taxOffice: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      supplierGroup: '',
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
      <SheetContent className="sm:max-w-[425px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Yeni Tedarikçi</SheetTitle>
          <SheetDescription>
            Sisteme yeni bir tedarikçi ekleyin. Kırmızı işaretli alanlar
            zorunludur.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
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
            <Label htmlFor="taxNumber">Vergi Numarası</Label>
            <Input id="taxNumber" {...form.register('taxNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxOffice">Vergi Dairesi</Label>
            <Input id="taxOffice" {...form.register('taxOffice')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierGroup">Tedarikçi Grubu</Label>
            <Input id="supplierGroup" {...form.register('supplierGroup')} />
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
            <Label htmlFor="address">Adres</Label>
            <Input id="address" {...form.register('address')} />
          </div>
          <div className="pt-4 flex justify-end space-x-2 pb-4">
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
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
