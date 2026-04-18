"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { FileText, Barcode, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@omnicore/ui/components/ui/dropdown-menu";
import { Button } from "@omnicore/ui/components/ui/button";
import { Checkbox } from "@omnicore/ui/components/ui/checkbox";

export type OrderStatus = "Bekliyor" | "Kargolandı" | "Teslim Edildi";

export interface OrderData {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  amount: string;
  channel: string;
  invoiceStatus?: string;
  invoicePdfUrl?: string;
  shippingLabelUrl?: string;
  netProfit?: string;
  costPrice?: string;
  commissionAmount?: string;
  shippingCost?: string;
  taxAmount?: string;
  discountAmount?: string;
}

export const columns: ColumnDef<OrderData>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: 'pointer' },
          }}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
        >
          {row.getIsExpanded() ? '▼' : '▶'}
        </button>
      ) : null;
    },
  },
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
  {
    accessorKey: "netProfit",
    header: () => <div className="text-right">Net Kâr</div>,
    cell: ({ row }) => {
      const netProfitStr = row.getValue("netProfit") as string | undefined;
      const amountStr = row.getValue("amount") as string;

      let netProfit = 0;
      if (netProfitStr) {
        netProfit = parseFloat(netProfitStr);
      }

      if (!netProfitStr && !amountStr) {
        return <div className="text-right font-medium">-</div>;
      }

      let badgeClasses = "bg-slate-50 text-slate-700";
      if (netProfit > 0) {
        badgeClasses = "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 border-transparent";
      } else if (netProfit < 0) {
        badgeClasses = "bg-rose-50 text-rose-700 hover:bg-rose-50/80 border-transparent";
      }

      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(netProfit);

      return (
        <div className="text-right">
          {netProfitStr ? (
            <Badge variant="outline" className={`font-medium ${badgeClasses}`}>
              {formatted}
            </Badge>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      );
    },
  },
  {
    id: "documents",
    header: "Belgeler",
    cell: ({ row }) => {
      const order = row.original;
      const showPdf = order.invoiceStatus === "SIGNED" || !!order.invoicePdfUrl;
      const showBarcode = !!order.shippingLabelUrl;

      return (
        <div className="flex items-center gap-2">
          {showPdf && (
            <a
              href={order.invoicePdfUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-primary transition-colors"
              title="Fatura PDF"
            >
              <FileText className="h-5 w-5" />
            </a>
          )}
          {showBarcode && (
            <a
              href={order.shippingLabelUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-primary transition-colors"
              title="Kargo Etiketi"
            >
              <Barcode className="h-5 w-5" />
            </a>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const order = row.original;
      const meta = table.options.meta as { handleUpdateOrder?: (id: string) => void } | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Sipariş No Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (meta?.handleUpdateOrder) {
                  meta.handleUpdateOrder(order.id);
                }
              }}
            >
              Test: Kargoya Ver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
