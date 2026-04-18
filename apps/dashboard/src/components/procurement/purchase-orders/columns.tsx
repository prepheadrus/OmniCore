"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@omnicore/ui/components/ui/badge"
import { ReceiveButton } from "./receive-button"

export type PurchaseOrderItem = {
  id: string
  productVariantId: string
  quantity: number
  unitCost: number
  totalCost: number
}

export type PurchaseOrder = {
  id: string
  supplierId: string
  status: string
  orderDate: string
  totalAmount: number
  items: PurchaseOrderItem[]
}

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "id",
    header: "Sipariş No",
    cell: ({ row }) => <div className="font-medium text-slate-900">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "supplierId",
    header: "Tedarikçi",
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      if (status === "RECEIVED") {
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">MAL KABUL EDİLDİ</Badge>
      }
      if (status === "CANCELLED") {
        return <Badge className="bg-slate-100 text-slate-500 border border-slate-200">İPTAL EDİLDİ</Badge>
      }
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">{status}</Badge>
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Toplam Tutar",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "orderDate",
    header: "Sipariş Tarihi",
    cell: ({ row }) => {
      const date = new Date(row.getValue("orderDate"))
      return date.toLocaleDateString("tr-TR")
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      // Sadece DRAFT veya SENT durumlarındayken mal kabul butonu göster
      if (status !== "RECEIVED" && status !== "CANCELLED") {
        // Lazy require avoids cyclic dependencies or dynamic component issues,
        // but in Next.js/TS `require` in a component can trigger TS errors.
        // It's safer to just render it directly by importing at the top.
        return (
          <div className="flex justify-end pr-2">
            <ReceiveButton purchaseOrderId={row.original.id} />
          </div>
        )
      }
      return null
    },
  },
]
