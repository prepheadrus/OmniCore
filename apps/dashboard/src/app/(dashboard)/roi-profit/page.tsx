"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import ROIProfit from "../../../components/roi-profit";
import ProfitSimulator from "../../../components/profit-simulator";
import ReconciliationClient from "../../../components/reconciliation/page-client";

export default function UnifiedFinancePage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 min-h-screen bg-[#fbfcfc] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Finansal Zeka ve Kârlılık</h2>
          <p className="text-sm text-slate-500">
            Kâr analizlerinizi, simülasyonlarınızı ve pazaryeri mutabakatlarınızı tek ekrandan yönetin.
          </p>
        </div>
      </div>

      <Tabs defaultValue="roi-profit" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roi-profit">ROI & Kâr Analizi</TabsTrigger>
          <TabsTrigger value="simulator">Kâr Simülatörü</TabsTrigger>
          <TabsTrigger value="reconciliation">Mutabakat</TabsTrigger>
        </TabsList>

        <TabsContent value="roi-profit" className="mt-0">
          <div className="py-6">
            <ROIProfit />
          </div>
        </TabsContent>

        <TabsContent value="simulator" className="mt-0">
          <div className="py-6">
            <ProfitSimulator />
          </div>
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-0">
          <div className="py-6">
            <ReconciliationClient />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
