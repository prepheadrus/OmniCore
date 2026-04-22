"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Checkbox } from "@omnicore/ui/components/ui/checkbox";
import { MoreVertical } from "lucide-react";
import { Button } from "@omnicore/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@omnicore/ui/components/ui/dropdown-menu";

export type InvoiceStatus = "Taslak" | "Eşleştirme Bekliyor" | "İşlendi" | "Ödendi";

export interface InvoiceData {
  id: string;
  invoiceNo: string;
  supplier: string;
  date: string;
  dueDate: string;
  amount: string;
  status: InvoiceStatus;
}

export const columns: ColumnDef<InvoiceData>[] = [
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
        className="rounded border-outline-variant text-primary focus:ring-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="rounded border-outline-variant text-primary focus:ring-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "invoiceNo",
    header: "Fatura No",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("invoiceNo")}</span>;
    },
  },
  {
    accessorKey: "supplier",
    header: "Tedarikçi",
  },
  {
    accessorKey: "date",
    header: "Fatura Tarihi",
  },
  {
    accessorKey: "dueDate",
    header: "Vade Tarihi",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Toplam Tutar</div>,
    cell: ({ row }) => {
      return <div className="text-right font-semibold">{row.getValue("amount")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as InvoiceStatus;
      let badgeClasses = "";

      switch (status) {
        case "İşlendi":
        case "Ödendi":
          badgeClasses = "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 border-transparent";
          break;
        case "Eşleştirme Bekliyor":
          badgeClasses = "bg-amber-50 text-amber-700 hover:bg-amber-50/80 border-transparent";
          break;
        case "Taslak":
        default:
          badgeClasses = "bg-slate-100 text-slate-600 hover:bg-slate-100/80 border-transparent";
          break;
      }

      return (
        <Badge variant="outline" className={`font-medium ${badgeClasses}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreVertical className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.invoiceNo)}
            >
              Fatura No Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Görüntüle</DropdownMenuItem>
            <DropdownMenuItem>Düzenle</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
