"use client"

import * as React from "react"
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
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnicore/ui/components/ui/table"

import { Button } from "@omnicore/ui/components/ui/button"
import { Input } from "@omnicore/ui/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@omnicore/ui/components/ui/dropdown-menu"
import { Search, SlidersHorizontal, ChevronDown, PackageCheck, PackageX } from "lucide-react"
import { toast } from "sonner"
import { ProductData } from "./columns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData?: React.Dispatch<React.SetStateAction<TData[]>>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [expanded, setExpanded] = React.useState({})

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
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => (row as ProductData).subRows as TData[],
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        if (!setData) return;
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
    },
  })

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length

  const handleBulkAction = (action: "active" | "inactive") => {
    const isActivating = action === "active";
    toast.success(`${selectedRowsCount} ürün başarıyla toplu olarak ${isActivating ? 'satışa açıldı' : 'kapatıldı'}.`)
    table.toggleAllRowsSelected(false);
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters and Search Bar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Ürün adı veya SKU ara..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-9 bg-white"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-dashed bg-white">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Durum
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
              {["Satışta", "Tükendi", "Pasif"].map((status) => {
                 const column = table.getColumn("status");
                 const isSelected = (column?.getFilterValue() as string[])?.includes(status) ?? false;

                 return (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const currentFilters = (column?.getFilterValue() as string[]) || [];
                      let newFilters;
                      if (checked) {
                        newFilters = [...currentFilters, status];
                      } else {
                        newFilters = currentFilters.filter(f => f !== status);
                      }
                      column?.setFilterValue(newFilters.length ? newFilters : undefined);
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                 )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-white">
              Sütunlar <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === 'name' ? 'Ürün Adı' : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sticky Action Bar for Bulk Actions */}
      {selectedRowsCount > 0 && (
        <div className="sticky top-4 z-10 flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm animate-in fade-in slide-in-from-top-4">
            <span className="text-sm font-medium text-slate-700">
                {selectedRowsCount} ürün seçildi
            </span>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={() => handleBulkAction("active")}>
                    <PackageCheck className="mr-2 w-4 h-4" />
                    Toplu Satışa Aç
                </Button>
                <Button size="sm" variant="outline" className="text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => handleBulkAction("inactive")}>
                    <PackageX className="mr-2 w-4 h-4" />
                    Toplu Kapat
                </Button>
            </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-slate-700">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                  className={`
                    transition-colors hover:bg-slate-50/80
                    ${row.depth > 0 ? 'bg-slate-50/30' : ''}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
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
                  Ürün bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-slate-500">
          Toplam {table.getFilteredRowModel().rows.length} ürün
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white"
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white"
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  )
}
