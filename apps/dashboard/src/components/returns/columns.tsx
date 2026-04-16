"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Button } from "@omnicore/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@omnicore/ui/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ReturnOrder, ReturnStatus } from "./mock-data";
import { toast } from "sonner";

const statusMap: Record<ReturnStatus, { label: string; colorClass: string }> = {
  RMA_INITIATED: {
    label: "İade Talebi Alındı",
    colorClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  IN_TRANSIT: {
    label: "Kargoda",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  INSPECTION_PENDING: {
    label: "İnceleniyor",
    colorClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  RESTOCK: {
    label: "Onaylandı",
    colorClass: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "Reddedildi",
    colorClass: "bg-red-100 text-red-800 border-red-200",
  },
  DISPOSED: {
    label: "İmha Edildi",
    colorClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
};

export const columns: ColumnDef<ReturnOrder>[] = [
  {
    accessorKey: "id",
    header: "İade Kodu",
  },
  {
    accessorKey: "orderId",
    header: "Sipariş No",
  },
  {
    accessorKey: "customer",
    header: "Müşteri",
  },
  {
    accessorKey: "reason",
    header: "İade Nedeni",
  },
  {
    accessorKey: "channel",
    header: "Kanal",
    cell: ({ row }) => {
      const channel = row.getValue("channel") as string;
      return <span className="capitalize">{channel}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as ReturnStatus;
      const statusConfig = statusMap[status];

      return (
        <Badge variant="outline" className={`${statusConfig.colorClass}`}>
          {statusConfig.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Tutar</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const returnOrder = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksiyonlar</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                toast("İade detayları yükleniyor...", {
                  description: `${returnOrder.id} numaralı iade detayları getiriliyor.`,
                });
              }}
            >
              İade Detayını Gör
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                toast.success("İade talebi onaylandı", {
                  description: `${returnOrder.id} numaralı iade başarıyla onaylandı.`,
                });
              }}
            >
              İadeyi Onayla
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => {
                toast.error("İade reddedildi", {
                  description: `${returnOrder.id} numaralı iade reddedildi.`,
                });
              }}
            >
              Reddet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
