"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import Campaigns from "../../../components/campaigns";
import { AdvertisingClient } from "../../../components/advertising/advertising-client";

export default function UnifiedMarketingPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 min-h-screen bg-[#fbfcfc] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Pazarlama ve Kampanyalar</h2>
          <p className="text-sm text-slate-500">
            Tüm pazaryeri indirim ve reklam kampanyalarınızı tek bir ekrandan yönetin.
          </p>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="campaigns">Kampanyalar</TabsTrigger>
          <TabsTrigger value="advertising">Reklamlar</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-0">
          <div className="py-6">
            <Campaigns />
          </div>
        </TabsContent>

        <TabsContent value="advertising" className="mt-0">
          <div className="py-6">
            <AdvertisingClient />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
