"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Button } from "@omnicore/ui/components/ui/button";
import { Checkbox } from "@omnicore/ui/components/ui/checkbox";
import { Play, Pause, Edit2, Trash2, ArrowUpRight } from "lucide-react";

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
  if (isNaN(num)) return "₺0";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
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
    header: "KAMPANYA ADI",
    cell: ({ row }) => {
      const camp = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-slate-900 text-sm">{camp.name}</div>
          <div className="text-[11px] text-slate-400">
            {camp.startDate ? new Date(camp.startDate).toLocaleDateString('tr-TR') : '-'} -
            {camp.endDate ? new Date(camp.endDate).toLocaleDateString('tr-TR') : '-'}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "marketplace",
    header: "PAZARYERİ",
    cell: ({ row }) => {
      const mp = row.original.marketplace || "";
      return <span className="text-sm text-slate-700 font-medium">{mp}</span>;
    }
  },
  {
    accessorKey: "type",
    header: "TÜR",
    cell: ({ row }) => {
      const type = row.original.type;

      let badgeColor = "bg-slate-50 text-slate-600 border-slate-200";
      let icon = "🎯";

      if (type === 'sponsored') { badgeColor = "bg-purple-50 text-purple-700 border-purple-200"; icon = "◎"; }
      else if (type === 'display') { badgeColor = "bg-blue-50 text-blue-700 border-blue-200"; icon = "📺"; }
      else if (type === 'video') { badgeColor = "bg-pink-50 text-pink-700 border-pink-200"; icon = "▶"; }
      else if (type === 'retargeting') { badgeColor = "bg-orange-50 text-orange-700 border-orange-200"; icon = "↺"; }

      return (
        <Badge variant="outline" className={`w-fit text-[11px] px-2 py-0.5 shadow-none capitalize gap-1 font-medium ${badgeColor}`}>
          <span className="text-[10px] opacity-70">{icon}</span> {type}
        </Badge>
      );
    }
  },
  {
    accessorKey: "budget",
    header: () => <div className="text-right">BÜTÇE</div>,
    cell: ({ row }) => {
      return <div className="text-right font-semibold text-slate-900">{formatCurrency(row.original.budget)}</div>;
    }
  },
  {
    accessorKey: "spent",
    header: () => <div className="text-right">HARCANAN</div>,
    cell: ({ row }) => {
      const camp = row.original;
      const progress = camp.budget > 0 ? (camp.spent / camp.budget) * 100 : 0;
      const isOverBudget = progress > 95;

      return (
        <div className="flex flex-col items-end gap-1.5 w-full">
          <div className="text-right font-semibold text-slate-900">
            {formatCurrency(camp.spent)}
          </div>
          <div className="w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${isOverBudget ? 'bg-rose-500' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "impressions",
    header: () => <div className="text-right">GÖSTERİM</div>,
    cell: ({ row }) => {
      return <div className="text-right text-slate-700">{row.original.impressions.toLocaleString('tr-TR')}</div>;
    }
  },
  {
    accessorKey: "clicks",
    header: () => <div className="text-right">TIKLAMA</div>,
    cell: ({ row }) => {
      return <div className="text-right text-slate-700">{row.original.clicks.toLocaleString('tr-TR')}</div>;
    }
  },
  {
    accessorKey: "ctr",
    header: () => <div className="text-right">CTR</div>,
    cell: ({ row }) => {
      return <div className="text-right text-amber-600 font-medium">%{row.original.ctr.toFixed(2)}</div>;
    }
  },
  {
    accessorKey: "roas",
    header: () => <div className="text-right">ROAS</div>,
    cell: ({ row }) => {
      const roas = row.original.roas;
      const colorClass = roas >= 4 ? "text-emerald-600" : (roas >= 2 ? "text-amber-600" : "text-rose-600");

      return (
        <div className={`text-right font-semibold flex items-center justify-end gap-1 ${colorClass}`}>
          {roas >= 4 && <ArrowUpRight className="w-3 h-3" />}
          {roas.toFixed(2)}x
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "DURUM",
    cell: ({ row }) => {
      const status = row.getValue("status") as CampaignStatus;
      let badgeClasses = "";

      switch (status) {
        case "Aktif":
          badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
          break;
        case "Duraklatıldı":
          badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
          break;
        case "Tamamlandı":
          badgeClasses = "bg-blue-50 text-blue-700 border-blue-200";
          break;
        case "Taslak":
        default:
          badgeClasses = "bg-slate-50 text-slate-600 border-slate-200";
      }

      return (
        <Badge variant="outline" className={`font-medium shadow-none px-2.5 py-0.5 rounded-full ${badgeClasses}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">İŞLEMLER</div>,
    cell: ({ row, table }) => {
      const camp = row.original;
      const meta = table.options.meta as { handleViewCampaign?: (camp: CampaignData) => void } | undefined;

      const isPaused = camp.status === "Duraklatıldı";

      return (
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.handleViewCampaign) meta.handleViewCampaign(camp);
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 hover:bg-slate-100 ${isPaused ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-500 hover:text-amber-600'}`}
            onClick={(e) => e.stopPropagation()}
          >
             {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
