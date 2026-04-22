"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Archive, Printer, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnicore/ui/components/ui/table";
import { Button } from "@omnicore/ui/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  return (
    <div className="relative">
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3">
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
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-xs text-slate-500">
          Toplam {table.getFilteredRowModel().rows.length} kayıt
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sticky Action Bar */}
      {selectedRowCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-800 mr-4">
            {selectedRowCount} Seçili Kayıt
          </span>
          <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-100 flex items-center gap-2 h-8 px-4 text-xs font-medium text-slate-700">
            <Archive className="h-4 w-4" />
            Arşivle
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-100 flex items-center gap-2 h-8 px-4 text-xs font-medium text-slate-700">
            <Printer className="h-4 w-4" />
            Yazdır
          </Button>
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
          <Button variant="ghost" size="sm" className="rounded-full hover:bg-rose-100 text-rose-600 hover:text-rose-700 flex items-center gap-2 h-8 px-4 text-xs font-medium bg-rose-50/50">
            <Trash2 className="h-4 w-4" />
            Sil
          </Button>
        </div>
      )}
    </div>
  );
}
