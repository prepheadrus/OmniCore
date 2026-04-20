'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@omnicore/ui/components/ui/badge';

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
    accessorKey: 'createdAt',
    header: 'Kayıt Tarihi',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString('tr-TR');
    },
  },
];
