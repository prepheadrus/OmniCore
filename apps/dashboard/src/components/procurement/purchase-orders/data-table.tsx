"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  getPaginationRowModel,
  ExpandedState,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select"
import { PurchaseOrder } from "./columns"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData extends PurchaseOrder, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get("status") || "ALL"

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === "ALL") {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Client-side filtering as a fallback.
  // In a real scenario, the data fetching logic would use the URL params to filter server-side.
  const filteredData = React.useMemo(() => {
    if (currentStatus === "ALL") return data;
    return data.filter(item => item.status === currentStatus);
  }, [data, currentStatus])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tüm Durumlar</SelectItem>
            <SelectItem value="DRAFT">Taslak (DRAFT)</SelectItem>
            <SelectItem value="SENT">Gönderildi (SENT)</SelectItem>
            <SelectItem value="RECEIVED">Mal Kabul (RECEIVED)</SelectItem>
            <SelectItem value="CANCELLED">İptal Edildi (CANCELLED)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50/50 hover:bg-slate-50/50">
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
                  )
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
                    className={`transition-colors cursor-pointer ${
                      row.original.status === 'RECEIVED' ? 'bg-emerald-50/30 hover:bg-emerald-50/50' :
                      row.original.status === 'CANCELLED' ? 'bg-slate-100/50 hover:bg-slate-100/70' :
                      'hover:bg-slate-50/50'
                    }`}
                    onClick={row.getToggleExpandedHandler()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <div className="p-4 border border-slate-200 rounded-md">
                          <h4 className="font-semibold mb-2 text-sm text-slate-700">Fatura Kalemleri</h4>
                          <div className="space-y-2">
                            {row.original.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-100">
                                <span className="text-slate-600">Variant ID: {item.productVariantId}</span>
                                <span className="font-medium">{item.quantity} Adet</span>
                                <span>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.unitCost)} / birim</span>
                                <span className="font-semibold">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.totalCost)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <svg
                      className="mb-4 h-12 w-12 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      ></path>
                    </svg>
                    <p className="text-lg font-medium text-slate-900">Henüz alım faturası yok</p>
                    <p className="text-sm">Sisteme kayıtlı alım faturası bulunmamaktadır.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Sonraki
        </Button>
      </div>
    </div>
  )
}
