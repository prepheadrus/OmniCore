"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import Automation from "../../../components/automation";
import SmartOrderRules from "../../../components/smart-order-rules";
import ShippingRulesClient from "../../../components/shipping-rules/page-client";
import ContentRules from "../../../components/content-rules";

export default function UnifiedAutomationPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 min-h-screen bg-[#fbfcfc] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Otomasyon ve Kurallar Merkezi</h2>
          <p className="text-sm text-slate-500">
            Sipariş, kargo, içerik ve genel veri otomasyonu kurallarınızı tek merkezden yönetin.
          </p>
        </div>
      </div>

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="automation">Veri Otomasyonu</TabsTrigger>
          <TabsTrigger value="order-rules">Sipariş Kuralları</TabsTrigger>
          <TabsTrigger value="shipping-rules">Kargo Kuralları</TabsTrigger>
          <TabsTrigger value="content-rules">İçerik Kuralları</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="mt-0">
          <div className="py-6">
            <Automation />
          </div>
        </TabsContent>

        <TabsContent value="order-rules" className="mt-0">
          <div className="py-6">
            <SmartOrderRules />
          </div>
        </TabsContent>

        <TabsContent value="shipping-rules" className="mt-0">
          <div className="py-6">
            <ShippingRulesClient />
          </div>
        </TabsContent>

        <TabsContent value="content-rules" className="mt-0">
          <div className="py-6">
            <ContentRules />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
