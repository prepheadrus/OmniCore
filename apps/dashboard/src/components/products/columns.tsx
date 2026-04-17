"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@omnicore/ui/components/ui/checkbox"
import { Badge } from "@omnicore/ui/components/ui/badge"
import { Input } from "@omnicore/ui/components/ui/input"
import { Image as ImageIcon, CornerDownRight } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Row, Column, Table } from "@tanstack/react-table"

export type ProductStatus = "Satışta" | "Tükendi" | "Pasif"

export type ProductData = {
  id: string
  image: string
  name: string
  sku: string
  price: string
  stock: number
  status: ProductStatus
  channel: string
  subRows?: ProductData[]
}

interface TableMetaWithUpdateData {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

// Hücre içi düzenleme (inline editing) için bileşen
const EditableCell = ({
  value: initialValue,
  row,
  column,
  table,
  type = "text"
}: {
  value: string | number
  row: Row<ProductData>
  column: Column<ProductData, unknown>
  table: Table<ProductData>
  type?: string
}) => {
  const [value, setValue] = useState(initialValue)

  // Tablo verisi değiştiğinde yerel state'i güncelle
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    if (value !== initialValue) {
      (table.options.meta as TableMetaWithUpdateData)?.updateData(row.index, column.id, value)
      toast.success(`${column.id === 'price' ? 'Fiyat' : 'Stok'} başarıyla güncellendi`, {
        description: `${row.original.name}: ${initialValue} ➔ ${value}`,
      })
    }
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      type={type}
      className="h-8 w-full min-w-[80px] bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background px-2 py-1 text-right"
    />
  )
}

export const columns: ColumnDef<ProductData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <div className="pl-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: () => <div className="w-10"></div>,
    cell: ({ row }) => {
      const isVariant = row.depth > 0;
      if (isVariant) return <div className="w-10 flex justify-end pr-2 text-slate-300"><CornerDownRight className="h-4 w-4" /></div>;

      return (
        <div className="h-10 w-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
          <ImageIcon className="h-5 w-5" />
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Ürün Adı",
    cell: ({ row, getValue }) => {
      const isVariant = row.depth > 0;
      return (
        <div className={`font-medium ${isVariant ? 'text-slate-600' : 'text-slate-900'} flex items-center`}>
            {row.getCanExpand() && (
               <button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: 'pointer' },
                  className: "mr-2 h-4 w-4 border rounded-sm flex items-center justify-center text-xs"
                }}
              >
                {row.getIsExpanded() ? '-' : '+'}
              </button>
            )}
            {getValue<string>()}
        </div>
      )
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
        const isVariant = row.depth > 0;
        return <div className={`text-sm ${isVariant ? 'text-slate-400' : 'text-slate-500'}`}>{row.getValue("sku")}</div>
    }
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Fiyat</div>,
    cell: ({ getValue, row, column, table }) => {
      return (
        <EditableCell
            value={getValue<string>()}
            row={row}
            column={column}
            table={table}
        />
      )
    },
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-right">Stok</div>,
    cell: ({ getValue, row, column, table }) => {
      return (
         <EditableCell
            value={getValue<number>()}
            row={row}
            column={column}
            table={table}
            type="number"
        />
      )
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as ProductStatus

      let badgeClass = ""
      switch (status) {
        case "Satışta":
          badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          break
        case "Tükendi":
          badgeClass = "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
          break
        case "Pasif":
          badgeClass = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          break
      }

      return (
        <Badge variant="outline" className={badgeClass}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
