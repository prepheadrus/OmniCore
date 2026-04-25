"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Button } from "@omnicore/ui/components/ui/button";
import { Checkbox } from "@omnicore/ui/components/ui/checkbox";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@omnicore/ui/components/ui/tooltip";

export type OrderStatus = "Bekliyor" | "Hazırlanıyor" | "Kargoda" | "Teslim Edildi" | "İptal/İade";

export interface OrderData {
  id: string; // marketplace order no or internal ID
  internalId: string;
  marketplaceOrderNo?: string;
  marketplace: string;
  customerName: string;
  customerAddress: string;
  itemsSummary: string;
  date: string;
  status: OrderStatus;
  rawStatus: string;
  amount: number;
  taxAmountNum: number;
  commissionAmountNum: number;
  channel: string;
  carrier: string;
  trackingNo: string;
  invoiceStatus?: string;
  invoicePdfUrl?: string;
  shippingLabelUrl?: string;
  netProfit?: string;
  costPrice?: string;
  shippingCost?: string;
  discountAmount?: string;
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "₺0,00";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(num);
};

export const columns: ColumnDef<OrderData>[] = [
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
    cell: ({ row }) => {
      const order = row.original;
      let marketplaceBadgeColor = "bg-slate-100 text-slate-600";

      const mpLower = order.marketplace?.toLowerCase() || "";
      if (mpLower.includes('trendyol')) marketplaceBadgeColor = "bg-orange-50 text-orange-600";
      else if (mpLower.includes('hepsiburada')) marketplaceBadgeColor = "bg-orange-50 text-orange-600";
      else if (mpLower.includes('amazon')) marketplaceBadgeColor = "bg-slate-800 text-slate-100";

      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-slate-900">{order.id}</div>
          <Badge variant="outline" className={`w-fit text-[10px] px-1.5 py-0 border-transparent ${marketplaceBadgeColor}`}>
            {order.marketplace || "Bilinmiyor"}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "customerName",
    header: "Müşteri",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-slate-700">{order.customerName}</span>
          {order.customerAddress && (
            <span className="text-xs text-slate-400">{order.customerAddress}</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "itemsSummary",
    header: "Ürünler",
    cell: ({ row }) => {
      return <div className="text-sm text-slate-600 max-w-[200px] truncate" title={row.original.itemsSummary}>{row.original.itemsSummary}</div>;
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Tutar</div>,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-right font-medium text-slate-900 cursor-help underline decoration-slate-300 decoration-dashed underline-offset-4">
                {formatCurrency(order.amount)}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-slate-700 border border-slate-200 shadow-none p-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Ara Toplam:</span>
                  <span>{formatCurrency(order.amount - order.taxAmountNum)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Vergi:</span>
                  <span>{formatCurrency(order.taxAmountNum)}</span>
                </div>
                {order.commissionAmountNum > 0 && (
                  <div className="flex justify-between gap-4 text-rose-600">
                    <span>Komisyon:</span>
                    <span>-{formatCurrency(order.commissionAmountNum)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between gap-4 font-semibold">
                  <span>Toplam:</span>
                  <span>{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: "Lojistik",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700">{order.carrier}</span>
          {order.trackingNo && (
            <span className="text-xs text-slate-400">{order.trackingNo}</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus;
      let badgeClasses = "";

      switch (status) {
        case "Bekliyor":
          badgeClasses = "bg-slate-100 text-slate-700";
          break;
        case "Hazırlanıyor":
          badgeClasses = "bg-amber-50 text-amber-700";
          break;
        case "Kargoda":
          badgeClasses = "bg-blue-50 text-blue-700";
          break;
        case "Teslim Edildi":
          badgeClasses = "bg-emerald-50 text-emerald-700";
          break;
        case "İptal/İade":
          badgeClasses = "bg-rose-50 text-rose-700";
          break;
        default:
          badgeClasses = "bg-slate-50 text-slate-700";
      }

      return (
        <Badge variant="outline" className={`border-transparent font-medium shadow-none ${badgeClasses}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ row }) => {
      return <div className="text-slate-500 text-sm">{row.original.date}</div>;
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const order = row.original;
      const meta = table.options.meta as { handleViewOrder?: (order: OrderData) => void } | undefined;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-900"
          onClick={(e) => {
            e.stopPropagation();
            if (meta?.handleViewOrder) {
              meta.handleViewOrder(order);
            }
          }}
        >
          Detay
        </Button>
      );
    },
  },
];
