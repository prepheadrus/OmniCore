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
import { useRouter } from "next/navigation"

interface DataTableProps {
  columns: ColumnDef<Product>[]
  data: Product[]
}

export function DataTable({ columns, data: initialData }: DataTableProps) {
  const router = useRouter()
  const [data, setData] = React.useState(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const { selectedChannelId } = useChannel()

  React.useEffect(() => {
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
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getSubRows: (row) => row.subRows,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              const rowToUpdate = old[rowIndex]
              if (rowToUpdate) {
                return {
                  ...rowToUpdate,
                  [columnId]: value,
                }
              }
            }
            return row
          })
        )
      },
    },
  })

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Ürün adı veya SKU ara..."
          value={(table.getColumn("nameAndSku")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nameAndSku")?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-8 text-[13px] bg-[#ffffff] border-[#c6c6c6]/20 focus-visible:border-[#000000] focus-visible:ring-0"
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
                <SelectTrigger className="w-[130px] h-8 text-[13px] bg-[#ffffff] border-[#c6c6c6]/20 focus:ring-0 focus:border-[#000000]">
                    <SelectValue placeholder="Durum Seç" />
                </SelectTrigger>
                <SelectContent className="bg-[#ffffff] border-[#c6c6c6]/20">
                    <SelectItem value="ALL" className="text-[13px]">Tümü</SelectItem>
                    <SelectItem value="IN_STOCK" className="text-[13px]">Satışta</SelectItem>
                    <SelectItem value="OUT_OF_STOCK" className="text-[13px]">Tükendi</SelectItem>
                    <SelectItem value="INACTIVE" className="text-[13px]">Pasif</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="rounded-[6px] border border-[#c6c6c6]/20 bg-[#ffffff] overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-[#c6c6c6]/20">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-8 py-1 px-2 text-[12px] text-[#474747] font-semibold bg-[#f2f4f6]">
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
                  className="hover:bg-[#f2f4f6] transition-colors border-[#c6c6c6]/10 cursor-pointer"
                  onClick={() => router.push(`/products/${row.original.id}`)}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#474747]">
                  Ürün bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedRowsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#000000] text-[#dae2fd] px-6 py-3 rounded-[6px] shadow-lg flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-[13px] font-medium">
            {selectedRowsCount} ürün seçildi
          </span>
          <div className="flex items-center gap-2 border-l border-[#333b50] pl-6">
            <Button size="sm" variant="ghost" className="h-7 text-[12px] hover:bg-[#333b50] hover:text-[#ffffff]">
              Satışa Aç
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[12px] hover:bg-[#333b50] hover:text-[#ffffff]">
              Satışa Kapat
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[12px] text-[#ffdad6] hover:bg-[#410002] hover:text-[#ffdad6]">
              Sil
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8 text-[12px] border-[#c6c6c6]/20 text-[#191c1e] hover:bg-[#f2f4f6]"
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8 text-[12px] border-[#c6c6c6]/20 text-[#191c1e] hover:bg-[#f2f4f6]"
        >
          Sonraki
        </Button>
      </div>
    </div>
  )
}
