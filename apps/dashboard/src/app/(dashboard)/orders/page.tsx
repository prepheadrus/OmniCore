'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@omnicore/ui/components/ui/table';
import { Skeleton } from '@omnicore/ui/components/ui/skeleton';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface OrderData {
  id: string;
  customer: string;
  date: string;
  status: string;
  amount: string;
}

// Generate dummy data to populate the loading table
const data: OrderData[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `order-${i}`,
  customer: `customer-${i}`,
  date: `date-${i}`,
  status: `status-${i}`,
  amount: `amount-${i}`,
}));

export const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: "id",
    header: "Sipariş No",
    cell: () => <Skeleton className="h-4 w-20" />,
  },
  {
    accessorKey: "customer",
    header: "Müşteri",
    cell: () => <Skeleton className="h-4 w-32" />,
  },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: () => <Skeleton className="h-4 w-24" />,
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: () => <Skeleton className="h-4 w-16" />,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Tutar</div>,
    cell: () => (
      <div className="flex justify-end">
        <Skeleton className="h-4 w-20" />
      </div>
    ),
  },
];

export default function OrdersPage() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Siparişler
        </h1>
        <p className="text-slate-500 mt-1.5 font-medium">
          Sipariş verileri yükleniyor...
        </p>
      </div>

      <div className="rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50/50 hover:bg-slate-50/50"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
