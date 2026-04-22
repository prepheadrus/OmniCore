"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SupplierFormSheet } from "./supplier-form-sheet"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "")
  const [isFormOpen, setIsFormOpen] = React.useState(false)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Handle Search Input Change with Debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      if (searchQuery) {
        current.set("search", searchQuery)
      } else {
        current.delete("search")
      }

      const search = current.toString()
      const query = search ? `?${search}` : ""

      router.replace(`${pathname}${query}`, { scroll: false })
    }, 500)

    return () => clearTimeout(handler)
  }, [searchQuery, pathname, router, searchParams])

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (value === "all") {
      current.delete(key)
    } else {
      current.set(key, value)
    }
    const search = current.toString()
    const query = search ? `?${search}` : ""
    router.replace(`${pathname}${query}`, { scroll: false })
  }

  return (
    <div>
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Tedarikçiler</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Yeni Tedarikçi Ekle
          </Button>
          <SupplierFormSheet
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 space-x-2">
         <div className="flex items-center space-x-2 flex-1">
            <Input
              placeholder="İsim, VKN veya Yetkili ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />

            <Select
              value={searchParams.get("isActive") || "all"}
              onValueChange={(val) => handleFilterChange("isActive", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü (Durum)</SelectItem>
                <SelectItem value="true">Sadece Aktif</SelectItem>
                <SelectItem value="false">Pasif</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get("isDropshipper") || "all"}
              onValueChange={(val) => handleFilterChange("isDropshipper", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tedarik Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü (Tür)</SelectItem>
                <SelectItem value="true">Sadece Dropshipper</SelectItem>
                <SelectItem value="false">Standart</SelectItem>
              </SelectContent>
            </Select>
         </div>
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
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
                    <p className="text-lg font-medium text-slate-900">Sonuç bulunamadı</p>
                    <p className="text-sm">Filtrelerinize uygun tedarikçi bulunmamaktadır.</p>
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
