"use client";

import * as React from "react";
import {
  ColumnDef,
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
import { OrderDetailSheet } from "./order-detail-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  onUpdateOrder?: (order: any) => void;
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
  const [marketplaceFilter, setMarketplaceFilter] = React.useState(searchParams.get("marketplace") || "ALL");
  const [dateFrom, setDateFrom] = React.useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = React.useState(searchParams.get("dateTo") || "");

  const [selectedOrder, setSelectedOrder] = React.useState<OrderData | null>(null);

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
      handleViewOrder: (order: OrderData) => setSelectedOrder(order),
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;
  const [isPrinting, setIsPrinting] = React.useState(false);

  // Debounced search logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;

      if (searchTerm) {
        if (searchTerm !== searchParams.get("q")) {
           params.set("q", searchTerm);
           changed = true;
        }
      } else {
        if (searchParams.has("q")) {
           params.delete("q");
           changed = true;
        }
      }

      if (marketplaceFilter !== "ALL") {
        if (marketplaceFilter !== searchParams.get("marketplace")) {
          params.set("marketplace", marketplaceFilter);
          changed = true;
        }
      } else {
        if (searchParams.has("marketplace")) {
          params.delete("marketplace");
          changed = true;
        }
      }

      if (dateFrom) {
        if (dateFrom !== searchParams.get("dateFrom")) {
          params.set("dateFrom", dateFrom);
          changed = true;
        }
      } else if (searchParams.has("dateFrom")) {
        params.delete("dateFrom");
        changed = true;
      }

      if (dateTo) {
        if (dateTo !== searchParams.get("dateTo")) {
          params.set("dateTo", dateTo);
          changed = true;
        }
      } else if (searchParams.has("dateTo")) {
        params.delete("dateTo");
        changed = true;
      }

      if (changed) {
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, marketplaceFilter, dateFrom, dateTo, pathname, router, searchParams]);

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
      <div className="flex items-center gap-4 bg-white p-2 rounded-md border border-slate-200">
        <Input
          placeholder="Sipariş No / Müşteri Ara..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-[300px]"
        />

        <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pazaryeri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tüm Pazaryerleri</SelectItem>
            <SelectItem value="Trendyol">Trendyol</SelectItem>
            <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
            <SelectItem value="Amazon">Amazon</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px] text-slate-500"
          />
          <span className="text-slate-400">-</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px] text-slate-500"
          />
        </div>
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
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={(e) => {
                      // Prevent sheet from opening if clicking on checkbox or actions
                      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="checkbox"]')) {
                        return;
                      }
                      setSelectedOrder(row.original as any as OrderData);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
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

      <OrderDetailSheet
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateOrder={(updatedOrder) => {
          if (onUpdateOrder) {
            onUpdateOrder(updatedOrder);
          }
          // Also update the currently viewed order so the sheet reflects changes
          setSelectedOrder(updatedOrder);
        }}
      />

      {hasSelectedRows && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-4 px-6 py-3 bg-[oklch(100%_0_0/0.8)] dark:bg-[oklch(18%_0.02_250/0.8)] backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full">
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
              className="rounded-full shadow-none"
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
