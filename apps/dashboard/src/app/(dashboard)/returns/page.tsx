"use client";

import React, { useState, useEffect } from 'react';
import { columns } from '../../../components/returns/columns';
import { DataTable } from '../../../components/returns/data-table';
import { DataTableSkeleton } from '../../../components/shared/data-table-skeleton';
import { mockReturns, ReturnOrder } from '../../../components/returns/mock-data';
import { Button } from '@omnicore/ui/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ReturnAcceptanceSheet } from '../../../components/returns/return-acceptance-sheet';
import { QualityControlSheet } from '../../../components/returns/quality-control-sheet';

export default function ReturnsPage() {
  const [data, setData] = useState<ReturnOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAcceptanceSheetOpen, setIsAcceptanceSheetOpen] = useState(false);

  // Quality Control State
  const [qcSheetOpen, setQcSheetOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<ReturnOrder | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Simulate 1000ms delay for fetching data
    const timer = setTimeout(() => {
      setData(mockReturns);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    toast("İadeler senkronize ediliyor...", {
      description: "Pazaryerlerinden en güncel iade talepleri çekiliyor.",
    });

    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Senkronizasyon tamamlandı", {
        description: "En güncel iade verileri başarıyla çekildi.",
      });
    }, 2000);
  };

  const handleOpenQC = (order: ReturnOrder) => {
    setSelectedReturnOrder(order);
    setQcSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            İade Yönetimi (Reverse Logistics)
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">
            Müşteri iade taleplerini, kargo durumlarını ve depo kabul (RMA) süreçlerini yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="h-9"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Senkronize Et
          </Button>
          <Button
            size="sm"
            className="h-9 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => setIsAcceptanceSheetOpen(true)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni İade Kabulü
          </Button>
        </div>
      </div>

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns(handleOpenQC)} data={data} />
      )}

      {/* New Return Acceptance Sheet */}
      <ReturnAcceptanceSheet
        isOpen={isAcceptanceSheetOpen}
        onClose={() => setIsAcceptanceSheetOpen(false)}
      />

      {/* Quality Control (RMA) Sheet */}
      <QualityControlSheet
        isOpen={qcSheetOpen}
        onClose={() => {
          setQcSheetOpen(false);
          // Optional: clear selected after close animation
          setTimeout(() => setSelectedReturnOrder(null), 300);
        }}
        returnOrder={selectedReturnOrder}
      />
    </div>
  );
}
