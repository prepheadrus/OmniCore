"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Button } from "@omnicore/ui/components/ui/button";
import { Checkbox } from "@omnicore/ui/components/ui/checkbox";

export type CampaignStatus = "Aktif" | "Duraklatıldı" | "Taslak" | "Tamamlandı";

export interface CampaignData {
  id: string;
  name: string;
  marketplace: string;
  type: "sponsored" | "display" | "video" | "retargeting";
  budget: number;
  dailyBudget: number;
  status: CampaignStatus;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  cpc: number;
  ctr: number;
  startDate?: string;
  endDate?: string;
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "₺0,00";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(num);
};

export const columns: ColumnDef<CampaignData>[] = [
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
    accessorKey: "name",
    header: "Kampanya Adı",
    cell: ({ row }) => {
      const camp = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-slate-900">{camp.name}</div>
          <div className="text-xs text-slate-400 capitalize">{camp.type}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "marketplace",
    header: "Kanal",
    cell: ({ row }) => {
      const mp = row.original.marketplace || "";
      let marketplaceBadgeColor = "bg-slate-100 text-slate-600";

      const mpLower = mp.toLowerCase();
      if (mpLower.includes('trendyol')) marketplaceBadgeColor = "bg-orange-50 text-orange-600";
      else if (mpLower.includes('hepsiburada')) marketplaceBadgeColor = "bg-orange-50 text-orange-600";
      else if (mpLower.includes('amazon')) marketplaceBadgeColor = "bg-slate-800 text-slate-100";

      return (
        <Badge variant="outline" className={`w-fit text-[10px] px-1.5 py-0 border-transparent shadow-none ${marketplaceBadgeColor}`}>
          {mp || "Bilinmiyor"}
        </Badge>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as CampaignStatus;
      let badgeClasses = "";

      switch (status) {
        case "Aktif":
          badgeClasses = "bg-emerald-50 text-emerald-700";
          break;
        case "Duraklatıldı":
          badgeClasses = "bg-amber-50 text-amber-700";
          break;
        case "Tamamlandı":
          badgeClasses = "bg-blue-50 text-blue-700";
          break;
        case "Taslak":
        default:
          badgeClasses = "bg-slate-100 text-slate-700";
      }

      return (
        <Badge variant="outline" className={`border-transparent font-medium shadow-none ${badgeClasses}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "budget",
    header: () => <div className="text-right">Bütçe / Harcama</div>,
    cell: ({ row }) => {
      const camp = row.original;
      const progress = camp.budget > 0 ? (camp.spent / camp.budget) * 100 : 0;

      return (
        <div className="flex flex-col items-end gap-1">
          <div className="text-right font-medium text-slate-900">
            {formatCurrency(camp.spent)} <span className="text-slate-400 font-normal text-xs">/ {formatCurrency(camp.budget)}</span>
          </div>
          <div className="w-full max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${progress > 90 ? 'bg-rose-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "roas",
    header: () => <div className="text-right">ROAS</div>,
    cell: ({ row }) => {
      const roas = row.original.roas;
      const colorClass = roas >= 5 ? "text-emerald-600 font-semibold" : (roas >= 2 ? "text-amber-600" : "text-rose-600");

      return (
        <div className={`text-right ${colorClass}`}>
          {roas.toFixed(2)}x
        </div>
      );
    }
  },
  {
    accessorKey: "metrics",
    header: () => <div className="text-right">Metrikler</div>,
    cell: ({ row }) => {
      const camp = row.original;
      return (
        <div className="flex flex-col items-end gap-0.5 text-xs text-slate-500">
          <div>CTR: <span className="font-medium text-slate-700">{camp.ctr.toFixed(2)}%</span></div>
          <div>CPC: <span className="font-medium text-slate-700">{formatCurrency(camp.cpc)}</span></div>
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const camp = row.original;
      const meta = table.options.meta as { handleViewCampaign?: (camp: CampaignData) => void } | undefined;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-900"
          onClick={(e) => {
            e.stopPropagation();
            if (meta?.handleViewCampaign) {
              meta.handleViewCampaign(camp);
            }
          }}
        >
          Yönet
        </Button>
      );
    },
  },
];
