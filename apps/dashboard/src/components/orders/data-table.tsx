"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnicore/ui/components/ui/table";

import { Button } from "@omnicore/ui/components/ui/button";
import { Input } from "@omnicore/ui/components/ui/input";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { OrderData } from "./columns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  onUpdateOrder?: (id: string) => void;
}

export function DataTable<TData extends OrderData, TValue>({
  columns,
  data,
  meta,
  onUpdateOrder,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("q") || "");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualFiltering: true,
    pageCount: meta?.totalPages ?? -1,
    state: {
      rowSelection,
    },
    meta: {
      handleUpdateOrder: onUpdateOrder,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;
  const [isPrinting, setIsPrinting] = React.useState(false);

  // Debounced search logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        if (searchTerm !== searchParams.get("q")) {
           params.set("q", searchTerm);
           params.set("page", "1");
           router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      } else {
        if (searchParams.has("q")) {
           params.delete("q");
           params.set("page", "1");
           router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handlePrintLabels = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      table.toggleAllPageRowsSelected(false);
      toast.success("Kargo etiketleri başarıyla birleştirildi!");
    }, 1500);
  };

  const handleNextPage = () => {
     if (meta && meta.page < meta.totalPages) {
         const params = new URLSearchParams(searchParams.toString());
         params.set("page", (meta.page + 1).toString());
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
     }
  }

  const handlePreviousPage = () => {
     if (meta && meta.page > 1) {
         const params = new URLSearchParams(searchParams.toString());
         params.set("page", (meta.page - 1).toString());
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
     }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Müşteri veya Sipariş No ara..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
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
                  className="h-24 text-center text-slate-500"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-slate-500">
          {meta ? (
            <>Sayfa {meta.page} / {meta.totalPages} (Toplam {meta.total} sipariş)</>
          ) : (
             <>Sayfa 1 / 1</>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!meta || meta.page <= 1}
            className="bg-white"
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!meta || meta.page >= meta.totalPages}
            className="bg-white"
          >
            Sonraki
          </Button>
        </div>
      </div>

      {hasSelectedRows && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-4 px-6 py-3 bg-[oklch(100%_0_0/0.8)] dark:bg-[oklch(18%_0.02_250/0.8)] backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg rounded-full">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold mr-2">
                {selectedRows.length}
              </span>
              sipariş seçildi
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <Button
              size="sm"
              onClick={handlePrintLabels}
              disabled={isPrinting}
              className="rounded-full shadow-sm"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Kargo Etiketlerini Yazdır
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
