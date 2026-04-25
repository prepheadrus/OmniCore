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
  category?: string
  brand?: string
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

  const onBlur = async () => {
    setIsEditing(false)
    const newValue = type === "number" ? Number(value) : value
    if (initialValue !== newValue) {
      table.options.meta?.updateData(index, id, newValue)

      // Optimistic update successful, send to backend
      try {
        const res = await fetch(`/api/products/${original.id}/inline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: id, value: newValue })
        })

        if (!res.ok) throw new Error('Failed to update')

        toast.success(`${original.name} ürünü güncellendi`, {
          description: `${id === 'price' ? 'Fiyat' : 'Stok'} başarıyla ${newValue} olarak değiştirildi.`,
        })
      } catch (error) {
        // Rollback on failure
        table.options.meta?.updateData(index, id, initialValue)
        setValue(initialValue)
        toast.error('Güncelleme Başarısız', {
          description: 'Lütfen tekrar deneyin.'
        })
      }
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
        className="h-7 text-[13px] px-2 py-1 w-20 border-slate-200 focus-visible:border-slate-400 focus-visible:ring-0 bg-white transition-colors shadow-none rounded-md"
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
      className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-slate-200"
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
        href={`?productId=${row.original.id}`}
        scroll={false}
        className="text-left font-medium text-slate-800 text-[13px] hover:text-slate-900 hover:underline decoration-slate-300 transition-colors cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.name}
      </Link>
      <span className="text-slate-500 font-mono text-[11px]">{row.original.sku}</span>
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
        className="translate-y-[2px] border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50"
        />
        {row.getCanExpand() && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-slate-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              row.getToggleExpandedHandler()();
            }}
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
    cell: ({ row, table }) => <NameCell row={row} table={table} />,

  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => (
      <div className="px-2 py-1 text-[13px] text-[#474747]">
        {row.getValue("category") || "-"}
      </div>
    ),
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
          colorClass = "bg-emerald-50 text-emerald-700 border-transparent shadow-none"
          break
        case "OUT_OF_STOCK":
          label = "Tükendi"
          colorClass = "bg-red-50 text-red-700 border-transparent shadow-none"
          break
        case "INACTIVE":
          label = "Taslak"
          colorClass = "bg-slate-100 text-slate-700 border-transparent shadow-none"
          break
        default:
          label = status
          colorClass = "bg-slate-100 text-slate-700 border-transparent shadow-none"
      }

      return (
        <Badge variant="outline" className={`${colorClass} font-medium text-[11px] px-1.5 py-0 rounded-md`}>
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
        ? "bg-emerald-50 text-emerald-700 border-transparent shadow-none"
        : "bg-red-50 text-red-700 border-transparent shadow-none"

      return (
        <Badge variant="outline" className={`${colorClass} font-medium text-[11px] px-1.5 py-0 rounded-md`}>
          {margin > 0 ? "+" : ""}{margin}%
        </Badge>
      )
    },
  },
  {
    accessorKey: "channels",
    header: "Pazar Yeri",
    cell: ({ row }) => {
      const channels = row.getValue("channels") as string[]
      if (!channels || channels.length === 0) return <span className="text-[#c6c6c6] text-[11px]">-</span>

      const getChannelInitial = (ch: string) => {
        switch(ch.toLowerCase()) {
            case 'trendyol': return 'T'
            case 'hepsiburada': return 'H'
            case 'amazon': return 'A'
            case 'n11': return 'N'
            default: return ch.charAt(0).toUpperCase()
        }
      }

      return (
        <div className="flex gap-1">
          {channels.map((ch) => (
             <Badge key={ch} variant="secondary" className="bg-[#e6e8ea] text-[#191c1e] text-[10px] px-1 py-0 border border-slate-200 h-4 rounded-sm shadow-none">
               {getChannelInitial(ch)}
             </Badge>
          ))}
        </div>
      )
    }
  }
]
