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
import { Search, Plus } from "lucide-react";

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

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 max-w-sm w-full relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Kampanya ara..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-9 bg-slate-50 border-slate-200 shadow-none h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-9 shadow-none text-slate-600 border-slate-200">
             Durum: Tümü
           </Button>
           <Button size="sm" className="h-9 shadow-none gap-2 bg-slate-900 hover:bg-slate-800" onClick={handleCreateNew}>
             <Plus className="h-4 w-4" />
             Yeni Kampanya
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs font-medium text-slate-500 h-9">
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
                  className="border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => {
                    setSelectedCampaign(row.original as unknown as CampaignData);
                    setIsSheetOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
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

      <div className="flex items-center justify-between space-x-2 py-3 px-4 border-t border-slate-200 bg-slate-50 mt-auto">
        <div className="text-xs text-slate-500">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} kampanya seçildi.
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
