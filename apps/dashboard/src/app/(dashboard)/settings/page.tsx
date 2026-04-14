"use client";

import React from "react";
import { useSettings } from "../../../contexts/SettingsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@omnicore/ui/components/ui/card";
import { Switch } from "@omnicore/ui/components/ui/switch";
import { Label } from "@omnicore/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";

export default function SettingsPage() {
  const {
    marketplaces,
    toggleMarketplace,
    invoiceProvider,
    setInvoiceProvider,
    shippingProvider,
    setShippingProvider,
  } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Ayarlar</h1>
        <p className="text-sm text-slate-500 mt-2">
          Pazar yeri, fatura ve kargo entegrasyonlarınızı yönetin.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktif Satış Kanalları</CardTitle>
            <CardDescription>
              Hangi pazar yerlerinde işlem yapacağınızı seçin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trendyol">Trendyol</Label>
                <p className="text-sm text-slate-500">Trendyol pazar yeri entegrasyonu</p>
              </div>
              <Switch
                id="trendyol"
                checked={marketplaces.trendyol}
                onCheckedChange={() => toggleMarketplace("trendyol")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hepsiburada">Hepsiburada</Label>
                <p className="text-sm text-slate-500">Hepsiburada pazar yeri entegrasyonu</p>
              </div>
              <Switch
                id="hepsiburada"
                checked={marketplaces.hepsiburada}
                onCheckedChange={() => toggleMarketplace("hepsiburada")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sağlayıcılar</CardTitle>
            <CardDescription>
              Fatura ve kargo işlemleri için varsayılan sağlayıcılarınızı belirleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Fatura Sağlayıcı</Label>
              <Select
                value={invoiceProvider}
                onValueChange={(value: any) => setInvoiceProvider(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fatura Sağlayıcı Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  <SelectItem value="parasut">Paraşüt</SelectItem>
                  <SelectItem value="bizimhesap">BizimHesap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kargo Sağlayıcı</Label>
              <Select
                value={shippingProvider}
                onValueChange={(value: any) => setShippingProvider(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kargo Sağlayıcı Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  <SelectItem value="yurtici">Yurtiçi Kargo</SelectItem>
                  <SelectItem value="mng">MNG Kargo</SelectItem>
                  <SelectItem value="aras">Aras Kargo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
