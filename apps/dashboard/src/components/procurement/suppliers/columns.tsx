"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@omnicore/ui/components/ui/badge"

export type Supplier = {
  id: string
  name: string
  taxNumber?: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
}

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Tedarikçi Adı",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "taxNumber",
    header: "Vergi No",
  },
  {
    accessorKey: "email",
    header: "E-Posta",
  },
  {
    accessorKey: "phone",
    header: "Telefon",
  },
  {
    accessorKey: "createdAt",
    header: "Kayıt Tarihi",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString("tr-TR")
    },
  },
]
