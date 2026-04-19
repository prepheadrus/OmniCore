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
import { useChannel } from "../../../src/contexts/ChannelContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@omnicore/ui/components/ui/select"
import { Product } from "./columns"
import { updateProductInlineAction } from "../../app/(dashboard)/products/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DataTableProps {
  columns: ColumnDef<Product>[]
  data: Product[]
}

export function DataTable({ columns, data: initialData }: DataTableProps) {
  const [data, setData] = React.useState(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const { selectedChannelId } = useChannel()
  const router = useRouter()

  // Filter data based on selected channel (if we were filtering locally)
  // Or in a real scenario, this would trigger a refetch. For now, we mock a channel reload
  React.useEffect(() => {
    // We just reset selection on channel change as a simulation
    setRowSelection({})
  }, [selectedChannelId])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // Required for nested rows
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getSubRows: (row) => row.subRows, // Required for nested rows
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      updateData: async (rowIndex: number, columnId: string, value: unknown) => {
        const rowToUpdate = data[rowIndex];
        if (!rowToUpdate) return;

        // Optimistic update
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                [columnId]: value,
              }
            }
            return row
          })
        )

        // Server Action call
        try {
          const result = await updateProductInlineAction(rowToUpdate.id, { [columnId]: value }, selectedChannelId);
          if (result.success) {
            toast.success("Hücre güncellendi.");
            // router.refresh() will be called naturally if we want, or we rely on the optimistic update
          } else {
            toast.error(result.error || "Güncelleme başarısız.");
            // Revert on failure (we could implement this, but keeping it simple for now)
          }
        } catch(error) {
           toast.error("Güncelleme başarısız.");
        }
      },
    },
  })

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="space-y-4 relative">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Ürün adı veya SKU ara..."
          value={(table.getColumn("nameAndSku")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nameAndSku")?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-8 text-[13px]"
        />
        <div className="flex items-center gap-2">
            <Select
                value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
                onValueChange={(value) => {
                    if (value === "ALL") {
                        table.getColumn("status")?.setFilterValue(undefined)
                    } else {
                        table.getColumn("status")?.setFilterValue(value)
                    }
                }}
            >
                <SelectTrigger className="w-[130px] h-8 text-[13px]">
                    <SelectValue placeholder="Durum Seç" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Tümü</SelectItem>
                    <SelectItem value="IN_STOCK">Satışta</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Tükendi</SelectItem>
                    <SelectItem value="INACTIVE">Pasif</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-8 py-1 px-2 text-[12px] text-slate-500 font-medium">
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
                  className="hover:bg-slate-50 transition-colors border-b-slate-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-2 text-[13px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  Ürün bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sticky Action Bar */}
      {selectedRowsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-[13px] font-medium">
            {selectedRowsCount} ürün seçildi
          </span>
          <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
            <Button size="sm" variant="ghost" className="h-7 text-[12px] hover:bg-slate-800 hover:text-white">
              Satışa Aç
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[12px] hover:bg-slate-800 hover:text-white">
              Satışa Kapat
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[12px] text-red-400 hover:bg-slate-800 hover:text-red-300">
              Sil
            </Button>
          </div>
        </div>
      )}

      {/* Footer Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8 text-[12px]"
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8 text-[12px]"
        >
          Sonraki
        </Button>
      </div>
    </div>
  )
}
