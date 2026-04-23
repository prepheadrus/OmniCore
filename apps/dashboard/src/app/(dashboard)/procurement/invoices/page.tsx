"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Search, TrendingUp, Package, Activity, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@omnicore/ui/components/ui/card";
import { Input } from "@omnicore/ui/components/ui/input";
import { Button } from "@omnicore/ui/components/ui/button";

import { columns } from "../../../../components/procurement/invoices/columns";
import { DataTable } from "../../../../components/procurement/invoices/data-table";
import { InvoiceFormSheet } from "../../../../components/procurement/invoices/invoice-form-sheet";
import { getInvoices } from "../../../../components/procurement/invoices/actions";
import { toast } from "sonner";

function InvoicesPageContent() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInvoices({
        page: parseInt(page),
        limit: 10,
        documentNo: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (response.success) {
        // Map data if needed to match columns, assume DTO returns compatible format
        // mapping status to readable UI format depending on backend DTO
        setData(response.data || []);
      } else {
        toast.error("Faturalar yüklenirken hata oluştu");
      }
    } catch (error) {
      toast.error("Faturalar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSearchParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentVal = params.get(key);

    if (currentVal === value) return; // Prevent infinite render loop

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.set("page", "1"); // reset page on filter change
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const memoizedColumns = useMemo(() => columns, []);
  const memoizedData = useMemo(() => data, [data]);

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
              <button
                onClick={() => updateSearchParam("status", "all")}
                className={`px-3 py-1 text-xs font-semibold rounded shadow-sm transition-colors ${status === "all" ? "bg-white text-slate-900" : "bg-transparent text-slate-500 hover:text-slate-900"}`}>
                Tümü
              </button>
              <button
                onClick={() => updateSearchParam("status", "DRAFT")}
                className={`px-3 py-1 text-xs font-semibold rounded shadow-sm transition-colors ${status === "DRAFT" ? "bg-white text-slate-900" : "bg-transparent text-slate-500 hover:text-slate-900"}`}>
                Açık
              </button>
              <button
                onClick={() => updateSearchParam("status", "COMPLETED")}
                className={`px-3 py-1 text-xs font-semibold rounded shadow-sm transition-colors ${status === "COMPLETED" ? "bg-white text-slate-900" : "bg-transparent text-slate-500 hover:text-slate-900"}`}>
                Ödendi
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-50 border-slate-200 text-sm w-64 h-9 focus-visible:ring-indigo-500"
                placeholder="Fatura veya tedarikçi ara..."
                defaultValue={search}
                onChange={(e) => {
                  const val = e.target.value;
                  // Basic debounce for typing
                  setTimeout(() => updateSearchParam("search", val), 300);
                }}
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
        <div className="p-0 border-none relative min-h-[300px]">
           {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
           ) : (
             <DataTable columns={memoizedColumns} data={memoizedData} />
           )}
        </div>
      </div>

      {/* Sheet Form */}
      <InvoiceFormSheet isOpen={isSheetOpen} onClose={() => {
        setIsSheetOpen(false);
        loadData(); // refresh table after close
      }} />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <InvoicesPageContent />
    </Suspense>
  );
}
