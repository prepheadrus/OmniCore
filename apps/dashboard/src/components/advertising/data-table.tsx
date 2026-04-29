"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, Plus, Filter } from "lucide-react";

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
import { CampaignData } from "./columns";
import { CampaignSheet } from "./campaign-sheet";
import { Badge } from "@omnicore/ui/components/ui/badge";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<CampaignData | null>(null);

  // Active filters for pill buttons
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("Tümü");
  const [activeMarketplaceFilter, setActiveMarketplaceFilter] = React.useState<string>("Tümü");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      handleViewCampaign: (campaign: CampaignData) => {
        setSelectedCampaign(campaign);
        setIsSheetOpen(true);
      }
    }
  });

  const handleCreateNew = () => {
    setSelectedCampaign(null);
    setIsSheetOpen(true);
  };

  const handleStatusFilter = (status: string) => {
    setActiveStatusFilter(status);
    table.getColumn("status")?.setFilterValue(status === "Tümü" ? "" : status);
  };

  const handleMarketplaceFilter = (mp: string) => {
    setActiveMarketplaceFilter(mp);
    table.getColumn("marketplace")?.setFilterValue(mp === "Tümü" ? "" : mp);
  };

  const statuses = ["Tümü", "Aktif", "Taslak", "Duraklatıldı", "Tamamlandı"];
  const marketplaces = ["Tümü", "Trendyol", "Hepsiburada", "Amazon"];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 space-y-4">
        {/* Top Actions & Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-sm w-full relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Kampanya ara..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-9 bg-slate-50 border-slate-200 shadow-none h-9 text-sm w-[300px]"
            />
          </div>

          <Button size="sm" className="h-9 shadow-none gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateNew}>
            <Plus className="h-4 w-4" />
            Yeni Kampanya
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Durum:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  {statuses.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusFilter(s)}
                      className={`px-3 py-1 rounded-sm transition-colors ${activeStatusFilter === s ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-px h-6 bg-slate-200 mx-2"></div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Pazaryeri:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  {marketplaces.map(mp => (
                    <button
                      key={mp}
                      onClick={() => handleMarketplaceFilter(mp)}
                      className={`px-3 py-1 rounded-sm transition-colors ${activeMarketplaceFilter === mp ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {mp}
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
             <Badge variant="outline" className="shadow-none border-emerald-200 bg-emerald-50 text-emerald-700 px-2 rounded-sm">
                {table.getFilteredRowModel().rows.length} kampanya
             </Badge>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs font-semibold text-slate-500 h-10 tracking-wide">
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
                  className="border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors group"
                  onClick={() => {
                    setSelectedCampaign(row.original as unknown as CampaignData);
                    setIsSheetOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
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

      <div className="flex items-center justify-between space-x-2 py-3 px-4 border-t border-slate-200 bg-white mt-auto">
        <div className="text-xs text-slate-500">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} satır seçildi.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 shadow-none border-slate-200 text-slate-600"
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 shadow-none border-slate-200 text-slate-600"
          >
            Sonraki
          </Button>
        </div>
      </div>

      <CampaignSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        initialData={selectedCampaign}
      />
    </div>
  );
}
