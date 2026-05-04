"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import ProductFeeds from "../../../components/feeds";
import FeedOptimizer from "../../../components/feed-optimizer";
import FeedTemplates from "../../../components/feed-templates";

export default function UnifiedFeedsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6 min-h-screen bg-[#fbfcfc] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Katalog ve Feed Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Pazar yeri ürün entegrasyonlarını, şablonlarını ve feed optimizasyonlarını yönetin.
          </p>
        </div>
      </div>

      <Tabs defaultValue="feeds" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="feeds">Feedler</TabsTrigger>
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizasyon</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="mt-0">
          <ProductFeeds />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <FeedTemplates />
        </TabsContent>

        <TabsContent value="optimizer" className="mt-0">
          <FeedOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
