'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Button } from '@omnicore/ui/components/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@omnicore/ui/components/ui/dropdown-menu';
import { useState } from 'react';
import { SupplierFormSheet } from './supplier-form-sheet';
import { deleteSupplierAction } from '../../../app/(dashboard)/procurement/suppliers/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export type Supplier = {
  id: string;
  name: string;
  taxNumber?: string;
  taxOffice?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  supplierGroup?: string;
  createdAt: string;
  isActive?: boolean;
  isDropshipper?: boolean;
  // Included fields for editing
  streetAddress?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  currency?: string;
  iban?: string;
  bankName?: string;
  paymentTerms?: number;
  eInvoiceAlias?: string;
  naceCode?: string;
  mersisNo?: string;
  tradeRegistryNo?: string;
  leadTimeInDays?: number;
  minimumOrderQuantity?: number;
  returnAddress?: string;
  externalSellerId?: string;
  performanceScore?: number;
  contactName?: string;
  website?: string;
};

const ActionCell = ({ supplier }: { supplier: Supplier }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Bu tedarikçiyi silmek istediğinize emin misiniz?')) {
      setIsDeleting(true);
      try {
        await deleteSupplierAction(supplier.id);
        toast.success('Tedarikçi başarıyla silindi.');
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || 'Tedarikçi silinirken bir hata oluştu.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Menüyü aç</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksiyonlar</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupplierFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={supplier}
      />
    </>
  );
};

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: 'Tedarikçi Adı',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'taxNumber',
    header: 'Vergi No',
  },
  {
    accessorKey: 'contactEmail',
    header: 'E-Posta',
  },
  {
    accessorKey: 'contactPhone',
    header: 'Telefon',
  },
  {
    accessorKey: 'supplierGroup',
    header: 'Grup',
  },
  {
    accessorKey: 'isActive',
    header: 'Durum',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return (
        <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Kayıt Tarihi',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString('tr-TR');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell supplier={row.original} />,
  },
];
