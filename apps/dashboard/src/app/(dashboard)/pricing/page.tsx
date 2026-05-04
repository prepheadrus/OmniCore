"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import SmartPricing from "../../../components/pricing";
import PriceManagement from "../../../components/price-management";
import DynamicPricing from "../../../components/dynamic-pricing";
import BuyBoxOptimizer from "../../../components/buybox-optimizer";
import RadarPageContent from "../../../components/radar/radar-content";

export default function UnifiedPricingPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 min-h-screen bg-[#fbfcfc] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Akıllı Fiyatlandırma ve Rekabet</h2>
          <p className="text-sm text-slate-500">
            Fiyat stratejilerini, buybox rekabetini ve dinamik fiyatlandırmayı tek merkezden yönetin.
          </p>
        </div>
      </div>

      <Tabs defaultValue="price-management" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="price-management">Fiyat Yönetimi</TabsTrigger>
          <TabsTrigger value="dynamic-pricing">Dinamik Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="buybox-optimizer">Buy Box Optimizasyonu</TabsTrigger>
          <TabsTrigger value="radar">Rekabet Radarı</TabsTrigger>
          <TabsTrigger value="smart-pricing">Akıllı Fiyatlandırma</TabsTrigger>
        </TabsList>

        <TabsContent value="price-management" className="mt-0">
          <PriceManagement />
        </TabsContent>

        <TabsContent value="dynamic-pricing" className="mt-0">
          <DynamicPricing />
        </TabsContent>

        <TabsContent value="buybox-optimizer" className="mt-0">
          <BuyBoxOptimizer />
        </TabsContent>

        <TabsContent value="radar" className="mt-0">
          <RadarPageContent />
        </TabsContent>

        <TabsContent value="smart-pricing" className="mt-0">
          <SmartPricing />
        </TabsContent>
      </Tabs>
    </div>
  );
}
