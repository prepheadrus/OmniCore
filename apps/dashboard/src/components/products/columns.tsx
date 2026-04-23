"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@omnicore/ui/components/ui/checkbox"
import { Badge } from "@omnicore/ui/components/ui/badge"
import { Button } from "@omnicore/ui/components/ui/button"
import { Input } from "@omnicore/ui/components/ui/input"
import { ChevronRight, ChevronDown, ImageIcon } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

// Types for Product Data
export type ProductStatus = "IN_STOCK" | "OUT_OF_STOCK" | "INACTIVE"

export type Product = {
  id: string
  name: string
  sku: string
  price: number
  cost: number // Maliyet
  margin: number // Kâr Marjı (Yüzde)
  stock: number
  status: ProductStatus
  imageUrl?: string
  channels: string[] // Satış Kanalları
  subRows?: Product[]
}

// Inline Edit Cell Component
const InlineEditCell = ({
  getValue,
  row: { index, original },
  column: { id },
  table,
  type = "text"
}: {
  getValue: () => unknown
  row: { index: number; original: Product }
  column: { id: string }
  table: any // eslint-disable-line @typescript-eslint/no-explicit-any
  type?: "text" | "number"
}) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)

  // Sync state if initialValue changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    setIsEditing(false)
    const newValue = type === "number" ? Number(value) : value
    if (initialValue !== newValue) {
      table.options.meta?.updateData(index, id, newValue)
      toast.success(`${original.name} ürünü güncellendi`, {
        description: `${id === 'price' ? 'Fiyat' : 'Stok'} başarıyla ${newValue} olarak değiştirildi.`,
      })
    }
  }

  if (isEditing) {
    return (
      <Input
        type={type}
        value={value as string | number}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        autoFocus
        className="h-7 text-[13px] px-2 py-1 w-20 border-[#c6c6c6]/20 focus-visible:border-[#000000] focus-visible:ring-0 bg-[#ffffff] transition-colors"
      />
    )
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-[#f2f4f6] px-2 py-1 rounded transition-colors"
    >
      {type === "number" && id === "price" ? `₺${Number(value).toFixed(2)}` : String(value)}
    </div>
  )
}


const NameCell = ({ row, table }: { row: { original: Product; depth: number }; table: any }) => {
  const isVariant = row.depth > 0

  return (
    <div className={`flex flex-col ${isVariant ? "pl-4" : ""}`}>
      <Link
        href={`/products/${row.original.id}`}
        className="text-left font-medium text-[#191c1e] text-[13px] hover:text-[#000000] hover:underline decoration-[#333b50]/30 transition-colors cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.name}
      </Link>
      <span className="text-[#474747] font-mono text-[11px]">{row.original.sku}</span>
    </div>
  )
}

export const columns: ColumnDef<Product>[] = [
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
        className="translate-y-[2px] border-[#c6c6c6]/40 data-[state=checked]:bg-[#000000] data-[state=checked]:text-[#ffffff]"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] border-[#c6c6c6]/40 data-[state=checked]:bg-[#000000] data-[state=checked]:text-[#ffffff]"
        />
        {row.getCanExpand() && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-[#f2f4f6]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              row.getToggleExpandedHandler()();
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-3 w-3 text-[#474747]" />
            ) : (
              <ChevronRight className="h-3 w-3 text-[#474747]" />
            )}
          </Button>
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageUrl",
    header: "Görsel",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string | undefined
      if (row.depth > 0 && !imageUrl) return <div className="h-8 w-8 ml-4"></div>

      return (
        <div className="h-8 w-8 rounded-md bg-[#f2f4f6] border border-[#c6c6c6]/20 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt="Product" width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-4 w-4 text-[#c6c6c6]" />
          )}
        </div>
      )
    },
  },
  {
    id: "nameAndSku",
    header: "Ürün / SKU",
    accessorFn: (row) => `${row.name} ${row.sku}`,
    cell: ({ row, table }) => <NameCell row={row} table={table} />,

  },
  {
    accessorKey: "stock",
    header: "Stok",
    cell: (props) => <InlineEditCell {...props} type="number" />,
  },
  {
    accessorKey: "price",
    header: "Satış Fiyatı",
    cell: (props) => <InlineEditCell {...props} type="number" />,
  },
  {
    accessorKey: "cost",
    header: "Maliyet",
    cell: ({ row }) => (
      <div className="px-2 py-1 text-[13px] text-[#474747]">
        ₺{Number(row.getValue("cost")).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as ProductStatus

      let label = ""
      let colorClass = ""

      switch (status) {
        case "IN_STOCK":
          label = "Aktif"
          colorClass = "bg-[#f0fdf4] text-[#166534] border-transparent"
          break
        case "OUT_OF_STOCK":
          label = "Tükendi"
          colorClass = "bg-[#ffdad6] text-[#ba1a1a] border-transparent"
          break
        case "INACTIVE":
          label = "Taslak"
          colorClass = "bg-[#f2f4f6] text-[#474747] border-transparent"
          break
        default:
          label = status
          colorClass = "bg-[#f2f4f6] text-[#474747] border-transparent"
      }

      return (
        <Badge variant="outline" className={`${colorClass} font-medium border text-[11px] px-1.5 py-0 rounded-md`}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || value === "ALL") return true
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "margin",
    header: "Kâr Marjı",
    cell: ({ row }) => {
      const margin = Number(row.getValue("margin"))
      const isProfitable = margin > 0
      const colorClass = isProfitable
        ? "bg-[#f0fdf4] text-[#166534] border-transparent"
        : "bg-[#ffdad6] text-[#ba1a1a] border-transparent"

      return (
        <Badge variant="outline" className={`${colorClass} font-medium border text-[11px] px-1.5 py-0 rounded-md`}>
          {margin > 0 ? "+" : ""}{margin}%
        </Badge>
      )
    },
  },
  {
    accessorKey: "channels",
    header: "Kanallar",
    cell: ({ row }) => {
      const channels = row.getValue("channels") as string[]
      if (!channels || channels.length === 0) return <span className="text-[#c6c6c6] text-[11px]">-</span>
      return (
        <div className="flex gap-1">
          {channels.map((ch) => (
             <Badge key={ch} variant="secondary" className="bg-[#e6e8ea] text-[#191c1e] text-[10px] px-1 py-0 border-0 h-4 rounded-sm">
               {ch.charAt(0).toUpperCase()}
             </Badge>
          ))}
        </div>
      )
    }
  }
]
