"use client";

import { CampaignData } from "./columns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@omnicore/ui/components/ui/sheet";
import { Button } from "@omnicore/ui/components/ui/button";
import { Badge } from "@omnicore/ui/components/ui/badge";
import { Input } from "@omnicore/ui/components/ui/input";
import { Label } from "@omnicore/ui/components/ui/label";
import { Play, Pause, Save, BarChart3, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";
import { Textarea } from "@omnicore/ui/components/ui/textarea";

interface CampaignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: CampaignData | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
};

export function CampaignSheet({ isOpen, onClose, initialData }: CampaignSheetProps) {
  const isEditing = !!initialData;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] p-0 flex flex-col border-l border-slate-200 shadow-xl gap-0">
        <SheetHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? initialData.name : "Yeni Kampanya Oluştur"}
              </SheetTitle>
              <SheetDescription className="text-sm text-slate-500">
                {isEditing
                  ? "Kampanya performans detaylarını ve ayarlarını görüntüleyin."
                  : "Yeni bir reklam kampanyası oluşturmak için aşağıdaki formu doldurun."}
              </SheetDescription>
            </div>
            {isEditing && (
              <Badge variant="outline" className="shadow-none font-medium capitalize border-transparent bg-slate-100 text-slate-700">
                {initialData.marketplace}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {isEditing ? (
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 border-b border-slate-100 bg-slate-50/50">
                <TabsList className="h-10 bg-transparent p-0 gap-6">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-0 h-10 text-slate-500 data-[state=active]:text-slate-900"
                  >
                    Genel Bakış
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-0 h-10 text-slate-500 data-[state=active]:text-slate-900"
                  >
                    Ayarlar
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6 m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" /> ROAS
                    </div>
                    <div className="text-2xl font-semibold text-slate-900">
                      {initialData.roas.toFixed(2)}x
                    </div>
                  </div>
                  <div className="p-4 rounded-md border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Dönüşüm</div>
                    <div className="text-2xl font-semibold text-slate-900">
                      {initialData.conversions.toLocaleString("tr-TR")}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900">Bütçe Tüketimi</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Harcanan: {formatCurrency(initialData.spent)}</span>
                      <span className="text-slate-900 font-medium">{formatCurrency(initialData.budget)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min((initialData.spent / initialData.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-right">
                      Günlük Bütçe: {formatCurrency(initialData.dailyBudget)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900">Performans Metrikleri</h4>
                  <div className="rounded-md border border-slate-200 divide-y divide-slate-100">
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">Gösterim</span>
                      <span className="font-medium">{initialData.impressions.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">Tıklama</span>
                      <span className="font-medium">{initialData.clicks.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">CTR (Tıklama Oranı)</span>
                      <span className="font-medium">%{initialData.ctr.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="text-slate-500">CPC (Tıklama Başı Maliyet)</span>
                      <span className="font-medium">{formatCurrency(initialData.cpc)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="p-6 space-y-4 m-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-700">Kampanya Adı <span className="text-rose-500">*</span></Label>
                  <Input id="name" defaultValue={initialData.name} className="h-9 shadow-none bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-xs font-medium text-slate-700">Toplam Bütçe (₺) <span className="text-rose-500">*</span></Label>
                    <Input id="budget" type="number" defaultValue={initialData.budget} className="h-9 shadow-none bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyBudget" className="text-xs font-medium text-slate-700">Günlük Bütçe (₺)</Label>
                    <Input id="dailyBudget" type="number" defaultValue={initialData.dailyBudget} className="h-9 shadow-none bg-slate-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs font-medium text-slate-700">Başlangıç Tarihi</Label>
                    <Input id="startDate" type="date" defaultValue={initialData.startDate} className="h-9 shadow-none bg-slate-50 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs font-medium text-slate-700">Bitiş Tarihi</Label>
                    <Input id="endDate" type="date" defaultValue={initialData.endDate} className="h-9 shadow-none bg-slate-50 text-slate-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-product-ids" className="text-xs font-medium text-slate-700">Ürün ID'leri (JSON)</Label>
                  <Textarea id="edit-product-ids" defaultValue="[]" className="h-20 shadow-none bg-slate-50 font-mono text-xs resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-targeting" className="text-xs font-medium text-slate-700">Hedefleme (JSON)</Label>
                  <Textarea id="edit-targeting" defaultValue="{}" className="h-20 shadow-none bg-slate-50 font-mono text-xs resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-creative" className="text-xs font-medium text-slate-700">Kreatif (JSON)</Label>
                  <Textarea id="edit-creative" defaultValue="{}" className="h-20 shadow-none bg-slate-50 font-mono text-xs resize-none" />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-6 space-y-5">
               {/* Create Form matching original screenshot */}
               <div className="space-y-2">
                  <Label htmlFor="new-name" className="text-xs font-medium text-slate-700">Kampanya Adı <span className="text-rose-500">*</span></Label>
                  <Input id="new-name" placeholder="Örn: Yaz Sezonu Kampanyası" className="h-10 shadow-none border-slate-300" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-700">Pazaryeri <span className="text-rose-500">*</span></Label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-500">
                      <option value="">Pazaryeri seçin</option>
                      <option value="trendyol">Trendyol</option>
                      <option value="hepsiburada">Hepsiburada</option>
                      <option value="amazon">Amazon</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-700">Kampanya Türü <span className="text-rose-500">*</span></Label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-500">
                      <option value="">Tür seçin</option>
                      <option value="sponsored">Sponsored</option>
                      <option value="display">Display</option>
                      <option value="video">Video</option>
                      <option value="retargeting">Retargeting</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-budget" className="text-xs font-medium text-slate-700">Toplam Bütçe (₺) <span className="text-rose-500">*</span></Label>
                    <Input id="new-budget" type="number" placeholder="0" className="h-10 shadow-none border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-daily" className="text-xs font-medium text-slate-700">Günlük Bütçe (₺)</Label>
                    <Input id="new-daily" type="number" placeholder="0" className="h-10 shadow-none border-slate-200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-start-date" className="text-xs font-medium text-slate-700">Başlangıç Tarihi</Label>
                    <Input id="new-start-date" type="date" className="h-10 shadow-none border-slate-200 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-end-date" className="text-xs font-medium text-slate-700">Bitiş Tarihi</Label>
                    <Input id="new-end-date" type="date" className="h-10 shadow-none border-slate-200 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="new-product-ids" className="text-xs font-medium text-slate-700">Ürün ID'leri (JSON)</Label>
                  <Textarea id="new-product-ids" defaultValue="[]" className="h-20 shadow-none border-slate-200 font-mono text-xs resize-none text-slate-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-targeting" className="text-xs font-medium text-slate-700">Hedefleme (JSON)</Label>
                  <Textarea id="new-targeting" defaultValue="{}" className="h-20 shadow-none border-slate-200 font-mono text-xs resize-none text-slate-600" />
                </div>
                <div className="space-y-2 pb-6">
                  <Label htmlFor="new-creative" className="text-xs font-medium text-slate-700">Kreatif (JSON)</Label>
                  <Textarea id="new-creative" defaultValue="{}" className="h-20 shadow-none border-slate-200 font-mono text-xs resize-none text-slate-600" />
                </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex justify-end items-center gap-3 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          {isEditing ? (
             <>
              <Button
                variant="outline"
                className="h-10 shadow-none border-slate-200 text-slate-700 bg-white mr-auto"
              >
                {initialData.status === "Aktif" ? (
                  <><Pause className="w-4 h-4 mr-2" /> Duraklat</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Devam Et</>
                )}
              </Button>
              <Button className="h-10 px-6 shadow-none bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" /> Kaydet
              </Button>
             </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} className="h-10 px-4 text-slate-500 hover:text-slate-900 border border-transparent">İptal</Button>
              <Button className="h-10 px-6 shadow-none bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Oluştur</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
