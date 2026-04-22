"use client";

import React, { useState } from "react";
import { Plus, Search, TrendingUp, Package, Activity, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@omnicore/ui/components/ui/card";
import { Input } from "@omnicore/ui/components/ui/input";
import { Button } from "@omnicore/ui/components/ui/button";

import { columns, InvoiceData } from "../../../../components/procurement/invoices/columns";
import { DataTable } from "../../../../components/procurement/invoices/data-table";
import { InvoiceFormSheet } from "../../../../components/procurement/invoices/invoice-form-sheet";

const mockInvoices: InvoiceData[] = [
  {
    id: "1",
    invoiceNo: "INV-2023-0892",
    supplier: "Zenith Endüstriyel A.Ş.",
    date: "12 Haz 2024",
    dueDate: "12 Tem 2024",
    amount: "₺42.500,00",
    status: "İşlendi",
  },
  {
    id: "2",
    invoiceNo: "ABC-9902341",
    supplier: "Global Lojistik Çözümleri",
    date: "10 Haz 2024",
    dueDate: "25 Haz 2024",
    amount: "₺8.240,00",
    status: "Eşleştirme Bekliyor",
  },
  {
    id: "3",
    invoiceNo: "FT-44582910",
    supplier: "Atlas Teknoloji Ltd.",
    date: "08 Haz 2024",
    dueDate: "08 Tem 2024",
    amount: "₺15.900,00",
    status: "Taslak",
  },
];

export default function InvoicesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Aylık Toplam Alış</span>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">₺482.900,00</div>
              <div className="text-emerald-600 text-[11px] flex items-center mt-1.5 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>%12.4 vs geçen ay</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Bekleyen Eşleştirmeler</span>
              <Package className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-rose-600">24 Kalem</div>
              <div className="text-rose-500/80 text-[11px] mt-1.5 font-medium">Acil aksiyon gerektirir</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Maliyet Değişim Trendi</span>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">%+4.2</div>
              <div className="text-slate-500 text-[11px] mt-1.5 font-medium">Son 30 gün ortalaması</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Gelecek Ödemeler</span>
              <CalendarClock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">₺124.500,00</div>
              <div className="text-slate-500 text-[11px] mt-1.5 font-medium">Önümüzdeki 7 gün</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">Alış Faturaları</h2>
            <div className="flex bg-slate-100 rounded-md p-1">
              <button className="px-3 py-1 text-xs font-semibold bg-white rounded shadow-sm text-slate-900">Tümü</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Açık</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Ödendi</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-50 border-slate-200 text-sm w-64 h-9 focus-visible:ring-indigo-500"
                placeholder="Fatura veya tedarikçi ara..."
              />
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 flex items-center gap-2"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="font-semibold text-sm">Yeni Fatura</span>
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-0 border-none">
           <DataTable columns={columns} data={mockInvoices} />
        </div>
      </div>

      {/* Sheet Form */}
      <InvoiceFormSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </div>
  );
}
