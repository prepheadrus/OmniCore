"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";

export type OrderStatus = "Bekliyor" | "Kargolandı" | "Teslim Edildi";

export interface OrderData {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  amount: string;
  channel: string;
}

export const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: "id",
    header: "Sipariş No",
  },
  {
    accessorKey: "customer",
    header: "Müşteri",
  },
  {
    accessorKey: "date",
    header: "Tarih",
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus;
      let badgeClasses = "";

      switch (status) {
        case "Bekliyor":
          badgeClasses = "bg-amber-50 text-amber-700 hover:bg-amber-50/80";
          break;
        case "Kargolandı":
          badgeClasses = "bg-blue-50 text-blue-700 hover:bg-blue-50/80";
          break;
        case "Teslim Edildi":
          badgeClasses = "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80";
          break;
        default:
          badgeClasses = "bg-slate-50 text-slate-700 hover:bg-slate-50/80";
      }

      return (
        <Badge variant="outline" className={`border-transparent font-medium ${badgeClasses}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "channel",
    header: "Kanal",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Tutar</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("amount")}</div>;
    },
  },
];
