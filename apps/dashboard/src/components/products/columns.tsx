"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@omnicore/ui/components/ui/badge";

export type ProductStatus = "Stokta" | "Tükendi" | "Kritik Stok";

export interface ProductData {
  id: string;
  image: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  status: ProductStatus;
  channel: string;
}

export const columns: ColumnDef<ProductData>[] = [
  {
    accessorKey: "image",
    header: "Ürün Görseli",
    cell: () => {
      return (
        <div className="w-10 h-10 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
          IMG
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Ürün Adı",
    cell: ({ row }) => {
      return <div className="font-medium text-slate-900">{row.getValue("name")}</div>;
    }
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      return <div className="text-slate-500 font-mono text-sm">{row.getValue("sku")}</div>;
    }
  },
  {
    accessorKey: "price",
    header: "Fiyat",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("price")}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stok Miktarı",
    cell: ({ row }) => {
      return <div>{row.getValue("stock")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as ProductStatus;
      let badgeClasses = "";

      switch (status) {
        case "Stokta":
          badgeClasses = "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80";
          break;
        case "Tükendi":
          badgeClasses = "bg-red-50 text-red-700 hover:bg-red-50/80";
          break;
        case "Kritik Stok":
          badgeClasses = "bg-amber-50 text-amber-700 hover:bg-amber-50/80";
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
];
