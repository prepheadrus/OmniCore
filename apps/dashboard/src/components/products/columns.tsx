"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@omnicore/ui/components/ui/checkbox"
import { Badge } from "@omnicore/ui/components/ui/badge"
import { Button } from "@omnicore/ui/components/ui/button"
import { Input } from "@omnicore/ui/components/ui/input"
import { ChevronRight, ChevronDown, ImageIcon } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
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
  table: any
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
        className="h-7 text-[13px] px-2 py-1 w-20 border-slate-200 bg-white"
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors"
    >
      {type === "number" && id === "price" ? `₺${Number(value).toFixed(2)}` : String(value)}
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
        {row.getCanExpand() && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-slate-100"
            onClick={row.getToggleExpandedHandler()}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-3 w-3 text-slate-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-500" />
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
      // Varyantlarda görsel yoksa boş gösterilebilir, ama opsiyonel
      if (row.depth > 0 && !imageUrl) return <div className="h-8 w-8 ml-4"></div>

      return (
        <div className="h-8 w-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt="Product" width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-4 w-4 text-slate-400" />
          )}
        </div>
      )
    },
  },
  {
    id: "nameAndSku",
    header: "Ürün / SKU",
    accessorFn: (row) => `${row.name} ${row.sku}`,
    cell: ({ row }) => {
      const isVariant = row.depth > 0
      return (
        <div className={`flex flex-col ${isVariant ? "pl-4" : ""}`}>
          <span className="font-medium text-slate-700 text-[13px]">{row.original.name}</span>
          <span className="text-slate-500 font-mono text-[11px]">{row.original.sku}</span>
        </div>
      )
    },
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
      <div className="px-2 py-1 text-[13px] text-slate-600">
        ₺{Number(row.getValue("cost")).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "margin",
    header: "Kâr Marjı",
    cell: ({ row }) => {
      const margin = Number(row.getValue("margin"))
      const isProfitable = margin > 0
      // OKLCH pastel green or pastel red using inline style or specific tailwind
      const colorClass = isProfitable
        ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" // equivalent to emerald 50, 800, 200
        : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" // equivalent to red 50, 800, 200

      return (
        <Badge variant="outline" className={`${colorClass} font-medium border text-[11px] px-1.5 py-0`}>
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
      if (!channels || channels.length === 0) return <span className="text-slate-400 text-[11px]">-</span>
      return (
        <div className="flex gap-1">
          {channels.map((ch) => (
             <Badge key={ch} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-1 py-0 border-0 h-4">
               {ch.charAt(0).toUpperCase()}
             </Badge>
          ))}
        </div>
      )
    }
  }
]
