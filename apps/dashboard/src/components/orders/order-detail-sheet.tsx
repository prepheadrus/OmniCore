"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@omnicore/ui/components/ui/sheet";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { FileText, Barcode, Box, Truck, CreditCard } from "lucide-react";
import { OrderData } from "./columns";

interface OrderDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
  onUpdateOrder?: (order: OrderData) => void;
}

export function OrderDetailSheet({ isOpen, onClose, order, onUpdateOrder }: OrderDetailSheetProps) {
  if (!order) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-l border-slate-200">
        <SheetHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold text-slate-900">
              {order.id}
            </SheetTitle>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 shadow-none">
              {order.status}
            </Badge>
          </div>
          <SheetDescription className="text-slate-500">
            {order.date} itibariyle {order.marketplace} üzerinden verildi.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Müşteri Bilgileri */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-slate-500" /> Müşteri & Teslimat
            </h3>
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 space-y-2">
              <div className="font-medium text-slate-800">{order.customerName}</div>
              <div className="text-sm text-slate-600 leading-relaxed">
                {order.customerAddress || "Adres bilgisi bulunmuyor."}
              </div>
            </div>
          </section>

          {/* Finansal Özet */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" /> Finansal Özet
            </h3>
            <div className="p-4 rounded-md border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Ara Toplam</span>
                <span className="text-slate-700 font-medium">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.amount - order.taxAmountNum)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">KDV</span>
                <span className="text-slate-700">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.taxAmountNum)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Komisyon</span>
                <span className="text-rose-600">
                  -{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.commissionAmountNum)}
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-medium text-slate-900">Toplam</span>
                <span className="font-bold text-slate-900">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.amount)}
                </span>
              </div>
            </div>
          </section>

          {/* Lojistik */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-500" /> Lojistik & Kargo
            </h3>
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Kargo Firması</div>
                <div className="text-sm font-medium text-slate-800">{order.carrier || "Belirtilmedi"}</div>
              </div>
              {order.trackingNo && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Takip Numarası</div>
                  <div className="text-sm text-slate-800 flex items-center gap-2">
                    {order.trackingNo}
                    <Barcode className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Belgeler */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" /> Belgeler
            </h3>
            <div className="flex gap-3">
              <a
                href={order.invoicePdfUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-medium transition-colors ${
                  order.invoiceStatus === "SIGNED" || order.invoicePdfUrl
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-slate-50 border-slate-100 text-slate-400 pointer-events-none"
                }`}
              >
                <FileText className="w-4 h-4" />
                Fatura PDF
              </a>
              <a
                href={order.shippingLabelUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-medium transition-colors ${
                  order.shippingLabelUrl
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-slate-50 border-slate-100 text-slate-400 pointer-events-none"
                }`}
              >
                <Barcode className="w-4 h-4" />
                Kargo Etiketi
              </a>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
